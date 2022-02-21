const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const corsWorkerPlugin = require('./scripts/corsWorkerPlugin')
const InlineChunkHtmlPlugin = require('./scripts/InlineChunkHtmlPlugin')
const InlineFaviconHtmlPlugin = require('./scripts/InlineFaviconHtmlPlugin')
const { defineConfig } = require('@vue/cli-service')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')
const gitInfo = require('git-repo-info')()
const singleFileDLL = process.argv.includes('--singlefile-dll')
const singleFile = process.argv.includes('--singlefile') || singleFileDLL
process.env.VUE_APP_BUILD = require('dayjs')().format('YYMMDDHHmm')
process.env.VUE_APP_ROUTER_HASH = singleFile ? 'true' : 'false'
process.env.VUE_APP_SINGLEFILE = singleFile ? 'true' : 'false'
process.env.VUE_APP_LOCALRES = singleFile || process.env.NODE_ENV === 'development' ? 'true' : 'false'
process.env.VUE_APP_TIMESTAMP = Date.now()
process.env.VUE_APP_GIT_SHA = (gitInfo.abbreviatedSha || '').substring(0, 8)
process.env.VUE_APP_GIT_MSG = gitInfo.commitMessage
module.exports = defineConfig({
    publicPath: singleFile
        ? '.'
        : process.env.NODE_ENV === 'production'
        ? 'https://cocogoat-1251105598.file.myqcloud.com/'
        : '/',
    transpileDependencies: true,
    productionSourceMap: false,
    parallel: false,
    // worker-loader与thread-loader冲突
    css: {
        extract: !singleFile,
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
        config.plugin('corsWorkerPlugin').use(corsWorkerPlugin)
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
        } else {
            config.module
                .rule('raw')
                .type('asset')
                .set('resourceQuery', /raw/)
                .set('generator', { filename: 'assets/[name].[contenthash:8][ext]' })
            config.module
                .rule('worker')
                .test(/\.worker\.expose\.ts$/)
                .use('worker')
                .loader('worker-loader')
                .options({
                    worker: 'CorsWorker',
                })
        }
    },
})
