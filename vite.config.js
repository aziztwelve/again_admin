import path from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [
    vue(),
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "pinia",
        // другие автоматические импорты
      ],
      dts: "src/auto-imports.d.ts", // генерирует файл с типами
      eslintrc: {
        enabled: true, // генерирует .eslintrc-auto-import.json
      },
    }),
    Components({
      dirs: ["src/components"], // директория для компонентовå
      dts: "src/components.d.ts", // генерирует файл с типами компонентов
      // Если используете UI библиотеки, добавьте резолверы:
      // resolvers: [
      //   (componentName) => {
      //     if (componentName.startsWith('Ui'))
      //       return { name: componentName, from: '@/components/ui' }
      //   },
      // ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
