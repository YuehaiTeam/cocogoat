const { defineConfig } = require('@vue/cli-service')
const corsWorkerPlugin = require('./scripts/corsWorkerPlugin')
module.exports = defineConfig({
    publicPath: process.env.NODE_ENV === 'production' ? 'https://cocogoat-1251105598.file.myqcloud.com/' : '/',
    transpileDependencies: true,
    productionSourceMap: false,
    chainWebpack: (config) => {
        config.output.set('chunkLoadingGlobal', 'define')
        config.plugins.delete('prefetch')
        config.plugins.delete('preload')
        config.module
            .rule('raw')
            .type('asset')
            .set('resourceQuery', /raw/)
            .set('generator', { filename: 'assets/[name].[contenthash:8][ext]' })
        config.module.rule('txt').type('asset/source').set('resourceQuery', /txt/)
        config.resolve.set('fallback', {
            util: require.resolve('util'),
            '@genshin-data': require('path').resolve(__dirname, 'src', 'plugins', 'genshin-data', 'data'),
        })
        config.module.set('parser', {
            'javascript/auto': {
                worker: ['Worker from @/utils/corsWorker', '...'],
            },
            'javascript/esm': {
                worker: ['Worker from @/utils/corsWorker', '...'],
            },
        })
        config.plugin('corsWorkerPlugin').use(corsWorkerPlugin)
    },
})
