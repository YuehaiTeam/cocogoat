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
    // 直接捕获 wrapper 内部 new Worker(...) 的脚本地址，
    // 不再用正则在函数源码里猜：旧正则会把包装函数里的 addEventListener('error', ...) 匹配成地址，
    // 导致 file:// 下去加载 file:///.../error 并抛出 SecurityError。
    const temp_Worker = window.Worker
    const temp_RevokeObjectUrl = window.URL.revokeObjectURL
    let captured = ''
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.Worker = function (url: string) {
        if (!captured) captured = String(url)
        return new URL(url, import.meta.url)
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    window.URL.revokeObjectURL = (_url: string) => {
        // 先不撤销，等 Worker 创建完成后再交给浏览器回收
    }
    try {
        wrapper()
    } catch (e) {
        if (!captured) throw new Error('WorkerMacro faild to get url: ' + (e as Error)?.message)
    } finally {
        window.Worker = temp_Worker
        window.URL.revokeObjectURL = temp_RevokeObjectUrl
    }
    if (!captured) throw new Error('WorkerMacro faild to get url')
    return new URL(captured, import.meta.url)
}
WorkerMacro.installToWindow = installToWindow
WorkerMacro.WorkerExtract = WorkerExtract
WorkerMacro.Worker = Worker

WorkerUrl.WorkerExtract = WorkerExtract
WorkerUrl.Worker = function (url: string) {
    return new URL(url, import.meta.url)
}
