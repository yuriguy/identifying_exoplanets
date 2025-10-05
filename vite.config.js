// vite.config.ts (ou .js)
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    proxy: {
      // Proxy requests to /predict to your local Flask API
      "/predict": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false,
      },
      // tudo que começar com /TAP vai pra NASA
      "/TAP": {
        target: "https://exoplanetarchive.ipac.caltech.edu",
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
