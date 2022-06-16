const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
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
const useCDN = !process.argv.includes('--no-cdn')
const useSWC = isCI
    ? 'false'
    : process.argv.includes('--no-swc')
    ? 'false'
    : process.argv.includes('--no-swc-minify')
    ? 'compile'
    : 'true'
const useSentry =
    !process.argv.includes('--no-sentry') && process.env.NODE_ENV === 'production' && !!process.env.SENTRY_KEY
process.env.VUE_APP_BUILD = require('dayjs')().format('YYMMDDHHmm')
process.env.VUE_APP_ROUTER_HASH = singleFile ? 'true' : 'false'
process.env.VUE_APP_SINGLEFILE = singleFile ? 'true' : 'false'
process.env.VUE_APP_LOCALRES = singleFile || process.env.NODE_ENV === 'development' ? 'true' : 'false'
process.env.VUE_APP_TIMESTAMP = Date.now()
process.env.VUE_APP_GIT_SHA = (gitInfo.abbreviatedSha || '').substring(0, 8)
process.env.VUE_APP_GIT_MSG =
    (gitInfo.commitMessage || '').split('-----END PGP SIGNATURE-----')[1].trim() || gitInfo.commitMessage || ''
console.log(`[cocogoat-web] Build ${process.env.NODE_ENV} ${process.env.VUE_APP_GIT_SHA}/${process.env.VUE_APP_BUILD}`)
console.log(`SingleFile: ${singleFile}, CDN: ${useCDN}, SWC: ${useSWC}, Sentry: ${useSentry}`)
console.log('')
console.log(process.env.VUE_APP_GIT_MSG)
console.log('')
module.exports = defineConfig({
    publicPath: singleFile ? '.' : process.env.NODE_ENV === 'production' && useCDN ? 'https://77.xyget.cn/' : '/',
    assetsDir: 'static',
    transpileDependencies: true,
    productionSourceMap: true,
    parallel: false,
    // worker-loader、sentry-plugin都和thread-loader冲突
    // swc下thread-loader降低速度
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
            AutoImport({
                resolvers: [ElementPlusResolver()],
            }),
            Components({
                dirs: [],
                resolvers: [ElementPlusResolver()],
            }),
        ],
    },
    chainWebpack: (config) => {
        config.output.set('chunkLoadingGlobal', 'define')
        config.plugins.delete('prefetch')
        config.plugins.delete('preload')
        config.module.rule('txt').type('asset/source').set('resourceQuery', /txt/)
        config.resolve.set('fallback', {
            util: require.resolve('util'),
            '@genshin-data': require('path').resolve(__dirname, 'src', 'plugins', 'genshin-data', 'data'),
        })
        config.resolve.alias.set('lodash', 'lodash-es')
        config.plugin('corsWorkerPlugin').use(corsWorkerPlugin)
        config.module.rule('ts').use('ifdef-loader').loader('ifdef-loader').options({
            SINGLEFILE: singleFile,
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
                .test(/\.worker\.expose\.ts$/)
                .use('worker')
                .loader('worker-loader')
                .options({
                    inline: 'no-fallback',
                })
            config.module
                .rule('raw')
                .type('asset/inline')
                .set('resourceQuery', /raw/)
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
                .rule('raw-ignore-local')
                .type('asset')
                .set('resourceQuery', /rawnolocal/)
                .set('generator', { filename: 'assets/[name].[contenthash:8][ext]' })
            config.module.rule('images').type('asset/inline').set('generator', {})
            config.module.rule('fonts').type('asset/inline').set('generator', {})

            config.externals({
                'monaco-editor': 'var monaco',
            })
            config.resolve.alias.set('lodash-full', 'lodash-es')
        } else {
            config.module
                .rule('raw')
                .type('asset')
                .set('resourceQuery', /raw/)
                .set('generator', { filename: 'assets/[name].[contenthash:8][ext]' })
            config.module.set('parser', {
                'javascript/auto': {
                    worker: ['Worker from @/utils/corsWorker', 'ServiceWorker from @/utils/serviceWorker', '...'],
                },
                'javascript/esm': {
                    worker: ['Worker from @/utils/corsWorker', 'ServiceWorker from @/utils/serviceWorker', '...'],
                },
            })
            config
                .plugin('EntrypointJsonPlugin')
                .use(new EntrypointJsonPlugin(HtmlWebpackPlugin, Number(process.env.VUE_APP_BUILD).toString(36)))

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
                exceljs: ['https://s2.pstatp.com/cdn/expire-1-y/exceljs/4.3.0/exceljs.min.js', 'ExcelJS'],
                jszip: ['https://s2.pstatp.com/cdn/expire-1-y/jszip/3.7.0/jszip.min.js', 'JSZip'],
                'lodash-full': ['https://s2.pstatp.com/cdn/expire-1-y/lodash.js/4.17.21/lodash.min.js', '_'],
                '@sentry/browser': [
                    'https://npm.elemecdn.com/@sentry/tracing/build/bundle.tracing.es6.min.js',
                    'Sentry',
                ],
                '@sentry/tracing': [
                    'https://npm.elemecdn.com/@sentry/tracing/build/bundle.tracing.es6.min.js',
                    'Sentry',
                ],
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
