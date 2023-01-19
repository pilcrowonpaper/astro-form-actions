# Astro form actions

Use progressive form enhancement and handle form submissions in Astro.

```
npm i astro-form-actions
pnpm add astro-form-actions
yarn add astro-form-actions
```

**Documentation: https://github.com/pilcrowOnPaper/astro-form-actions/wiki**

**Demo: https://astro-form-actions.vercel.app**

> Need a library to parse your forms? Check out my other project [Adria](https://github.com/pilcrowOnPaper/adria)!

### Features

- Simple
- Type inference
- Supports multipart form data
- Framework agnostic

## Overview

This library is made up of 2 parts: server side and client side.

### Server side

`handleFormSubmission` will handle all POST requests to the page.

```ts
// inside .astro page
import {
	handleFormSubmission,
	reject,
	resolve,
	redirect
} from "astro-form-actions";

const { response, error, inputValues, body } = await handleFormSubmission(
	Astro,
	async (formData) => {
		const message = formData.get("message");
		if (typeof notes !== "string")
			return reject(400, {
				message: "bad input"
			});
		// do some stuff
		return resolve({
			success: true
		});
	}
);
if (response) return response;
```

### Client side

You can use a regular HTML form:

```html
<form method="post">
	<input name="message" />
	<input type="submit" />
</form>
```

Or, by using component frameworks like Solid (or just even vanilla JS), you can use `submitForm` to make the submission.

```tsx
import { submitForm } from "astro-form-actions/client";

export default () => {
	return (
		<form
			method="post"
			onSubmit={(e) => {
				e.preventDefault();
				const { error } = await submitForm<
					{
						success: boolean;
					},
					{
						message: string;
					}
				>(e.currentTarget);
			}}
		>
			<input name="message" />
			<input type="submit" />
		</form>
	);
};
```
