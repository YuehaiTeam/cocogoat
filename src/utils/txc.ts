import { characterIcon } from '@/assets/mihoyoImages/characterIcon'
import { store } from '@/store'
let currentEmail = ''
export const setUser = (email: string) => {
    if (currentEmail) return
    currentEmail = email
}
const gotxc = (data: Record<string, string>) => {
    const form = document.createElement('form')
    form.target = '_blank'
    form.method = 'POST'
    form.action = 'https://support.qq.com/product/417765'
    // 设置相应参数
    for (const key of Object.keys(data)) {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = data[key]
        form.appendChild(input)
    }
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
}
export const clicktxc = () => {
    const uname = store.value.user.name
    return gotxc(
        currentEmail && uname !== '默认'
            ? { openid: currentEmail, avatar: characterIcon(store.value.user.avatar), nickname: uname }
            : {},
    )
}
