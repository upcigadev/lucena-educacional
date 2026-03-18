import { defineConfig } from "vite";

import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins: any[] = [
    react(),
    mode === "development" && componentTagger(),
  ];

  // Only load Electron plugin when running locally (not in cloud builds)
  if (process.env.ELECTRON === "true") {
    try {
      const electron = require("vite-plugin-electron/simple");
      plugins.push(
        electron({
          main: {
            entry: "electron/main.ts",
            vite: {
              build: {
                rollupOptions: {
                  external: ["@prisma/client"],
                },
              },
            },
          },
          preload: { input: "electron/preload.ts" },
        })
      );
    } catch {
      // electron plugin not available
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: plugins.filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
