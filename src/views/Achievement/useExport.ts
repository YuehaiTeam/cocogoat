import { ref } from 'vue'
import { store, options } from '@/store'
export function useExportAchievements() {
    const exportData = ref({
        show: false,
        title: '',
        content: '',
    })
    const doExport = (_to: 'paimon' | 'seelie' | '') => {
        const to = _to || options.value.achievements_recent_export
        options.value.achievements_recent_export = to
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
