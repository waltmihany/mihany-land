import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/nasu-farm-react/",
  plugins: [react()],
  server: {
    fs: {
      allow: [".."]
    }
  }
});
