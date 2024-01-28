import { IStore } from '.'
import { IAchievementStore, UIAFStatus } from '@/typings/Achievement'
import { AchievementItem, IAchievementSource } from '@/typings/Achievement/Achievement'
export function legacyToUIAFExt(src: IAchievementStore[]): AchievementItem[] {
    return src.map(
        (e) =>
            new AchievementItem({
                id: e.id,
                timestamp: Math.floor(new Date(e.date).getTime() / 1000),
                current: Number(e.status.replace('总计', '')) || 0,
                status:
                    e.partial && e.partial.length > 0
                        ? UIAFStatus.ACHIEVEMENT_UNFINISHED
                        : UIAFStatus.ACHIEVEMENT_POINT_TAKEN,
                partial:
                    e.partialDetail?.reduce(
                        (a, b) => {
                            a[b.id] = Math.floor(new Date(b.timestamp).getTime() / 1000)
                            return a
                        },
                        {} as Record<number, number>,
                    ) || {},
                image: e.images?.main || '',
                source: IAchievementSource.IMPORT,
            }),
    )
}
export function achArrayToObject(src: AchievementItem[]): Record<number, AchievementItem> {
    return src.reduce(
        (a, b) => {
            a[b.id] = b
            return a
        },
        {} as Record<number, AchievementItem>,
    )
}
export const runMigrate = (key: string, data: IStore) => {
    let hasMigrated = false
    const pk = '.' + key
    if (!pk.endsWith('.options') && !pk.includes('.playground.') && !pk.endsWith('.currentUser')) {
        if (data.achievementVersion === 1.0) {
            data.achievement2 = achArrayToObject(legacyToUIAFExt(data.achievements))
            data.achievementVersion = 2.0
            hasMigrated = true
            console.log('Migrated achievement from v1.0 to v2.0')
        }
        if (data.achievement2 && 'undefined' in data.achievement2) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            delete data.achievement2['undefined']
        }
    }
    return hasMigrated
}
