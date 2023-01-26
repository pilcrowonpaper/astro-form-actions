export class RejectResponse<ErrorData extends {}> {
	public readonly type = "rejected";
	public status: number;
	public data: ErrorData;
	constructor(status: number, data: ErrorData) {
		this.status = status;
		this.data = data;
	}
}

export class RedirectResponse {
	public readonly type = "redirect";
	public status: number;
	public location: string;
	constructor(status: number, location: string) {
		this.status = status;
		this.location = location;
	}
}

export class ResolveResponse<Body extends {}> {
	public readonly type = "resolved";
	public body: Body;
	constructor(body: Body) {
		this.body = body;
	}
}

export type ExtractResolveResponse<Handle extends (...args: any) => any> = Extract<
	Awaited<ReturnType<Handle>>,
	InstanceType<typeof ResolveResponse>
>;

export type ExtractRejectResponse<Handle extends (...args: any) => any> = Extract<
	Awaited<ReturnType<Handle>>,
	InstanceType<typeof RejectResponse>
>;

export type ExtractRedirectResponse<Handle extends (...args: any) => any> = Extract<
	Awaited<ReturnType<Handle>>,
	InstanceType<typeof RedirectResponse>
>;


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

export const resolve = <Body extends {} | undefined>(body?: Body) => {
	return new ResolveResponse(
		(body ?? {}) as Body extends undefined ? {} : Body
	);
};

