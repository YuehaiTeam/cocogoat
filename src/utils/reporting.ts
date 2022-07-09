import { App } from 'vue'
import { Router } from 'vue-router'
import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'
import { ElMessageBox, ElNotification } from 'element-plus'
import 'element-plus/theme-chalk/el-notification.css'

import { eventToSentryRequest, sessionToSentryRequest } from '@sentry/core'
import { Event, Response, SentryRequest, Session, TransportOptions } from '@sentry/types'
import { SentryError, supportsReferrerPolicy, SyncPromise } from '@sentry/utils'
import { BaseTransport } from '@sentry/browser/esm/transports/base'
import { FetchImpl, getNativeFetchImplementation } from '@sentry/browser/esm/transports/utils'

export function init(app: App, router: Router) {
    /// #if SINGLEFILE
    checkHm()
        .then(() => import('@/plugins/tongji'))
        .then((module) => {
            module.default()
        })
        .catch(() => {
            // ignore hm failure
        })
    /// #else
    window.dataLayer = window.dataLayer || []
    window.gtag = function () {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', 'G-N5RVN34736')
    window.gtag('config', 'UA-167575061-1')
    document.head.appendChild(document.createElement('script')).src =
        'https://hm.baidu.com/hm.js?9fa0c980766e6a8646c0f814aa40b130'
    document.head.appendChild(document.createElement('script')).src =
        'https://www.googletagmanager.com/gtag/js?id=G-N5RVN34736'

    /// #endif
    Sentry.init({
        app,
        dsn: process.env.VUE_APP_SENTRY,
        integrations: [
            new BrowserTracing({
                routingInstrumentation: Sentry.vueRouterInstrumentation(router),
                tracingOrigins: ['77.cocogoat.work', '77.xyget.cn', /^\//],
            }),
        ],
        tracesSampleRate: 0.5,
        release: process.env.VUE_APP_GIT_SHA,
        environment: process.env.VUE_APP_SINGLEFILE === 'true' ? 'singlefile' : process.env.NODE_ENV,
        transport: SimpleFetchTransport,
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
        input = await ElMessageBox.prompt('请在下方输入您的问题。程序日志将被同时提交。', '反馈', {
            inputType: 'textarea',
            inputPlaceholder: '遇到什么困难了吗？',
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
                title: '反馈提交成功',
                message: 'ID: ' + evid,
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

/* Check HM */
const checkHm = () =>
    new Promise((resolve, reject) => {
        const t = new Image()
        t.onload = resolve
        t.onerror = reject
        t.src = 'https://hm.baidu.com/hm.gif'
    })

/* Sentry Transport */
export class SimpleFetchTransport extends BaseTransport {
    /**
     * Fetch API reference which always points to native browser implementation.
     */
    private _fetch: typeof fetch

    public constructor(options: TransportOptions, fetchImpl: FetchImpl = getNativeFetchImplementation()) {
        super(options)
        this._fetch = fetchImpl
    }

    /**
     * @inheritDoc
     */
    public sendEvent(event: Event): PromiseLike<Response> {
        return this._sendRequest(eventToSentryRequest(event, this._api), event)
    }

    /**
     * @inheritDoc
     */
    public sendSession(session: Session): PromiseLike<Response> {
        return this._sendRequest(sessionToSentryRequest(session, this._api), session)
    }

    /**
     * @param sentryRequest Prepared SentryRequest to be delivered
     * @param originalPayload Original payload used to create SentryRequest
     */
    _sendRequest(sentryRequest: SentryRequest, originalPayload: Event | Session): PromiseLike<Response> {
        if (this._isRateLimited(sentryRequest.type)) {
            this.recordLostEvent('ratelimit_backoff', sentryRequest.type)
            const err = {
                name: 'SentryError',
                message: 'too many requests',
                event: originalPayload,
                type: sentryRequest.type,
                reason: `Transport for ${sentryRequest.type} requests locked till ${this._disabledUntil(
                    sentryRequest.type,
                )} due to too many requests.`,
                status: 429,
            } as Error
            return Promise.reject(err)
        }

        const options: RequestInit = {
            body: sentryRequest.body,
            method: 'POST',
            // Despite all stars in the sky saying that Edge supports old draft syntax, aka 'never', 'always', 'origin' and 'default
            // https://caniuse.com/#feat=referrer-policy
            // It doesn't. And it throw exception instead of ignoring this parameter...
            // REF: https://github.com/getsentry/raven-js/issues/1233
            referrerPolicy: (supportsReferrerPolicy() ? 'origin' : '') as ReferrerPolicy,
        }
        if (this.options.fetchParameters !== undefined) {
            Object.assign(options, this.options.fetchParameters)
        }
        if (this.options.headers !== undefined) {
            options.headers = this.options.headers
        }

        return this._buffer
            .add(
                () =>
                    new SyncPromise<Response>((resolve, reject) => {
                        this._fetch(sentryRequest.url.replace(/sentry_(.*?)=/g, 'f9f3bed2daf73dc6_$1='), options)
                            .then((response) => {
                                const headers = {
                                    'x-sentry-rate-limits': response.headers.get('X-Sentry-Rate-Limits'),
                                    'retry-after': response.headers.get('Retry-After'),
                                }
                                this._handleResponse({
                                    requestType: sentryRequest.type,
                                    response,
                                    headers,
                                    resolve,
                                    reject,
                                })
                            })
                            .catch(reject)
                    }),
            )
            .then(undefined, (reason) => {
                // It's either buffer rejection or any other xhr/fetch error, which are treated as NetworkError.
                if (reason instanceof SentryError) {
                    this.recordLostEvent('queue_overflow', sentryRequest.type)
                } else {
                    this.recordLostEvent('network_error', sentryRequest.type)
                }
                throw reason
            })
    }
}
