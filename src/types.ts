import type { RedirectResponse, RejectResponse } from "./response.js";

// for each T as [typeA, typeB]
// return typeB if typeA is not never
type ConditionalUnion<T extends [any, any][]> = Exclude<
	{
		[K in keyof T]: T[K][0] extends never ? never : T[K][1];
	}[number],
	never
>;

type IgnoreResult = {
	type: "ignore";
	response: null;
	body: null;
	inputValues: Record<string, any>;
	error: null;
	redirected: false;
};

export type SuccessResult<Body extends {}> = {
	type: "success";
	response: Response | null;
	body: Body;
	inputValues: Record<string, any>;
	error: null;
	redirected: false;
};

export type RejectResult<ErrorData extends {}> = {
	type: "reject";
	response: Response | null;
	body: null;
	inputValues: Record<string, any>;
	error: ErrorData;
	redirected: false;
};

export type RedirectResult = {
	type: "redirect";
	response: Response;
	body: null;
	inputValues: Record<string, any>;
	error: null;
	redirected: true;
};

export type Result<
	Body extends {} | never,
	Reject extends RejectResponse<any> | never,
	Redirect extends RedirectResponse | never
> =
	| ConditionalUnion<
			[
				[Body, SuccessResult<Body>],
				[Reject, RejectResult<Reject["data"]>],
				[Redirect, RedirectResult]
			]
	  >
	| IgnoreResult;

export type SuccessJsonResult<Body extends {}> = {
	type: "success";
	body: Body;
	error: null;
	redirect_location: null;
};
export type RejectJsonResult<ErrorData extends {}> = {
	type: "reject";
	body: null;
	error: ErrorData;
	redirect_location: null;
};
export type RedirectJsonResult = {
	type: "redirect";
	body: null;
	error: null;
	redirect_location: string;
};
