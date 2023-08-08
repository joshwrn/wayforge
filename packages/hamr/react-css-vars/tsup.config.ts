import { defineConfig } from "tsup"

export default defineConfig({
	entry: [`../src/react-css-vars/index.ts`],
	outDir: `./dist`,
	dts: true,
	format: [`esm`, `cjs`],
	splitting: false,
	sourcemap: true,
	clean: true,
	external: [`react`, `@emotion/react`, `fp-ts`],
})
