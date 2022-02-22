import { IAchievementStore } from '@/typings/Achievement'
import { IArtifact } from '@/typings/Artifact'
import { currentUser as storageCurrentUser, get, set, list } from './impl'
import { Ref, ref, watch } from 'vue'

export function createEmptyStore() {
    return {
        achievements: [] as IAchievementStore[],
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
    }
}
export type IOptions = ReturnType<typeof createEmptyOptions>

export function loadStore(): IStore {
    const uid = storageCurrentUser()
    const data = get(uid) || {}
    return Object.assign(createEmptyStore(), data)
}
export function loadOptions(): IOptions {
    const data = get('options') || {}
    return Object.assign(createEmptyOptions(), data)
}
export function loadAllUsers() {
    const keys = list().map((key) => key.replace(/^cocogoat\.v1\./, ''))
    const alist = keys.map((key) => ({
        id: key,
        ...(get(key) as IStore).user,
    }))
    if (!keys.find((e) => e == currentUser.value)) {
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
                set(currentUser.value, storeval)
                storageCurrentUser(currentUser.value)
            },
            { deep: true },
        )
    let unwatch = watchStore()
    watch(currentUser, (user) => {
        unwatch()
        storageCurrentUser(user)
        store.value = loadStore()
        unwatch = watchStore()
    })
    watch(
        options,
        (options) => {
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
