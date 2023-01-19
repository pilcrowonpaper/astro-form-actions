import type {
	RedirectResponse,
	RejectResponse,
	ResolveResponse
} from "./response.js";

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

export type ResolvedResult<Body extends {}> = {
	type: "resolved";
	response: Response | null;
	body: Body;
	inputValues: Record<string, any>;
	error: null;
	redirected: false;
};

export type RejectedResult<ErrorData extends {}> = {
	type: "rejected";
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
	Resolve extends ResolveResponse<any> | never,
	Reject extends RejectResponse<any> | never,
	Redirect extends RedirectResponse | never
> =
	| ConditionalUnion<
			[
				[Resolve, ResolvedResult<Resolve["body"]>],
				[Reject, RejectedResult<Reject["data"]>],
				[Redirect, RedirectResult]
			]
	  >
	| IgnoreResult;

export type ResolvedJsonResult<Body extends {}> = {
	type: "resolved";
	body: Body;
	error: null;
	redirect_location: null;
};
export type RejectedJsonResult<ErrorData extends {}> = {
	type: "rejected";
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
