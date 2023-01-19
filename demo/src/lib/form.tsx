import { createSignal } from "solid-js";

type ErrorData = {
	message: string;
};

export default ({
	error,
	notes
}: {
	error: ErrorData | null;
	notes: string;
}) => {
	const [errorMessage, setErrorMessage] = createSignal(error?.message ?? null);
	return (
		<form
			enctype="multipart/form-data"
			method="post"
			class="w-full"
			onSubmit={async (e) => {}}
		>
			<p>Typing "invalid" will result in an error</p>
			<textarea
				name="notes"
				id="notes"
				class="w-full px-2 py-1.5 border"
				rows="3"
			>
				{notes}
			</textarea>
			<p class="text-red-400">{errorMessage()}</p>
			<input
				type="submit"
				name="Save"
				class="w-full my-2 bg-black text-white py-1.5 cursor-pointer hover:bg-zinc-800"
			/>
		</form>
	);
};
