const importExternal = function (externals = {}) {
    return {
        name: 'vite-external',
        enforce: 'pre',
        resolveId(id) {
            if (externals[id]) {
                return id
            }
        },
        config(config) {
            Object.assign(externals, config.resolve.externals)
            if (!config.optimizeDeps) config.optimizeDeps = {}
            if (!config.optimizeDeps.exclude) config.optimizeDeps.exclude = []
            let exclude = Object.keys(externals)
            if (config.optimizeDeps.include) {
                exclude = exclude.filter((key) => !config.optimizeDeps.include.includes(key))
            }
            config.optimizeDeps.exclude.push(...exclude)
        },
        load(id) {
            const fnOrIife = externals[id]
            if (!fnOrIife) return null
            return typeof fnOrIife === 'function'
                ? fnOrIife(id)
                : fnOrIife.startsWith('import(')
                  ? `import M from ${fnOrIife.slice(7, -1)};export default M`
                  : `const M = window['${fnOrIife}']; export default M`
        },
    }
}
export default importExternal
