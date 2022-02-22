import { IAchievementStore } from '@/typings/Achievement'
import { IArtifact } from '@/typings/Artifact'
import { currentUser as storageCurrentUser, get, set } from './impl'
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
export function useAutoSave(currentUser: Ref<string>, store: Ref<IStore>, options: Ref<IOptions>) {
    const watchStore = () =>
        watch(
            store,
            (storeval) => {
                set(currentUser.value, storeval)
            },
            { deep: true },
        )
    let unwatch = watchStore()
    watch(currentUser, (user, oldUser) => {
        unwatch()
        set(oldUser, store.value)
        storageCurrentUser(user)
        loadStore()
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
useAutoSave(currentUser, store, options)
