export type Result = {
	type: "resolved" | "rejected" | "redirect";
	body: null | {};
	error: null | {};
	redirectLocation: null | string;
};

export class ResolvedResult<Body extends {}> implements Result {
	public readonly type = "resolved";
	public readonly body: Body;
	public readonly error = null;
	public readonly redirectLocation = null;
	constructor(body: Body) {
		this.body = body;
	}
}

export class RejectedResult<ErrorData extends {}>
	implements Result
{
	public readonly type = "rejected";
	public readonly body = null;
	public readonly error: ErrorData;
	public readonly redirectLocation = null;
	constructor(error: ErrorData) {
		this.error = error;
	}
}

export class RedirectResult implements Result {
	public readonly type = "redirect";
	public readonly body = null;
	public readonly error = null;
	public readonly redirectLocation: string;
	constructor(redirectLocation: string) {
		this.redirectLocation = redirectLocation;
	}
}