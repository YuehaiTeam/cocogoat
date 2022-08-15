export * from './Achievement/Amos'
export * from './Achievement/UIAF'

export interface IAchievementStore {
    id: number
    categoryId: number
    status: string
    date: string
    images?: Record<string, string>
    partial?: number[]
    partialDetail?: { id: number; timestamp: number }[]
}
