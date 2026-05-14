import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

const rootDir = dirname(fileURLToPath(import.meta.url));

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  html: {
    title: "Chat",
  },
  plugins: [pluginReact()],
  dev: {
    lazyCompilation: false,
  },
  resolve: {
    alias: {
      "@": resolve(rootDir, "src"),
    },
  },
});
