import { options } from '@/store/index'
import { ref } from 'vue'
function fetchByLang(lang: string) {
    const url = `${process.env.VUE_APP_APIBASE}/contributed/${lang}/achievements-link.json`
    return fetch(url)
}
export function useContributedAchievements() {
    const data = ref({} as Record<string, string>)
    const fallbaskLang = 'zh-cn'
    fetchByLang(options.value.lang)
        .then(async (res) => {
            if (res.ok) {
                const json = await res.json()
                data.value = json
            } else {
                throw new Error('Status code not OK')
            }
        })
        .catch((err) => {
            console.error(`Fetch contributed achievements for ${options.value.lang} failed`, err)
            fetchByLang(fallbaskLang)
                .then(async (res) => {
                    if (res.ok) {
                        const json = await res.json()
                        data.value = json
                    } else {
                        throw new Error('Status code not OK')
                    }
                })
                .catch((err) => {
                    console.error(`Fetch contributed achievements for fallback failed`, err)
                })
        })
    return data
}
