import achevementsAmos from '@/generated/amos-data/amos/achievements/index'
export const goalMap = {} as Record<number, number>
const goalKeys = {
    31: 'sumeru',
    32: 'mortal-travails-series-iii',
    33: 'meetings-in-outrealm-series-iii',
    34: 'challenger-series-vi',
    35: 'sumeru-the-gilded-desert-series-i',
    36: 'elemental-specialist-series-ii',
} as Record<number, string>
achevementsAmos.forEach((cat) => {
    cat.key = goalKeys[cat.id] || cat.key.replace(/_/g, '-') || cat.id.toString()
    cat.achievements.forEach((ach) => {
        goalMap[ach.id] = cat.id
    })
})
