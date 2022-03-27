module.exports = class DeleteSourceMapPlugin {
    apply(compiler) {
        compiler.hooks.done.tap('DeleteSourceMapPlugin', (stats) => {
            const fs = require('fs')
            let countMatchAssets = 0
            let countMatchMapAssets = 0
            const outputPath = stats.compilation.getPath(compiler.outputPath)
            Object.keys(stats.compilation.assets)
                .filter((name) => /\.js\.map$/.test(name))
                .forEach((name) => {
                    countMatchMapAssets += 1
                    const existsAt = `${outputPath}/${name}`
                    fs.unlinkSync(existsAt)
                })
            console.log('✨ Succesfuly removed sourcemap files, count: ', countMatchMapAssets)
            Object.keys(stats.compilation.assets)
                .filter((name) => /\.js$/.test(name))
                .forEach((name) => {
                    countMatchAssets += 1
                    const existsAt = `${outputPath}/${name}`
                    const srcContent = fs.readFileSync(existsAt).toString()
                    const replacedContent = srcContent.replace(/\/\/# sourceMappingURL=.*/, '').trim()
                    fs.writeFileSync(existsAt, replacedContent)
                })
            console.log('✨ Succesfuly removed sourcemap url from files, count: ', countMatchAssets)
        })
    }
}
