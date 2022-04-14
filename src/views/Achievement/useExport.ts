import { i18n } from '@/i18n'
import { ElNotification } from 'element-plus'
import 'element-plus/theme-chalk/el-notification.css'
import { ref } from 'vue'
import { store, options } from '@/store'
import dayjs from 'dayjs'
import achevementsAmos from '@/plugins/amos/achievements'
import { cloneDeep } from 'lodash-es'
import copy from 'copy-to-clipboard'
export function useExportAchievements() {
    const exportData = ref({
        show: false,
        title: '',
        content: '',
    })
    const doExport = (_to: 'paimon' | 'seelie' | 'cocogoat' | 'excel' | 'snapgenshin' | '') => {
        const to = _to || options.value.achievements_recent_export
        options.value.achievements_recent_export = to
        if (to === 'cocogoat') {
            const ach0 = cloneDeep(store.value.achievements)
            ach0.forEach((e) => {
                e.images = undefined
            })
            const data = {
                source: '椰羊成就',
                value: {
                    achievements: ach0,
                },
                lastModified: new Date().toISOString(),
            }
            const jstr = JSON.stringify(data, null, 4)
            // save to file
            const blob = new Blob([jstr], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = '椰羊成就导出' + dayjs().format('YYYY-MM-DD HH:mm:ss') + '.json'
            a.click()
            return
        }
        if (to === 'snapgenshin') {
            const ach0 = store.value.achievements.map((e) => {
                return {
                    Id: e.id,
                    Time: e.date,
                }
            })
            const f = document.createElement('iframe')
            f.src = 'snapgenshin://achievement/import/clipboard'
            f.style.display = 'none'
            copy(JSON.stringify(ach0))
            document.body.appendChild(f)
            setTimeout(() => {
                document.body.removeChild(f)
            }, 1000)
            ElNotification.success({
                title: '已发起自动导入',
                message: '如果SnapGenshin没有启动或导入失败，请导出为椰羊JSON后手动导入。',
                duration: 15 * 1e3,
            })
            return
        }
        if (to === 'excel') {
            dumpToExcel()
            return
        }
        let content = ''
        if (to === 'seelie') {
            const exportArray = store.value.achievements.map((i) => {
                return [i.id, (i.status + ' ' + i.date).trim()]
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
            const exportArray = store.value.achievements.map((a) => {
                return [a.categoryId, a.id]
            })
            content = `/*
* 复制此处所有内容，
* 在Paimon.moe页面按F12打开调试器，
* 选择控制台(Console)
* 粘贴并回车执行完成导入
* 
* 使用此方法导入是为了保证您的原有成就不被覆盖
*
*/
const b = ${JSON.stringify(exportArray)};
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
        { header: '日期', key: 'date' },
    ]
    // convert data
    achevementsAmos.forEach((category) => {
        category.achievements.forEach((achievement) => {
            const ach = store.value.achievements.find((i) => i.id === achievement.id)
            worksheet.addRow({
                id: achievement.id,
                category: i18n.amos[category.name],
                name: i18n.amos[achievement.name],
                desc: i18n.amos[achievement.desc],
                reward: achievement.reward,
                status: ach ? ach.status : '',
                date: ach ? ach.date : '',
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
