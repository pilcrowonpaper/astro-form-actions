import type { AstroGlobal } from "astro";
import { parse } from "./multipart-form";
import {
	ExtractResolveResponse,
	ExtractRedirectResponse,
	ExtractRejectResponse,
	RedirectResponse,
	RejectResponse,
	ResolveResponse
} from "./response.js";
import type { ConditionalUnion } from "../utils";

import {
	ServerIgnoreResult,
	ServerRedirectResult,
	ServerRejectedResult,
	ServerResolvedResult
} from "./result";
import { RedirectResult, RejectedResult, ResolvedResult } from "../result";

type HandleFunction = (
	formData: FormData
) => Promise<
	| InstanceType<typeof ResolveResponse>
	| InstanceType<typeof RejectResponse>
	| InstanceType<typeof RedirectResponse>
>;

type ActionResult<Handle extends HandleFunction> =
	| ConditionalUnion<
			[
				[
					ExtractResolveResponse<Handle>,
					ServerResolvedResult<ExtractResolveResponse<Handle>["body"]>
				],
				[
					ExtractRejectResponse<Handle>,
					ServerRejectedResult<ExtractRejectResponse<Handle>["data"]>
				],
				[ExtractRedirectResponse<Handle>, ServerRedirectResult]
			]
	  >
	| ServerIgnoreResult;

export const action = async <Handle extends HandleFunction>(
	{
		request,
		response: astroResponse
	}: {
		request: Request;
		response: AstroGlobal["response"];
	},
	handle: Handle,
	enableCSRFProtection = true
): Promise<ActionResult<Handle>> => {
	const clonedRequest = request.clone();
	const contentType = clonedRequest.headers.get("content-type") ?? "";
	const isMultipartForm = contentType.includes("multipart/form-data");
	const checkCsrf = async () => {
		const requestOrigin = clonedRequest.headers.get("origin");
		const url = new URL(clonedRequest.url);
		return enableCSRFProtection ? requestOrigin === url.origin : true;
	};
	const isValidRequestOrigin = checkCsrf();
	if (clonedRequest.method !== "POST" || !isValidRequestOrigin) {
		return new ServerIgnoreResult({ inputValues: {} });
	}
	const formData = new FormData();
	const acceptHeader = clonedRequest.headers.get("accept");
	if (isMultipartForm) {
		const boundary = contentType.replace("multipart/form-data; boundary=", "");
		const bodyArrayBuffer = await clonedRequest.arrayBuffer();
		const parts = parse(new Uint8Array(bodyArrayBuffer), boundary);
		parts.forEach((value) => {
			const isFile = "type" in value;
			if (isFile) {
				formData.append(value.name!, new Blob([value.data]), value.filename!);
			} else {
				const textDecoder = new TextDecoder();
				formData.append(value.name!, textDecoder.decode(value.data));
			}
		});
	} else {
		const requestBodyFormData = await clonedRequest.formData();
		requestBodyFormData.forEach((value, key) => {
			formData.append(key, value);
		});
	}
	const inputValues = Object.fromEntries(
		[...formData.entries()].filter(
			(val): val is [string, string] => typeof val[1] === "string"
		)
	);
	const result = (await handle(formData)) as Awaited<ReturnType<Handle>>;
	const isJsonRequest = acceptHeader === "application/json";
	if (result instanceof ResolveResponse) {
		const body = result.body;
		const response = isJsonRequest
			? new Response(JSON.stringify(new ResolvedResult(body)))
			: null;
		return new ServerResolvedResult(
			{
				body,
				inputValues
			},
			response
		) as any;
	}
	if (result instanceof RejectResponse) {
		const errorData = result.data;
		const status = result.status;
		const response = isJsonRequest
			? new Response(JSON.stringify(new RejectedResult(errorData)), {
					status
			  })
			: null;
		astroResponse.status = status;
		return new ServerRejectedResult(
			{
				errorData,
				inputValues
			},
			response
		) as any;
	}
	if (result instanceof RedirectResponse) {
		const redirectLocation = result.location;
		const status = result.status;
		const response = isJsonRequest
			? new Response(JSON.stringify(new RedirectResult(redirectLocation)), {
					status
			  })
			: new Response(null, {
					status,
					headers: {
						location: redirectLocation
					}
			  });
		return new ServerRedirectResult(
			{
				inputValues,
				redirectLocation
			},
			response
		) as any;
	}
	throw new Error("Invalid result");
};
