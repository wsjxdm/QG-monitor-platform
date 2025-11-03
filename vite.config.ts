import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          antd: ["antd"],
          moment: ["moment"],
        },
      },
    },
  },
  css: {
    modules: {
      scopeBehaviour: "local",
      generateScopedName: "[name]_[local]_[hash:base64:5]",
      hashPrefix: "prefix",
      localsConvention: "camelCaseOnly",
    },
  },
});
