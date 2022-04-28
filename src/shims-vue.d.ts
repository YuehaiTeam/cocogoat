/* eslint-disable */
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module 'lodash-full' {
    import type _ from 'lodash'
    export default _
}

declare module '@/plugins/ocr/*'
declare module '@/plugins/yas/*'

declare module '*?raw'
declare module '*?txt'
declare module '*?rawnolocal'

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

declare module '@genshin-data/*/artifacts.json' {
    import { IArtifactDesc } from '@/typings/Artifact'
    const t: IArtifactDesc[]
    export default t
}

declare module '@/plugins/decomposed-achievements/DecomposedAchievements.json' {
    import { IDecomposedAchievement } from '@/typings/Achievement'
    const t: IDecomposedAchievement[]
    export default t
}

declare module '@yuehaiteam/shuanghua-last-version' {
    const latest: {
        url: string
        ver: string
    }
    export default latest
}

declare module 'flyio/dist/npm/fly'
declare module 'vue-virtual-scroller'
declare module 'vue-virtual-scroller/src/index'
declare module '@/plugins/tongji'
