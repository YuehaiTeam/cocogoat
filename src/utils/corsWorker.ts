const WebWorker = window.Worker
export class Worker extends WebWorker {
    constructor(_url: string | URL) {
        const url: URL = new URL(_url, location.href)
        const base = new URL(__webpack_public_path__, location.href)
        if (url.origin !== location.origin) {
            const blob = new Blob([`_base='${base}';importScripts('${url}');`], {
                type: 'application/javascript',
            })
            super(URL.createObjectURL(blob))
        } else {
            super(url)
        }
    }
}
