class InlineFaviconHtmlPlugin {
    iconMatch = []
    pluginName = 'InlineFaviconHtmlPlugin'
    constructor(htmlWebpackPlugin) {
        this.htmlWebpackPlugin = htmlWebpackPlugin
    }
    apply(compiler) {
        compiler.hooks.compilation.tap(this.pluginName, (compilation) => {
            const hooks = this.htmlWebpackPlugin.getHooks(compilation)
            hooks.afterTemplateExecution.tapAsync(this.pluginName, (htmlPluginData, cb) => {
                const iconMatch = htmlPluginData.html.match(/<link rel="icon" href="([^"]+)"\s*\/?>/)
                if (iconMatch && iconMatch[0] && iconMatch[1]) {
                    this.iconMatch.push({
                        html: htmlPluginData.outputName,
                        match: iconMatch,
                    })
                }
                cb(null, htmlPluginData)
            })
        })
        compiler.hooks.emit.tapAsync(this.pluginName, (compilation, cb) => {
            this.iconMatch.forEach((iconMatch) => {
                const iconPath = iconMatch.match[1].replace(compilation.options.output.publicPath, '')
                if (compilation.assets[iconPath] && compilation.assets[iconMatch.html]) {
                    const iconData = compilation.assets[iconPath].source()
                    const iconExt = iconPath.split('.').pop()
                    const mimeType = iconExt === 'ico' ? 'image/x-icon' : `image/${iconExt}`
                    const iconBase64 = `data:${mimeType};base64,${iconData.toString('base64')}`
                    let htmlData = compilation.assets[iconMatch.html].source().toString()
                    htmlData = htmlData.replace(iconMatch.match[1], iconBase64)
                    compilation.assets[iconMatch.html] = {
                        source: () => htmlData,
                        size: () => htmlData.length,
                    }
                    delete compilation.assets[iconPath]
                }
            })
            cb()
        })
    }
}
module.exports = InlineFaviconHtmlPlugin
