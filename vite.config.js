import vue from '@vitejs/plugin-vue'
import path from 'path'

export default {
  base: process.env.VITE_BASE_PATH,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    sourcemap: false,
    // 方案1: 使用terser (需要安装terser依赖)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 方案2: 使用esbuild (不需要额外依赖，注释上面的terser相关配置并取消注释下面这行)
    // minify: 'esbuild',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
        }
      }
    },
    // 启用构建缓存
    cache: true,
    // 并行处理
    cssCodeSplit: true
  }
}
