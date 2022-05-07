export class ServiceWorker {
    url: string
    fallback = false
    manifest = ''
    additionalCachedUrls = [] as string[]
    justinstall = false
    sw = navigator.serviceWorker ? navigator.serviceWorker.controller : null
    onprogress?: (loaded: number, total: number) => unknown
    custom = {} as Record<string, unknown>
    constructor(
        _url: string | URL,
        {
            fallback,
            manifest,
            additionalCachedUrls,
            onprogress,
        }: {
            fallback: string
            manifest: string
            additionalCachedUrls?: string[]
            onprogress?: (loaded: number, total: number) => unknown
        },
    ) {
        const url: URL = new URL(_url, location.href)
        if (url.origin !== location.origin) {
            this.url = fallback.toString()
            this.fallback = true
        } else {
            this.url = url.href
        }
        this.manifest = manifest
        this.additionalCachedUrls = additionalCachedUrls || []
        this.onprogress = onprogress
    }
    async install() {
        // if fallback, check file exists
        if (this.fallback) {
            try {
                const response = await fetch(this.url)
                if (response.status !== 200) {
                    throw new Error(`${response.status} ${response.statusText}`)
                }
            } catch (e) {
                return
            }
        }
        // check support
        if (!('serviceWorker' in navigator)) {
            return
        }
        this.addInstallListener()
        // check if already installed and is the same version
        if (navigator.serviceWorker.controller) {
            const current = navigator.serviceWorker.controller
            if (current.scriptURL === this.url) {
                return this.checkUpdate()
            }
        }
        // register
        navigator.serviceWorker
            .register(this.url, {
                scope: '/',
            })
            .then(async (registration) => {
                // wait for install
                await navigator.serviceWorker.ready
                console.log('[cocogoat-sw] ServiceWorker installed', registration)
                this.justinstall = true
            })
    }

    async uninstall() {
        const r = await navigator.serviceWorker.getRegistrations()
        for (const registration of r) {
            await registration.unregister()
        }
    }

    async addInstallListener() {
        if (!navigator.serviceWorker || !this.sw) {
            return
        }
        window.addEventListener('appinstalled', () => {
            console.log('[cocogoat-sw] installed to app')
            fetch('/_sw/register')
            this.cacheAll()
        })
    }
    async checkUpdate() {
        if (!this.manifest) return
        const manifestCache = await caches.open('cocogoat-sw-manifest')
        const request = new Request(__webpack_public_path__ + 'index.json')
        const cachedManifest = await manifestCache.match(request)
        if (!cachedManifest) return
        const cachedJson = await cachedManifest.json()
        const swManifest = cachedJson[3]
        if (this.manifest !== swManifest) {
            console.log('[cocogoat-sw] update found')
            this.cacheAll()
        }
    }
    async cacheAll(force = false) {
        if (!navigator.serviceWorker || !this.sw) {
            throw new Error('ServiceWorker not installed')
        }
        if (!this.manifest) {
            throw new Error('Manifest not loaded')
        }
        // fetch manifest
        const publicPath = new URL(__webpack_public_path__, location.href)
        const manifestUrl = new URL(this.manifest, publicPath)
        const manifestReq = await fetch(manifestUrl.toString())
        if (manifestReq.status !== 200) {
            throw new Error(`${manifestReq.status} ${manifestReq.statusText}`)
        }
        const _manifest = (await manifestReq.json()) as string[]
        const swCache = await caches.open('cocogoat-sw')
        const urls = (await swCache.keys()).map((e) => new URL(e.url).pathname).filter((e) => e.includes('static/'))
        for (const i of urls) {
            let u = i
            if (u[0] === '/') u = u.substring(1)
            if (!_manifest.includes(u)) {
                swCache.delete(i)
                console.log('[cocogoat-sw] purged:', i)
            }
        }
        const manifestCache = await caches.open('cocogoat-sw-manifest')
        const cachedManifest = await manifestCache.match(new Request('/_sw/meta/registered'))
        if (!cachedManifest && !force) return
        const manifest = [..._manifest, ...this.additionalCachedUrls]
        manifest.push(new URL('/', location.href).toString())
        // fetch all files
        let loaded = 0
        const total = manifest.length
        if (this.onprogress) this.onprogress.bind(this)(loaded, total)
        const promises = manifest.map((url) => {
            const urlObj = new URL(url, publicPath)
            return fetch(urlObj.toString(), {
                cache: 'no-store',
            })
                .then((res) => {
                    if (res.status !== 200) {
                        throw new Error(`${res.status} ${res.statusText}`)
                    }
                    return res.blob()
                })
                .then(() => {
                    loaded++
                    if (this.onprogress) this.onprogress.bind(this)(loaded, total)
                    console.log('[cocogoat-sw] precache', loaded + '/' + total)
                })
        })
        await Promise.all(promises)
    }
}
