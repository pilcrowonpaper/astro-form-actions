import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";
import solidJs from "@astrojs/solid-js";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  integrations: [tailwind(), solidJs()],
  output: "server",
  adapter: vercel()
});