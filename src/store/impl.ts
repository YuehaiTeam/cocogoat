export function get(user: string) {
    const item = localStorage.getItem(`cocogoat.v1.${user}`)
    try {
        return JSON.parse(item as string)
    } catch (e) {
        return null
    }
}
export function set(user: string, data: unknown) {
    localStorage.setItem(`cocogoat.v1.${user}`, JSON.stringify(data))
}
export function currentUser(user?: string): string {
    if (user) {
        set('currentUser', user)
    }
    return get('currentUser') || 'default'
}
