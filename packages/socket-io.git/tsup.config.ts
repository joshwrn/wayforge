import { defineConfig } from "tsup"

const entry = [
  `socket-git-node`,
  `socket-git-recoil`,
  `socket-git-atom-client`,
].map((path) => `src/${path}.ts`)

export default defineConfig({
  entry,
  dts: true,
  format: [`esm`, `cjs`],
  splitting: false,
  sourcemap: true,
  clean: true,
})
