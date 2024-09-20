import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/analysis-image.js'),
      name: 'analysis-image-sdk',
      fileName: (format) => `analysis-image-sdk.${format}.js`
    },
    rollupOptions: {
      // external: ['vue', 'naive-ui'],
      external: [], // 设置为空，将vue和naive-ui都打包进sdk
      output: {
        globals: {
          // vue: 'Vue',
          // naive_ui: 'NaiveUI'
        }
      }
    }
  }
});