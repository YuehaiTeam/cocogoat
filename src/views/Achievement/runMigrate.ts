import { IAchievementStore } from '@/typings/Achievement'

const deprecated = {
    81006: 85000,
    81007: 85001,
    81008: 85002,
    81009: 85003,
    81011: 85004,
    81012: 85005,
    81013: 85006,
    81219: 81222,
} as Record<number, number>

export function runMigrate(e: IAchievementStore) {
    let hasMigrated = false
    // 81xxx -> 8500x for compatibility
    if (deprecated[e.id]) {
        console.log('Converted', e.id, 'to', deprecated[e.id])
        e.id = deprecated[e.id]
        hasMigrated = true
    }
    // Migrate Date
    if (!e.date || e.date === '后续已完成') {
        console.log('Migrated achievement', e.id, ' with no date')
        e.date = new Date(0).toISOString()
        hasMigrated = true
    }
    // check is not iso date
    if (e.date && !e.date.includes('-')) {
        try {
            e.date = new Date(e.date).toISOString()
            hasMigrated = true
        } catch (er) {
            console.error('Failed to migrate date: ', e.id, e.date, er)
            e.date = new Date(0).toISOString()
            hasMigrated = true
        }
    }
    // check year>9999
    // 2021 can be 22021 20021 20221 20211
    if (e.date && e.date.indexOf('+') === 0) {
        const d = new Date(e.date)
        const yearstr = d.getFullYear().toString()
        if (yearstr.length === 5) {
            // 2020 for start with 2020
            if (yearstr.indexOf('2020') === 0) {
                d.setFullYear(2020)
                // 2022x/2002x/2202x -> 202x
            } else if (
                yearstr.indexOf('2022') === 0 ||
                yearstr.indexOf('2002') === 0 ||
                yearstr.indexOf('2202') === 0
            ) {
                d.setFullYear(Number('202' + yearstr[4]))
                // 202xx -> 202x
            } else if (yearstr.indexOf('202') === 0 && yearstr[4] === yearstr[3]) {
                d.setFullYear(Number('202' + yearstr[3]))
            } else {
                // set to now if unknown
                d.setFullYear(new Date().getFullYear())
            }
        }
        e.date = d.toISOString()
        console.log('Migrated invaild year from ' + yearstr + ' to ' + d.getFullYear())
        hasMigrated = true
    }
    return hasMigrated
}
