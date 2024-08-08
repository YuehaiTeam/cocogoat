import { ref } from 'vue'

const apis = {
    global: process.env.VUE_APP_APIBASE,
    cn: process.env.VUE_APP_APIBASECN,
} as Record<string, string>

export let apiregion = navigator.language.startsWith('zh') ? 'cn' : 'global'
export const apistatus = ref('')
export const apicolor = ref('info')
export const syncstatus = ref('')
export let regionchecked: Promise<string> | undefined
export const apibase = async (path = '', region = 'default') => {
    if (!regionchecked) {
        regionchecked = checkRegion(apiregion)
        apiregion = await regionchecked
    }
    await regionchecked
    return apis[region === 'default' ? apiregion : region] + path
}
export const checkRegion = async (apiregion: string) => {
    if (window.$cocogoat.status && window.$cocogoat.region) {
        apistatus.value = window.$cocogoat.status.msg
        apicolor.value = window.$cocogoat.status.typ
        syncstatus.value = window.$cocogoat.status.smsg
        return window.$cocogoat.region
    }
    const url = (await apis[apiregion]) + '/status'
    try {
        const res = await fetch(url)
        if (res.ok) {
            const rjson = await res.json()
            apistatus.value = rjson.msg
            apicolor.value = rjson.typ
            syncstatus.value = rjson.smsg
            if (apis[rjson.region]) {
                return rjson.region
            }
        }
    } catch (e) {
        console.error('API Region Probe Faild', e)
        return apiregion === 'global' ? 'cn' : 'global'
    }
    return apiregion
}
