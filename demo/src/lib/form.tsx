import { createSignal } from "solid-js";
import { submitForm } from "astro-form-actions/client";

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
			onSubmit={async (e) => {
				e.preventDefault()
				const { error } = await submitForm<{}, ErrorData>(e.currentTarget);
				setErrorMessage(error?.message ?? null);
			}}
		>
			<p>Type "invalid" to error, "redirect" to redirect</p>
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
				value="Save"
				class="w-full my-2 bg-black text-white py-1.5 cursor-pointer hover:bg-zinc-800"
			/>
		</form>
	);
};
