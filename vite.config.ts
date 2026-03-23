import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Electron main process
    electron([
      {
        // Main process entry
        entry: "electron/main.ts",
        vite: {
          build: {
            outDir: "dist-electron",
            sourcemap: mode === "development",
            minify: mode !== "development",
            rollupOptions: {
              external: ["electron"],
            },
          },
        },
      },
    ]),
    // Allow renderer process to use Node.js modules
    renderer(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
