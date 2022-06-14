<template>
    <Layout :class="$style.root">
        <template #title><span style="font-family: genshin">椰羊 · </span>志琼地图</template>
        <div :class="$style.client">
            <div :class="$style.title">
                <div class="icon"><fa-icon icon="map-location-dot" /></div>
                <h1>志琼</h1>
                <small>让你的原神地图能定位，可共享</small>
                <div class="tags">追踪定位 / 置顶悬浮 / 手机共享 / 多端同步</div>
                <div class="tags supported">支持的地图：米游社 / HoyoLab / 空荧酒馆 / 光环助手</div>
            </div>
            <div :class="$style.container">
                <div class="zq-mobile">
                    <el-divider>手机连接</el-divider>
                    <form @submit.prevent="openZq">
                        <div class="icon"><fa-icon icon="link" /></div>
                        <div class="text">电脑定位，手机同步</div>
                        <el-input
                            v-model="zqCode"
                            style="overflow: hidden"
                            size="large"
                            placeholder="九位连接码"
                            maxlength="9"
                            @keyup="toUpperInput"
                        >
                            <template #suffix>
                                <el-button
                                    :class="[$style.suffixBtn, zqCode.length === 9 ? 'show' : 'hide']"
                                    native-type="submit"
                                >
                                    <fa-icon icon="angle-right" />
                                </el-button>
                            </template>
                        </el-input>
                        <div class="version">仅支持配合电脑版使用</div>
                    </form>
                </div>
                <div class="zq-pc">
                    <el-divider>电脑使用</el-divider>
                    <div class="zq-pc-in">
                        <div class="windows item">
                            <div class="icon"><fa-icon :icon="['fab', 'microsoft']" /></div>
                            <div class="text">独立悬浮窗</div>
                            <a class="el-button el-button--large" :href="url" target="_blank">
                                <span>Game Bar悬浮窗</span>
                            </a>
                            <div class="version">v{{ version }} {{ size }}</div>
                        </div>
                        <div class="browser item">
                            <div class="icon"><fa-icon :icon="['fab', 'chrome']" /></div>
                            <div class="text">网页版插件</div>
                            <a class="el-button el-button--large" href="https://zhiqiong.vercel.app/sharedmap.user.js">
                                <span>安装油猴脚本</span>
                            </a>
                            <div class="version">自动更新</div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="options.showads">
                <div :class="$style.card" class="plz-card">
                    <div ref="ad" class="ad module"></div>
                    <div v-if="please" class="please">
                        <div class="text">
                            如果您希望支持我们，恳请您将本站加入广告屏蔽插件的白名单
                            <br />
                            我们承诺广告不会影响正常浏览，如不想看到此内容，可以在设置中关闭广告展示
                        </div>
                    </div>
                    <Adsense
                        data-ad-client="ca-pub-9385417627717996"
                        data-ad-slot="5933605883"
                        data-ad-format="horizontal"
                        data-full-width-responsive="true"
                    >
                    </Adsense>
                </div>
            </div>
        </div>
    </Layout>
</template>
<script lang="ts">
import { options } from '@/store'
import DlUpdate from '@/utils/dlUpdate'
import { defineComponent, ref, watch } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faMicrosoft, faChrome } from '@fortawesome/free-brands-svg-icons'
import { faLink, faMapLocationDot, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { apibase } from '@/utils/apibase'
import { ElMessageBox } from 'element-plus'
library.add(faMicrosoft, faChrome, faLink, faAngleRight, faMapLocationDot)
const latest = new DlUpdate('zhiqiong-uwp')
const lurl = ref('')
export default defineComponent({
    async beforeRouteEnter() {
        await latest.ready
        const u = new URL(latest.url.value)
        lurl.value = await apibase(u.pathname + u.search)
    },
    setup() {
        const ad = ref(null as HTMLElement | null)
        const please = ref(false)
        watch(
            () => ad.value,
            () => {
                if (ad.value) {
                    const len = ad.value.getClientRects().length
                    if (len <= 0) {
                        please.value = true
                    }
                }
            },
        )
        const zqCode = ref('')
        const openZq = async () => {
            if (zqCode.value.length !== 9) {
                return
            }
            const first = zqCode.value[0]
            if (!isNaN(Number(zqCode.value)) && (first === '1' || first === '2' || first === '5')) {
                ElMessageBox.alert(
                    '如不清楚如何获取连接码，请安装PC端油猴脚本或悬浮窗后在共享界面扫码连接。',
                    '连接码不是您的UID',
                    {
                        type: 'warning',
                        confirmButtonText: '知道了',
                    },
                )
                return
            }
            const a = document.createElement('a')
            a.href = 'https://zhiqiong.cocogoat.work/#/s/' + zqCode.value
            a.click()
        }
        const toUpperInput = () => {
            zqCode.value = zqCode.value.toUpperCase()
        }
        return {
            url: lurl,
            version: latest.version,
            size: latest.formattedSize,
            options,
            please,
            ad,
            openZq,
            zqCode,
            toUpperInput,
        }
    },
})
</script>
<style lang="scss" module>
.suffix-btn {
    width: 30px !important;
    height: 30px !important;
    margin: 0 !important;
    margin-right: -8px !important;
    transition: all 0.2s;
    &:global(.hide) {
        margin-right: -62px !important;
    }
}
.m-text {
    color: var(--c-text);
    font-size: 13px;
    margin-bottom: 10px;
    text-align: center;
    margin-top: -8px;
}
.root {
    :global(.pc) & {
        height: 100vh;
    }
}
.client {
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding-bottom: 140px;
    box-sizing: border-box;
    .title {
        margin-bottom: 30px;
        text-align: center;

        :global {
            .icon {
                font-size: 60px;
                color: var(--c-theme-sub);
            }

            h1 {
                margin: 10px auto;
            }

            .tags {
                color: var(--c-text-sub);
                font-size: 13px;
            }

            small {
                font-size: 14px;
                margin-top: -5px;
                margin-bottom: 5px;
                display: block;
            }
        }
    }

    .container {
        width: 100%;
        display: flex;
        flex-direction: row-reverse;
        justify-content: space-around;
        max-width: 650px;
        :global(.m) & {
            flex-direction: column;
        }
        :global {
            .zq-mobile {
                width: 200px;
                text-align: center;
                :global(.m) & {
                    width: 100%;
                    form {
                        width: 250px;
                        display: block;
                        margin: 0 auto;
                    }
                }
                .icon {
                    display: block;
                    text-align: center;
                    font-size: 60px;
                    color: var(--c-theme-sub);
                }
                .el-button {
                    width: 100%;
                    margin-top: 10px;
                }

                .el-input input {
                    text-align: center;
                }
            }

            .zq-pc {
                flex-basis: 50%;
                .zq-pc-in {
                    display: flex;
                    justify-content: space-between;
                    :global(.m) & {
                        padding: 0 30px;
                    }
                }
                .item {
                    text-align: center;

                    .icon {
                        font-size: 60px;
                        color: var(--c-theme-sub);
                    }

                    .el-button {
                        width: 150px;
                        text-decoration: none;
                    }
                }
            }
            .zq-pc,
            .zq-mobile {
                .text {
                    color: var(--c-text);
                    font-size: 13px;
                    margin-bottom: 10px;
                }

                .version {
                    color: var(--c-text-sub);
                    font-size: 12px;
                    margin-top: 10px;
                }
            }
        }
    }
    :global {
        .center {
            text-align: center;
            padding: 30px;
            .el-link {
                font-size: 20px;
            }
        }
        .plz-card {
            padding: 0px;
            position: absolute;
            height: 120px;
            text-align: center;
            left: 0;
            right: 0;
            bottom: 0;
            .please {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                padding: 15px;
                box-sizing: border-box;
            }
            .adswrapper {
                position: absolute;
                top: 0;
                left: 0;
                display: inline-block;
                max-height: 120px;
                width: 100%;
                max-width: 100%;
                text-align: center;
            }
        }
    }
}
</style>
