<template>
    <Layout full-height>
        <template #title>
            <div class="teleport-title">PC端更新包列表</div>
        </template>
        <template #actions></template>
        <div v-elloading="loading" :class="$style.page">
            <el-scrollbar v-if="!loading">
                <el-card class="title-card" :header="`最新版本：${result.game.latest.version}`">
                    <a class="d-link" :href="result.game.latest.path" target="_blank" rel="noreferrer">
                        <div class="icon">
                            <fa-icon icon="box-open"></fa-icon>
                        </div>
                        <div class="center">
                            <div class="name">{{ basename(result.game.latest.path) }}</div>
                            <div class="meta">
                                <span> <fa-icon icon="database" /> {{ formatSize(result.game.latest.size) }}</span>
                                <span> <fa-icon icon="hashtag" /> {{ result.game.latest.md5 }} </span>
                            </div>
                        </div>
                        <div class="right">
                            <fa-icon icon="angle-right"></fa-icon>
                        </div>
                    </a>
                    <el-divider>语音包</el-divider>
                    <a
                        v-for="i in result.game.latest.voice_packs"
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
                                <span> <fa-icon icon="database" /> {{ formatSize(i.size) }}</span>
                                <span> <fa-icon icon="hashtag" /> {{ i.md5 }} </span>
                            </div>
                        </div>
                        <div class="right">
                            <fa-icon icon="angle-right"></fa-icon>
                        </div>
                    </a>
                </el-card>
                <el-card v-for="z in result.game.diffs" :key="z.name" class="title-card" header="增量包">
                    <a class="d-link" :href="z.path" target="_blank" rel="noreferrer">
                        <div class="icon">
                            <fa-icon icon="calendar-plus"></fa-icon>
                        </div>
                        <div class="center">
                            <div class="name">{{ basename(z.path) }}</div>
                            <div class="meta">
                                <span> <fa-icon icon="database" /> {{ formatSize(z.size) }}</span>
                                <span> <fa-icon icon="hashtag" /> {{ z.md5 }} </span>
                            </div>
                        </div>
                        <div class="right">
                            <fa-icon icon="angle-right"></fa-icon>
                        </div>
                    </a>
                    <el-divider>语音包</el-divider>
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
                                <span> <fa-icon icon="database" /> {{ formatSize(i.size) }}</span>
                                <span> <fa-icon icon="hashtag" /> {{ i.md5 }} </span>
                            </div>
                        </div>
                        <div class="right">
                            <fa-icon icon="angle-right"></fa-icon>
                        </div>
                    </a>
                </el-card>
            </el-scrollbar>
        </div>
    </Layout>
</template>

<script lang="ts">
import '@/styles/actions.scss'
import { ref, defineComponent } from 'vue'
import {
    faBoxOpen,
    faFileAudio,
    faAngleRight,
    faHashtag,
    faDatabase,
    faCalendarPlus,
} from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { ElNotification } from 'element-plus'
library.add(faBoxOpen, faAngleRight, faFileAudio, faHashtag, faDatabase, faCalendarPlus)
import { vLoading } from 'element-plus/es/components/loading/src/directive'
import 'element-plus/theme-chalk/el-loading.css'
import 'element-plus/theme-chalk/el-notification.css'
export default defineComponent({
    name: 'InstallerIndex',
    directives: {
        elloading: vLoading,
    },
    setup() {
        const loading = ref(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = ref<any>({})
        fetch(process.env.VUE_APP_APIBASE + '/v1/utils/client')
            .then((res) => {
                return res.json()
            })
            .then((res) => {
                result.value = res.data
                loading.value = false
            })
            .catch((err) => {
                ElNotification.error({
                    title: '出错了',
                    message: err.message,
                })
            })
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
        }
    },
})
</script>
<style lang="scss" module>
.page {
    height: 100%;
    background: #eee;
    :global {
        .title-card {
            margin: 20px;
        }
        .d-link {
            border: 1px solid #ccc;
            display: block;
            height: 55px;
            text-decoration: none;
            border-radius: 5px;
            color: #555;
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
                opacity: 0.8;
                font-size: 12px;
                span {
                    margin-right: 10px;
                    min-width: 80px;
                    display: inline-block;
                }
            }

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
</style>
