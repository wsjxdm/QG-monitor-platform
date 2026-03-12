import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";//处理jsx的插件
import { visualizer } from 'rollup-plugin-visualizer'; // 默认导入
import { viteMockServe } from 'vite-plugin-mock'; // 导入插件

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true, // 打包完成后自动打开分析页面
      gzipSize: true, // 显示gzip压缩后的大小
      brotliSize: true, // 显示brotli压缩后的大小
      filename: 'bundle-analyze.html' // 生成的分析文件名（可选）
    }),
    viteMockServe({
      // supportTs: false, // 如果你使用 TypeScript，可以设置为 true
      logger: false, // 控制台日志开关
      mockPath: './src/mock', // 设置模拟接口数据文件的存放目录，根目录为项目根目录
    }),
  ],//使用React插件
  server: {
    port: 3000,
    open: true,
  },
});
