import * as localStorageImpl from './impl/localStorage'
import { debouncedSingleSync } from './sync'
/* Hack localStorage to warn manual modify */
// eslint-disable-next-line no-proto
localStorage.__proto__._setItem = localStorage.__proto__.setItem
localStorage.setItem = (a, b) => {
    if (typeof a === 'string' && a.indexOf('cocogoat.v1.') === 0) {
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            x.y = z
        } catch (er) {
            const e = er as Error
            if (e.stack) {
                const stack = e.stack.split('at ').map((e) => e.trim())
                stack.splice(0, 2)
                const rootstack = stack[stack.length - 1]
                if (rootstack.includes('<anonymous>') && !stack.join('\n').includes('.')) {
                    if (
                        !confirm(
                            '看起来你正在尝试手动修改数据库 - 这是不推荐的，如果你在导入数据，请使用各页面的导入功能。\n\n如已知晓可能带来的同步失败、数据重复等问题并仍要执行，请点击确定。',
                        )
                    )
                        return false
                }
            }
        }
    }
    localStorage._setItem(a, b)
}

export function get(user: string) {
    return localStorageImpl.get(user)
}
export function set(user: string, data: unknown) {
    const now = new Date()
    const last = localStorageImpl.set(user, data, now)
    debouncedSingleSync({ user, data, now, last })
}
export function del(user: string) {
    const now = new Date()
    const last = localStorageImpl.del(user)
    debouncedSingleSync({ user, data: null, now, last })
}
export function list() {
    return localStorageImpl.list()
}
export function currentUser(user?: string): string {
    const now = new Date()
    if (user) {
        const [_user, last] = localStorageImpl.currentUser(user, now)
        debouncedSingleSync({ user: 'currentUser', data: _user, now, last })
    }
    return localStorageImpl.currentUser(user, now)[0]
}
