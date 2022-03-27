const apis = {
    global: process.env.VUE_APP_APIBASE,
    cn: process.env.VUE_APP_APIBASECN,
} as Record<string, string>
export let apiregion = navigator.language.startsWith('zh') ? 'cn' : 'global'
export let regionchecked = false
export const apibase = async (path = '') => {
    if (!regionchecked) {
        regionchecked = true
        await checkRegion()
    }
    return apis[apiregion] + path
}
export const checkRegion = async () => {
    const url = await apibase('/v1/utils/api-region')
    try {
        const res = await fetch(url)
        if (res.ok) {
            const apistr = await res.text()
            if (apis[apistr]) {
                apiregion = apistr
            }
        }
    } catch (e) {
        console.error('API Region Probe Faild', e)
        apiregion = apiregion === 'global' ? 'cn' : 'global'
    }
}
