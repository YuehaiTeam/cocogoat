import { App as TypeApp, createApp } from 'vue'
import App from './App.vue'
import router from './router'
import resources, { setResourcesAndUpdateInfo } from './resources'
import { defaultResources } from './resource-main'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import View from '@/views/View.vue'
import { store, currentUser, options } from './store'
import { initSync } from './store/sync'
import { createPinia } from 'pinia'
import ScriptX from 'vue-scriptx'
import '@/utils/darkmode'
import { i18n, initi18n } from '@/i18n'
import Adsense from 'vue-google-adsense/dist/Adsense.min.js'

import type { CocogoatGlobal } from '@/typings/global'

/// #if !SINGLEFILE
import { loadSW } from '@/utils/serviceWorkerEntrance'
/// #endif

const app = createApp(App)
app.use(createPinia())
app.use(ScriptX)
app.use(Adsense)

// 兼容性检查：
export let notInSameoriginFrame = parent === window
if (!notInSameoriginFrame) {
    try {
        if (parent.location.origin === location.origin) {
            notInSameoriginFrame = false
        }
    } catch (e) {
        notInSameoriginFrame = true
    }
}

setResourcesAndUpdateInfo(defaultResources)
declare global {
    interface Window {
        $cocogoat: CocogoatGlobal<TypeApp>
        dataLayer: unknown[]
        gtag: (...args: unknown[]) => void
    }
}

;(async () => {
    await initi18n()
    if (options.value.reporting && process.env.NODE_ENV === 'production') {
        const { init } = await import('@/utils/reporting')
        init(app, router)
    }
    app.component('FaIcon', FontAwesomeIcon).component('Layout', View).use(router).mount('#toki')
    if (top === window && !location.href.includes('/frames')) {
        // Don't sync in iframes
        initSync()
    } else if (top !== window && !location.href.includes('/frames')) {
        document.body.classList.add('layout')
    }
    window.$cocogoat = window.$cocogoat || {}
    const c = {
        endpoint: '',
        build: '',
        route: process.env.VUE_APP_ROUTER_HASH === 'true' ? 'hash' : 'history',
        app,
        store,
        i18n,
        options,
        resources,
        currentUser,
    } as typeof window['$cocogoat']
    Object.assign(c, window.$cocogoat)
    window.$cocogoat = c
    window.$cocogoat.onload && window.$cocogoat.onload()
    /// #if !SINGLEFILE
    loadSW()
    /// #endif
})()

// 检查连续刷新
const lastT = sessionStorage.lastRefreshTimes || 0
if (lastT > 3) {
    caches.keys().then((names) => names.forEach((name) => caches.delete(name)))
    delete sessionStorage.lastRefreshTimes
} else {
    const openTime = Date.now()
    window.addEventListener('beforeunload', () => {
        if (Date.now() - openTime < 800) {
            sessionStorage.lastRefreshTimes = (Number(sessionStorage.lastRefreshTimes) || 0) + 1
        }
    })
}
