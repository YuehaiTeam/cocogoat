import { debounce } from 'lodash-es'
import { ref, reactive, watch, Ref, nextTick } from 'vue'
import { reloadAllUsers, currentUser, store, disableAutoSave } from '.'
import * as localStorageImpl from './impl/localStorage'
import { SyncProvider } from './providers/typing'
const providersEntrance = require.context('./providers', true, /\.\/(.*?)\/index\.ts$/, 'lazy')
export enum SYNCSTAT {
    OFFLINE = 'offline',
    WAITING = 'waitng',
    SYNCING = 'syncing',
    SYNCED = 'synced',
    FAILED = 'failed',
    PARTIALLY = 'partially',
}
export enum SYNCERR {
    CONFLICT = 'conflict',
    OFFLINE = 'offline',
    OTHER = 'other',
    AUTH = 'auth',
}
export interface IProviderStorage {
    class: string
    data: unknown
}
export interface IProviderItem {
    id: string
    provider: SyncProvider
    class: string
    data: Ref<unknown>
    unwatch: ReturnType<typeof watch>
}
export const syncProviders = ref([] as IProviderItem[])
export class SyncError<T> extends Error {
    code: SYNCERR
    data: T
    constructor(public readonly err: SYNCERR, public readonly errmsg: string, data: T) {
        super(errmsg)
        this.code = err
        this.data = data
    }
}

export const syncStatus = ref({
    status: SYNCSTAT.OFFLINE,
    errors: [] as SyncError<unknown>[],
})
export const initSync = async () => {
    const availableProviders = {} as Record<string, (data: unknown) => Promise<SyncProvider>>
    providersEntrance.keys().forEach((key) => {
        availableProviders[key.replace(/^\.\/(.*?)\/index\.ts$/, '$1')] = async (data: unknown) => {
            const Module = (await providersEntrance(key)).default
            return new Module(data)
        }
    })
    const keys = Object.keys(localStorage)
        .filter((key) => key.startsWith('cocogoat.sync.v1.'))
        .map((key) => [key.replace('cocogoat.sync.v1.', ''), localStorage.getItem(key)])
    if (process.env.NODE_ENV === 'development' && location.href.includes('debugSync')) {
        keys.push(['debug', JSON.stringify({ class: 'debug', data: {} })])
    }
    const promises = keys
        .map(([key, item]) => {
            const exist = syncProviders.value.find((provider) => provider.id === key)
            if (exist) {
                return Promise.resolve(exist)
            }
            try {
                const data = JSON.parse(item as string) as IProviderStorage
                const refdata = reactive(data.data as object)
                const unwatch = watch(refdata, (val) => {
                    localStorage.setItem(
                        'cocogoat.sync.v1.' + key,
                        JSON.stringify({
                            class: data.class,
                            data: val,
                        }),
                    )
                })
                return (async () => {
                    const provider = await availableProviders[data.class](refdata)
                    return {
                        id: key,
                        class: data.class,
                        data: refdata,
                        provider,
                        unwatch,
                    }
                })()
            } catch (e) {
                console.log(e)
                return false
            }
        })
        .filter((provider) => provider !== false) as Promise<IProviderItem>[]
    syncProviders.value = await Promise.all(promises)
    if (syncProviders.value.length > 0) {
        syncStatus.value.status = SYNCSTAT.SYNCING
        getAll()
    }
}
export const getAll = async () => {
    const promises = syncProviders.value.map((provider) => {
        return provider.provider.loadAll()
    })
    const result = await Promise.allSettled(promises)
    const failed = result
        .filter((r) => r.status === 'rejected')
        .map((r) => (r as PromiseRejectedResult).reason) as SyncError<unknown>[]
    const success = result.filter((r) => r.status === 'fulfilled') as PromiseFulfilledResult<
        Record<
            string,
            {
                value: unknown
                lastModified: Date
            }
        >
    >[]
    const storgeKeys = {} as Record<string, { value: unknown; lastModified: Date }[]>
    success.forEach((r) => {
        const { value } = r
        Object.keys(value).forEach((key) => {
            if (!storgeKeys[key]) {
                storgeKeys[key] = []
            }
            storgeKeys[key].push(value[key])
        })
    })
    Object.keys(storgeKeys).forEach((key) => {
        const items = storgeKeys[key]
        const latestItem = items.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())[0]
        const localItemLast = localStorageImpl.last(key) || new Date(0)
        const localt = Math.floor(localItemLast.getTime() / 1000)
        const latestt = Math.floor(latestItem.lastModified.getTime() / 1000)
        if (localt > latestt) {
            failed.push(
                new SyncError(SYNCERR.CONFLICT, 'conflict', {
                    localNow: new Date(0),
                    localLast: localItemLast,
                    remoteLast: latestItem.lastModified,
                }),
            )
        } else {
            localStorageImpl.set(key, latestItem.value, latestItem.lastModified)
        }
    })
    if (failed.length > 0) {
        syncStatus.value.status = SYNCSTAT.PARTIALLY
    } else {
        syncStatus.value.status = SYNCSTAT.SYNCED
    }
    disableAutoSave.value = true
    await nextTick()
    reloadAllUsers()
    currentUser.value = localStorageImpl.currentUser()[0]
    const storeval = localStorageImpl.get(currentUser.value)
    if (storeval) {
        store.value = storeval
    }
    await nextTick()
    disableAutoSave.value = false
    syncStatus.value.errors = failed
    console.log(failed)
    return {
        failed,
        count: promises.length,
    }
}
export const singleSync = async ({
    user,
    data,
    now,
    last,
    force,
}: {
    user: string
    data: unknown
    now: Date
    last: Date
    force?: true
}) => {
    const promises = syncProviders.value.map((provider) => {
        return provider.provider.set(user, data, { localLast: last, localNow: now, forceOverride: force || undefined })
    })
    const result = await Promise.allSettled(promises)
    const failed = result
        .filter((r) => r.status === 'rejected')
        .map((r) => (r as PromiseRejectedResult).reason) as SyncError<unknown>[]
    return {
        failed,
        count: promises.length,
    }
}
let debouncedSyncValues = {} as Record<string, { user: string; data: unknown; now: Date; last: Date; force?: true }>
export const singleSyncCached = async () => {
    syncStatus.value.status = SYNCSTAT.SYNCING
    const copy = debouncedSyncValues
    debouncedSyncValues = {}
    const promises = await Promise.all(Object.values(copy).map((e) => singleSync(e)))
    let failed = [] as SyncError<unknown>[]
    let length = 0
    promises.forEach((e) => {
        length += e.count
        failed = failed.concat(e.failed)
    })
    if (failed.length === length) {
        syncStatus.value.status = SYNCSTAT.FAILED
    } else if (failed.length > 0) {
        syncStatus.value.status = SYNCSTAT.PARTIALLY
    } else {
        syncStatus.value.status = SYNCSTAT.SYNCED
    }
    console.log(failed)
    syncStatus.value.errors = failed
}
const _debouncedSingleSync = debounce(singleSyncCached, 1 * 1e3)
export const debouncedSingleSync = (arg: { user: string; data: unknown; now: Date; last: Date; force?: true }) => {
    if (syncProviders.value.length <= 0) return
    syncStatus.value.status = SYNCSTAT.WAITING
    debouncedSyncValues[arg.user] = arg
    return _debouncedSingleSync()
}
export const forceSyncAll = async () => {
    const keys = localStorageImpl.list().concat(['options', 'currentUser'])
    keys.forEach((key) => {
        const last = localStorageImpl.last(key)
        const val = localStorageImpl.get(key)
        debouncedSingleSync({
            user: key,
            data: val,
            now: last,
            last,
            force: true,
        })
    })
}
