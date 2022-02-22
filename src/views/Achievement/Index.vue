<template>
    <Layout style="background: #eee">
        <template #title>
            <div class="teleport-title">
                <span style="font-family: genshin">椰羊 · 成就</span>
            </div>
        </template>
        <template #actions>
            <div class="actions">
                <el-button
                    v-show="!showScanner"
                    class="import-button"
                    type="danger"
                    size="default"
                    plain
                    @click="doClear"
                >
                    <fa-icon icon="trash-can" />
                    清空
                </el-button>
                <div v-show="!showScanner" class="dropdown">
                    <el-dropdown class="header-plain-dropdown" split-button @click="doExport('')">
                        导出
                        <template #dropdown>
                            <el-dropdown-menu class="el-dropdown-menu--small">
                                <el-dropdown-item disabled class="export-title"> Paimon.moe </el-dropdown-item>
                                <el-dropdown-item @click="doExport('paimon')">代码</el-dropdown-item>
                                <el-dropdown-item divided disabled class="export-title"> Seelie.me </el-dropdown-item>
                                <el-dropdown-item @click="doExport('seelie')">代码</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
                <el-button
                    size="default"
                    type="primary"
                    :plain="!showScanner"
                    style="margin-left: 10px"
                    @click="showScanner = !showScanner"
                >
                    <fa-icon icon="crosshairs" /> {{ showScanner ? '退出' : '' }}识别
                </el-button>
            </div>
        </template>
        <div v-if="showScanner" :class="$style.scannerArea">
            <iframe ref="scannerFrame" class="scanner-frame" :src="frameSrc"></iframe>
            <div class="scanner-back">
                <div class="scanner-box">
                    <div class="scanner-title">成就识别</div>
                </div>
            </div>
        </div>
        <el-dialog v-model="exportData.show" :title="exportData.title" :custom-class="$style.exportDialog">
            <el-input type="textarea" :model-value="exportData.content"></el-input>
        </el-dialog>
        <el-dialog v-model="scannerResult.show" title="扫描结束" :custom-class="$style.scannerResultDialog">
            以下为失败列表，您可以自行检查后添加。
            <div class="faildResults">
                <img v-for="(image, index) in scannerResult.faildImages" :key="index" :src="image" />
            </div>
        </el-dialog>
        <section :class="$style.achievementView">
            <div class="progress">
                <div
                    class="progress-in"
                    :style="{ width: (currentCat.finished / currentCat.achievements.length) * 100 + '%' }"
                ></div>
            </div>
            <div class="sidebar">
                <el-scrollbar>
                    <div class="sidebar-in">
                        <router-link
                            v-for="i in achievementCat"
                            :key="i.id"
                            :to="{
                                ...$route,
                                params: {
                                    cat: i.id === 'wonders_of_the_world' ? '' : i.id,
                                },
                            }"
                            :active-class="i.id === 'wonders_of_the_world' ? '' : 'router-link-active'"
                            :exact-active-class="i.id === 'wonders_of_the_world' ? 'router-link-active' : ''"
                        >
                            <div>
                                {{ i.name }}
                            </div>
                            <small>
                                {{ i.finished }}/{{ i.achievements.length }} ({{
                                    Math.round((i.finished / i.achievements.length) * 100)
                                }}%)
                            </small>
                        </router-link>
                    </div>
                </el-scrollbar>
            </div>
            <article>
                <section v-for="i in currentAch" :key="i.id">
                    <div class="single">
                        <div class="check">
                            <div
                                class="check-circle"
                                :class="{ checked: achievementFin[i.id] }"
                                @click="updateFinished(i.id)"
                            >
                                <fa-icon icon="check" />
                            </div>
                        </div>
                        <div class="middle">
                            <div class="name">
                                <div class="award" :class="{ checked: achievementFin[i.id] }">
                                    <img src="@/assets/images/yuanshi.png" alt="原石" />
                                    <span class="number">{{ i.reward }}</span>
                                </div>
                                <div class="ntxt">
                                    {{ i.name }}
                                </div>
                            </div>
                            <small>
                                {{ i.desc }}
                            </small>
                        </div>
                        <div v-if="achievementFin[i.id]" class="right">
                            <div class="status">
                                <input v-model="achievementFin[i.id].status" type="text" />
                            </div>
                            <div class="date">
                                <input v-model="achievementFin[i.id].date" type="text" />
                            </div>
                        </div>
                    </div>
                    <template v-if="i.sub">
                        <div v-for="j in i.sub" :key="j.id" class="single sub">
                            <div class="check">
                                <div
                                    class="check-circle"
                                    :class="{ checked: achievementFin[j.id] }"
                                    @click="updateFinished(j.id)"
                                >
                                    <fa-icon icon="check" />
                                </div>
                            </div>
                            <div class="middle">
                                <div class="name">
                                    <div class="award" :class="{ checked: achievementFin[j.id] }">
                                        <img src="@/assets/images/yuanshi.png" alt="原石" />
                                        <span class="number">{{ j.reward }}</span>
                                    </div>
                                    <div class="ntxt">
                                        {{ j.name }}
                                    </div>
                                </div>
                                <small>
                                    {{ j.desc }}
                                </small>
                            </div>
                            <div v-if="achievementFin[j.id]" class="right">
                                <div class="status">
                                    <input v-model="achievementFin[j.id].status" type="text" />
                                </div>
                                <div class="date">
                                    <input v-model="achievementFin[j.id].date" type="text" />
                                </div>
                            </div>
                        </div>
                    </template>
                </section>
            </article>
        </section>
    </Layout>
</template>

<script lang="ts">
import '@/styles/actions.scss'
import { ref, defineComponent, computed } from 'vue'
import { faCrosshairs, faArrowUpFromBracket, faCheck, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { useRoute, useRouter } from 'vue-router'
import { i18n } from '@/i18n'
import { options, store } from '@/store'
import { IAchievementStore } from '@/typings/Achievement'
import { ElMessageBox } from 'element-plus'
library.add(faCrosshairs, faArrowUpFromBracket, faCheck, faTrashCan)
import { useScannerFrame } from './scannerFrame'
import dayjs from 'dayjs'
export default defineComponent({
    name: 'ArtifactIndex',
    components: {},
    setup() {
        const selectedIds = ref<string[]>([])
        const showScanner = ref(false)
        const router = useRouter()
        const frameSrc = router.resolve({ name: 'frames.achievement.scan' }).href
        const achievementFin = computed(() => {
            const achievementStore = store.value.achievements
            const fin = {} as Record<number, IAchievementStore>
            achievementStore.forEach((i) => {
                if (i.id) {
                    fin[i.id] = i
                }
            })
            return fin
        })
        const achievementCat = computed(() => {
            const ach = i18n.value.achievements.concat([]).sort((a, b) => a.order - b.order)
            ach.forEach((i) => {
                i.id = i.id.toLowerCase()
                let finished = 0
                i.achievements.forEach((j) => {
                    if (achievementFin.value[j.id]) {
                        finished++
                    }
                })
                i.achievements = i.achievements.filter((e) => !e.name.includes('(test)'))
                i.finished = finished
            })
            return ach
        })
        const route = useRoute()
        const currentCatId = computed(() => {
            return route.params.cat || 'wonders_of_the_world'
        })
        const currentCat = computed(() => {
            return achievementCat.value.find((i) => i.id === currentCatId.value) || achievementCat.value[0]
        })
        const currentAch = computed(() => {
            const ach = currentCat.value.achievements.concat([]).sort((a, b) => a.order - b.order)
            ach.forEach((i) => {
                i.sub = []
            })
            return ach.filter((e) => {
                if (e.preStage) {
                    let pre = e
                    while (pre.preStage && pre.preStage !== pre.id) {
                        const find = ach.find((i) => i.id === pre.preStage)
                        if (!find) break
                        pre = find
                    }
                    // now pre is root
                    pre.sub = pre.sub || []
                    pre.sub.push(e)
                    return false
                }
                return true
            })
        })
        const updateFinished = (id: number) => {
            if (achievementFin.value[id]) {
                store.value.achievements = store.value.achievements.filter((i) => i.id !== id)
                return
            }
            const finishedData = {
                id,
                status: '手动勾选',
                categoryId: currentCat.value.originalId,
                date: dayjs().format('YYYY/MM/DD'),
            } as IAchievementStore
            store.value.achievements.push(finishedData)
        }
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
        const doClear = async () => {
            try {
                await ElMessageBox.confirm('真的要清空吗？', '提示')
            } catch (e) {
                return
            }
            store.value.achievements = []
        }
        const scannerFrame = ref<HTMLIFrameElement | null>(null)
        const scannerResult = ref({ show: false, faildImages: [] as string[] })
        useScannerFrame({
            scannerFrame,
            results: scannerResult,
            achievementFin,
            showScanner,
        })
        return {
            showScanner,
            selectedIds,
            frameSrc,
            achievementCat,
            currentCatId,
            currentCat,
            achievementFin,
            currentAch,
            updateFinished,
            doExport,
            exportData,
            doClear,
            scannerFrame,
            scannerResult,
        }
    },
})
</script>
<style lang="scss" module>
.export-dialog {
    width: 500px !important;
    max-width: 90%;
    textarea {
        font-size: 12px;
        height: 350px;
        font-family: Consolas, monospace;
    }
    :global {
        .faildResults {
            margin-top: 20px;
            width: 100%;
            height: 300px;
            border: 1px solid #ddd;
            padding: 10px;
            box-sizing: border-box;
            display: block;
            overflow-y: scroll;
            img {
                max-width: 100%;
                border: 1px solid #ddd;
                border-radius: 5px;
                display: block;
                margin-bottom: 5px;
            }
        }
    }
}
.scanner-result-dialog {
    width: 600px !important;
    max-width: 90%;
}
.achievement-view {
    position: relative;
    min-height: 100%;
    :global {
        .progress {
            height: 3px;
            position: fixed;
            top: 50px;
            left: 315px;
            right: 0;
            z-index: 99;
            .progress-in {
                height: 100%;
                background: #409eff;
                transition: all 0.3s;
            }
        }
        article {
            padding: 15px 10px;
            padding-left: 260px;
            min-height: 100%;
            section {
                background: #fff;
                border-radius: 3px;
                margin-bottom: 15px;
                color: #555;
                .single {
                    position: relative;
                    padding: 15px;
                    &.sub {
                        background: #f0f7ff;
                        border-top: 1px solid #d3e8ff;
                    }
                    .ntxt {
                        display: inline-block;
                        white-space: nowrap;
                        max-width: calc(100% - 200px);
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    small {
                        max-width: calc(100% - 145px);
                        overflow: hidden;
                        white-space: nowrap;
                        display: inline-block;
                        text-overflow: ellipsis;
                    }
                    .award {
                        user-select: none;
                        display: inline-block;
                        height: 25px;
                        vertical-align: middle;
                        color: #409eff;
                        font-size: 12px;
                        padding: 0 5px;
                        box-sizing: border-box;
                        border-radius: 3px;
                        margin-right: 10px;
                        width: 55px;
                        text-align: center;
                        border: 1px solid #409eff;
                        &.checked {
                            background: #409eff;
                            color: #fff;
                        }
                        img {
                            height: 18px;
                            vertical-align: top;
                            padding-top: 3px;
                            padding-right: 4px;
                            display: inline-block;
                            margin-left: -2px;
                        }
                        .number {
                            height: 18px;
                            vertical-align: top;
                            padding-top: 4px;
                            display: inline-block;
                        }
                    }
                }

                .right {
                    width: 80px;
                    position: absolute;
                    right: 15px;
                    top: 15px;
                    input {
                        appearance: none;
                        border: 0;
                        color: #409eff;
                        width: 100%;
                        text-align: center;
                        background: transparent;
                        display: block;
                        outline: 0;
                        border: 1px solid transparent;
                        border-radius: 3px;
                        &:focus,
                        &:hover {
                            border-color: #409eff;
                        }
                    }
                    .status input {
                        font-size: 17px;
                        height: 22px;
                    }
                }

                .name {
                    font-weight: bold;
                }
                .desc {
                    color: #888;
                    font-size: 13px;
                }
                .check {
                    float: left;
                    user-select: none;
                    height: 40px;
                    width: 40px;
                    padding-left: 2px;
                    padding-top: 6px;
                    box-sizing: border-box;
                    margin-right: 10px;
                    .check-circle {
                        cursor: pointer;
                        width: 34px;
                        height: 34px;
                        border: 2px solid #bfdfff;
                        border-radius: 100%;
                        box-sizing: border-box;
                        color: #bfdfff;
                        font-size: 23px;
                        text-align: center;
                        transition: all 0.3s;
                        &.checked {
                            color: #fff;
                            background: #409eff;
                            border-color: #409eff;
                        }
                        &:hover {
                            border-color: #409eff;
                        }
                        &.checked:hover {
                            border-color: #0079cc;
                            background: #0079cc;
                        }
                    }
                }
            }
        }
        .sidebar {
            background: #fff;
            box-shadow: 2px 0px 12px 0 rgb(0 0 0 / 10%);
            width: 235px;
            position: fixed;
            left: 80px;
            top: 50px;
            height: calc(100vh - 50px);
            overflow: overlay;
            box-sizing: border-box;
            .sidebar-in {
                padding: 15px;
            }
            a {
                display: block;
                padding: 12px;
                padding-left: 5px;
                padding-right: 20px;
                text-decoration: none;
                text-align: right;
                color: #666;
                border-right: 2px solid #eee;
                font-size: 14px;
                transition: all 0.2s;
                &.router-link-active {
                    color: #409eff;
                    border-color: #409eff;
                }
            }
        }
    }
}
.scanner-area {
    position: fixed;
    top: 50px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    overflow: hidden;
    z-index: 900;
    :global {
        .scanner-frame {
            width: 100%;
            height: 100%;
            border: 0;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 2;
        }
        .scanner-back {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
            .scanner-box {
                max-width: 100%;
                width: 600px;
                height: 650px;
                background: #fff;
                border-radius: 5px;
                margin: 0 auto;
                margin-top: calc(10vh - 60px);
                .scanner-title {
                    height: 40px;
                    line-height: 40px;
                    font-size: 20px;
                    padding-left: 20px;
                    padding-top: 10px;
                }
            }
        }
    }
}
:global(.pc) .scanner-area {
    left: 80px;
}
:global(.m) .scanner-area {
    bottom: 50px;
    :global {
        .scanner-box {
            margin-top: 0;
            height: 100%;
            border-radius: 0;
        }
    }
}
</style>
