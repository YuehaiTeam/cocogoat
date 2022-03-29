import characterImages from '@/assets/characters'
import { options } from '@/store'
import { ICharacter } from '@/typings/Character'
import { watch } from 'vue'
import { defineStore } from 'pinia'

const createEmptyI18n = () => ({
    characters: [] as ICharacter[],
    atifactParams: {} as Record<string, string>,
    characterAvatar: {} as Record<string, string>,
    amos: [] as string[],
})
export const usei18n = defineStore('i18n', {
    state: createEmptyI18n,
    getters: {},
})
export const i18n = usei18n()

const langEntrance = require.context('./', true, /\.\/(.*?)\/index\.ts$/, 'lazy')
const langLoader = {} as Record<string, () => Promise<ReturnType<typeof createEmptyI18n>>>
langEntrance.keys().forEach((key) => {
    langLoader[key.replace(/^\.\/(.*?)\/index\.ts$/, '$1')] = () => langEntrance(key)
})
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
        langmodule.characterAvatar = characterImages
        for (const key of Object.keys(langmodule)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            i18n[key] = langmodule[key]
        }
    }
}
export async function initi18n() {
    await loadi18n()
    watch(() => options.value.lang, loadi18n)
}
