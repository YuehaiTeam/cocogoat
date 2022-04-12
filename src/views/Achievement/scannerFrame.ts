import { apibase } from '@/utils/apibase'
import { store } from '@/store'
import { IAchievementStore } from '@/typings/Achievement'
import delay from 'delay'
import { ElLoading, ElMessageBox, ElNotification } from 'element-plus'
import { Ref, watch, onBeforeUnmount } from 'vue'
import achevementsAmos from '@/plugins/amos/achievements/index'
import type { IAScannerData } from '../AchievementScanner/scanner/scanner'
export interface IScannerFrameResult {
    show: boolean
    length: number
    faildImages: { image: string; data: IAScannerData }[]
}
let loading = false
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
            const faildImages = faildData.map((e) => {
                return {
                    image: e.images?.main || '',
                    data: {
                        ...e,
                        images: undefined,
                    },
                }
            })
            if (faildData.length > 0) {
                console.log('Faild:', faildData)
                results.value = {
                    length: r.length,
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
    const sendOops = async () => {
        if (loading) return
        const body = JSON.stringify(results.value.faildImages.filter((e) => !e.data.success))
        const endpoint = await apibase('/v1/oops', 'global')
        loading = true
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body,
            })
            if (res.ok) {
                const data = await res.json()
                ElNotification.success({
                    title: '反馈成功',
                    message: 'ID:' + data.id,
                })
            } else {
                throw new Error()
            }
        } catch (e) {
            ElNotification.error({
                title: '发送失败',
                message: '发送失败，请检查网络连接',
            })
        }
        loading = false
    }
    return { sendOops }
}
