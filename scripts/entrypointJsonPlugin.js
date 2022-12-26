const crypto = require('crypto')
module.exports = class EntrypointJsonPlugin {
    files = []
    prejs = []
    constructor(htmlWebpackPlugin, data, prejs = []) {
        this.htmlWebpackPlugin = htmlWebpackPlugin
        this.files.push(data || {})
        this.prejs = prejs
    }
    apply(compiler) {
        compiler.hooks.compilation.tap('EntrypointJsonPlugin', (compilation) => {
            const hooks = this.htmlWebpackPlugin.getHooks(compilation)
            hooks.alterAssetTagGroups.tap('EntrypointJsonPlugin', (assets) => {
                // header scripts
                let scripts = assets.headTags
                    .filter((tag) => tag.tagName === 'script' && tag.attributes && tag.attributes.src)
                    .map((tag) => tag.attributes.src)
                // body scripts
                scripts = scripts.concat(
                    assets.bodyTags
                        .filter((tag) => tag.tagName === 'script' && tag.attributes && tag.attributes.src)
                        .map((tag) => tag.attributes.src),
                )
                // header styles
                const styles = assets.headTags
                    .filter(
                        (tag) =>
                            tag.tagName === 'link' &&
                            tag.attributes &&
                            tag.attributes.rel === 'stylesheet' &&
                            tag.attributes.href,
                    )
                    .map((tag) => tag.attributes.href)
                this.files.push(this.prejs.concat(scripts), styles)
            })
        })
        // write json file
        compiler.hooks.emit.tap('EntrypointJsonPlugin', (compilation) => {
            // write assets json
            const assetList = Object.keys(compilation.assets).filter(
                (e) => !e.endsWith('.map') && !e.endsWith('.wasm') && !e.endsWith('.ort') && !e.endsWith('.html'),
            )
            const assetsJson = JSON.stringify(assetList)
            // get md5 of assetsJson
            const assetsMd5 = crypto.createHash('md5').update(assetsJson).digest('hex')
            const fn = `static/sw/${assetsMd5.substring(0, 8)}.json`
            compilation.assets[fn] = {
                source: () => assetsJson,
                size: () => assetsJson.length,
            }
            this.files.push(fn)
            // write entrypoint json
            const json = JSON.stringify(this.files)
            compilation.assets['index.json'] = {
                source: () => json,
                size: () => json.length,
            }
        })
    }
}
