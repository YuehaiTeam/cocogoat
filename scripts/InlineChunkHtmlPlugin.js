'use strict'
class InlineChunkHtmlPlugin {
    constructor(htmlWebpackPlugin, tests) {
        this.htmlWebpackPlugin = htmlWebpackPlugin
        this.tests = tests
    }
    getInlinedTag(publicPath, assets, tag) {
        if (tag.tagName !== 'script' || !(tag.attributes && tag.attributes.src)) {
            return tag
        }
        const scriptName = publicPath ? tag.attributes.src.replace(publicPath, '') : tag.attributes.src
        if (!this.tests.some((test) => scriptName.match(test))) {
            return tag
        }
        const asset = assets[scriptName]
        if (asset == null) {
            return tag
        }
        return { tagName: 'script', innerHTML: asset.source(), closeTag: true, isInlined: true }
    }
    apply(compiler) {
        let publicPath = compiler.options.output.publicPath || ''
        if (publicPath && !publicPath.endsWith('/')) {
            publicPath += '/'
        }
        compiler.hooks.compilation.tap('InlineChunkHtmlPlugin', (compilation) => {
            const tagFunction = (tag) => this.getInlinedTag(publicPath, compilation.assets, tag)
            const hooks = this.htmlWebpackPlugin.getHooks(compilation)
            hooks.alterAssetTagGroups.tap('InlineChunkHtmlPlugin', (assets) => {
                assets.headTags = assets.headTags.map(tagFunction)
                assets.bodyTags = assets.bodyTags.map(tagFunction)
                assets.headTags = assets.headTags.filter((tag) => {
                    if (tag.isInlined) {
                        assets.bodyTags.push(tag)
                        return false
                    }
                    return true
                })
            })
            hooks.afterEmit.tap('InlineChunkHtmlPlugin', () => {
                Object.keys(compilation.assets).forEach((assetName) => {
                    if (this.tests.some((test) => assetName.match(test))) {
                        delete compilation.assets[assetName]
                    }
                })
            })
        })
    }
}
module.exports = InlineChunkHtmlPlugin
