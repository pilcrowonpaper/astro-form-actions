import { parse } from "./multipart-form";

export const parseRequestBody = async (request: Request) => {
	const clonedRequest = request.clone();
	const contentType = request.headers.get("content-type") ?? "";
	const isMultipartForm = contentType.includes("multipart/form-data");
	const formData = new FormData();
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
};
