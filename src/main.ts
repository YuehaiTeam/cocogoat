import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setResourcesAndUpdateInfo } from './resources'
import { defaultResources } from './resource-main'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import View from '@/views/View.vue'

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
const app = createApp(App)
app.component('FaIcon', FontAwesomeIcon).component('Layout', View).use(router).mount('#toki')

Reflect.set(window, 'app', app)
