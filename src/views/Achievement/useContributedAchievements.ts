import { apibase } from '@/utils/apibase'
import { options } from '@/store/index'
import { ref } from 'vue'
export const cachedContributedData = {} as Record<string, Record<string, string>>
async function fetchByLang(lang: string) {
    const url = await apibase(`/contributed/${lang}/achievements-link.json`)
    return await fetch(url)
}
export function useContributedAchievements() {
    const fallbackLang = 'zh-cn'
    const data = ref({} as Record<string, string>)
    if (cachedContributedData[options.value.lang]) {
        data.value = cachedContributedData[options.value.lang]
        return data
    }
    fetchByLang(options.value.lang)
        .then(async (res) => {
            if (res.ok) {
                const json = await res.json()
                cachedContributedData[options.value.lang] = json
                data.value = json
            } else {
                throw new Error('Status code not OK')
            }
        })
        .catch((err) => {
            console.error(`Fetch contributed achievements for ${options.value.lang} failed`, err)
            options.value.lang !== fallbackLang &&
                fetchByLang(fallbackLang)
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
