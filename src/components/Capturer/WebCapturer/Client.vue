<template>
    <div :class="$style.client">
        <div class="client-content">
            <div v-if="loading">
                <div :class="$style.loader">
                    <div class="loader-animation">
                        <span class="cssload-loader"><span class="cssload-loader-inner"></span></span>
                    </div>
                    <div class="loader-text">正在连接辅助插件</div>
                </div>
            </div>
            <div v-if="notFound && !loading" class="not-found">
                <div class="title">
                    {{ needUpdate ? '您的辅助插件版本过低' : '自动操作需要辅助插件' }}
                    <small v-if="needUpdate">(v{{ version }})</small>
                </div>
                <div class="content">
                    由于浏览器限制，自动操作无法在网页完成
                    <a class="dlink" href="/extra/client" target="_blank">
                        点击此处下载辅助插件<small>(v{{ cVersion }} 300kB)</small>
                    </a>
                    <div class="absolute-area">
                        <el-button class="start-btn start-gray" @click="enable(false)">
                            <div class="l">
                                <fa-icon icon="check" />
                            </div>
                            <div class="m">
                                <div class="t">
                                    {{ needUpdate ? '我已更新并重新运行客户端' : '我已下载并运行客户端' }}
                                </div>
                                <div class="d">记得同意控制键鼠的权限申请</div>
                            </div>
                            <div class="r">
                                <fa-icon icon="angle-right" />
                            </div>
                        </el-button>
                    </div>
                </div>
            </div>
            <div v-if="!notFound && (denied || gameNotFound) && !loading" class="not-found">
                <div class="title">{{ denied ? '您已拒绝辅助插件的权限申请' : '未找到可用的原神游戏窗口' }}</div>
                <div class="content">
                    <div v-if="denied">
                        由于浏览器限制，自动操作无法在网页完成<br />
                        模拟键鼠操作需要您运行辅助插件并同意权限申请
                    </div>
                    <div v-else>
                        自动操仅支持原神PC客户端<br />
                        暂未支持云游戏、模拟器等，请使用手动操作或重新检查
                    </div>
                    <div class="absolute-area">
                        <el-button class="start-btn start-gray" @click="enable(false)">
                            <div class="l">
                                <fa-icon icon="check" />
                            </div>
                            <div class="m">
                                <div class="t">点击重试</div>
                                <div class="d">记得同意控制键鼠的权限申请</div>
                            </div>
                            <div class="r">
                                <fa-icon icon="angle-right" />
                            </div>
                        </el-button>
                    </div>
                </div>
            </div>
        </div>
        <el-button class="start-btn" type="info" plain @click="$emit('done', -1)">
            <div class="l">
                <fa-icon icon="arrow-pointer" />
            </div>
            <div class="m">
                <div class="t">我想手动操作</div>
                <div class="d">也可用于投屏或不支持辅助插件的系统</div>
            </div>
            <div class="r">
                <fa-icon icon="angle-right" />
            </div>
        </el-button>
    </div>
</template>

<script lang="ts">
import { ref, defineComponent, toRef, onMounted, PropType } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowPointer, faAngleRight, faCheck } from '@fortawesome/free-solid-svg-icons'
import { CocogoatWebControl } from '@/modules/webcontrol'
import { versionCompare } from '@/utils/versionCompare'
library.add(faArrowPointer, faAngleRight, faCheck)
export default defineComponent({
    props: {
        control: {
            type: Object as PropType<CocogoatWebControl>,
            required: true,
        },
    },
    emits: ['done'],
    setup(props, { emit }) {
        const w = toRef(props, 'control')
        const loading = ref(true)
        const notFound = ref(false)
        const denied = ref(false)
        const gameNotFound = ref(false)
        const needUpdate = ref(false)
        const version = ref('')
        const enable = async (force = false) => {
            if (loading.value && !force) return
            loading.value = true
            denied.value = false
            const alive = await w.value.check()
            if (!alive) {
                notFound.value = true
                loading.value = false
                needUpdate.value = false
                return
            } else if (versionCompare(w.value.version, process.env.VUE_APP_CLIENT_MIN_VER || '') < 0) {
                needUpdate.value = true
                notFound.value = true
                loading.value = false
                version.value = w.value.version
                return
            } else {
                needUpdate.value = false
                try {
                    loading.value = true
                    const authorized = await w.value.authorize()
                    if (authorized) {
                        let windows = await w.value.listWindows()
                        windows = windows.filter(
                            (w) =>
                                (w.title.includes('原神') || w.title.toLowerCase().includes('genshin')) &&
                                w.classname === 'UnityWndClass',
                        )
                        if (windows.length === 0) {
                            notFound.value = false
                            loading.value = false
                            gameNotFound.value = true
                            return
                        }
                        emit('done', windows[0].hWnd)
                    } else {
                        denied.value = true
                    }
                    notFound.value = false
                } catch (e) {
                    notFound.value = true
                    console.log(e)
                }
            }
            loading.value = false
        }
        onMounted(() => enable(true))
        return {
            loading,
            notFound,
            enable,
            denied,
            gameNotFound,
            needUpdate,
            version,
            cVersion: process.env.VUE_APP_CLIENT_VER,
        }
    },
})
</script>

<style lang="scss" module>
.client {
    padding-top: 10vh;
    :global {
        .client-content {
            height: 250px;
            position: relative;
            .absolute-area {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
            }
        }
        .not-found {
            .title {
                font-size: 23px;
                margin-bottom: 10px;
            }

            a {
                color: #555;
                text-decoration: none;
                &.dlink {
                    margin-top: 8px;
                    display: block;
                    color: #0068b7;
                }
            }
        }
    }
}
.loader {
    width: 200px;
    color: #666;
    text-align: center;
    font-size: 14px;
    margin: 0 auto;
    padding-top: 50px;
    :global {
        .loader-text {
            padding-top: 15px;
        }
        .cssload-loader {
            display: block;
            margin: 0 auto;
            width: 30px;
            height: 30px;
            position: relative;
            border: 3px solid #333;
            &:local {
                animation: scanner-cssload-loader 2.3s infinite ease;
            }
        }
        .cssload-loader-inner {
            vertical-align: top;
            display: inline-block;
            width: 100%;
            background-color: #333;
            &:local {
                animation: scanner-cssload-loader-inner 2.3s infinite ease-in;
            }
        }
        .loader-progress {
            width: 170px;
            height: 2px;
            background: #ddd;
            margin: 0 auto;
            margin-top: 20px;
            position: relative;
            .loader-progress-bar {
                width: 0;
                height: 100%;
                background: #777;
                position: absolute;
                left: 0;
                top: 0;
            }
        }
        .loader-progress-text {
            font-size: 12px;
            position: relative;
            top: -12px;
            background: #fff;
            display: inline-block;
            padding: 0 4px;
        }
    }
}
@keyframes scanner-cssload-loader {
    0% {
        transform: rotate(0deg);
    }

    25% {
        transform: rotate(180deg);
    }

    50% {
        transform: rotate(180deg);
    }

    75% {
        transform: rotate(360deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
@keyframes scanner-cssload-loader-inner {
    0% {
        height: 0%;
    }

    25% {
        height: 0%;
    }

    50% {
        height: 100%;
    }

    75% {
        height: 100%;
    }

    100% {
        height: 0%;
    }
}
</style>
