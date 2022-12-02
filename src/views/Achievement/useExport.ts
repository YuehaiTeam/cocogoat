import { apibase } from './../../utils/apibase'
import { i18n } from '@/i18n'
import { ElMessageBox, ElNotification } from 'element-plus'
import 'element-plus/theme-chalk/el-notification.css'
import { ref } from 'vue'
import { store, options } from '@/store'
import dayjs from 'dayjs'
import achevementsAmos from '@/generated/amos-data/amos/achievements'
import copy from 'copy-to-clipboard'
import { UIAF, UIAFMagicTime, UIAFStatus, UIAFStatusCN, IAchievementStore, UIAFItem10 } from '@/typings/Achievement'
import { getUrl } from '@/router'
export function useExportAchievements() {
    const exportData = ref({
        show: false,
        title: '',
        content: '',
    })
    const doExport = async (
        _to:
            | 'paimon'
            | 'seelie'
            | 'cocogoat'
            | 'cocogoat.v2'
            | 'excel'
            | 'snapgenshin'
            | 'snaphutao'
            | 'xunkong'
            | 'qyinter'
            | 'uiaf'
            | 'uiaf10'
            | 'share'
            | '',
    ) => {
        const to = _to || options.value.achievements_recent_export
        if (to !== 'share') options.value.achievements_recent_export = to
        if (to === 'cocogoat') {
            const ach0 = Object.values(store.value.achievement2)
                .filter((ach) => ach.status > UIAFStatus.ACHIEVEMENT_UNFINISHED)
                .map(async (ach) => {
                    return {
                        id: ach.id,
                        categoryId: await ach.goalId,
                        date: dayjs(ach.timestamp).format('YYYY-MM-DD'),
                        status: ach.current?.toString(),
                    } as IAchievementStore
                })
            const data = {
                source: '椰羊成就',
                value: {
                    achievements: await Promise.all(ach0),
                },
                lastModified: new Date().toISOString(),
            }
            downloadJson(data, '椰羊成就.legacy')
            return
        }
        if (to === 'cocogoat.v2') {
            downloadJson(toUIAFExt(), '椰羊成就.uiafext')
            return
        }
        if (to === 'share') {
            ;(async () => {
                const msg = ElNotification({
                    message: '正在创建分享，请稍候...',
                    duration: 0,
                    showClose: false,
                    type: 'info',
                })
                try {
                    const res = await fetch(await apibase('/v2/memo?source=分享链接'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(toUIAFExt()),
                    })
                    if (!res.ok) {
                        let err = res.statusText
                        try {
                            err = await res.text()
                        } catch (e) {}
                        throw new Error(err)
                    }
                    const rdata = await res.json()
                    if (!rdata.key) {
                        throw new Error('No key')
                    }
                    const link = new URL(
                        getUrl('achievement.index', false, { memo: rdata.key }),
                        location.href,
                    ).toString()
                    try {
                        msg.close()
                    } catch (e) {}
                    try {
                        await ElMessageBox.prompt(
                            '打开以下分享链接，即可快速导入成就。注意：每个分享链接只能导入一次。',
                            '分享链接创建成功',
                            {
                                confirmButtonText: '复制链接',
                                cancelButtonText: '关闭',
                                inputValue: link,
                            },
                        )
                        copy(link)
                        ElNotification({
                            message: '分享链接已复制到剪贴板',
                            type: 'success',
                        })
                    } catch (e) {
                        console.log(e)
                    }
                } catch (e) {
                    try {
                        msg.close()
                    } catch (e) {}
                    console.error(e)
                    return ElNotification.error('分享失败，请稍后再试')
                }
            })()
            return
        }
        if (to === 'uiaf') {
            downloadJson(toUIAF(), '椰羊UIAF1.1')
            return
        }
        if (to === 'uiaf10') {
            downloadJson(toUIAF('v1.0'), '椰羊UIAF1.0')
            return
        }
        if (to === 'snapgenshin') {
            callClient(
                'snapgenshin://achievement/import/uiaf',
                '如果SnapGenshin没有启动或导入失败，请导出为UIAF 1.1后手动导入。',
                toUIAF(),
            )
            return
        }
        if (to === 'snaphutao') {
            callClient(
                'hutao://achievement/import',
                '如果SnapHutao没有启动或导入失败，请导出为UIAF 1.1后手动导入。',
                toUIAF(),
            )
            return
        }
        if (to === 'xunkong') {
            callClient(
                'xunkong://import-achievement?caller=椰羊&from=clipboard',
                '如果寻空没有启动或导入失败，请导出为UIAF 1.1后手动导入。',
                toUIAF(),
            )
            return
        }
        if (to === 'qyinter') {
            const msg = ElNotification({
                message: '正在导出，请稍候...',
                duration: 0,
                showClose: false,
                type: 'info',
            })
            const data = {
                key: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
                    .toString(16)
                    .substring(0, 8)
                    .toUpperCase(),
                data: toUIAF('v1.1'),
            }
            try {
                const res = await fetch('https://api.qyinter.com/achievementRedis', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                })
                if (!res.ok) {
                    throw new Error(await res.text())
                }
                try {
                    try {
                        msg.close()
                    } catch (e) {}
                    await ElMessageBox.prompt(
                        '请在原魔工具箱小程序输入以下分享码以导入成就，三分钟内有效。',
                        '导出到原魔工具箱成功',
                        {
                            confirmButtonText: '复制分享码',
                            cancelButtonText: '关闭',
                            inputValue: data.key,
                        },
                    )
                    copy(data.key)
                    ElNotification({
                        message: '分享码已复制到剪贴板',
                        type: 'success',
                    })
                } catch (e) {
                    console.log(e)
                }
            } catch (e) {
                try {
                    msg.close()
                } catch (e) {}
                ElNotification.error('导出失败，请稍后再试')
                console.error(e)
            }
            return
        }
        if (to === 'excel') {
            dumpToExcel()
            return
        }
        let content = ''
        if (to === 'seelie') {
            const exportArray = Object.values(store.value.achievement2)
                .filter((ach) => ach.status > UIAFStatus.ACHIEVEMENT_UNFINISHED)
                .map((ach) => {
                    return [
                        ach.id,
                        (ach.current + ' ' + ach.timestamp
                            ? dayjs(ach.timestamp).format('YYYY-MM-DD HH:mm:ss')
                            : ''
                        ).trim(),
                    ]
                })
            content = `/*
* 复制此处所有内容，
* 在Seelie.me页面按F12打开调试器，
* 选择控制台(Console)
* 粘贴并回车执行完成导入
* 
* 使用此方法导入是为了保证您的原有成就不被覆盖
*
*/
const z = ${JSON.stringify(exportArray)};
const a = localStorage.account || 'main'
const b = JSON.parse(localStorage.getItem(\`\${a}-achievements\`)||'{}')
z.forEach(c=>{b[c[0]]={done:true,notes:c[1]}})
localStorage.setItem(\`\${a}-achievements\`,JSON.stringify(b))
localStorage.last_update = (new Date()).toISOString()
location.href='/achievements'`
        } else {
            const exportArray = Object.values(store.value.achievement2)
                .filter((ach) => ach.status > UIAFStatus.ACHIEVEMENT_UNFINISHED)
                .map(async (ach) => {
                    return [await ach.goalId, ach.id]
                })
            const fexportArray = await Promise.all(exportArray)
            content = `/*
* 复制此处所有内容，
* 在Paimon.moe页面按F12打开调试器，
* 选择控制台(Console)
* 粘贴并回车执行完成导入
* 
* 使用此方法导入是为了保证您的原有成就不被覆盖
*
*/
const b = ${JSON.stringify(fexportArray)};
const a = (await localforage.getItem('achievement')) || {};
b.forEach(c=>{a[c[0]]=a[c[0]]||{};a[c[0]][c[1]]=true})
await localforage.setItem('achievement',a);
location.href='/achievement'`
        }
        exportData.value = {
            show: true,
            content,
            title: '导出到' + (to === 'paimon' ? 'Paimon.moe' : 'Seelie.me'),
        }
        // do nothing
    }
    return { exportData, doExport }
}

export function toUIAF(version: 'v1.1' | 'v1.0' = 'v1.1', data = store.value.achievement2): UIAF {
    const uiaf: UIAF = {
        info: {
            export_app: 'cocogoat',
            export_app_version: process.env.VUE_APP_GIT_SHA || 'unkonwn',
            export_timestamp: Math.floor(Date.now() / 1000),
            uiaf_version: version,
        },
        list: [],
    }
    Object.values(data).forEach((e) => {
        if (version === 'v1.0' && e.status <= UIAFStatus.ACHIEVEMENT_UNFINISHED) return
        uiaf.list.push({
            id: e.id,
            timestamp: e.timestamp || UIAFMagicTime,
            current: e.current || 0,
            status: version === 'v1.0' ? undefined : e.status,
        } as UIAFItem10)
    })
    return uiaf
}
export function toUIAFExt(data = store.value.achievement2): UIAF {
    const uiaf: UIAF = {
        info: {
            export_app: 'cocogoat',
            export_app_version: process.env.VUE_APP_GIT_SHA || 'unkonwn',
            export_timestamp: Math.floor(Date.now() / 1000),
            uiaf_version: 'v1.1',
            cocogoat_ext: {
                version: 'v1.0',
            },
        },
        list: [],
    }
    Object.values(data).forEach((e) => {
        uiaf.list.push(JSON.parse(JSON.stringify(e)))
    })
    return uiaf
}
function downloadJson(data: unknown, prefix: string) {
    const jstr = JSON.stringify(data, null, 4)
    const blob = new Blob([jstr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = prefix + '.' + dayjs().format('YYYYMMDDHHmmss') + '.json'
    a.click()
}
function callClient(url: string, msg: string, copyData: unknown) {
    const f = document.createElement('iframe')
    f.src = url
    f.style.display = 'none'
    if (copyData) copy(JSON.stringify(copyData))
    document.body.appendChild(f)
    ElNotification.success({
        title: '已发起自动导入',
        message: msg,
        duration: 15 * 1e3,
    })
    setTimeout(() => {
        document.body.removeChild(f)
    }, 1000)
}
async function dumpToExcel() {
    const noti = ElNotification.info({
        title: '处理中',
        message: '请稍候...',
        duration: 0,
    })
    const exceljs = await import('exceljs')
    const workbook = new exceljs.Workbook()
    const worksheet = workbook.addWorksheet('椰羊成就导出')
    worksheet.columns = [
        { header: 'ID', key: 'id' },
        { header: '分类', key: 'category' },
        { header: '名称', key: 'name' },
        { header: '原石', key: 'reward' },
        { header: '描述', key: 'desc' },
        { header: '状态', key: 'status' },
        { header: '进度', key: 'current' },
        { header: '日期', key: 'date' },
    ]
    // convert data
    achevementsAmos.forEach((category) => {
        category.achievements.forEach((achievement) => {
            const ach = store.value.achievement2[achievement.id]
            worksheet.addRow({
                id: achievement.id,
                category: i18n.amos[category.name],
                name: i18n.amos[achievement.name],
                desc: i18n.amos[achievement.desc],
                reward: achievement.reward,
                status: ach ? UIAFStatusCN[ach.status] : '未完成',
                current: ach ? ach.current : '',
                date: ach ? dayjs(ach.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss') : '',
            })
        })
    })
    // download xlsx
    noti.close()
    ElNotification.success({
        title: '导出成功',
        message: '即将下载...',
    })
    const buf = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '椰羊成就导出' + dayjs().format('YYYY-MM-DD HH:mm:ss') + '.xlsx'
    a.click()
}
