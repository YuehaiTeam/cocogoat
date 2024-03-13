/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plugin } from 'vite'
import parse from 'vite-plugin-ifdef/src/preprocessor.js'
const vitePluginIfDef = (userOptions = { data: {} as Record<string, any>, option: {} as Record<string, any> }) => {
    const data = userOptions.data
    const option = userOptions.option
    let filePath: string
    return {
        name: 'vite-ifdef',
        enforce: 'pre',
        resolveId(source) {
            filePath = source
        },
        transform(code) {
            const verboseFlag = 'verbose'
            const verbose = option[verboseFlag]

            const tripleSlashFlag = 'ifdef-triple-slash'
            const tripleSlash = option[tripleSlashFlag]

            const fillWithBlanksFlag = 'ifdef-fill-with-blanks'
            const fillWithBlanks = option[fillWithBlanksFlag]

            const uncommentPrefixFlag = 'ifdef-uncomment-prefix'
            const uncommentPrefix = option[uncommentPrefixFlag]

            return parse(code, data, verbose, tripleSlash, filePath, fillWithBlanks, uncommentPrefix)
        },
    } as Plugin
}
export default vitePluginIfDef
