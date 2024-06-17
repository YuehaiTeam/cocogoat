import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { $cocogoat } from '@/bus'
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
        path: '/extra/installer',
        component: () => import('@/views/Layout.vue'),
        children: [
            {
                path: '',
                name: 'installer.index',
                component: () => import('@/views/Installer/HYP.vue'),
            },
            {
                path: '',
                name: 'installer.legacy',
                component: () => import('@/views/Installer/Index.vue'),
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
                    {
                        path: 'sync/:app?',
                        name: 'options.sync',
                        component: () => import('@/views/Options/Sync.vue'),
                    },
                    {
                        path: 'env',
                        name: 'options.env',
                        component: () => import('@/views/Options/Env.vue'),
                    },
                ],
            },
        ],
    },
    /* Frames */
    {
        path: '/frames/achievement-scanner',
        component: () => import('@/views/AchievementScanner/Index.vue'),
        children: [
            {
                path: '',
                name: 'frames.achievement.scan',
                component: () => import('@/views/AchievementScanner/Entrance.vue'),
            },
            {
                path: 'capture',
                name: 'frames.achievement.scan.capture-scanner',
                component: () => import('@/views/AchievementScanner/CaptureScanner/Index.vue'),
            },
            {
                path: 'line',
                name: 'frames.achievement.scan.line-scanner',
                component: () => import('@/views/AchievementScanner/LineScanner/Index.vue'),
            },
            {
                path: 'screenshot',
                name: 'frames.achievement.scan.screenshot-scanner',
                component: () => import('@/views/AchievementScanner/ScreenshotScanner/Index.vue'),
            },
            {
                path: 'rvfc',
                name: 'frames.achievement.scan.rvfc-scanner',
                component: () => import('@/views/AchievementScanner/RvfcScanner/Index.vue'),
            },
        ],
    },
    {
        path: '/frames/artifact-scanner',
        component: () => import('@/views/ArtifactScanner/Index.vue'),
        children: [
            {
                path: '',
                name: 'frames.artifact.scan',
                component: () => import('@/views/ArtifactScanner/Entrance.vue'),
            },
            {
                path: 'capture',
                name: 'frames.artifact.scan.capture-scanner',
                component: () => import('@/views/ArtifactScanner/CaptureScanner/Index.vue'),
            },
            {
                path: 'screenshot',
                name: 'frames.artifact.scan.screenshot-scanner',
                component: () => import('@/views/ArtifactScanner/ScreenshotScanner/Index.vue'),
            },
        ],
    },
    {
        path: '/frames/playground',
        name: 'frames.playground',
        component: () => import('@/views/Playground/Index.vue'),
    },
    {
        path: '/extra/playground',
        component: () => import('@/views/Layout.vue'),
        children: [
            {
                path: '',
                name: 'extra.playground',
                component: () => import('@/views/Playground/Frame.vue'),
            },
        ],
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
    {
        path: '/extra/client',
        component: () => import('@/views/Layout.vue'),
        children: [
            {
                path: '',
                name: 'extra.client',
                component: () => import('@/views/Client.vue'),
            },
        ],
    },
    {
        path: '/zhiqiong',
        component: () => import('@/views/Layout.vue'),
        children: [
            {
                path: '',
                name: 'zhiqiong',
                component: () => import('@/views/Zhiqiong.vue'),
            },
        ],
    },
]

const router = createRouter({
    history: $cocogoat.route === 'hash' ? createWebHashHistory() : createWebHistory('/'),
    routes,
})
declare global {
    interface Window {
        _hmt: string[][]
    }
}
router.afterEach((to) => {
    try {
        window._hmt.push(['_trackPageview', to.fullPath])
    } catch (e) {}
    try {
        window.gtag('set', { page_path: to.fullPath })
        window.gtag('event', 'page_view')
    } catch (e) {}
})
export default router
export function getUrl(name: string, followTheme = true, query: Record<string, string> = {}): string {
    const dark = document.body.classList.contains('dark') ? 'dark' : ''
    const h = router.resolve({ name, hash: followTheme ? '#theme=' + dark : '', query }).href
    return h
}
