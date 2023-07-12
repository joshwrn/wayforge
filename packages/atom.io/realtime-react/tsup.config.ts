import { defineConfig } from "tsup"

export default defineConfig({
  entry: [`../src/realtime-react/index.ts`],
  outDir: `./dist`,
  dts: true,
  format: [`esm`, `cjs`],
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [`atom.io`, `fp-ts`, `socket.io-client`, `react`, `@emotion/react`],
})
