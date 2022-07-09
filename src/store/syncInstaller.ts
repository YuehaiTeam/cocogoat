let providerInstallerList: {
    class: string
    name: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: any
}[] = []
/// #if WEBPACK
const providerInstaller = require.context('@/store/providers', true, /\.\/(.*?)\/Install\.vue$/)
providerInstallerList = providerInstaller.keys().map((key) => {
    const module = providerInstaller(key)
    return {
        class: key.replace(/\.\/(.*?)\/Install\.vue$/, '$1'),
        name: module.name,
        component: module.default,
    }
})
/// #else
// for vite
const viteProviderInstaller = import.meta.glob('@/store/providers/**/Install.vue', { eager: true })
providerInstallerList = Object.keys(viteProviderInstaller).map((key) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const module = viteProviderInstaller[key] as any
    return {
        class: key.replace(/(.*)\/(.*?)\/Install\.vue$/, '$2'),
        name: module.name,
        component: module.default,
    }
})
/// #endif
export default providerInstallerList
