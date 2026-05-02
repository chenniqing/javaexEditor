import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/lib/index.js", import.meta.url)),
      name: "JavaexEditor",
      fileName: "javaex-editor"
    },
    rollupOptions: {
      output: {
        exports: "named"
      }
    }
  }
});
