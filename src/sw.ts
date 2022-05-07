/* Service Worker */
import resources, { resourceInfo, IResourceItem, setResources } from '@/resources'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, NetworkOnly, CacheFirst } from 'workbox-strategies'

import testResources from '@/../resources.json'
export function speedTest() {
    // group testresources by tag
    const testResourcesByTag = testResources.reduce((acc, item) => {
        const tag = item.tag
        if (!acc[tag]) {
            acc[tag] = []
        }
        acc[tag].push(item)
        return acc
    }, {} as Record<string, IResourceItem[]>) as Record<string, IResourceItem[]>
    // test each tag
    const allPromises = [] as Promise<IResourceItem>[]
    const waitPromises = [] as Promise<IResourceItem>[]
    for (const tag of Object.keys(testResourcesByTag)) {
        const items = testResourcesByTag[tag]
        const promises = items.map((item) =>
            (async () => {
                const ret = await fetch((item.prefix || '') + item.test, {
                    method: 'HEAD',
                    mode: 'cors',
                })
                if (!ret.ok) {
                    throw new Error(`${item.test} is not available`)
                }

                const r1 = { ...item.resources }
                for (const key of Object.keys(r1)) {
                    if (resourceInfo[key]) resourceInfo[key].urls.push((item.prefix || '') + r1[key])
                }
                return item
            })(),
        )
        allPromises.push(
            Promise.any(promises).then((item) => {
                const r1 = { ...item.resources }
                for (const key of Object.keys(r1)) {
                    r1[key] = (item.prefix || '') + r1[key]
                }
                setResources(r1)
                return item
            }),
        )
        waitPromises.push(...promises)
    }
    return [Promise.allSettled(allPromises), Promise.allSettled(waitPromises)]
}

const cacheName = 'cocogoat-sw'
const publicPath = __webpack_public_path__
const cachePromise = caches.open(cacheName)

let speedTestResult = [] as Awaited<ReturnType<typeof speedTest>>

addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(
        Promise.all([
            caches.open(cacheName + '-manifest').then((cache) => cache.add(__webpack_public_path__ + 'index.json')),
            fetch(new Request(new URL('/', location.href).toString())).then(async (response) => {
                const cache = await caches.open(cacheName)
                return cache.put(new Request(new URL('/', location.href).toString()), response)
            }),
        ]),
    )
})

addEventListener('activate', () => {
    clients.claim()
})

// wasm(s)
registerRoute(/\/_sw\/resources\/(.*?)/, async ({ url, request }): Promise<Response> => {
    const u = new URL(url)
    const basename = u.pathname.split('/').pop() || ''
    // check cache
    const cache = await cachePromise
    const cached = await cache.match(request)
    if (cached) {
        console.log('[cocogoat-sw] resource cached:', basename)
        return cached
    }
    // fastest-mirror
    if (speedTestResult.length <= 0) {
        console.log('[cocogoat-sw] speedtest started')
        speedTestResult = await speedTest()
    }
    await speedTestResult[0]
    const mirror = resources[basename]
    if (!mirror) {
        // return 404
        console.log('[cocogoat-sw] resource 404:', basename)
        return new Response('[cocogoat-sw]Error: Not Found', { status: 404 })
    }
    // fetch
    const response = await fetch(mirror)
    console.log('[cocogoat-sw] resource fetched:', basename)
    // cache
    await cache.put(request, response.clone())
    // return
    return response
})

// offlinefirst for cache
registerRoute(
    new RegExp(`${publicPath}static/(.*)`),
    new CacheFirst({
        cacheName: cacheName,
    }),
)

// networkfirst for jsons
registerRoute(
    /(.*).json/,
    new NetworkFirst({
        cacheName: cacheName,
    }),
)

// networkfirst for contributed
registerRoute(
    /contributed/,
    new NetworkFirst({
        cacheName: cacheName + '-api',
    }),
)

// networkfirst for api-region
registerRoute(
    /api-region/,
    new NetworkFirst({
        cacheName: cacheName + '-api',
    }),
)

// networkfirst for mihoyo.com
registerRoute(
    /mihoyo\.com/,
    new NetworkFirst({
        cacheName: cacheName + '-mohoyo',
    }),
)

// network-only for api
registerRoute(new RegExp(`${publicPath}77/(.*)`), new NetworkOnly())

// networkfirst for pages
registerRoute(
    // eslint-disable-next-line prefer-regex-literals
    ({ url }) => {
        // check same origin
        if (new URL(url).origin !== location.origin) {
            return false
        }
        return !new URL(url).pathname.includes('.')
    },
    async ({ url, request }): Promise<Response> => {
        const u = new URL(url)
        const basename = u.pathname.split('/').pop() || ''
        // just fetch first
        try {
            const response = await fetch(request)
            console.log(u.pathname)
            if (u.pathname === '/') {
                const cache = await cachePromise
                await cache.put(request, response.clone())
            }
            return response
        } catch (e) {
            if (basename.includes('.')) {
                return new Response('[cocogoat-sw] Error: You are offline and no cached version installed!', {
                    status: 404,
                })
            }
            // fallback to `/` for cache
            const cache = await cachePromise
            const cached = await cache.match(new Request(new URL('/', url).toString()))
            if (cached) {
                return cached
            }
            return new Response('[cocogoat-sw] Error: You are offline and no cached version installed!', {
                status: 404,
            })
        }
    },
)

// cache manifest handler
registerRoute(/\/_sw\/register/, async (): Promise<Response> => {
    try {
        caches
            .open(cacheName + '-manifest')
            .then((cache) => cache.put(new Request('/_sw/meta/registered'), new Response('true')))
        return new Response('[cocogoat-sw] manifest registered')
    } catch (e) {
        return new Response('[cocogoat-sw] manifest register FAILD: ' + (e as Error).message, {
            status: 500,
        })
    }
})
