export default () => {
	return (
		<form enctype="multipart/form-data" method="post" class="w-full">
			<textarea name="notes" id="notes" class="w-full px-2 py-1.5 border" rows="3" />
			<input
				type="submit"
				name="Save"
				class="w-full my-2 bg-black text-white py-1.5 cursor-pointer hover:bg-zinc-800"
			/>
		</form>
	);
};
