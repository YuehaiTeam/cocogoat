const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
    transpileDependencies: true,
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
    },
})
