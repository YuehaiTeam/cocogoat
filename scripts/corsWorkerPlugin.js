const pluginName = 'corsWorkerPlugin'
module.exports = class CorsWorkerPlugin {
    constructor(webpack) {
        this.webpack = webpack
    }
    apply(compiler) {
        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            const { mainTemplate, runtimeTemplate } = compilation
            mainTemplate.hooks.localVars.tap({ name: pluginName, stage: 1 }, (source) => {
                const script = runtimeTemplate.iife(
                    '',
                    `if(typeof ${this.webpack.RuntimeGlobals.require} !== "undefined") {
                        if (typeof globalThis !== "undefined" && globalThis._base) {
                            ${this.webpack.RuntimeGlobals.publicPath} = _base
                        }
                    }`,
                )
                return source + script
            })
        })
    }
}
