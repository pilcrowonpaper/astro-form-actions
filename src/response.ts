export class RejectResponse<ErrorData extends {}> {
	public readonly type = "reject";
	public status: number;
	public data: ErrorData;
	constructor(status: number, data: ErrorData) {
		this.status = status;
		this.data = data ?? {};
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
