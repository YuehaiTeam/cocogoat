import { defineConfig, splitVendorChunkPlugin, loadEnv } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import ifdefPlugin from './scripts/vite-ifdef'
import importExternal from './scripts/vite-external'
import { viteWorkerMacro } from './scripts/workermacro'
import ignoreNolocal from './scripts/vite-ignore-nolocal'
import gzipAssets from './scripts/vite-gzip-assets'
import inlineFavicon from './scripts/vite-inline-favicon'
import { visualizer } from 'rollup-plugin-visualizer'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { singleFileHTML } from './scripts/vite-singlefile'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import checker from 'vite-plugin-checker'
import vue from '@vitejs/plugin-vue'
import GitInfo from 'git-repo-info'
import { resolve } from 'path'
import dayjs from 'dayjs'
const gitInfo = GitInfo()
const isCI = !!process.env.SENTRY_KEY
const useCDN = process.argv.includes('--cdn') || isCI
const singleFile = process.argv.includes('--singlefile')
const isTest = process.argv.includes('--test') || process.env.CF_PAGES === '1'
const useSentry =
    !process.argv.includes('--no-sentry') && process.env.NODE_ENV === 'production' && !!process.env.SENTRY_KEY
process.env.VUE_APP_BUILD = dayjs().format('YYMMDDHHmm')
process.env.VUE_APP_TEST = isTest ? 'true' : 'false'
process.env.VUE_APP_ROUTER_HASH = singleFile ? 'true' : 'false'
process.env.VUE_APP_SINGLEFILE = singleFile ? 'true' : 'false'
process.env.VUE_APP_LOCALRES = singleFile || process.env.NODE_ENV === 'development' ? 'true' : 'false'
process.env.VUE_APP_TIMESTAMP = Date.now().toString()
process.env.VUE_APP_GIT_SHA = (gitInfo.abbreviatedSha || '').substring(0, 8)
process.env.VUE_APP_GIT_BRC = gitInfo.branch || 'unknown'
process.env.VUE_APP_GIT_MSG =
    ((gitInfo.commitMessage || '').split('-----END PGP SIGNATURE-----')[1] || '').trim() || gitInfo.commitMessage || ''
console.log(
    `[cocogoat-web][vite] Build ${process.env.NODE_ENV} ${process.env.VUE_APP_GIT_BRC}#${process.env.VUE_APP_GIT_SHA}/${process.env.VUE_APP_BUILD}`,
)
console.log(`SingleFile: ${singleFile}, CDN: ${useCDN}, Sentry: ${useSentry}\n`)
console.log(process.env.VUE_APP_GIT_MSG)
console.log('')

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, __dirname, 'VUE_APP_')
    const base = singleFile ? './' : process.env.NODE_ENV === 'production' && useCDN ? 'https://gi.cocogoat.cn/' : '/'
    return {
        base: base,
        define: Object.keys(env).reduce(
            (acc, key) => {
                acc[`process.env.${key}`] = JSON.stringify(env[key])
                return acc
            },
            {
                'process.env.BASE_URL': JSON.stringify(base),
            },
        ),
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
                lodash: 'lodash-es',
            },
        },
        build: {
            reportCompressedSize: false,
        },
        esbuild: {
            charset: 'utf8',
            legalComments: 'external',
        },
        css: {
            modules: {
                localsConvention: 'camelCaseOnly',
                generateScopedName: '[local]-[hash:6]',
            },
        },
        plugins: [
            checker({
                typescript: true,
                vueTsc: true,
                eslint:
                    command === 'build'
                        ? undefined
                        : {
                              lintCommand: 'eslint ./**/*.{js,ts,vue} --ext .js,.ts,.vue',
                          },
            }),
            vue(),
            AutoImport({
                resolvers: [ElementPlusResolver()],
            }),
            Components({
                dirs: [],
                resolvers: [ElementPlusResolver()],
            }),
            viteWorkerMacro(command === 'serve' ? 'vite-dev' : singleFile ? 'vite-singlefile' : 'vite'),
            ifdefPlugin({
                option: { verbose: false },
                data: {
                    SINGLEFILE: singleFile,
                    VITE: true,
                    WEBPACK: false,
                    VITE_DEV: command === 'serve',
                },
            }),
            importExternal({
                'monaco-editor': 'monaco',
            }),
            visualizer({
                emitFile: true,
                filename: 'dist/report.html',
            }),
            createHtmlPlugin({
                minify: true,
                entry: 'src/main.ts',
            }),
            ...(singleFile
                ? [
                      ignoreNolocal(),
                      viteSingleFile({
                          removeViteModuleLoader: true,
                      }),
                      gzipAssets(),
                      singleFileHTML(),
                      inlineFavicon(),
                  ]
                : [splitVendorChunkPlugin()]),
        ],
    }
})
