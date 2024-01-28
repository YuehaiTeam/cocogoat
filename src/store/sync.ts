import { debounce } from 'lodash-es'
import { ref, reactive, watch, Ref, nextTick } from 'vue'
import { reloadAllUsers, currentUser, store, disableAutoSave, loadStore } from '.'
import * as localStorageImpl from './impl/localStorage'
import { SyncProvider } from './providers/typing'
/// #if WEBPACK
const providersEntrance = require.context('./providers', true, /\.\/(.*?)\/index\.ts$/, 'lazy')
/// #else
const viteProvidersEntrance = import.meta.glob('./providers/**/index.ts')
/// #endif
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
    DISABLED = 'disabled',
}
export interface IProviderStorage {
    class: string
    data: unknown
}
export interface IProviderItem {
    id: string
    provider: SyncProvider
    enabled: Promise<{ enabled: boolean; reason: string }>
    class: string
    data: Ref<unknown>
    unwatch: ReturnType<typeof watch>
}
export const syncProviders = ref([] as IProviderItem[])
export class SyncError<T> extends Error {
    code: SYNCERR
    data: T
    provider?: string
    constructor(
        public readonly err: SYNCERR,
        public readonly errmsg: string,
        data: T,
    ) {
        super(errmsg + `(${JSON.stringify(data)})`)
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
    /// #if WEBPACK
    providersEntrance.keys().forEach((key) => {
        availableProviders[key.replace(/^\.\/(.*?)\/index\.ts$/, '$1')] = async (data: unknown) => {
            const Module = (await providersEntrance(key)).default
            return new Module(data)
        }
    })
    /// #else
    Object.keys(viteProvidersEntrance).forEach((key) => {
        availableProviders[key.replace(/^\.\/providers\/(.*?)\/index\.ts$/, '$1')] = async (data: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const Module = ((await viteProvidersEntrance[key]()) as any).default
            return new Module(data)
        }
    })
    /// #endif
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
                        enabled: provider.enabled(),
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
    const promises = syncProviders.value.map(async (provider) => {
        const e = await provider.enabled
        if (!e.enabled) {
            throw new SyncError(SYNCERR.DISABLED, e.reason, provider)
        }
        return await provider.provider.loadAll()
    })
    const result = (await Promise.allSettled(promises)).map((e, i) => {
        return {
            provider: syncProviders.value[i].id,
            result: e,
        }
    })
    const failed = result
        .filter((r) => r.result.status === 'rejected')
        .map((r) => {
            const err = (r.result as PromiseRejectedResult).reason as SyncError<unknown>
            err.provider = r.provider
            return err
        })
    const success = result
        .filter((r) => r.result.status === 'fulfilled')
        .map((e) => {
            const result = e.result as PromiseFulfilledResult<
                Record<
                    string,
                    {
                        value: unknown
                        lastModified: Date
                        provider: string
                    }
                >
            >
            for (const value of Object.values(result.value)) {
                value.provider = e.provider
            }
            return result
        })
    const storgeKeys = {} as Record<string, { value: unknown; lastModified: Date; provider: string }[]>
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
            const err = new SyncError(SYNCERR.CONFLICT, 'conflict when getting [' + key + ']', {
                localNow: new Date(0),
                localLast: localItemLast,
                remoteLast: latestItem.lastModified,
            })
            err.provider = latestItem.provider
            failed.push(err)
        } else {
            localStorageImpl.set(key, latestItem.value, latestItem.lastModified)
        }
    })
    if (failed.length > 0) {
        syncStatus.value.status = SYNCSTAT.PARTIALLY
        console.error('-> SYNC Faild with errors :')
        failed.forEach((err) => {
            console.error(err)
        })
    } else {
        syncStatus.value.status = SYNCSTAT.SYNCED
    }
    disableAutoSave.value = true
    await nextTick()
    reloadAllUsers()
    currentUser.value = localStorageImpl.currentUser()[0]
    const storeval = loadStore()
    if (storeval) {
        store.value = storeval
    }
    await nextTick()
    disableAutoSave.value = false
    syncStatus.value.errors = failed
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
    const promises = syncProviders.value.map(async (provider) => {
        const e = await provider.enabled
        if (!e.enabled) {
            throw new SyncError(SYNCERR.DISABLED, e.reason, provider)
        }
        return await provider.provider.set(user, data, {
            localLast: last,
            localNow: now,
            forceOverride: force || undefined,
        })
    })
    const result = (await Promise.allSettled(promises)).map((e, i) => {
        return {
            provider: syncProviders.value[i].id,
            result: e,
        }
    })
    const failed = result
        .filter((r) => r.result.status === 'rejected')
        .map((r) => {
            ;(r.result as PromiseRejectedResult).reason.provider = r.provider
            return (r.result as PromiseRejectedResult).reason
        }) as SyncError<unknown>[]
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
    if (failed.length > 0) {
        console.error('-> SYNC Faild with errors :')
        failed.forEach((err) => {
            console.error(err)
        })
    }
    syncStatus.value.errors = failed
}
const _debouncedSingleSync = debounce(singleSyncCached, 1 * 1e3)
export const debouncedSingleSync = (arg: { user: string; data: unknown; now: Date; last: Date; force?: true }) => {
    if (syncProviders.value.length <= 0) return
    syncStatus.value.status = SYNCSTAT.WAITING
    debouncedSyncValues[arg.user] = arg
    return _debouncedSingleSync()
}
export const forceSyncAll = async (force = true) => {
    const keys = localStorageImpl.list().concat(['options', 'currentUser'])
    keys.forEach((key) => {
        const last = localStorageImpl.last(key)
        const val = localStorageImpl.get(key)
        debouncedSingleSync({
            user: key,
            data: val,
            now: last,
            last,
            force: force ? true : undefined,
        })
    })
}
