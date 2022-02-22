import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from 'vue-router'
const routes: Array<RouteRecordRaw> = [
    /* Main */
    {
        path: '/',
        component: () => import('@/views/Layout.vue'),
        children: [
            {
                path: '',
                name: 'home',
                component: () => import('@/views/Home.vue'),
            },
        ],
    },
    {
        path: '/artifact',
        component: () => import('@/views/Layout.vue'),
        children: [
            {
                path: '',
                name: 'artifact.index',
                component: () => import('@/views/Artifact/Index.vue'),
            },
        ],
    },
    {
        path: '/achievement',
        component: () => import('@/views/Layout.vue'),
        children: [
            {
                path: ':cat?',
                name: 'achievement.index',
                component: () => import('@/views/Achievement/Index.vue'),
            },
            {
                path: 'scan-and-export',
                name: 'achievement.scan-and-export',
                component: () => import('@/views/AchievementScanner/ScanAndExport.vue'),
            },
        ],
    },
    {
        path: '/options',
        component: () => import('@/views/Layout.vue'),
        children: [
            {
                path: '',
                name: 'options',
                component: () => import('@/views/Options/Index.vue'),
                children: [
                    {
                        path: '',
                        name: 'options.basic',
                        component: () => import('@/views/Options/Basic.vue'),
                    },
                    {
                        path: 'user',
                        name: 'options.user',
                        component: () => import('@/views/Options/User.vue'),
                    },
                ],
            },
        ],
    },
    /* Frames */
    {
        path: '/frames/achievement-scanner',
        name: 'frames.achievement.scan',
        component: () => import('@/views/AchievementScanner/Index.vue'),
    },
    /* Tools */
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
    history: process.env.VUE_APP_ROUTER_HASH === 'true' ? createWebHashHistory() : createWebHistory('/'),
    routes,
})

export default router
export function getUrl(name: string) {
    return router.resolve({ name }).href
}
