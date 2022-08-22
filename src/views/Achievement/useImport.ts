/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ref } from 'vue'
import { store } from '@/store'
import { sandboxedEval } from '@/utils/sandbox'
import { legacyToUIAFExt } from '@/store/migrate'
import { IAchievementStore, UIAFMagicTime, UIAF, UIAFStatus } from '@/typings/Achievement'
import { AchievementItem, IAchievementItem, IAchievementSource } from '@/typings/Achievement/Achievement'

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
    const achList = [] as AchievementItem[]
    Object.keys(j.achievement).forEach((index: string) => {
        const ach = j.achievement[index] as Record<number, true>
        Object.keys(ach).forEach((key) => {
            if (!ach[Number(key)]) return
            achList.push(
                new AchievementItem({
                    id: Number(key),
                    status: UIAFStatus.ACHIEVEMENT_POINT_TAKEN,
                    timestamp: Math.floor(Date.now() / 1000),
                    current: 0,
                    partial: {},
                    image: '',
                    source: IAchievementSource.IMPORT,
                }),
            )
        })
    })
    return achList
}
function hasSeelieJson(j: Record<string, any>) {
    if (!j['achievements']) return false
    if (Array.isArray(j['achievements'])) return false
    if (typeof j['achievements'] !== 'object') return false
    if (Object.keys(j['achievements']).length === 0) return false
    const firstChild = j['achievements'][Object.keys(j['achievements'])[0]]
    if (typeof firstChild !== 'object') return false
    if (typeof firstChild['done'] === 'boolean') return true
    return false
}
function convertSeelieJson(b: Record<string, any>) {
    const achList = [] as AchievementItem[]
    Object.keys(b).forEach((key) => {
        const seelieItem = b[key] as { done: boolean; notes: string }
        if (!seelieItem.done) return
        seelieItem.notes = seelieItem.notes || ''
        achList.push(
            new AchievementItem({
                id: Number(key),
                current: Number(seelieItem.notes.trim().split(' ')[0]) || 0,
                timestamp: Math.floor(
                    new Date((seelieItem.notes.trim() + ' ').split(' ')[1].trim()).getTime() / 1000 || 0,
                ),
                image: '',
                partial: {},
                status: UIAFStatus.ACHIEVEMENT_POINT_TAKEN,
                source: IAchievementSource.IMPORT,
            }),
        )
    })
    return achList
}
export function hasUIAF(data: Record<string, any>): data is UIAF {
    if (!data.list) return false
    if (!Array.isArray(data.list)) return false
    if (data.list.length === 0) return false
    if (!data.list[0].id && data.list[0].id !== 0) return false
    if (typeof data.list[0].current === 'undefined') return false
    if (!data.list[0].timestamp && data.list[0].timestamp !== 0) return false
    return true
}
export function toUIAFExt(src: IAchievementItem[]): AchievementItem[] {
    return src.map(
        (e) =>
            new AchievementItem({
                id: e.id,
                timestamp: e.timestamp,
                current: e.current,
                status: 'status' in e ? e.status : UIAFStatus.ACHIEVEMENT_POINT_TAKEN,
                partial: e.partial || {},
                image: e.image || '',
                source: IAchievementSource.IMPORT,
            }),
    )
}
export function convertUIAF(data: UIAF): { achievements: IAchievementStore[]; source: string } {
    let source = data.source || data.info.export_app || 'UIAF'
    if (source === 'cocogoat') source = '椰羊UIAF'
    const achievements: IAchievementStore[] = []
    data.list.forEach((e) => {
        const dt = new Date(e.timestamp === UIAFMagicTime ? 0 : e.timestamp * 1000)
        const val = e.current ? e.current.toString() : ''
        achievements.push({
            id: e.id,
            date: dt.toISOString(),
            status: val,
            categoryId: -1, // will be changed later
        })
    })
    return {
        achievements,
        source,
    }
}
// eslint-disable-next-line max-params
export function useImport(
    content: Ref<string>,
    allowed: Ref<boolean>,
    importText: Ref<string>,
    importData: Ref<AchievementItem[]>,
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
                importData.value = legacyToUIAFExt(j.achievements)
            } else if (j.value && j.value.achievements && hasCocogoatAchievementJson(j.value)) {
                const imsource = j.source || '椰羊备份'
                importText.value = '导入' + imsource + ' (' + j.value.achievements.length + '个)'
                allowed.value = true
                importData.value = legacyToUIAFExt(j.value.achievements)
            } else if (hasUIAF(j)) {
                let source = j.source || j.info.export_app || 'UIAF'
                if (source === 'cocogoat') source = '椰羊UIAF'
                importText.value = '导入' + source + ' (' + j.list.length + '个)'
                allowed.value = true
                importData.value = toUIAFExt(j.list as IAchievementItem[])
            } else if (j.value && hasUIAF(j.value)) {
                let source = j.source || j.value.info.export_app || 'UIAF'
                if (source === 'cocogoat') source = '椰羊UIAF'
                importText.value = '导入' + source + ' (' + j.value.list.length + '个)'
                allowed.value = true
                importData.value = toUIAFExt(j.value.list as IAchievementItem[])
            } else if (j.achievement && (importData.value = hasPaimonMoeJson(j) || [])) {
                importText.value = '导入Paimon.moe备份 (' + importData.value.length + '个)'
                allowed.value = true
            } else if (j.achievements && hasSeelieJson(j)) {
                importData.value = convertSeelieJson(j.achievements)
                importText.value = '导入Seelie备份 (' + importData.value.length + '个)'
                allowed.value = true
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
                        importData.value = legacyToUIAFExt(mockDB.achievements)
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
                    return
                }
                if (typeof result.account === 'string' || typeof result['main-achievements'] === 'string') {
                    // maybe seelie.me js
                    const a = result.account || 'main'
                    const b = JSON.parse(result[`${a}-achievements`])
                    const achList = convertSeelieJson(b)
                    importText.value = '导入SeeLie.me代码 (' + achList.length + '个)'
                    allowed.value = true
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
        const dv = importData.value as AchievementItem[]
        for (const ach of dv) {
            if (!ach.id || !(ach instanceof AchievementItem)) continue
            const orig = store.value.achievement2[ach.id] || ach
            ach.partial = ach.partial || orig.partial
            store.value.achievement2[ach.id] = ach
        }
    }
    return {
        checkContent,
        importToStore,
    }
}
