const pluginName = 'corsWorkerPlugin'
const { RuntimeGlobals } = require('webpack')
module.exports = class CorsWorkerPlugin {
    apply(compiler) {
        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            const { mainTemplate, runtimeTemplate } = compilation
            mainTemplate.hooks.localVars.tap({ name: pluginName, stage: 1 }, (source) => {
                const script = runtimeTemplate.iife(
                    '',
                    `if(typeof ${RuntimeGlobals.require} !== "undefined") {
                        if (typeof globalThis !== "undefined" && globalThis._base) {
                            ${RuntimeGlobals.publicPath} = _base
                        }
                    }`,
                )
                return source + script
            })
        })
    }
}
