import { defineConfig } from "vite";
import { viteMockServe } from "vite-plugin-mock";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    viteMockServe({
      mockPath: "src/mock", // 确保路径正确
      enable: true,
      watchFiles: true, // 监听mock文件变化
      localEnabled: true, // 本地开发环境启用
    }),
  ],
  server: {
    headers: {
      "Content-Security-Policy": "frame-ancestors 'none'",
    },
  },
});
