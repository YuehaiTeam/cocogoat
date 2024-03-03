import { IAchievementStore } from '@/typings/Achievement'
import { IArtifact } from '@/typings/Artifact'
import { currentUser as storageCurrentUser, get, set, list } from './impl'
import { Ref, ref, watch } from 'vue'
import { runMigrate } from './migrate'
import { AchievementItem } from '../typings/Achievement/Achievement'

export const disableAutoSave = ref(false)

export function createEmptyStore() {
    return {
        achievements: [] as IAchievementStore[],
        achievement2: {} as Record<number, AchievementItem>,
        achievementVersion: 2,
        artifacts: [] as IArtifact[],
        user: {
            name: '默认',
            avatar: 'traveler',
        },
    }
}
export type IStore = ReturnType<typeof createEmptyStore>
export function createEmptyOptions() {
    return {
        lang: navigator.language.toLowerCase(),
        achievements_recent_export: 'excel',
        achievements_show_unpublished: false,
        reporting: true,
        showads: true,
    }
}
export type IOptions = ReturnType<typeof createEmptyOptions>

export function loadStore(): IStore {
    const uid = storageCurrentUser()
    const predata = get(uid) || { achievementVersion: 2.0 }
    predata.achievementVersion = predata.achievementVersion || 1.0
    const data = Object.assign(createEmptyStore(), predata)
    if (runMigrate(uid, data)) {
        console.log('Store Migration Finished')
    }
    data.achievement2 = AchievementItem.fromObject(data.achievement2)
    return data
}
export function loadOptions(): IOptions {
    const data = get('options') || {}
    return Object.assign(createEmptyOptions(), data)
}
export function loadAllUsers() {
    const keys = list()
    const alist = keys.map((key) => ({
        id: key,
        ...(get(key) as IStore).user,
    }))
    if (!keys.find((e) => e === currentUser.value)) {
        alist.unshift({
            id: currentUser.value,
            name: '默认',
            avatar: 'traveler',
        })
    }
    return alist
}
export function useAutoSave(currentUser: Ref<string>, store: Ref<IStore>, options: Ref<IOptions>) {
    const watchStore = () =>
        watch(
            store,
            (storeval) => {
                if (disableAutoSave.value) return
                set(currentUser.value, storeval)
                const changedUser = storageCurrentUser()
                if (changedUser !== currentUser.value) {
                    storageCurrentUser(currentUser.value)
                }
            },
            { deep: true },
        )
    let unwatch = watchStore()
    watch(currentUser, (user) => {
        if (disableAutoSave.value) return
        unwatch()
        const changedUser = storageCurrentUser()
        if (changedUser !== user) {
            storageCurrentUser(user)
            store.value = loadStore()
        }
        unwatch = watchStore()
    })
    watch(
        options,
        (options) => {
            if (disableAutoSave.value) return
            set('options', options)
        },
        { deep: true },
    )
}
export const currentUser = ref(storageCurrentUser())
export const store = ref(loadStore())
export const options = ref(loadOptions())
export const allUsers = ref(loadAllUsers())
export function reloadAllUsers() {
    allUsers.value = loadAllUsers()
}
useAutoSave(currentUser, store, options)
