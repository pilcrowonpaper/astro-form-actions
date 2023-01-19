import type { AstroGlobal } from "astro";
import { parse } from "parse-multipart-data";
import type {
	RedirectJsonResult,
	RedirectResult,
	RejectedJsonResult,
	RejectedResult,
	Result,
	ResolvedJsonResult,
	ResolvedResult
} from "./types.js";
import {
	RedirectResponse,
	RejectResponse,
	ResolveResponse
} from "./response.js";

type ExtractResolveResponse<Handle extends (...args: any) => any> = Extract<
	Awaited<ReturnType<Handle>>,
	InstanceType<typeof ResolveResponse>
>;

type ExtractRejectResponse<Handle extends (...args: any) => any> = Extract<
	Awaited<ReturnType<Handle>>,
	InstanceType<typeof RejectResponse>
>;

type ExtractRedirectResponse<Handle extends (...args: any) => any> = Extract<
	Awaited<ReturnType<Handle>>,
	InstanceType<typeof RedirectResponse>
>;

export const handleFormSubmission = async <
	R extends {
		request: Request;
		response: AstroGlobal["response"];
	},
	Handle extends (formData: FormData) => Promise<Record<string, any>>
>(
	{ request, response }: R,
	handle: Handle
): Promise<
	Result<
		ExtractResolveResponse<Handle>,
		ExtractRejectResponse<Handle>,
		ExtractRedirectResponse<Handle>
	>
> => {
	const clonedRequest = request.clone();
	const contentType = clonedRequest.headers.get("content-type") ?? "";
	const isMultipartForm = contentType.includes("multipart/form-data");
	const isUrlEncodedForm = contentType.includes(
		"application/x-www-form-urlencoded"
	);
	const isValidContentType = isMultipartForm || isUrlEncodedForm;
	if (clonedRequest.method !== "POST" || !isValidContentType)
		return {
			type: "ignore",
			response: null,
			body: null,
			inputValues: {},
			error: null,
			redirected: false
		};
	const formData = new FormData();
	const acceptHeader = clonedRequest.headers.get("accept");
	if (isMultipartForm) {
		const boundary = contentType.replace("multipart/form-data; boundary=", "");
		const parts = parse(
			Buffer.from(await clonedRequest.arrayBuffer()),
			boundary
		);
		parts.forEach((value) => {
			const isFile = !!value.type;
			if (isFile) {
				formData.append(value.name!, new Blob([value.data]), value.filename!);
			} else {
				formData.append(value.name!, value.data.toString());
			}
		});
	} else if (isUrlEncodedForm) {
		const requestBodyFormData = await clonedRequest.formData();
		requestBodyFormData.forEach((value, key) => {
			formData.append(key, value);
		});
	} else {
		throw new Error("Unexpected value");
	}
	const inputValues = Object.fromEntries(formData.entries());
	const result = (await handle(formData)) as Awaited<ReturnType<Handle>>;
	if (result instanceof RejectResponse) {
		const type = "rejected";
		const body = null;
		const redirected = false;
		const error = result.data;
		const status = result.status;
		if (acceptHeader === "application/json") {
			return {
				type,
				body,
				response: new Response(
					JSON.stringify({
						type,
						body,
						error,
						redirect_location: null
					} satisfies RejectedJsonResult<typeof error>),
					{
						status
					}
				),
				inputValues,
				error,
				redirected
			} satisfies RejectedResult<typeof error> as any;
		}
		response.status = status;
		return {
			type,
			body,
			response: null,
			inputValues,
			error,
			redirected
		} satisfies RejectedResult<typeof error> as any;
	}
	if (result instanceof RedirectResponse) {
		const type = "redirect";
		const body = null;
		const redirected = true;
		const error = null;
		const redirectLocation = result.location;
		const redirectResponse =
			acceptHeader === "application/json"
				? new Response(
						JSON.stringify({
							type,
							body,
							error,
							redirect_location: redirectLocation
						} satisfies RedirectJsonResult),
						{
							status: result.status
						}
				  )
				: new Response(null, {
						status: result.status,
						headers: {
							location: redirectLocation
						}
				  });
		return {
			type,
			body,
			response: redirectResponse,
			inputValues,
			error,
			redirected
		} satisfies RedirectResult as any;
	}
	const body = result;
	const type = "resolved";
	const redirected = false;
	const error = null;
	if (acceptHeader === "application/json") {
		return {
			type,
			body,
			response: new Response(
				JSON.stringify({
					type,
					body,
					error,
					redirect_location: null
				} satisfies ResolvedJsonResult<typeof body>)
			),
			inputValues,
			error,
			redirected
		} satisfies ResolvedResult<typeof body> as any;
	}
	return {
		type,
		body,
		response: null,
		inputValues,
		error,
		redirected
	} satisfies ResolvedResult<typeof body> as any;
};

export const reject = <Data extends {} | undefined>(
	status: number,
	data?: Data
) => {
	return new RejectResponse(
		status,
		(data ?? {}) as Data extends undefined ? {} : Data
	);
};

export const redirect = (status: number, location: string) => {
	return new RedirectResponse(status, location);
};

export const resolve = <Body extends {}>(body: Body) => {
	return new ResolveResponse(body);
};
