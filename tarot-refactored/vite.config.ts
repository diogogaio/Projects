import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), checker({ typescript: false })],
  server: {
    port: 3081, // Set the port to 3081
  },
  build: {
    commonjsOptions: { transformMixedEsModules: true }, // Change
  },
});
