import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), dts()],
  build: {
    lib: {
      entry: resolve(__dirname, "index.ts"),
      name: "@cafeore-2024/common",
      fileName: "index",
      formats: ["es"],
    },
  },
});
