const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const InlineChunkHtmlPlugin = require('./scripts/InlineChunkHtmlPlugin')
const { defineConfig } = require('@vue/cli-service')
const corsWorkerPlugin = require('./scripts/corsWorkerPlugin')
process.env.VUE_APP_BUILD = require('dayjs')().format('YYMMDDHHmm')
const singleFile = process.argv.includes('--singlefile')
process.env.VUE_APP_ROUTER_HASH = singleFile ? 'true' : 'false'
process.env.VUE_APP_LOCALRES = singleFile || process.env.NODE_ENV === 'development' ? 'true' : 'false'
module.exports = defineConfig({
    publicPath: process.env.NODE_ENV === 'production' ? 'https://cocogoat-1251105598.file.myqcloud.com/' : '/',
    transpileDependencies: true,
    productionSourceMap: false,
    parallel: false,
    // worker-loader与thread-loader冲突
    css: {
        extract: !singleFile,
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
            config.output.filename('[name].js')
            config.plugin('limitchunk').use(
                new webpack.optimize.LimitChunkCountPlugin({
                    maxChunks: 1,
                }),
            )

            config
                .plugin('InlineChunkHtmlPlugin')
                .before('copy')
                .use(new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/app/]))
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
                    dataUrl: {
                        mimetype: 'application/octet-stream',
                    },
                })
            config.module
                .rule('raw-ignore-local')
                .type('asset')
                .set('resourceQuery', /rawnolocal/)
                .set('generator', { filename: 'assets/[name].[contenthash:8][ext]' })
            config.module.rule('images').type('asset/inline').set('generator', {})
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
