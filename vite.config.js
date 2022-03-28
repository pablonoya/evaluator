import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  proxy: {
    "/eval": "http://localhost:8000",
  },
  build: {
    manifest: true,
    outDir: "./dist/",
    rollupOptions: {
      // overwrite default .html entry
      input: "./src/main.jsx",
    },
  },
  // base: process.env === "production" ? "/static/" : "/",
  root: "./src",
  plugins: [react()],
})
