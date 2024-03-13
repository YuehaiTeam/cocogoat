import { apibase, syncstatus } from '@/utils/apibase'
import { SyncProvider } from '../typing'
import { SyncError, SYNCERR, SYNCSTAT } from '../../sync'
import Manage from './Manage.vue'
import { ref, reactive, markRaw } from 'vue'
import { options } from '@/store'
const pathbase = '/v2/qingxin'
export interface ICocogoatSyncStatus {
    status: SYNCSTAT
    error: SyncError<unknown> | null
}
class CocogoatSyncProvider implements SyncProvider {
    data: { token: string; lastModified: number }
    token = ''
    user = ''
    email = ''
    gzDisabled = false
    notice = ref('')
    component = markRaw(Manage)
    status = reactive({
        status: SYNCSTAT.WAITING,
        error: null,
    } as ICocogoatSyncStatus)
    constructor(data: { token: string; lastModified: number }) {
        try {
            this.data = data
            this.token = data.token
            this.email = this.getFromJWT(this.token, 'email')
            this.user = this.getFromJWT(this.token, 'sub')
            if (options.value.reporting) {
                import('@/utils/reporting').then(({ setUser }) => {
                    setUser(this.email)
                })
                import('@/utils/txc').then(({ setUser }) => {
                    setUser(this.email)
                })
            }
        } catch (e) {
            const err = new SyncError(SYNCERR.AUTH, 'Authorization required', null)
            this.status.status = SYNCSTAT.OFFLINE
            this.status.error = err
            throw err
        }
    }
    async enabled() {
        await apibase()
        return { enabled: syncstatus.value === '', reason: syncstatus.value }
    }
    async info(): Promise<{ user: string; name: string; avatar: string; storage: number[] }> {
        const req = await fetch(`${await apibase(pathbase)}/${this.user}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
        })
        return await req.json()
    }
    gzCompress(data: string) {
        const inputBlob = new Blob([data], { type: 'application/json' })
        const compstream = new CompressionStream('gzip') as TransformStream
        return new Response(inputBlob.stream().pipeThrough(compstream)).blob()
    }
    noCompress(data: string) {
        return data
    }
    async set(
        key: string,
        value: unknown,
        { localLast, localNow, forceOverride }: { localLast: Date; localNow: Date; forceOverride?: true },
    ): Promise<{
        value: unknown
        lastModified: Date
    }> {
        const compress =
            value !== null && !this.gzDisabled && 'CompressionStream' in window ? this.gzCompress : this.noCompress
        const req = await fetch(
            `${await apibase(pathbase)}/${this.user}/${key}${
                forceOverride || localLast.getTime() === 0 ? '?override' : ''
            }`,
            {
                method: value === null ? 'DELETE' : 'PUT',
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                    'If-Unmodified-Since': localLast.toUTCString(),
                    'X-Last-Modified': localNow.toUTCString(),
                    ...(compress === this.gzCompress
                        ? {
                              'Content-Encoding': 'gzip',
                          }
                        : {}),
                },
                body: value === null ? undefined : await compress(JSON.stringify(value)),
            },
        )
        // code 415: gzip decode failed
        if (req.status === 415) {
            this.gzDisabled = true
            return await this.set(key, value, { localLast, localNow, forceOverride })
        }
        // code 412: conflict
        if (req.status === 412) {
            const err = new SyncError(SYNCERR.CONFLICT, 'conflict when saving [' + key + ']', {
                localLast,
                remoteLast: new Date(req.headers.get('Last-Modified') || 0),
                localNow,
            })
            this.status.status = SYNCSTAT.FAILED
            this.status.error = err
            throw err
        }
        // code 401: unauthorized
        if (req.status === 401) {
            const err = new SyncError(SYNCERR.AUTH, 'Authorization required', null)
            this.status.status = SYNCSTAT.OFFLINE
            this.status.error = err
            throw err
        }
        // 404
        if (req.status === 404) {
            return {
                value: null,
                lastModified: new Date(0),
            }
        }
        // server fault
        if (!req.ok) {
            let errMsg = req.statusText
            try {
                const restext = await req.text()
                errMsg = restext
                try {
                    const resjson = JSON.parse(restext)
                    if (resjson.error) {
                        errMsg = resjson.error
                    }
                } catch (e) {}
            } catch (e) {}
            const err = new SyncError(SYNCERR.OTHER, errMsg, req)
            this.status.status = SYNCSTAT.FAILED
            this.status.error = err
            throw err
        }
        if (req.status === 204) {
            return { value: null, lastModified: localNow }
        }
        const res: { afterLastModified: string } = await req.json()
        const newToken = req.headers.get('authorization')
        if (newToken) {
            this.data.token = newToken.replace('Bearer ', '')
            this.data.lastModified = Date.now()
        }
        // done
        return {
            value,
            lastModified: new Date(res.afterLastModified),
        }
    }
    async get(key: string) {
        const req = await fetch(`${await apibase(pathbase)}/${this.user}/${key}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
        })
        // code 401: unauthorized
        if (req.status === 401) {
            const err = new SyncError(SYNCERR.AUTH, 'Authorization required', null)
            this.status.status = SYNCSTAT.OFFLINE
            this.status.error = err
            throw err
        }
        // server fault
        if (!req.ok) {
            let errMsg = req.statusText
            try {
                const restext = await req.text()
                errMsg = restext
                try {
                    const resjson = JSON.parse(restext)
                    if (resjson.error) {
                        errMsg = resjson.error
                    }
                } catch (e) {}
            } catch (e) {}
            const err = new SyncError(SYNCERR.OTHER, errMsg, req)
            this.status.status = SYNCSTAT.FAILED
            this.status.error = err
            throw err
        }
        // done
        return {
            value: await req.json(),
            lastModified: new Date(req.headers.get('Last-Modified') || 0),
        }
    }
    async loadAll() {
        const req = await fetch(`${await apibase(pathbase)}/${this.user}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
        })
        // server fault
        if (!req.ok) {
            let errMsg = req.statusText
            try {
                const restext = await req.text()
                errMsg = restext
                try {
                    const resjson = JSON.parse(restext)
                    if (resjson.error) {
                        errMsg = resjson.error
                    }
                } catch (e) {}
            } catch (e) {}
            const err = new SyncError(SYNCERR.OTHER, errMsg, req)
            this.status.status = SYNCSTAT.FAILED
            this.status.error = err
            throw err
        }
        const newToken = req.headers.get('authorization')
        if (newToken) {
            this.data.token = newToken.replace('Bearer ', '')
            this.data.lastModified = Date.now()
        }
        const jsonObj = (await req.json()) as Record<string, { value: unknown; lastModified: string | Date }>
        Object.keys(jsonObj).forEach((key) => {
            jsonObj[key].lastModified = new Date(jsonObj[key].lastModified)
        })
        return jsonObj as Record<string, { value: unknown; lastModified: Date }>
    }
    getFromJWT(token: string, key: string) {
        const parts = token.split('.')
        if (parts.length !== 3) {
            throw new Error('Invalid token')
        }
        const payload = JSON.parse(atob(parts[1]))
        return payload[key]
    }
}
export default CocogoatSyncProvider
