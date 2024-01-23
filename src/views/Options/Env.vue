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

        <h4>本地资源管理</h4>
        <div class="cachemgr desc">
            如遇到加载问题，可尝试清空缓存与离线资源。这不会影响您的数据。
            <p>
                <el-button type="danger" plain @click="clearData">清除所有离线资源</el-button>
                <el-button v-if="hasSw" plain type="primary" @click="installData">强制更新离线资源</el-button>
            </p>
        </div>
    </section>
</template>
<script>
import { langNames } from '@/i18n'
import { options } from '@/store'
import { configuredMode } from '@/utils/darkmode'
import { ElNotification } from 'element-plus'
import * as comp from '@/utils/compatibility'
export default {
    setup() {
        const sw = window.$cocogoat.sw
        const hasSw = !!sw?.sw
        const report = async () => {
            const reporting = await import('@/utils/reporting')
            reporting.report()
        }
        const installData = async () => {
            sw.cacheAll(true)
        }
        const clearData = async () => {
            try {
                const manifestCache = await caches.open('cocogoat-sw-manifest')
                const cachedManifest = await manifestCache.match('/_sw/meta/registered')
                await caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
                if (cachedManifest) {
                    // 对于安装为 PWA 的用户，清除缓存后需要强制更新以确保离线时可用
                    await fetch('/_sw/register')
                    sw.cacheAll(true)
                } else {
                    alert('离线资源已清除，页面将重新加载以生效')
                    location.reload()
                }
            } catch (e) {
                ElNotification({
                    title: '清除失败',
                    message: '请联系开发者',
                    type: 'error',
                })
                throw e
            }
        }
        return {
            langNames,
            options,
            report,
            configuredMode,
            comp,
            UA: navigator.userAgent,
            installData,
            clearData,
            hasSw,
        }
    },
}
</script>
<style lang="scss" module>
.option-basic {
    padding: 0 20px;
    :global {
        h4 {
            margin: 10px 0;
        }
        .desc {
            color: var(--c-text-mid);
            padding: 10px;
            margin-bottom: 10px;
            font-size: 14px;
            b {
                color: darkred;
            }
        }
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
