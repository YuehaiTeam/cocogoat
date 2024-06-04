<template>
    <div>
        <Loader v-if="!load" source="achievement" :instance="getScannerInstance" @done="load = true" />
        <div v-else :class="$style.scannerEntrance">
            <h1>
                椰羊·成就扫描
                <small>请选择扫描方式</small>
            </h1>
            <div class="method-list">
                <router-link
                    :to="{ name: 'frames.achievement.scan.capture-scanner', params: { direct: 'true' } }"
                    class="one"
                    :class="{ disabled: !scannerCompatible }"
                >
                    <i>
                        <fa-icon icon="desktop" />
                    </i>
                    <h2>
                        读屏扫描
                        <small v-if="scannerCompatible">
                            <div>滚动页面自动扫描</div>
                            <div>推荐电脑用户使用</div>
                        </small>
                        <small v-else style="color: #fe6565">
                            <div>暂不支持该浏览器</div>
                            <div style="font-size: 12px">请换用 Chrome 或 Edge</div>
                        </small>
                    </h2>
                </router-link>
                <router-link
                    class="one"
                    :to="{ name: 'frames.achievement.scan.rvfc-scanner' }"
                    :class="{ disabled: !hasRequestVideoFrameCallback }"
                >
                    <i>
                        <fa-icon icon="photo-film" />
                    </i>
                    <h2>
                        录屏识别
                        <small v-if="hasRequestVideoFrameCallback">
                            <div>上传录屏文件识别</div>
                            <div>手机用户可以选择</div>
                        </small>
                        <small v-else style="color: #fe6565">
                            <div>暂不支持该浏览器</div>
                            <div style="font-size: 12px">
                                {{ isIOS ? '仅支持 iOS 15.4 及以上' : '请换用 Chrome 或 Edge' }}
                            </div>
                        </small>
                    </h2>
                </router-link>
            </div>
            <div class="line-entrance">
                <router-link :to="{ name: 'frames.achievement.scan.screenshot-scanner' }">
                    <i>
                        <fa-icon icon="crop-simple" />
                    </i>
                    <h2>截图识别</h2>
                    <small>手动截图上传识别</small>
                </router-link>
                <router-link :to="{ name: 'frames.achievement.scan.line-scanner' }">
                    <i>
                        <fa-icon icon="clipboard-list" />
                    </i>
                    <h2>图片集识别</h2>
                    <small>导入第三方扫描器的图片结果</small>
                </router-link>
            </div>
            <FooterComponent name="成就" />
        </div>
    </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import Loader from '@/components/Scanner/Loader.vue'
import Footer from '@/components/Scanner/Footer.vue'
import { scannerCompatible, hasRequestVideoFrameCallback, isIOS } from '@/utils/compatibility'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faDesktop, faCropSimple, faClipboardList, faPhotoFilm } from '@fortawesome/free-solid-svg-icons'
import { getScannerInstance } from './scanner/scanner.worker'
library.add(faDesktop, faCropSimple, faClipboardList, faPhotoFilm)

export default defineComponent({
    components: {
        Loader,
        FooterComponent: Footer,
    },
    setup() {
        const load = ref(false)
        return {
            load,
            isIOS,
            scannerCompatible,
            getScannerInstance,
            hasRequestVideoFrameCallback,
        }
    },
})
</script>

<style lang="scss" module>
.scanner-entrance {
    :global {
        h1 {
            margin: 0;
            padding: 20px;
            text-align: center;
            font-weight: normal;
            font-size: 25px;
            padding-top: 16vh;
            small {
                color: #888;
                display: block;
                font-size: 14px;
                margin-top: 10px;
            }
        }

        .method-list {
            display: flex;
            justify-content: space-between;
            width: 350px;
            max-width: 100%;
            margin: 0 auto;
            margin-top: 25px;
            flex-wrap: wrap;
            .one {
                margin: auto;
                width: 150px;
                padding-top: 13px;
                border: 1px solid #ddd;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.2s;
                color: var(--c-text);
                text-decoration: none;
                i {
                    font-size: 40px;
                    display: block;
                    text-align: center;
                }
                h2 {
                    font-weight: normal;
                    text-align: center;
                    font-size: 18px;
                    small {
                        display: block;
                        font-size: 13px;
                        color: var(--c-text-sub);
                        margin-top: 9px;
                    }
                }
                &:hover {
                    border-color: var(--c-text-sub);
                    transform: translateY(-4px);
                }
                &.disabled {
                    pointer-events: none;
                    opacity: 0.5;
                }
            }
        }
        .line-entrance {
            a {
                display: block;
                margin: 30px auto;
                border: 1px solid #ddd;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.2s;
                color: var(--c-text);
                text-decoration: none;
                width: 330px;
                display: block;
                line-height: 40px;
                text-align: center;
                height: 40px;
                &:hover {
                    border-color: #aaa;
                    transform: translateY(-4px);
                }
                & + a {
                    margin-top: -20px;
                }
            }

            h2 {
                display: inline-block;
                font-size: 15px;
                font-weight: normal;
                height: 40px;
                vertical-align: top;
                margin: 0;
            }

            i {
                font-size: 20px;
                margin-right: 10px;
                margin-top: -1px;
                height: 40px;
                display: inline-block;
            }

            small {
                font-size: 12px;
                display: inline-block;
                padding-left: 8px;
                height: 40px;
                vertical-align: top;
                color: #999;
            }
        }
    }
}
</style>
