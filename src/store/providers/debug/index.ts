import delay from 'delay'

class DebugSyncProvider {
    constructor() {
        console.info('DEBUG-SYNC: created')
    }
    async info(): Promise<{ user: string; name: string; avatar: string; storage: number[] }> {
        return {
            user: 'debug',
            name: 'debug',
            avatar: '',
            storage: [0, 0],
        }
    }
    async set(
        key: string,
        value: unknown,
        { localLast, localNow }: { localLast: Date; localNow: Date },
    ): Promise<{
        value: unknown
        lastModified: Date
    }> {
        await delay(100)
        console.info('DEBUG-SYNC: set', key, value, { localLast, localNow })
        return {
            value,
            lastModified: localNow,
        }
    }
    async get(key: string): Promise<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: any
        lastModified: Date
    }> {
        console.info('DEBUG-SYNC: get', key)
        await delay(100)
        return {
            value: null,
            lastModified: new Date(0),
        }
    }
    async loadAll() {
        return {}
    }
}
export default DebugSyncProvider
