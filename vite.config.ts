import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  // "/" is correct for Vercel. GitHub Pages would need "/smart-waste-hub/"
  base: "/",
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // In local dev, forward /api calls to the local Express server on port 5000
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    },
    hmr: { overlay: false },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
