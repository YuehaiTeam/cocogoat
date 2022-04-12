const apis = {
    global: process.env.VUE_APP_APIBASE,
    cn: process.env.VUE_APP_APIBASECN,
} as Record<string, string>
export let apiregion = navigator.language.startsWith('zh') ? 'cn' : 'global'
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
    const url = (await apis[apiregion]) + '/v1/utils/api-region'
    try {
        const res = await fetch(url)
        if (res.ok) {
            const apistr = await res.text()
            if (apis[apistr]) {
                return apistr
            }
        }
    } catch (e) {
        console.error('API Region Probe Faild', e)
        return apiregion === 'global' ? 'cn' : 'global'
    }
    return apiregion
}
