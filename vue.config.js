const { createRequire } = require('module')
const requireDependency = createRequire(require.resolve('@vue/cli-service'))
const webpack = requireDependency('webpack')
const { resolve } = require('path')
const HtmlWebpackPlugin = requireDependency('html-webpack-plugin')
const corsWorkerPlugin = require('./scripts/corsWorkerPlugin')
const InlineChunkHtmlPlugin = require('./scripts/InlineChunkHtmlPlugin')
const DeleteSourceMapPlugin = require('./scripts/deleteSourceMapPlugin')
const InlineFaviconHtmlPlugin = require('./scripts/InlineFaviconHtmlPlugin')
const EntrypointJsonPlugin = require('./scripts/entrypointJsonPlugin')
const { defineConfig } = require('@vue/cli-service')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')
const gitInfo = require('git-repo-info')()
const singleFileDLL = process.argv.includes('--singlefile-dll')
const singleFile = process.argv.includes('--singlefile') || singleFileDLL
const SentryPlugin = require('@sentry/webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const isCI = !!process.env.SENTRY_KEY
const isTest = process.argv.includes('--test') || process.env.CF_PAGES === '1'
const useCDN = process.argv.includes('--cdn') || isCI
const usePreJS = process.argv.includes('--prejs') || false // isCI
const useSWC = isCI
    ? 'false'
    : process.argv.includes('--no-swc')
      ? 'false'
      : process.argv.includes('--no-swc-minify')
        ? 'compile'
        : 'true'
const useSentry = false
// !process.argv.includes('--no-sentry') && process.env.NODE_ENV === 'production' && !!process.env.SENTRY_KEY
process.env.VUE_APP_BUILD = require('dayjs')().format('YYMMDDHHmm')
process.env.VUE_APP_ROUTER_HASH = singleFile ? 'true' : 'false'
process.env.VUE_APP_SINGLEFILE = singleFile ? 'true' : 'false'
process.env.VUE_APP_LOCALRES = singleFile || process.env.NODE_ENV === 'development' ? 'true' : 'false'
process.env.VUE_APP_TIMESTAMP = Date.now()
process.env.VUE_APP_TEST = isTest ? 'true' : 'false'
process.env.VUE_APP_GIT_SHA = (gitInfo.abbreviatedSha || '').substring(0, 8)
process.env.VUE_APP_GIT_BRC = gitInfo.branch || 'unknown'
process.env.VUE_APP_GIT_MSG =
    ((gitInfo.commitMessage || '').split('-----END PGP SIGNATURE-----')[1] || '').trim() || gitInfo.commitMessage || ''
console.log(
    `[cocogoat-web] Build ${process.env.NODE_ENV} ${process.env.VUE_APP_GIT_BRC}#${process.env.VUE_APP_GIT_SHA}/${process.env.VUE_APP_BUILD}`,
)
console.log(`SingleFile: ${singleFile}, CDN: ${useCDN}, PreJS: ${usePreJS}, SWC: ${useSWC}, Sentry: ${useSentry}`)
console.log('')
console.log(process.env.VUE_APP_GIT_MSG)
console.log('')

const PREJS_PROD_SUFFIX = process.env.NODE_ENV === 'production' ? '.prod' : ''
const PREJS_URL =
    'https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/??' +
    [
        `vue/3.2.31/vue.runtime.global${PREJS_PROD_SUFFIX}.min.js`,
        `vue-router/4.0.13/vue-router.global${PREJS_PROD_SUFFIX}.min.js`,
        'font-awesome/6.0.0/js/fontawesome.min.js',
    ].join(',')
const preJsExt = {
    vue: 'var Vue',
    'vue-router': 'var VueRouter',
    '@vue/reactivity': 'var Vue',
    '@fortawesome/fontawesome-svg-core': 'var FontAwesome',
}
if (usePreJS) {
    process.env.VUE_APP_PREJS_URL = PREJS_URL
}

module.exports = defineConfig({
    publicPath: singleFile ? '.' : process.env.NODE_ENV === 'production' && useCDN ? 'https://gi.cocogoat.cn/' : '/',
    assetsDir: 'static',
    transpileDependencies: true,
    productionSourceMap: true,
    parallel: false,
    // worker-loader、sentry-plugin都和thread-loader冲突
    // swc/esbuild下thread-loader降低速度
    devServer: {
        headers: {
            'Service-Worker-Allowed': '/',
        },
    },
    css: {
        extract: singleFile
            ? false
            : {
                  ignoreOrder: true,
              },
        loaderOptions: {
            css: {
                modules: {
                    auto: false,
                    localIdentName: '[local]-[hash:6]',
                    exportLocalsConvention: 'camelCaseOnly',
                },
            },
        },
    },
    terser: {
        minify: useSWC === 'true' ? 'swc' : 'terser',
        terserOptions: {
            format: {
                ascii_only: false,
            },
        },
    },
    configureWebpack: {
        plugins: [
            AutoImport.default({
                resolvers: [ElementPlusResolver()],
            }),
            Components.default({
                dirs: [],
                resolvers: [ElementPlusResolver()],
            }),
        ],
    },
    chainWebpack: (config) => {
        config.plugin('html').tap((args) => {
            args[0].template = resolve(__dirname, 'index.html')
            return args
        })
        config.output.set('chunkLoadingGlobal', 'define')
        config.plugins.delete('prefetch')
        config.plugins.delete('preload')
        config.module.rule('asset-raw').type('asset/source').set('resourceQuery', /raw/)
        config.resolve.set('fallback', {
            util: require.resolve('util'),
        })
        config.resolve.alias.set('lodash', 'lodash-es')
        config.plugin('corsWorkerPlugin').use(corsWorkerPlugin, [webpack])
        config.module.rule('ts').use('ifdef-loader').loader('ifdef-loader').options({
            SINGLEFILE: singleFile,
            WEBPACK: true,
            VITE: false,
            VITE_DEV: false,
        })
        config.module
            .rule('ts')
            .use('workermacro-loader')
            .loader('./scripts/workermacro')
            .options({
                mode: singleFile ? 'webpack-singlefile' : 'webpack',
            })
        config.set('externalsType', 'script')
        if (singleFile) {
            config.output.filename((pathData) => {
                return typeof pathData.chunk.name === 'string' && pathData.chunk.name.includes('-dll')
                    ? pathData.chunk.name.replace('-dll', '.[contenthash:4]') + '.dll.js'
                    : '[name].js'
            })
            if (singleFileDLL) {
                config.optimization.splitChunks({
                    chunks: (chunk) => {
                        if (typeof chunk.name === 'string' && chunk.name.includes('-dll')) {
                            chunk.preventIntegration = true
                        }
                        return true
                    },
                    cacheGroups: {
                        commons: {
                            test: /\.(wasm|ort)/,
                            name: 'libcocogoat-dll',
                            chunks: 'all',
                        },
                    },
                })
            }
            config.plugin('limitchunk').use(
                new webpack.optimize.LimitChunkCountPlugin({
                    maxChunks: 1,
                }),
            )

            config
                .plugin('InlineChunkHtmlPlugin')
                .before('copy')
                .use(new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/app/]))
            config.plugin('InlineFaviconHtmlPlugin').after('copy').use(new InlineFaviconHtmlPlugin(HtmlWebpackPlugin))
            config.module
                .rule('worker')
                .test(/\\.expose\.ts$/)
                .use('worker')
                .loader('worker-loader')
                .options({
                    inline: 'no-fallback',
                })
            config.module
                .rule('asset-url')
                .type('asset/inline')
                .set('resourceQuery', /url/)
                .set('generator', {
                    dataUrl: (content, { filename }) => {
                        // gzip it
                        console.log('gzipping', filename)
                        const zlib = require('zlib')
                        const data = Buffer.from(content)
                        const compressed = zlib.gzipSync(data, {
                            level: 9,
                        })
                        return `data:application/gzip;base64,${compressed.toString('base64')}`
                    },
                })
            config.module
                .rule('asset-nolocal')
                .type('asset')
                .set('resourceQuery', /nolocal/)
                .set('generator', { filename: 'assets/[name].[contenthash:8][ext]' })
            config.module.rule('images').type('asset/inline').set('generator', {})
            config.module.rule('fonts').type('asset/inline').set('generator', {})

            config.externals({
                'monaco-editor': 'var monaco',
            })
            config.resolve.alias.set('lodash-full', 'lodash-es')
        } else {
            config.optimization.splitChunks({
                cacheGroups: {
                    defaultVendors: {
                        name: 'vendors',
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        chunks: 'initial',
                    },
                    common: {
                        name: 'common',
                        minChunks: 2,
                        priority: -20,
                        chunks: 'initial',
                        reuseExistingChunk: true,
                    },
                },
            })
            config.module
                .rule('asset-url')
                .type('asset')
                .set('resourceQuery', /url/)
                .set('generator', { filename: 'assets/[name].[contenthash:8][ext]' })
            config.module.set('parser', {
                'javascript/auto': {
                    worker: [
                        'Worker from @/utils/corsWorker',
                        'WorkerUrl from @/utils/corsWorker',
                        'WorkerMacro from @/utils/corsWorker',
                        'ServiceWorker from @/utils/serviceWorker',
                        '...',
                    ],
                },
                'javascript/esm': {
                    worker: [
                        'Worker from @/utils/corsWorker',
                        'WorkerUrl from @/utils/corsWorker',
                        'WorkerMacro from @/utils/corsWorker',
                        'ServiceWorker from @/utils/serviceWorker',
                        '...',
                    ],
                },
            })
            config
                .plugin('EntrypointJsonPlugin')
                .use(
                    new EntrypointJsonPlugin(
                        HtmlWebpackPlugin,
                        Number(process.env.VUE_APP_BUILD).toString(36),
                        usePreJS ? [PREJS_URL] : [],
                    ),
                )

            if (process.env.NODE_ENV === 'production') {
                // bundle analyzer
                config.plugin('BundleAnalyzerPlugin').use(BundleAnalyzerPlugin, [
                    {
                        analyzerMode: 'static',
                        openAnalyzer: process.argv.includes('--report'),
                    },
                ])
            }

            if (useSentry) {
                config.plugin('sentry').use(SentryPlugin, [
                    {
                        url: process.env.SENTRY_URL,
                        authToken: process.env.SENTRY_KEY,
                        org: 'yuehaiteam',
                        project: 'cocogoat-web',
                        ignore: ['node_modules'],
                        include: './dist',
                        release: process.env.VUE_APP_GIT_SHA,
                        setCommits: {
                            auto: true,
                        },
                        urlPrefix: '~/',
                    },
                ])
                config.plugin('DeleteSourceMapPlugin').use(DeleteSourceMapPlugin)
            }
            // externals
            config.externals({
                'monaco-editor': 'var monaco',
                exceljs: ['https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/exceljs/4.3.0/exceljs.min.js', 'ExcelJS'],
                jszip: ['https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/jszip/3.7.0/jszip.min.js', 'JSZip'],
                ...(usePreJS ? preJsExt : {}),
            })

            // swc
            if (useSWC !== 'false') {
                config.module
                    .rule('js')
                    .uses.delete('babel-loader')
                    .end()
                    .use('swc-loader')
                    .loader('swc-loader')
                    .options({
                        sync: false,
                    })
                config.module
                    .rule('ts')
                    .uses.delete('babel-loader')
                    .delete('ts-loader')
                    .end()
                    .use('swc-loader')
                    .before('ifdef-loader')
                    .loader('swc-loader')
                    .options({
                        sync: false,
                        jsc: {
                            parser: {
                                syntax: 'typescript',
                            },
                        },
                    })
            }
        }
    },
})
