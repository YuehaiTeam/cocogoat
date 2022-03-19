<template>
    <div>
        <Loader v-if="!load" @done="load = true" />
        <div v-else :class="$style.scannerEntrance">
            <h1>
                椰羊·成就扫描
                <small>请选择扫描方式</small>
            </h1>
            <div class="method-list">
                <router-link
                    :to="{ name: 'frames.achievement.scan.capture-scanner', params: { direct: true } }"
                    class="one"
                    :class="{ disabled: !scannerCompatible }"
                >
                    <i>
                        <fa-icon icon="desktop" />
                    </i>
                    <h2>
                        自动扫描
                        <small v-if="scannerCompatible">
                            <div>自动滚动自动扫描</div>
                            <div>推荐电脑用户使用</div>
                        </small>
                        <small v-else style="color: #fe6565">
                            <div>暂不支持该浏览器</div>
                            <div style="font-size: 12px">请换用Chrome或Edge</div>
                        </small>
                    </h2>
                </router-link>
                <router-link class="one disabled" :to="{ name: 'frames.achievement.scan' }">
                    <i>
                        <fa-icon icon="crop-simple" />
                    </i>
                    <h2>
                        截图识别
                        <small>
                            <div>手动截图上传识别</div>
                            <div>暂未开发敬请期待</div>
                        </small>
                    </h2>
                </router-link>
            </div>
            <div class="line-entrance">
                <router-link :to="{ name: 'frames.achievement.scan.line-scanner' }">
                    <i>
                        <fa-icon icon="clipboard-list" />
                    </i>
                    <h2>图片集识别</h2>
                    <small>导入第三方扫描器的图片结果</small>
                </router-link>
            </div>
            <FooterComponent />
        </div>
    </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import Loader from './Common/Loader.vue'
import Footer from './Common/Footer.vue'
import { scannerCompatible } from '@/utils/compatibility'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faDesktop, faCropSimple, faClipboardList } from '@fortawesome/free-solid-svg-icons'
library.add(faDesktop, faCropSimple, faClipboardList)

export default defineComponent({
    components: {
        Loader,
        FooterComponent: Footer,
    },
    setup() {
        const load = ref(false)
        return {
            load,
            scannerCompatible,
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
                color: #555;
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
                        color: #777;
                        margin-top: 9px;
                    }
                }
                &:hover {
                    border-color: #aaa;
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
                color: #555;
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
