import { defineConfig } from 'vite'
import { resolve } from 'path'
import { viteSingleFile } from 'vite-plugin-singlefile'
export default defineConfig({
    root: './loader',
    build: {
        polyfillModulePreload: false,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    plugins: [viteSingleFile()],
})
