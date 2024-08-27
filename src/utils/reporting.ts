/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { App } from 'vue'
import { Router } from 'vue-router'
import * as Sentry from '@sentry/vue'
import { ElMessageBox, ElNotification } from 'element-plus'
import 'element-plus/theme-chalk/el-notification.css'

const makeTransformedFetchTransport: typeof Sentry.makeFetchTransport = (options, nativeFetch) => {
    if (options.url) {
        options.url = options.url
            .replace(/sentry_(.*?)=/g, 'cocogoat_ins_$1=')
            .replace('/api/0/envelope/', '/')
            .replace('/api/0/', '/')
    }
    return Sentry.makeFetchTransport(options, nativeFetch)
}

export async function init(app: App, router: Router) {
    document.head.appendChild(document.createElement('script')).src =
        'https://hm.baidu.com/hm.js?9fa0c980766e6a8646c0f814aa40b130'
    ;((window, website, root) => {
        const {
            screen: { width, height },
            navigator: { language },
            location,
            document,
            history,
        } = window
        const { hostname, pathname, search } = location
        const _data = 'data-'
        const endpoint = `${root}/ev`
        const screen = `${width}x${height}`
        const eventRegex = /data-x-ev-([\w-_]+)/
        const eventNameAttribute = _data + 'x-ev'
        const delayDuration = 300

        /* Helper functions */

        const hook = (_this: any, method: any, callback: any) => {
            const orig = _this[method]

            return (...args: any[]) => {
                callback(...args)
                return orig.apply(_this, args)
            }
        }

        const getPath = (url: string) => {
            if (url.substring(0, 4) === 'http') {
                return '/' + url.split('/').splice(3).join('/')
            }
            return url
        }

        const getPayload = () => ({
            website,
            hostname,
            screen,
            language,
            title: document.title,
            url: currentUrl,
            referrer: currentRef,
        })

        /* Tracking functions */

        const trackingDisabled = () => {
            // @ts-expect-error
            const { doNotTrack, navigator, external } = window

            const msTrackProtection = 'msTrackingProtectionEnabled'
            const msTracking = () => {
                // @ts-expect-error
                return external && msTrackProtection in external && external[msTrackProtection]()
            }

            // @ts-expect-error
            const dnt = doNotTrack || navigator.doNotTrack || navigator.msDoNotTrack || msTracking()

            // eslint-disable-next-line eqeqeq
            return dnt == '1' || dnt === 'yes'
        }

        const handlePush = (_state: unknown, title: string, url: string) => {
            if (!url) return

            currentRef = currentUrl
            currentUrl = getPath(url.toString())

            if (currentUrl !== currentRef) {
                setTimeout(track, delayDuration)
            }
        }

        const handleClick = () => {
            const trackElement = (el: HTMLElement): any => {
                const attr = el.getAttribute.bind(el)
                const eventName = attr(eventNameAttribute)

                if (eventName) {
                    const eventData = {} as Record<string, any>

                    el.getAttributeNames().forEach((name: string) => {
                        const match = name.match(eventRegex)

                        if (match) {
                            eventData[match[1]] = attr(name)
                        }
                    })

                    return track(eventName, { data: eventData })
                }
                return Promise.resolve()
            }

            const callback = (e: any) => {
                const findATagParent = (rootElem: HTMLElement | null, maxSearchDepth: number) => {
                    let currentElement = rootElem
                    for (let i = 0; i < maxSearchDepth; i++) {
                        if (currentElement?.tagName === 'A') {
                            return currentElement
                        }
                        currentElement = currentElement?.parentElement || null
                        if (!currentElement) {
                            return null
                        }
                    }
                    return null
                }

                const el = e.target
                const anchor = el.tagName === 'A' ? el : findATagParent(el, 10)

                if (anchor) {
                    const { href, target } = anchor
                    const external =
                        target === '_blank' || e.ctrlKey || e.shiftKey || e.metaKey || (e.button && e.button === 1)
                    const eventName = anchor.getAttribute(eventNameAttribute)

                    if (eventName && href) {
                        if (!external) {
                            e.preventDefault()
                        }
                        return trackElement(anchor).then(() => {
                            if (!external) location.href = href
                        })
                    }
                } else {
                    trackElement(el)
                }
            }

            document.addEventListener('click', callback, true)
        }

        const send = (payload: any) => {
            if (trackingDisabled()) return
            const headers = {
                'Content-Type': 'application/json',
            } as Record<string, string>
            if (typeof cache !== 'undefined') {
                headers['x-ev-cache'] = cache
            }
            return fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({ type: 'event', payload }),
                headers,
            })
                .then((res) => res.text())
                .then((text) => {
                    cache = text
                })
        }

        const track = (obj?: any, data?: any) => {
            if (typeof obj === 'string') {
                return send({
                    ...getPayload(),
                    name: obj,
                    data: typeof data === 'object' ? data : undefined,
                })
            } else if (typeof obj === 'object') {
                return send(obj)
            } else if (typeof obj === 'function') {
                return send(obj(getPayload()))
            }
            return send(getPayload())
        }

        // @ts-expect-error
        if (!window.$ev) {
            // @ts-expect-error
            window.$ev = (obj, data) => track(obj, data)
        }

        let currentUrl = `${pathname}${search}`
        let currentRef = document.referrer
        let cache: string
        let initialized: boolean

        if (!trackingDisabled()) {
            history.pushState = hook(history, 'pushState', handlePush)
            history.replaceState = hook(history, 'replaceState', handlePush)
            handleClick()
            const init = () => {
                if (document.readyState === 'complete' && !initialized) {
                    track()
                    initialized = true
                }
            }
            document.addEventListener('readystatechange', init, true)
            init()
        }
    })(window, '8dd6307d-d7ff-4b0a-be63-4e6f9520334e', process.env.VUE_APP_APIBIG)

    Sentry.init({
        app,
        dsn: process.env.VUE_APP_SENTRY,
        integrations: [Sentry.browserTracingIntegration({ router })],
        tracesSampleRate: 0.5,
        release: process.env.VUE_APP_GIT_SHA,
        environment: process.env.VUE_APP_SINGLEFILE === 'true' ? 'singlefile' : process.env.NODE_ENV,
        tracePropagationTargets: [
            'https://77.cocogoat.cn',
            'https://77.cocogoat.work',
            'https://cd1-big.cocogoat.cn',
            'https://cd2-big.cocogoat.cn:11443',
        ],
        transport: makeTransformedFetchTransport,
    })
}
let currentEmail = ''
export async function setUser(email: string) {
    if (currentEmail) return
    currentEmail = email
    Sentry.setUser({
        email,
    })
}

export async function report() {
    let input
    try {
        input = await ElMessageBox.prompt('请在下方输入您的问题。程序日志将被同时提交。', '上传日志', {
            inputType: 'textarea',
            inputPlaceholder: '点击 xxx 之后，yyy 就崩溃了。',
        })
    } catch (e) {
        return
    }
    if (!input.value) return
    const comments = input.value
    const evid = Sentry.captureMessage('用户反馈：\n' + comments)
    const u = new URL(process.env.VUE_APP_SENTRY || '')
    u.username = ''
    u.password = ''
    u.pathname = u.pathname.split('/').slice(0, -1).join('/') + '/api/embed/error-page/'
    u.searchParams.set('eventId', evid)
    console.log(comments)

    const reportData = {
        name: 'anonymous-report',
        email: currentEmail || `anonymous-report@cocogoat.work`,
        comments,
    }
    try {
        const res = await fetch(u.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(reportData).toString(),
        })
        if (res.ok) {
            ElNotification({
                title: '日志已上传',
                message: 'ID: ' + evid + ' 请将此 ID 提交给开发者，否则无法解决任何问题。',
                type: 'success',
                customClass: 'feedback-notification',
                duration: 0,
            })
        } else {
            throw new Error('Got a non-200 response')
        }
    } catch (e) {
        ElNotification({
            title: '反馈提交失败',
            message: (e as Error).message,
            type: 'error',
        })
    }
}
