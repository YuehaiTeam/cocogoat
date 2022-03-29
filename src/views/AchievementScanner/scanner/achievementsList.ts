import { Achievement, AchievementCategory } from '@/typings/Achievement'
export let achievementMap = [] as AchievementCategory[]
export const achievementTitles: { str: string; obj: Achievement }[] = []
export const achievementEC: { str: string; obj: Achievement }[] = []
export const achievementSubs: { str: string; obj: Achievement }[] = []
export let amos: string[] = []
export function initAchievementMap(map: AchievementCategory[], _amos: string[]) {
    amos = _amos
    achievementMap = map
    achievementMap.forEach((c) => {
        c.achievements.forEach((a) => {
            achievementTitles.push({
                str: amos[a.name].replace(/…|「|」/g, ''),
                obj: a,
            })
            achievementSubs.push({
                str: amos[a.desc].replace(/…|「|」/g, ''),
                obj: a,
            })
            achievementEC.push({
                str: `${amos[a.name]}-${amos[a.desc]}`.replace(/…|「|」/g, ''),
                obj: a,
            })
        })
    })
    console.log('created achievement map with length=' + achievementTitles.length)
}
