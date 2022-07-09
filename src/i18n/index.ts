import { options } from '@/store'
import { watch } from 'vue'
import { defineStore } from 'pinia'

const createEmptyI18n = () => ({
    atifactParams: {} as Record<string, string>,
    amos: [] as string[],
})
export const usei18n = defineStore('i18n', {
    state: createEmptyI18n,
    getters: {},
})
export let i18n: ReturnType<typeof usei18n>

const langLoader = {} as Record<string, () => Promise<ReturnType<typeof createEmptyI18n>>>
/// #if WEBPACK
// for webpack
const webpackEntrance = require.context('./', true, /\.\/(.*?)\/index\.ts$/, 'lazy')
webpackEntrance.keys().forEach((key) => {
    langLoader[key.replace(/^\.\/(.*?)\/index\.ts$/, '$1')] = () => webpackEntrance(key)
})
/// #else
// for vite
const viteEntrance = import.meta.glob('./**/index.ts')
Object.keys(viteEntrance).forEach((key) => {
    langLoader[key.replace(/^\.\/(.*?)\/index\.ts$/, '$1')] = viteEntrance[key] as () => Promise<
        ReturnType<typeof createEmptyI18n>
    >
})
/// #endif
export const langNames = {
    'zh-cn': '简体中文',
    'en-us': 'English',
}
export async function loadi18n() {
    let lang = options.value.lang || navigator.language.toLowerCase()
    if (!langLoader[lang]) {
        console.warn(`i18n: ${lang} not found`)
        lang = 'zh-cn'
    }
    const langModule = langLoader[lang]
    if (langModule) {
        const langmodule = await langModule()
        for (const key of Object.keys(langmodule)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            i18n[key] = langmodule[key]
        }
    }
}
export async function initi18n() {
    i18n = usei18n()
    await loadi18n()
    watch(() => options.value.lang, loadi18n)
}
