<template>
    <div>
        <div v-if="!ocrCompatible" :class="$style.showUncompatible">
            <span class="l">
                <fa-icon :icon="['fab', 'internet-explorer']" />
                <span class="x">
                    <fa-icon icon="triangle-exclamation" />
                </span>
            </span>
            <div class="text">当前浏览器不支持此功能<br />请升级或更换浏览器</div>
        </div>
        <div v-else class="scanner-loading">
            <div :class="$style.loader">
                <div class="loader-animation">
                    <span class="cssload-loader"><span class="cssload-loader-inner"></span></span>
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
import { ref, defineComponent, onMounted } from 'vue'
import { ocrCompatible } from '@/utils/compatibility'
import { getScannerInstance } from '../scanner/scanner.client'
import { send } from '../utils'

export default defineComponent({
    emits: ['done'],
    setup(props, { emit }) {
        const progress = ref(0)
        const progressText = ref(process.env.VUE_APP_SINGLEFILE === 'true' ? '解压资源文件' : '获取资源地址')
        onMounted(async () => {
            if (!ocrCompatible) {
                return
            }
            const instance = getScannerInstance()
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.$cocogoat.artifact_scanner_instance = instance
            instance.onProgress((pvalue) => {
                if (progress.value < 0) {
                    return
                }
                send('load', pvalue)
                progress.value = pvalue
                if (pvalue < -90) {
                    send('load', false)
                    progressText.value = '应用初始化失败, 请联系开发者'
                    return
                }
                if (pvalue < 0) {
                    send('load', false)
                    progressText.value = '加载失败, 请刷新重试或联系开发者'
                    return
                }
                progressText.value = ''
                if (pvalue >= 100) {
                    progressText.value = '校验完整性'
                    setTimeout(() => {
                        send('load', true)
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
    padding-top: 40vh;
    color: #666;
    text-align: center;
    font-size: 14px;
    margin: 0 auto;
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
