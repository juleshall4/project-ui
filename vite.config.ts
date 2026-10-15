import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // Some Coss examples read Next.js env vars; give them an empty stand-in.
  define: { "process.env": "{}" },
  plugins: [react(), tailwindcss()],
  server: {
    // Transform the showcase and every example at startup, so first visits are quick.
    warmup: { clientFiles: ["./src/showcase/*.tsx", "./src/components/**/*.tsx"] },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "next/link": path.resolve(import.meta.dirname, "./src/showcase/next-link.tsx"),
    },
  },
});
