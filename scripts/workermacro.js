const workerMacro = (mode, code) => {
    if (!code.includes('@worker')) return code
    let preImports = ``
    const prep = code
        .replace(/([.[\]'"`\w]*)\(\/\*\s@worker(-url)?\s['"]([^'"]*)['"]\s['"]?([^'"]*)?['"]?\s?\*\/\)/g, (...args) => {
            const magic = `__worker_macro_${Math.round(Math.random() * Number.MAX_SAFE_INTEGER)
                .toString(16)
                .substring(0, 8)}__`
            const url = JSON.stringify(args[3])
            const worker = args[1]
            const fns = args[4] ? args[4].split(' ') : []
            let chunkname = []
            if (fns.length >= 1) chunkname.push(`/* webpackChunkName: ${JSON.stringify(fns[0])} */ `)
            if (fns.length >= 2) chunkname.push(`/* webpackEntryOptions: { filename: ${JSON.stringify(fns[1])} } */ `)
            chunkname = chunkname.join('')
            const wrapperStart = `${args[1]}(()=>{\nconsole.log('[worker-macro] ${mode}');\n`
            const wrapperEnd = `\n})`
            switch (mode) {
                case 'webpack':
                    return `${wrapperStart}return new ${worker}(new URL(${chunkname}${url}, import.meta.url))${wrapperEnd}`
                case 'webpack-singlefile':
                    return `${wrapperStart}${args[1]}.installToWindow();const Worker = require(${url}).default;return new Worker()${wrapperEnd}`
                case 'vite':
                    return `${wrapperStart}return new ${worker}(new URL(${url}, import.meta.url))${wrapperEnd}`
                case 'vite-dev':
                case 'vite-singlefile':
                    preImports += `import ${magic} from ${JSON.stringify(args[3] + '?worker&inline')};\n`
                    return `${wrapperStart}return new ${worker}(${args[1]}.WorkerExtract(${magic}))${wrapperEnd}`
            }
        })
        .replace(/\/\*\s@worker\s\*\/\sthrow(.*)[\r\n]/g, '')
    return preImports + prep
}
const viteWorkerMacro = function (
    mode, // 'webpack' | 'webpack-singlefile' | 'vite' | 'vite-dev' | 'vite-singlefile',
) {
    return {
        name: 'vite-workermacro',
        enforce: 'pre',
        async transform(code) {
            return workerMacro(mode, code)
        },
    }
}
const webpackWorkerMacro = function (source, map) {
    // get loader options
    const options = this.getOptions()
    const mode = options.mode || 'webpack'
    if (source) {
        this.callback(null, workerMacro(mode, source), map)
    } else {
        this.callback(null, source, map)
    }
}
module.exports = webpackWorkerMacro
module.exports.viteWorkerMacro = viteWorkerMacro
module.exports.workerMacro = workerMacro
