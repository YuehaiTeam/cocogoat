import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setResourcesAndUpdateInfo } from './resources'
import { defaultResources } from './resource-main'

setResourcesAndUpdateInfo(defaultResources)
const app = createApp(App)
app.use(router).mount('#toki')
Reflect.set(window, 'app', app)
