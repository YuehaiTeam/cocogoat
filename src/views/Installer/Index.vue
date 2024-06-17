<template>
    <Layout full-height>
        <template #title>
            <div class="teleport-title">PC 端更新包列表</div>
        </template>
        <template #actions>
            <router-link :to="{ name: 'installer.index' }">
                <el-button type="info" plain>转到米哈游启动器</el-button>
            </router-link>
        </template>
        <div v-elloading="loading" :class="$style.page">
            <el-scrollbar>
                <el-tabs
                    :model-value="($route.query.type || 'pc-cn').toString()"
                    @update:model-value="$router.replace({ query: { type: $event === 'pc-cn' ? undefined : $event } })"
                >
                    <el-tab-pane v-for="(i, a) in urls" :key="a" :name="a" :label="i.name"></el-tab-pane>
                </el-tabs>
                <div v-if="!loading">
                    <el-card v-if="result.sdk" class="title-card" header="SDK（渠道服专用）">
                        <a class="d-link" :href="result.sdk.path" target="_blank" rel="noreferrer">
                            <div class="icon">
                                <fa-icon icon="house-laptop"></fa-icon>
                            </div>
                            <div class="center">
                                <div class="name">{{ result.sdk.desc }}.zip</div>
                                <div class="meta">
                                    <span>
                                        <fa-icon icon="file-zipper" /> {{ formatSize(result.sdk.package_size) }}</span
                                    >
                                    <span> <fa-icon icon="database" /> {{ formatSize(result.sdk.size) }}</span>
                                    <span> <fa-icon icon="hashtag" /> {{ result.sdk.md5 }} </span>
                                </div>
                            </div>
                            <div class="right">
                                <fa-icon icon="angle-right"></fa-icon>
                            </div>
                        </a>
                    </el-card>
                    <template v-for="m in ['pre_download_game', 'game']">
                        <div v-if="result[m]" :key="m">
                            <el-card
                                class="title-card"
                                :header="`${m === 'game' ? '最新版本' : '预下载'}：${result[m].latest.version}`"
                            >
                                <a
                                    v-if="result[m].latest.path"
                                    class="d-link"
                                    :href="result[m].latest.path"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <div class="icon">
                                        <fa-icon icon="box-open"></fa-icon>
                                    </div>
                                    <div class="center">
                                        <div class="name">{{ basename(result[m].latest.path) }}</div>
                                        <div class="meta">
                                            <span>
                                                <fa-icon icon="file-zipper" />
                                                {{ formatSize(result[m].latest.package_size) }}</span
                                            >
                                            <span>
                                                <fa-icon icon="database" />
                                                {{ formatSize(result[m].latest.size) }}</span
                                            >
                                            <span> <fa-icon icon="hashtag" /> {{ result[m].latest.md5 }} </span>
                                        </div>
                                    </div>
                                    <div class="right">
                                        <fa-icon icon="angle-right"></fa-icon>
                                    </div>
                                </a>
                                <div v-else class="d-seg">
                                    <div class="d-text">
                                        <div class="icon">
                                            <fa-icon icon="code-merge"></fa-icon>
                                        </div>
                                        <div class="center">
                                            <div class="name">分卷包</div>
                                            <div class="meta">
                                                <span>
                                                    <fa-icon icon="file-zipper" /> 共
                                                    {{ formatSize(result[m].latest.package_size) }}</span
                                                >
                                                <span>
                                                    <fa-icon icon="database" /> 共
                                                    {{ formatSize(result[m].latest.size) }}</span
                                                >
                                            </div>
                                        </div>
                                    </div>
                                    <div class="seg-list">
                                        <a
                                            v-for="i in result[m].latest.segments"
                                            :key="i.path"
                                            :href="i.path"
                                            target="_blank"
                                            rel="noreferrer"
                                            class="d-link d-small"
                                        >
                                            <div class="icon">
                                                <fa-icon icon="box-open"></fa-icon>
                                            </div>
                                            <div class="center">
                                                <div class="meta">
                                                    <span class="seg-name">{{ basename(i.path) }}</span>
                                                    <span> <fa-icon icon="hashtag" /> {{ i.md5 }} </span>
                                                </div>
                                            </div>
                                            <div class="right">
                                                <fa-icon icon="angle-right"></fa-icon>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                                <el-divider v-if="result[m].latest.voice_packs.length > 0">语音包</el-divider>
                                <a
                                    v-for="i in result[m].latest.voice_packs"
                                    :key="i.path"
                                    class="d-link list-link"
                                    :href="i.path"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <div class="icon">
                                        <fa-icon icon="file-audio"></fa-icon>
                                    </div>
                                    <div class="center">
                                        <div class="name">{{ basename(i.path) }}</div>
                                        <div class="meta">
                                            <span>
                                                <fa-icon icon="file-zipper" /> {{ formatSize(i.package_size) }}</span
                                            >
                                            <span> <fa-icon icon="database" /> {{ formatSize(i.size) }}</span>
                                            <span> <fa-icon icon="hashtag" /> {{ i.md5 }} </span>
                                        </div>
                                    </div>
                                    <div class="right">
                                        <fa-icon icon="angle-right"></fa-icon>
                                    </div>
                                </a>
                            </el-card>
                            <el-card v-for="z in result[m].diffs" :key="z.name" class="title-card" header="增量包">
                                <a class="d-link" :href="z.path" target="_blank" rel="noreferrer">
                                    <div class="icon">
                                        <fa-icon icon="calendar-plus"></fa-icon>
                                    </div>
                                    <div class="center">
                                        <div class="name">{{ basename(z.path) }}</div>
                                        <div class="meta">
                                            <span>
                                                <fa-icon icon="file-zipper" /> {{ formatSize(z.package_size) }}</span
                                            >
                                            <span> <fa-icon icon="database" /> {{ formatSize(z.size) }}</span>
                                            <span> <fa-icon icon="hashtag" /> {{ z.md5 }} </span>
                                        </div>
                                    </div>
                                    <div class="right">
                                        <fa-icon icon="angle-right"></fa-icon>
                                    </div>
                                </a>
                                <el-divider v-if="z.voice_packs.length > 0">语音包</el-divider>
                                <a
                                    v-for="i in z.voice_packs"
                                    :key="i.path"
                                    class="d-link list-link"
                                    :href="i.path"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <div class="icon">
                                        <fa-icon icon="file-audio"></fa-icon>
                                    </div>
                                    <div class="center">
                                        <div class="name">{{ basename(i.path) }}</div>
                                        <div class="meta">
                                            <span>
                                                <fa-icon icon="file-zipper" /> {{ formatSize(i.package_size) }}</span
                                            >
                                            <span> <fa-icon icon="database" /> {{ formatSize(i.size) }}</span>
                                            <span> <fa-icon icon="hashtag" /> {{ i.md5 }} </span>
                                        </div>
                                    </div>
                                    <div class="right">
                                        <fa-icon icon="angle-right"></fa-icon>
                                    </div>
                                </a>
                            </el-card>
                        </div>
                    </template>
                </div>
            </el-scrollbar>
        </div>
    </Layout>
</template>

<script lang="ts">
import '@/styles/actions.scss'
import { ref, onMounted, defineComponent, watch } from 'vue'
import {
    faBoxOpen,
    faFileAudio,
    faAngleRight,
    faHashtag,
    faDatabase,
    faFileZipper,
    faCalendarPlus,
    faHouseLaptop,
    faCodeMerge,
} from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { ElNotification } from 'element-plus'
library.add(
    faBoxOpen,
    faAngleRight,
    faFileAudio,
    faHashtag,
    faCodeMerge,
    faDatabase,
    faFileZipper,
    faCalendarPlus,
    faHouseLaptop,
)
import { vLoading } from 'element-plus/es/components/loading/src/directive'
import 'element-plus/theme-chalk/el-loading.css'
import 'element-plus/theme-chalk/el-notification.css'
import { urls } from './urls'
import { useRoute } from 'vue-router'
export default defineComponent({
    name: 'InstallerIndex',
    directives: {
        elloading: vLoading,
    },
    setup() {
        const loading = ref(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = ref<any>({})
        const route = useRoute()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cachedResult = {} as Record<string, any>
        const load = async () => {
            const url = await urls[(route.query.type || 'pc-cn').toString()].url
            if (cachedResult[url]) {
                result.value = cachedResult[url]
                return
            }
            loading.value = true
            return fetch(url)
                .then((res) => {
                    return res.json()
                })
                .then((res) => {
                    result.value = res.data
                    loading.value = false
                    cachedResult[url] = res.data
                })
                .catch((err) => {
                    ElNotification.error({
                        title: '出错了',
                        message: err.message,
                    })
                })
        }
        onMounted(load)
        watch(route, load)
        const basename = (path: string) => {
            const pathArr = path.split('/')
            return pathArr[pathArr.length - 1]
        }
        const formatSize = (size: number) => {
            if (size < 1024) {
                return `${size}B`
            } else if (size < 1024 * 1024) {
                return `${(size / 1024).toFixed(2)}KB`
            } else if (size < 1024 * 1024 * 1024) {
                return `${(size / 1024 / 1024).toFixed(2)}MB`
            } else {
                return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`
            }
        }
        return {
            loading,
            result,
            basename,
            formatSize,
            urls,
        }
    },
})
</script>
<style lang="scss" module>
.page {
    height: 100%;
    background: var(--c-background);
    :global {
        .el-tabs__nav-scroll {
            padding: 0 20px;
        }
        .title-card {
            margin: 20px;
        }
        .d-link,
        .d-text {
            display: block;
            text-decoration: none;
            border-radius: 5px;
            color: var(--c-text);
            box-sizing: border-box;
            position: relative;
            display: flex;
            align-items: center;
            transition: all 0.3s;

            .icon {
                font-size: 27px;
                height: 100%;
                float: left;
                line-height: 53px;
                width: 53px;
                text-align: center;
            }

            .right {
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                opacity: 0.8;
                line-height: 53px;
                padding-right: 15px;
            }

            .meta {
                opacity: 0.7;
                font-size: 12px;
                span {
                    margin-right: 10px;
                    min-width: 80px;
                    display: inline-block;
                }
            }
            &.d-small {
                height: 35px;
                margin-top: 12px;
                .icon,
                .right {
                    font-size: 16px;
                    line-height: 33px;
                }
            }
        }
        .d-link {
            border: 1px solid var(--c-border);
            height: 55px;
            &:hover {
                color: #0079cc;
                border-color: #0079cc;
            }
            &.list-link {
                margin-bottom: 15px;
            }
        }
    }
}
:global(.m) .page {
    :global {
        .title-card {
            margin: 20px 0;
            .name {
                max-width: 60vw;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
    }
}
</style>
