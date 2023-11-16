import { apibase } from '@/utils/apibase'

export const urls = {
    'pc-cn': {
        name: '原神',
        url: 'https://sdk-static.mihoyo.com/hk4e_cn/mdk/launcher/api/resource?key=eYd89JmJ&launcher_id=18&channel_id=1',
    },
    'pc-bili': {
        name: '原神（BiliBili）',
        url: 'https://sdk-static.mihoyo.com/hk4e_cn/mdk/launcher/api/resource?key=KAtdSsoQ&launcher_id=17&channel_id=14',
    },
    'pc-hk': {
        name: '原神（海外）',
        url: 'https://sdk-os-static.mihoyo.com/hk4e_global/mdk/launcher/api/resource?channel_id=1&key=gcStgarh&launcher_id=10&sub_channel_id=0',
    },
    'hkrpg-cn': {
        name: '崩坏：星穹铁道',
        url: 'https://api-launcher-static.mihoyo.com/hkrpg_cn/mdk/launcher/api/resource?channel_id=1&key=6KcVuOkbcqjJomjZ&launcher_id=33&sub_channel_id=1',
    },
    'hkrpg-bili': {
        name: '崩坏：星穹铁道（BiliBili）',
        url: 'https://api-launcher-static.mihoyo.com/hkrpg_cn/mdk/launcher/api/resource?channel_id=14&key=fSPJNRwFHRipkprW&launcher_id=28&sub_channel_id=0',
    },
    'hkrpg-os': {
        name: '崩坏：星穹铁道（海外）',
        url: apibase(
            '/3rdparty/mhyproxy/hkrpg-launcher-static.hoyoverse.com/hkrpg_global/mdk/launcher/api/resource?channel_id=1&key=vplOVX8Vn7cwG8yb&launcher_id=35&sub_channel_id=1',
        ),
    },
    'bh3-cn': {
        name: '崩坏3',
        url: apibase(
            '/3rdparty/mhyproxy/bh3-launcher-static.mihoyo.com/bh3_cn/mdk/launcher/api/resource?channel_id=1&key=SyvuPnqL&launcher_id=4&sub_channel_id=1',
        ),
    },
    'bh3-os': {
        name: '崩坏3（国际）',
        url: apibase(
            '/3rdparty/mhyproxy/sdk-os-static.mihoyo.com/bh3_global/mdk/launcher/api/resource?channel_id=1&key=dpz65xJ3&launcher_id=10&sub_channel_id=1',
        ),
    },
    'bh3-tw': {
        name: '崩坏3（台）',
        url: apibase(
            '/3rdparty/mhyproxy/sdk-os-static.mihoyo.com/bh3_global/mdk/launcher/api/resource?channel_id=1&key=demhUTcW&launcher_id=8&sub_channel_id=1',
        ),
    },
    'bh3-jp': {
        name: '崩坏3（日）',
        url: apibase(
            '/3rdparty/mhyproxy/sdk-os-static.mihoyo.com/bh3_global/mdk/launcher/api/resource?channel_id=1&key=ojevZ0EyIyZNCy4n&launcher_id=19&sub_channel_id=6',
        ),
    },
    'bh3-kr': {
        name: '崩坏3（韩）',
        url: apibase(
            '/3rdparty/mhyproxy/sdk-os-static.mihoyo.com/bh3_global/mdk/launcher/api/resource?channel_id=1&key=PRg571Xh&launcher_id=11&sub_channel_id=1',
        ),
    },
} as Record<string, { name: string; url: string | Promise<string> }>
