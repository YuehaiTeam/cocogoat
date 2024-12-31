export const WebWorker = window.Worker
export class Worker extends WebWorker {
    url: string
    constructor(_url: string | URL) {
        const url: URL = new URL(_url, location.href)
        const base = new URL(process.env.BASE_URL as string, location.href)
        if (location.protocol !== 'file:' && url.origin !== location.origin) {
            const blob = new Blob([`_base='${base}';importScripts('${url}');`], {
                type: 'application/javascript',
            })
            super(URL.createObjectURL(blob))
        } else {
            /// #if VITE_DEV
            super(url, {
                type: 'module',
            })
            /// #else
            super(url)
            /// #endif
        }
        this.url = url.href
    }
}
interface WindowWithCorsWorker extends Window {
    CorsWorker: typeof Worker
}
export function installToWindow() {
    ;(window as unknown as WindowWithCorsWorker).CorsWorker = Worker
}
export function WorkerMacro(arg?: Worker | URL | (() => Worker)): Worker {
    /* @worker */ throw new Error('WorkerMacro must be used with plugin')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return typeof arg === 'function' ? arg() : arg.href ? new Worker(arg.href) : arg
}
export function WorkerUrl(arg?: URL | (() => URL)): URL {
    /* @worker */ throw new Error('WorkerMacro must be used with plugin')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return typeof arg === 'function' ? arg() : arg
}
export function WorkerExtract(wrapper: () => Worker): URL {
    const url = wrapper.toString().match(/\(\s?['"](.*?)['"][,)\s]/)
    if (!url) {
        try {
            const temp_Worker = window.Worker
            const temp_RevokeObjectUrl = window.URL.revokeObjectURL
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.Worker = function (url: string) {
                return new URL(url, import.meta.url)
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            window.URL.revokeObjectURL = (_url: string) => {
                // do nothing
            }
            const tmpUrl = wrapper() as unknown as URL
            window.Worker = temp_Worker
            window.URL.revokeObjectURL = temp_RevokeObjectUrl
            return tmpUrl
        } catch (e) {
            throw new Error('WorkerMacro faild to get url')
        }
    }
    return new URL(url[1], import.meta.url)
}
WorkerMacro.installToWindow = installToWindow
WorkerMacro.WorkerExtract = WorkerExtract
WorkerMacro.Worker = Worker

WorkerUrl.WorkerExtract = WorkerExtract
WorkerUrl.Worker = function (url: string) {
    return new URL(url, import.meta.url)
}
