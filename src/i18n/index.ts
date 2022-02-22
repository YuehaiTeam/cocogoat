import characterImages from '@/assets/characters'
import { options } from '@/store'
import { AchievementCategory } from '@/typings/Achievement'
import { ICharacter } from '@/typings/Character'
import { ref, watch } from 'vue'
function createEmptyI18n() {
    return {
        achievements: [] as AchievementCategory[],
        character: [] as ICharacter[],
        characterAvatar: {} as Record<string, string>,
    }
}
export const i18n = ref(createEmptyI18n())
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
        i18n.value = langmodule
    }
}
export async function initi18n() {
    await loadi18n()
    watch(() => options.value.lang, loadi18n)
}
