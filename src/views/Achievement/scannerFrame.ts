import { store } from '@/store'
import { IAchievementStore } from '@/typings/Achievement'
import delay from 'delay'
import { ElLoading, ElMessageBox } from 'element-plus'
import { Ref, watch, onBeforeUnmount } from 'vue'
import achevementsAmos from '@/plugins/amos/achievements/index'
import type { IAScannerData } from '../AchievementScanner/scanner/scanner'
export interface IScannerFrameResult {
    show: boolean
    faildImages: string[]
}

export function useScannerFrame({
    scannerFrame,
    results,
    achievementFin,
    showScanner,
}: {
    scannerFrame: Ref<HTMLIFrameElement | null>
    results: Ref<IScannerFrameResult>
    achievementFin: Ref<Record<number, IAchievementStore>>
    showScanner: Ref<boolean>
}) {
    const messageHandler = async (ev: MessageEvent) => {
        const { app, event, data } = ev.data
        if (app !== 'cocogoat.scanner.achievement') return
        if (event === 'ready') {
            return
        }
        if (event === 'result') {
            showScanner.value = false
            const loader = ElLoading.service({ fullscreen: true, text: '结果处理中...' })
            await delay(100)
            const { result } = data
            for (const e of result as IAScannerData[]) {
                if (!e.success) continue
                if (e.achievement.preStage && e.achievement.preStage > 0) {
                    const cat = achevementsAmos.find((x) => x.id === e.achievement.categoryId)
                    if (cat) {
                        const preStage = cat.achievements.find((x) => x.id === e.achievement.preStage)
                        if (preStage) {
                            const p = {
                                ...e,
                                done: true,
                                success: true,
                                date: '后续已完成',
                            }
                            result.push({
                                ...p,
                                achievement: {
                                    ...preStage,
                                    categoryId: e.achievement.categoryId,
                                },
                            })
                        }
                    }
                }
            }
            const faildData = [] as IAScannerData[]
            const r = result
                .filter((e: IAScannerData) => {
                    if (!e.success || !e.done) {
                        faildData.push(e)
                        return false
                    }
                    return true
                })
                .map((e: IAScannerData) => {
                    return {
                        id: e.achievement.id,
                        date: e.date,
                        status: e.status,
                        categoryId: e.achievement.categoryId,
                        images: e.images,
                    } as IAchievementStore
                })
            r.forEach((e: IAchievementStore) => {
                if (!achievementFin.value[e.id]) {
                    store.value.achievements.push(e)
                }
            })
            const faildImages = faildData.map((e) => e.images?.main || '')
            if (faildData.length > 0) {
                console.log('Faild:', faildData)
                results.value = {
                    show: true,
                    faildImages,
                }
            } else {
                ElMessageBox.alert('成功识别' + r.length + '个，失败0个', '扫描结束')
            }
            await delay(100)
            loader.close()
            console.log('got result from scanner', result)
        }
    }
    watch(scannerFrame, (v) => {
        console.log(v)
        if (!v) {
            window.removeEventListener('message', messageHandler)
            return
        }
        window.addEventListener('message', messageHandler)
    })
    onBeforeUnmount(() => {
        window.removeEventListener('message', messageHandler)
    })
}
