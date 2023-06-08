import { apibase } from '@/utils/apibase'

export const urls = {
    'pc-cn': {
        name: '天空岛（国服）',
        url: 'https://sdk-static.mihoyo.com/hk4e_cn/mdk/launcher/api/resource?key=eYd89JmJ&launcher_id=18&channel_id=1',
    },
    'pc-bili': {
        name: '世界树（BiliBili）',
        url: 'https://sdk-static.mihoyo.com/hk4e_cn/mdk/launcher/api/resource?key=KAtdSsoQ&launcher_id=17&channel_id=14',
    },
    'pc-hk': {
        name: '海外',
        url: 'https://sdk-os-static.mihoyo.com/hk4e_global/mdk/launcher/api/resource?channel_id=1&key=gcStgarh&launcher_id=10&sub_channel_id=0',
    },
    'hkrpg-cn': {
        name: '崩坏：星穹铁道',
        url: 'https://api-launcher-static.mihoyo.com/hkrpg_cn/mdk/launcher/api/resource?channel_id=1&key=6KcVuOkbcqjJomjZ&launcher_id=33&sub_channel_id=1',
    },
    'hkrpg-os': {
        name: '崩坏：星穹铁道（海外）',
        url: apibase('/3rdparty/installer/hkrpg-os?channel_id=1&key=vplOVX8Vn7cwG8yb&launcher_id=35&sub_channel_id=1'),
    },
    'bh3-cn': {
        name: '崩坏3',
        url: 'https://sdk-static.mihoyo.com/bh3_cn/mdk/launcher/api/resource?channel_id=1&key=SyvuPnqL&launcher_id=4&sub_channel_id=1',
    },
    'bh3-os': {
        name: '崩坏3（国际）',
        url: apibase('/3rdparty/installer/bh3-os?channel_id=1&key=dpz65xJ3&launcher_id=10&sub_channel_id=1'),
    },
    'bh3-tw': {
        name: '崩坏3（台）',
        url: apibase('/3rdparty/installer/bh3-os?channel_id=1&key=demhUTcW&launcher_id=8&sub_channel_id=1'),
    },
    'bh3-jp': {
        name: '崩坏3（日）',
        url: apibase('/3rdparty/installer/bh3-os?channel_id=1&key=ojevZ0EyIyZNCy4n&launcher_id=19&sub_channel_id=6'),
    },
    'bh3-kr': {
        name: '崩坏3（韩）',
        url: apibase('/3rdparty/installer/bh3-os?channel_id=1&key=PRg571Xh&launcher_id=11&sub_channel_id=1'),
    },
} as Record<string, { name: string; url: string | Promise<string> }>
