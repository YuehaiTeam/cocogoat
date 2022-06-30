<template>
    <div>
        <div v-if="!ocrCompatible" :class="$style.showUncompatible">
            <span class="l">
                <fa-icon :icon="['fab', 'internet-explorer']" />
                <span class="x">
                    <fa-icon icon="triangle-exclamation" />
                </span>
            </span>
            <div v-if="!edgeStrictMode" class="text">当前浏览器不支持此功能<br />请升级或更换浏览器</div>
            <div v-else class="text">请对本站禁用Edge浏览器的“增强安全模式”以使用此功能</div>
        </div>
        <div v-else class="scanner-loading">
            <div :class="$style.loader">
                <div class="loader-animation">
                    <icon-loading class="loader-svg" :percent="progress * 0.88 + 5" />
                </div>
                <div class="loader-text">椰羊正在饮甘露，马上就来</div>
                <div class="loader-progress">
                    <div class="loader-progress-bar" :style="{ width: progress + '%' }"></div>
                </div>
                <div class="loader-progress-text">
                    <span>{{ progressText || `${progress.toFixed(2)}%` }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted, PropType } from 'vue'
import { ocrCompatible, edgeStrictMode } from '@/utils/compatibility'
import { send } from './utils'
import IconLoading from '@/components/Icons/loading.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { faInternetExplorer } from '@fortawesome/free-brands-svg-icons'
library.add(faTriangleExclamation, faInternetExplorer)

export default defineComponent({
    components: {
        IconLoading,
    },
    props: {
        source: {
            type: String,
            required: true,
        },
        instance: {
            type: Function as PropType<
                () => {
                    initPromise: Promise<unknown>
                    onProgress: (handler: (progress: number) => unknown) => void
                }
            >,
            required: true,
        },
    },
    emits: ['done'],
    setup(props, { emit }) {
        const progress = ref(0)
        const progressText = ref(process.env.VUE_APP_SINGLEFILE === 'true' ? '解压资源文件' : '获取资源地址')
        onMounted(async () => {
            if (!ocrCompatible) {
                return
            }
            const instance = props.instance()
            instance.onProgress((pvalue) => {
                if (progress.value < 0) {
                    return
                }
                send('load', pvalue, props.source)
                progress.value = pvalue
                if (pvalue < -90) {
                    send('load', false, props.source)
                    progressText.value = '应用初始化失败, 请联系开发者'
                    return
                }
                if (pvalue < 0) {
                    send('load', false, props.source)
                    progressText.value = '加载失败, 请刷新重试或联系开发者'
                    return
                }
                progressText.value = ''
                if (pvalue >= 100) {
                    progressText.value = '校验完整性'
                    setTimeout(() => {
                        send('load', true, props.source)
                        progressText.value = '应用初始化'
                    }, 140)
                }
            })
            instance.initPromise.then(() => {
                emit('done')
            })
        })
        return {
            ocrCompatible,
            progress,
            progressText,
            edgeStrictMode,
        }
    },
})
</script>

<style lang="scss" module>
.show-uncompatible {
    width: 200px;
    padding-top: 30vh;
    margin: 0 auto;
    text-align: center;
    user-select: none;
    :global {
        .l {
            display: inline-block;
            font-size: 120px;
            color: #777;
            position: relative;
            margin-left: -10px;
            .x {
                font-size: 50px;
                position: absolute;
                color: #444;
                bottom: 7px;
                right: -21px;
            }
        }
        .text {
            color: #888;
            margin-top: 8px;
            font-size: 14px;
        }
    }
}

.loader {
    width: 200px;
    padding-top: 35vh;
    color: #666;
    text-align: center;
    font-size: 14px;
    margin: 0 auto;
    :global {
        .loader-text {
            padding-top: 15px;
        }
        .loader-svg {
            width: 80px;
            height: 80px;
            fill: #555555;
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
            background: var(--c-background);
            display: inline-block;
            padding: 0 4px;
        }
    }
}
</style>
