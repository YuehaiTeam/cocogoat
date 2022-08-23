<template>
    <section :class="$style.optionBasic">
        <h4>运行环境检测</h4>
        <div class="ua">
            {{ UA }}
        </div>
        <div class="envdiv">
            <div class="line">
                <div class="title">设备类型</div>
                <div class="title-c"></div>
                <div class="content">{{ comp.isAndroid ? 'Android' : comp.isIOS ? 'iOS' : '默认' }}</div>
            </div>
            <div class="line">
                <div class="title">浏览器</div>
                <div class="title-c"></div>
                <div class="content">{{ comp.isSafari ? 'Safari' : '默认' }}</div>
            </div>
            <div class="line">
                <div class="title">严格安全模式</div>
                <div class="title-c"></div>
                <div class="content">{{ comp.edgeStrictMode ? '已启用' : '未启用' }}</div>
            </div>
            <div class="line">
                <div class="title">图像识别</div>
                <div class="title-c"></div>
                <div class="content">{{ comp.ocrCompatible ? '完整支持' : '无法使用' }}</div>
            </div>
            <div class="line">
                <div class="title">读屏扫描</div>
                <div class="title-c"></div>
                <div class="content">{{ comp.scannerCompatible ? '完整支持' : '无法使用' }}</div>
            </div>
            <div class="line">
                <div class="title">屏幕共享</div>
                <div class="title-c"></div>
                <div class="content">{{ comp.hasGetDisplayMedia ? '支持' : '不支持' }}</div>
            </div>
            <div class="line">
                <div class="title">悬浮窗</div>
                <div class="title-c"></div>
                <div class="content">{{ comp.hasPictureInPicture ? '支持' : '不支持' }}</div>
            </div>
            <div class="line">
                <div class="title">视频解析</div>
                <div class="title-c"></div>
                <div class="content">{{ comp.hasRequestVideoFrameCallback ? '支持' : '不支持' }}</div>
            </div>
            <div class="line">
                <div class="title">WebAssembly</div>
                <div class="title-c"></div>
                <div class="content">{{ comp.hasWasm ? '支持' : '不支持' }}</div>
            </div>
            <div class="line">
                <div class="title">WASM SIMD</div>
                <div class="title-c"></div>
                <div class="content">{{ comp.hasSIMD ? '支持' : '不支持' }}</div>
            </div>
            <div class="line">
                <div class="title">WebCodecs</div>
                <div class="title-c"></div>
                <div class="content">{{ comp.hasWebCodecs ? '支持' : '不支持' }}</div>
            </div>
        </div>
    </section>
</template>
<script>
import { langNames } from '@/i18n'
import { options } from '@/store'
import { configuredMode } from '@/utils/darkmode'
import * as comp from '@/utils/compatibility'
export default {
    setup() {
        const report = async () => {
            const reporting = await import('@/utils/reporting')
            reporting.report()
        }
        return {
            langNames,
            options,
            report,
            configuredMode,
            comp,
            UA: navigator.userAgent,
        }
    },
}
</script>
<style lang="scss" module>
.option-basic {
    padding: 0 20px;
    :global {
        .envdiv {
            display: flex;
            flex-wrap: wrap;
            padding: 10px;
            padding-top: 0;
            margin: 10px;
            margin-top: 0;
            background: var(--c-menu);

            .line {
                font-size: 14px;
                padding: 10px 15px;
                text-align: center;
                .title {
                    font-weight: bold;
                    padding: 3px;
                }
                .title-c {
                    height: 2px;
                    width: 70%;
                    background: var(--c-theme);
                    margin: 0 auto;
                    margin-bottom: 10px;
                }
            }
        }
        .ua {
            font-family: Consolas, monospace;
            padding: 15px 20px;
            background: var(--c-menu);
            margin: 10px;
            margin-bottom: 0;
        }
    }
}
</style>
