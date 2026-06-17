import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.jpg", "logo.png", "robots.txt", "hero/*.jpg"],
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest,txt,xml,jpg,jpeg,webp}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.searchParams.has('code') ||
              url.searchParams.has('error') ||
              url.searchParams.has('access_token'),
            handler: "NetworkOnly",
          },
          {
            urlPattern: ({ request, url }) =>
              request.mode === "navigate" && !url.searchParams.has('code'),
            handler: "NetworkFirst",
            options: {
              cacheName: "html-pages",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5174,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
