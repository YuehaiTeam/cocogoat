export interface SyncProvider {
    enabled(): Promise<{ enabled: boolean; reason: string }>
    info(): Promise<{ user: string; name: string; avatar: string; storage: number[] }>
    set(
        key: string,
        value: unknown,
        { localLast, localNow, forceOverride }: { localLast: Date; localNow: Date; forceOverride?: true },
    ): Promise<{
        value: unknown
        lastModified: Date
    }>
    get(key: string): Promise<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: any
        lastModified: Date
    }>
    loadAll(): Promise<
        Record<
            string,
            {
                value: unknown
                lastModified: Date
            }
        >
    >
}
