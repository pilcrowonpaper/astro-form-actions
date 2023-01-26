import {
	RedirectResult,
	RejectedResult,
	ResolvedResult,
	Result
} from "../result";

type InputValues = Record<string, string | undefined>;

type ServerResult = Omit<Result, "type"> & {
	type: Result["type"] | "ignore";
	response: null | Response;
	inputValues: InputValues;
};

export class ServerIgnoreResult implements ServerResult {
	public readonly type = "ignore";
	public readonly body = null;
	public readonly error = null;
	public readonly redirectLocation = null;
	public readonly response = null;
	public readonly inputValues;
	constructor({ inputValues }: { inputValues: InputValues }) {
		this.inputValues = inputValues;
	}
}

export class ServerResolvedResult<Body extends {}>
	extends ResolvedResult<Body>
	implements ServerResult
{
	public readonly response;
	public readonly inputValues;
	constructor(
		{
			body,
			inputValues
		}: {
			body: Body;
			inputValues: InputValues;
		},
		response: Response | null
	) {
		super(body);
		this.inputValues = inputValues;
		this.response = response;
	}
}

export class ServerRejectedResult<ErrorData extends {}>
	extends RejectedResult<ErrorData>
	implements ServerResult
{
	public readonly response;
	public readonly inputValues;
	constructor(
		{
			errorData,
			inputValues
		}: {
			errorData: ErrorData;
			inputValues: InputValues;
		},
		response: Response | null
	) {
		super(errorData);
		this.inputValues = inputValues;
		this.response = response;
	}
}

export class ServerRedirectResult
	extends RedirectResult
	implements ServerResult
{
	public readonly response;
	public readonly inputValues;
	constructor(
		{
			redirectLocation,
			inputValues
		}: {
			redirectLocation: string;
			inputValues: InputValues;
		},
		response: Response
	) {
		super(redirectLocation);
		this.inputValues = inputValues;
		this.response = response;
	}
}
