import { options } from '@/store'
import { AchievementCategory } from '@/typings/Achievement'
import { ref, watch } from 'vue'
function createEmptyI18n() {
    return {
        achievements: [] as AchievementCategory[],
    }
}
export const i18n = ref(createEmptyI18n())
const langEntrance = require.context('./', true, /\.\/(.*?)\/index\.ts$/, 'lazy')
const langLoader = {} as Record<string, () => Promise<ReturnType<typeof createEmptyI18n>>>
console.log(langLoader)
langEntrance.keys().forEach((key) => {
    langLoader[key.replace(/^\.\/(.*?)\/index\.ts$/, '$1')] = () => langEntrance(key)
})
export async function loadi18n() {
    let lang = options.value.lang || navigator.language.toLowerCase()
    if (!langLoader[lang]) {
        console.warn(`i18n: ${lang} not found`)
        lang = 'zh-cn'
    }
    const langModule = langLoader[lang]
    if (langModule) {
        const langmodule = await langModule()
        i18n.value = langmodule
    }
}
export async function initi18n() {
    await loadi18n()
    watch(() => options.value.lang, loadi18n)
}
