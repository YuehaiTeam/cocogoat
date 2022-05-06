import { ServiceWorker } from '@/utils/serviceWorker'
export const sw = new ServiceWorker(
    new URL(/* webpackChunkName: "sw" */ /* webpackEntryOptions: { filename: "sw.js" } */ '@/sw.ts', import.meta.url),
    '/sw.js',
)
if (location.href.includes('let-me-in')) {
    sw.uninstall()
} else if (process.env.NODE_ENV === 'production' || location.href.includes('force-sw')) {
    sw.install()
}
window.$cocogoat.sw = sw
