import type {
	RedirectResult,
	RejectedResult,
	ResolvedResult
} from "../result.js";

export const submitForm = async <
	Body extends {} = {},
	ErrorData extends {} = {}
>(
	element: HTMLFormElement,
	handleRedirect: (location: string) => void = (location) =>
		(window.location.href = location)
) => {
	type ClientResult =
		| ResolvedResult<Body>
		| RejectedResult<ErrorData>
		| RedirectResult;
	const formData = new FormData(element);
	const response = await fetch(element.action, {
		method: element.method,
		body: formData,
		headers: {
			accept: "application/json"
		}
	});
	const result = (await response.json()) as ClientResult;
	if (result.type === "redirect") {
		handleRedirect(result.redirectLocation);
	}
	return result;
};
