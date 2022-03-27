export function get(user: string) {
    const item = localStorage.getItem(`cocogoat.v1.${user}`)
    try {
        return JSON.parse(item as string)
    } catch (e) {
        return null
    }
}
export function last(user: string) {
    const item = localStorage.getItem(`cocogoat.v1-t.${user}`)
    try {
        return new Date(item as string) || new Date(0)
    } catch (e) {
        return new Date(0)
    }
}
export function set(user: string, data: unknown, now?: Date) {
    if (data === null || data === undefined) return new Date(0)
    const lastSave = new Date(localStorage.getItem(`cocogoat.v1-t.${user}`) || 0)
    localStorage.setItem(`cocogoat.v1.${user}`, JSON.stringify(data))
    localStorage.setItem(`cocogoat.v1-t.${user}`, (now || new Date(0)).toISOString())
    return lastSave
}
export function del(user: string) {
    const lastSave = new Date(localStorage.getItem(`cocogoat.v1-t.${user}`) || 0)
    localStorage.removeItem(`cocogoat.v1.${user}`)
    localStorage.removeItem(`cocogoat.v1-t.${user}`)
    return lastSave
}
export function list() {
    return Object.keys(localStorage)
        .filter(
            (key) =>
                key.startsWith('cocogoat.v1.') &&
                !key.endsWith('.options') &&
                !key.includes('.playground.') &&
                !key.endsWith('.currentUser'),
        )
        .map((key) => key.substring(12))
}
export function currentUser(user?: string, now?: Date): [string, Date] {
    if (user) {
        const last = set('currentUser', user, now)
        return [user, last]
    }
    return [get('currentUser') || 'empty-uid', new Date(0)]
}
