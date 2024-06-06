import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [react(), checker({ typescript: true })],
  build: {
    commonjsOptions: { transformMixedEsModules: true }, // Change
  },
});

// I added this plugin below to have ts complains displayed on console, below is the default vite.config.ts before the changes: :
//npm install vite-plugin-checker --save-dev
