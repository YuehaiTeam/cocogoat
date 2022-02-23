import { App as TypeApp, createApp } from 'vue'
import App from './App.vue'
import router from './router'
import resources, { setResourcesAndUpdateInfo } from './resources'
import { defaultResources } from './resource-main'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import View from '@/views/View.vue'
import { store, currentUser, options } from './store'
import { initi18n, i18n } from '@/i18n'

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
        $cocogoat: {
            app: TypeApp
            store: typeof store
            options: typeof options
            i18n: typeof i18n
            resources: typeof resources
            currentUser: typeof currentUser
        }
    }
}
;(async () => {
    await initi18n()
    const app = createApp(App)
    if (options.value.reporting) {
        const { init } = await import('@/utils/reporting')
        init(app, router)
    }
    app.component('FaIcon', FontAwesomeIcon).component('Layout', View).use(router).mount('#toki')
    window.$cocogoat = {
        app,
        store,
        i18n,
        options,
        resources,
        currentUser,
    }
})()
