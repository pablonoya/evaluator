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
  resolve: {
    alias: [
      {
        find: /^@mui\/icons-material\/(.*)/,
        replacement: "@mui/icons-material/esm/$1",
      },
    ],
  },
  root: "./src",
  plugins: [react()],
})
