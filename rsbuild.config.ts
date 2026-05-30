import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginTailwindcss } from "@rsbuild/plugin-tailwindcss";

const rootDir = dirname(fileURLToPath(import.meta.url));

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  html: {
    title: "Chat",
  },
  plugins: [pluginReact(), pluginTailwindcss()],
  resolve: {
    alias: {
      "@": resolve(rootDir, "src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  output: {
    injectStyles: process.env.NODE_ENV === "development",
  },
});
