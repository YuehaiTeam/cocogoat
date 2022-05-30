import { apibase } from '@/utils/apibase'
import { markRaw } from 'vue'
import { decode } from 'js-base64'
import Manage from './Manage.vue'
import { SyncProvider } from '../typing'
import { SYNCERR, SyncError } from '@/store/sync'
interface IMsToken {
    access_token: string
    expires_in: number
    id_token: string
    refresh_token: string
    scope: string
    token_type: string
    last_updated: number
}
class OneDriveSyncProvider implements SyncProvider {
    component = markRaw(Manage)
    data: IMsToken
    name = ''
    user = ''
    constructor(data: IMsToken) {
        this.data = data
        const idToken = data.id_token
        const idTokenData = JSON.parse(decode(idToken.split('.')[1]))
        this.name = idTokenData.name
        this.user = idTokenData.preferred_username
    }
    async enabled() {
        return { enabled: true, reason: '' }
    }
    async refreshToken() {
        if (Date.now() - this.data.last_updated < this.data.expires_in * 1000) {
            return
        }
        const res = await fetch(await apibase('/oauth/v1/microsoft'), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refresh_token: this.data.refresh_token,
            }),
        })
        try {
            if (res.status === 200) {
                const token = await res.json()
                if (token.refresh_token && token.access_token) {
                    const idToken = token.id_token
                    Object.assign(this.data, token)
                    this.data.id_token = idToken
                    this.data.last_updated = Date.now()
                    console.log('SYNC-ONEDRIVE', 'Token Refreshed')
                }
            }
        } catch (e) {}
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
        { localLast, localNow, forceOverride }: { localLast: Date; localNow: Date; forceOverride?: true },
    ): Promise<{
        value: unknown
        lastModified: Date
    }> {
        await this.refreshToken()
        const fileUrl = `https://graph.microsoft.com/beta/me/drive/special/approot:/${key}.json`
        if (!forceOverride && localLast.getTime() > 0 && value !== null) {
            const remoteFileRes = await fetch(fileUrl, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.data.access_token}`,
                },
            })
            if (remoteFileRes.status === 200) {
                const remoteFile = await remoteFileRes.json()
                const lastModified = new Date(remoteFile.lastModifiedDateTime)
                if (lastModified > localLast) {
                    throw new SyncError(SYNCERR.CONFLICT, 'conflict when saving [' + key + ']', {
                        remoteLast: lastModified,
                        localLast,
                        localNow,
                        key,
                    })
                }
            }
        }
        const fileData = {
            value: value,
            lastModified: localNow.toISOString(),
        }
        const res = await fetch(
            `${fileUrl}${value === null ? '' : ':/content'}?@microsoft.graph.conflictBehavior=replace`,
            {
                method: value === null ? 'DELETE' : 'PUT',
                headers: {
                    Authorization: `Bearer ${this.data.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: value === null ? undefined : JSON.stringify(fileData, null, 4),
            },
        )
        const t = await res.text()
        if (res.status === 200 || res.status === 201 || res.status === 204 || res.status === 404) {
            return {
                value,
                lastModified: localNow,
            }
        }
        throw new SyncError(SYNCERR.OTHER, 'OneDrive Sync Faild', t)
    }
    async get(key: string): Promise<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: any
        lastModified: Date
    }> {
        await this.refreshToken()
        const fileUrl = `https://graph.microsoft.com/beta/me/drive/special/approot:/${key}.json:/content`
        const remoteFileRes = await fetch(fileUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.data.access_token}`,
            },
        })
        if (remoteFileRes.status === 404) {
            // 首次同步
            return {
                value: null,
                lastModified: new Date(0),
            }
        }
        if (remoteFileRes.status === 200) {
            try {
                const remoteFile = await remoteFileRes.json()
                return remoteFile
            } catch (e) {
                return {
                    value: null,
                    lastModified: new Date(0),
                }
            }
        }
        const resText = await remoteFileRes.text()
        throw new SyncError(SYNCERR.OTHER, 'OneDrive Sync Faild', {
            status: remoteFileRes.status,
            data: resText,
        })
    }
    async loadAll(): Promise<Record<string, { value: unknown; lastModified: Date }>> {
        await this.refreshToken()
        const childrenUrl = `https://graph.microsoft.com/beta/me/drive/special/approot/children`
        const res = await fetch(childrenUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.data.access_token}`,
            },
        })
        if (res.status === 200) {
            const children = await res.json()
            const result: Record<string, { value: unknown; lastModified: Date }> = {}
            for (const child of children.value) {
                if (!child.name.endsWith('.json')) {
                    continue
                }
                const fileUrl = `https://graph.microsoft.com/beta/me/drive/special/approot:/${child.name}:/content`
                const remoteFileRes = await fetch(fileUrl, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${this.data.access_token}`,
                    },
                })
                try {
                    if (remoteFileRes.status === 200) {
                        const remoteFile = await remoteFileRes.json()
                        remoteFile.lastModified = new Date(remoteFile.lastModified)
                        const fileKey = child.name.substr(0, child.name.length - 5)
                        result[fileKey] = remoteFile
                    }
                } catch (e) {
                    console.log(e)
                }
            }
            return result
        }
        throw new SyncError(SYNCERR.OTHER, 'OneDrive Sync Faild', {
            status: res.status,
            data: await res.text(),
        })
    }
}
export default OneDriveSyncProvider
