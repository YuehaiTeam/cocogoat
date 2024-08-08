import type { ServiceWorker } from '@/utils/serviceWorker'
import type { store, currentUser, options } from '@/store'
import type { i18n } from '@/i18n'
import type resources from '@/resources'
export interface CocogoatGlobal<T> {
    endpoint: string
    entrance: string
    region?: 'cn' | 'global'
    status?: Record<string, string>
    build: string
    route: 'history' | 'hash'
    manifest: string
    onload?: () => void
    app: T
    store: typeof store
    options: typeof options
    i18n: typeof i18n
    resources: typeof resources
    currentUser: typeof currentUser
    sw: ServiceWorker
    pre: boolean
}
