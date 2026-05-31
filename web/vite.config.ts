import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig(() => {
  const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1]
  const base = process.env.GITHUB_PAGES === "true" && repoName ? `/${repoName}/` : "/"

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@wishtracker/shared": path.resolve(__dirname, "../packages/shared/src/index.ts"),
      },
    },
    server: {
      port: 3011,
      host: true,
      proxy: {
        "/api": {
          target: "http://127.0.0.1:3010",
          changeOrigin: true,
        },
      },
    },
  }
})
