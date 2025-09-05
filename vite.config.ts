import { defineConfig } from "vite";

export default defineConfig({
  base: "/mermaid-floorplan/",
  build: {
    outDir: "build",
  },
  optimizeDeps: {
    include: ["monaco-editor"],
  },
});
