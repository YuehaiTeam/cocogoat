/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ref } from 'vue'
import dayjs from 'dayjs'
import { store } from '@/store'
import { sandboxedEval } from '@/utils/sandbox'
import { IAchievementStore } from '@/typings/Achievement'
import achevementsAmos from '@/plugins/amos/achievements/index'

function hasCocogoatAchievementJson(j: Record<string, any[]>) {
    return (
        Array.isArray(j.achievements) &&
        j.achievements.length > 0 &&
        !isNaN(j.achievements[0].id) &&
        typeof j.achievements[0].status === 'string' &&
        !isNaN(j.achievements[0].categoryId) &&
        typeof j.achievements[0].date === 'string'
    )
}
function hasPaimonMoeJson(j: Record<string, any>) {
    let r = j
    // array mode
    if (Array.isArray(j.achievement) && j.achievement.length > 0 && j.achievement.find((e) => e !== null)) {
        r = { achievement: {} }
        j.achievement.forEach((e, index) => {
            if (e === null) return
            r.achievement[index] = e
        })
    }
    // oject mode
    if (typeof r.achievement === 'object' && Object.keys(r.achievement).length > 0) {
        const firstObj = r.achievement[Object.keys(r.achievement)[0]]
        const firstOne = firstObj[Object.keys(firstObj)[0]]
        if (typeof firstOne === 'boolean') return convertPaimonMoeJson(r)
    }
    return false
}
function convertPaimonMoeJson(j: Record<string, any>) {
    const achList = [] as IAchievementStore[]
    Object.keys(j.achievement).forEach((index: string) => {
        const ach = j.achievement[index] as Record<number, true>
        Object.keys(ach).forEach((key) => {
            achList.push({
                id: Number(key),
                status: '导入',
                categoryId: Number(index),
                date: dayjs().format('YYYY/MM/DD'),
                images: {},
            })
        })
    })
    return achList
}
// eslint-disable-next-line max-params
export function useImport(
    content: Ref<string>,
    allowed: Ref<boolean>,
    importText: Ref<string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    importData: Ref<any>,
    importType: Ref<string>,
) {
    // eslint-disable-next-line complexity
    const checkContent = async () => {
        if (!content.value.trim() || (!content.value.includes('[') && !content.value.includes('{'))) {
            importText.value = '未识别到可导入的内容'
            allowed.value = false
            return
        }
        try {
            const j = JSON.parse(content.value)
            if (j.achievements && hasCocogoatAchievementJson(j)) {
                importText.value = '导入椰羊成就 (' + j.achievements.length + '个)'
                allowed.value = true
                importType.value = 'cocogoat'
                importData.value = j.achievements
            } else if (j.value && j.value.achievements && hasCocogoatAchievementJson(j.value)) {
                importText.value = '导入椰羊备份 (' + j.value.achievements.length + '个)'
                allowed.value = true
                importType.value = 'cocogoat'
                importData.value = j.value.achievements
            } else if (j.achievement && (importData.value = hasPaimonMoeJson(j))) {
                importText.value = '导入Paimon.moe备份 (' + importData.value.length + '个)'
                allowed.value = true
                importType.value = 'cocogoat'
            } else {
                importText.value = '未识别到可导入的内容'
                allowed.value = false
            }
        } catch (e) {
            console.log(e)
            // check script-style importer
            const sandboxScript = `
            class mockedLocalStorage {
                getItem(itemName) {
                    return Reflect.get(this, itemName);
                }
                setItem(itemName, itemValue) {
                    Reflect.set(this, itemName, itemValue);
                }
                removeItem(itemName) {
                    Reflect.deleteProperty(this, itemName);
                }
                clear() {
                    for (const key in this) {
                        if (Object.prototype.hasOwnProperty.call(this, key)) {
                            if (['getItem', 'setItem', 'removeItem', 'clear'].includes(key)) return;
                            Reflect.deleteProperty(this, key);
                        }
                    }
                }
            }
            const f = new mockedLocalStorage()
            const scope = {
                localStorage: f,
                localforage: f,
                document: null,
                XMLHttpRequest: null,
                fetch: null,
                navigator: null,
                window: null,
                import: null,
                alert: null,
                confirm: null,
                prompt: null
            };
            scope.window = scope;
            scope.top = scope;
            scope.self = scope;
            scope.parent = scope;
            with(scope) {
                ${content.value}
            }
            return JSON.parse(JSON.stringify(scope.localStorage));
            `
            try {
                if (content.value.includes('while(') || content.value.includes('while (')) {
                    throw new Error('Maybe Evil')
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const result = (await sandboxedEval(sandboxScript)) as any
                if (typeof result['cocogoat.v1.currentUser'] === 'string') {
                    // maybe cocogoat js
                    const mockCurrentUser = JSON.parse(result['cocogoat.v1.currentUser']) as string
                    const mockDB = result['cocogoat.v1.' + mockCurrentUser]
                    if (mockDB && hasCocogoatAchievementJson(mockDB)) {
                        importText.value = '导入椰羊代码 (' + mockDB.achievements.length + '个)'
                        allowed.value = true
                        importType.value = 'cocogoat'
                        importData.value = mockDB.achievements
                        return
                    } else {
                        throw new Error()
                    }
                }
                if (typeof result.achievement === 'object') {
                    // maybe paimon.moe js
                    importData.value = convertPaimonMoeJson(result)
                    importText.value = '导入Paimon.moe代码 (' + importData.value.length + '个)'
                    allowed.value = true
                    importType.value = 'cocogoat'
                    return
                }
                if (typeof result.account === 'string' || typeof result['main-achievements'] === 'string') {
                    // maybe seelie.me js
                    const a = result.account || 'main'
                    const b = JSON.parse(result[`${a}-achievements`])
                    const achList = [] as IAchievementStore[]
                    Object.keys(b).forEach((key) => {
                        const seelieItem = b[key] as { done: true; notes: string }
                        achList.push({
                            id: Number(key),
                            status: seelieItem.notes.trim().split(' ')[0],
                            categoryId: -1,
                            date: (seelieItem.notes.trim() + ' ').split(' ')[1].trim(),
                            images: {},
                        })
                    })
                    importText.value = '导入SeeLie.me代码 (' + achList.length + '个)'
                    allowed.value = true
                    importType.value = 'no-categoryId'
                    importData.value = achList
                    return
                }
                console.log(result)
                throw new Error('Nothing found in sandbox')
            } catch (e) {
                importText.value = '未识别到可导入的内容'
                allowed.value = false
                console.log(e)
            }
        }
    }
    const importToStore = () => {
        if (importType.value === 'no-categoryId') {
            // calculate categoryId Map
            const cMap = {} as Record<number, number>
            achevementsAmos.forEach((cat) => {
                cat.achievements.forEach((ach) => {
                    cMap[ach.id] = cat.id
                })
            })
            const dv = importData.value as IAchievementStore[]
            for (const ach of dv) {
                if (!ach.id) continue
                if (store.value.achievements.find((a) => a.id === ach.id)) continue
                if (ach.categoryId === -1) {
                    ach.categoryId = cMap[ach.id]
                }
                store.value.achievements.push(ach)
            }
        }
        if (importType.value === 'cocogoat') {
            const dv = importData.value as IAchievementStore[]
            for (const ach of dv) {
                if (!ach.id) continue
                if (store.value.achievements.find((a) => a.id === ach.id)) continue
                store.value.achievements.push(ach)
            }
        }
    }
    return {
        checkContent,
        importToStore,
    }
}
