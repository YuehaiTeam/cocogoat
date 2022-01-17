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
]

const router = createRouter({
    history: createWebHistory(location.origin.includes('.io') ? '/cocogoat-web/' : '/'),
    routes,
})

export default router
