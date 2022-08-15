/* eslint-disable */
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module 'lodash-full' {
    import type _ from 'lodash-es'
    export default _
}

declare module '@/plugins/ocr/*'
declare module '@/plugins/yas/*'

declare module '*?url'
declare module '*?raw'
declare module '*?raw&dictcompress'
declare module '*?url&nolocal'
declare module '*?url&gzip'

declare module 'vue-monaco'

declare module 'vue-google-adsense/dist/Adsense.min.js'

declare module '@/../resources.json' {
    import { IResourceItem } from './resources'
    const t: IResourceItem[]
    export default t
}

declare module 'onnxruntime-web/dist/ort.wasm-core.min.js' {
    export * from 'onnxruntime-web'
}

declare module 'flyio/dist/npm/fly'
declare module 'vue-virtual-scroller'
declare module 'vue-virtual-scroller/src/index'
declare module '@/plugins/tongji'
