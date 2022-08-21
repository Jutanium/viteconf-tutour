import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import UnocssPlugin from "unocss/vite";

export default defineConfig({
  plugins: [solidPlugin(), UnocssPlugin()],
  server: {
    port: 3000,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  build: {
    target: "esnext",
  },
});
