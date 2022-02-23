/* eslint-disable */
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module 'nd4js'

declare module '@/plugins/ocr/*'

declare module '*?raw'
declare module '*?rawnolocal'

declare module '@/../resources.json' {
    import { IResourceItem } from './resources'
    const t: IResourceItem[]
    export default t
}

declare module 'onnxruntime-web/dist/ort.wasm-core.min.js' {
    export * from 'onnxruntime-web'
}

declare module '@genshin-data/*/achievements.json' {
    import { AchievementCategory } from '@/typings/Achievement'
    const t: AchievementCategory[]
    export default t
}
declare module '@genshin-data/*/characters.json' {
    import { ICharacter } from '@/typings/Character'
    const t: ICharacter[]
    export default t
}

declare module 'flyio/dist/npm/fly'
declare module 'vue-virtual-scroller'
declare module 'vue-virtual-scroller/src/index'
