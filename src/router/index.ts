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
        path: '/achievement/scan-and-export',
        name: 'extera.achievement-export',
        component: () => import('@/views/AchievementScanner/ScanAndExport.vue'),
    },
    {
        path: '/extra/achievement-to-seelie',
        redirect: '/achievement/scan-and-export?to=seelie',
    },
    {
        path: '/extra/achievement-to-paimon-moe',
        redirect: '/achievement/scan-and-export?to=paimon-moe',
    },
]

const router = createRouter({
    history: createWebHistory('/'),
    routes,
})

export default router
