import achevementsAmos from '@/plugins/amos/achievements/index'
export const goalMap = {} as Record<number, number>
const goalKeys = {
    31: 'sumeru',
    32: 'mortal-travails-series-iii',
    33: 'meetings-in-outrealm-series-iii',
} as Record<number, string>
achevementsAmos.forEach((cat) => {
    cat.key = goalKeys[cat.id] || cat.key.replace(/_/g, '-') || cat.id.toString()
    cat.achievements.forEach((ach) => {
        goalMap[ach.id] = cat.id
    })
})
