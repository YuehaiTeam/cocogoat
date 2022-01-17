/* eslint-disable */
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module 'nd4js'

declare module '@/plugins/ocr/*'

declare module '*?raw'

declare module '@genshin-data/*/achievements.json' {
    import { AchievementCategory } from '@/plugins/genshin-data/src/types/achievement'
    const t: AchievementCategory[]
    export default t
}
