import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home',
        component: HomeView,
    },
    {
        path: '/frames/achievement-scanner',
        name: 'frames.scan',
        component: () => import('@/views/AchievementScanner/Index.vue'),
    },
    {
        path: '/extra/achievement-to-paimon-moe',
        name: 'extera.achievement-to-paimon-moe',
        component: () => import('@/views/AchievementScanner/ScanToPaimonMoe.vue'),
    },
]

const router = createRouter({
    history: createWebHistory('/'),
    routes,
})

export default router
