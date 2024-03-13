<template>
    <Layout :class="$style.home">
        <template #title><span style="font-family: genshin">椰羊 · 首页</span></template>
        <div :class="$style.root">
            <h1 :class="$style.title">
                椰羊 cocogoat
                <small>纯网页圣遗物管理·成就扫描·更多功能开发中</small>
            </h1>
            <div v-if="apistatus" :class="$style.apistatus">
                <el-alert type="warning" :title="apistatus" show-icon :closable="false" />
            </div>
            <div>
                <div :class="$style.card">
                    <div class="card-title">额外工具</div>
                    <div class="card-body">
                        <router-link :class="$style.extraOne" style="color: #0079cc" :to="{ name: 'installer.index' }">
                            <div class="circle">
                                <div class="img" style="border-color: #0079cc">
                                    <fa-icon icon="box-open" />
                                </div>
                                <div class="svg-w" style="background: #0079cc">
                                    <icon-cocogoat style="fill: #fff" />
                                </div>
                            </div>
                            <div class="text">PC 端<br />更新包列表</div>
                        </router-link>
                        <a
                            :class="$style.extraOne"
                            style="color: #ef930b"
                            href="https://yuehaiteam.github.io/webstatic-extractor/"
                            target="_blank"
                        >
                            <div class="circle">
                                <div class="img" style="border-color: #ef930b">
                                    <fa-icon icon="file-zipper" />
                                </div>
                                <div class="svg-w" style="background: #ef930b">
                                    <icon-cocogoat style="fill: #fff" />
                                </div>
                            </div>
                            <div class="text">WebStatic<br />Extractor</div>
                        </a>

                        <router-link :class="$style.extraOne" style="color: #009892" :to="{ name: 'zhiqiong' }">
                            <div class="circle">
                                <div class="img" style="border-color: #009892">
                                    <fa-icon icon="map-location-dot" />
                                </div>
                                <div class="svg-w" style="background: #009892">
                                    <icon-cocogoat style="fill: #fff" />
                                </div>
                            </div>
                            <div class="text">志琼<br />米游社地图插件</div>
                        </router-link>

                        <router-link
                            :class="$style.extraOne"
                            style="color: var(--c-text)"
                            :to="{ name: 'extra.playground' }"
                        >
                            <div class="circle">
                                <div class="img" style="border-color: var(--c-text)">
                                    <fa-icon icon="terminal" />
                                </div>
                                <div class="svg-w" style="background: var(--c-text)">
                                    <icon-cocogoat style="fill: var(--c-white)" />
                                </div>
                            </div>
                            <div class="text">OpenCV.js<br />Playground</div>
                        </router-link>
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
                        data-ad-slot="7187871056"
                        data-ad-format="horizontal"
                        data-full-width-responsive="false"
                    >
                    </Adsense>
                </div>
            </div>
            <div :class="$style.cardList">
                <a :class="$style.card" href="https://github.com/YuehaiTeam/cocogoat" target="_blank">
                    <fa-icon :icon="['fab', 'github-alt']" />
                    <h4>开源地址</h4>
                    <div>本工具已在 GitHub 以 BSD-3 协议完全开源，可任意修改使用</div>
                </a>
                <a :class="$style.card" href="https://github.com/YuehaiTeam/cocogoat/tree/main/docs" target="_blank">
                    <fa-icon icon="infinity" />
                    <h4>接入文档</h4>
                    <div>本工具中各类扫描器组件均提供接口，可以嵌入到任何项目中</div>
                </a>
                <a
                    :class="$style.card"
                    href="https://github.com/YuehaiTeam/cocogoat/actions/workflows/build-singlefile.yml"
                    target="_blank"
                >
                    <fa-icon icon="folder-tree" />
                    <h4>本地使用</h4>
                    <div>如需离线使用，请点这里下载本地专用版</div>
                </a>
                <a :class="$style.card" href="https://github.com/YuehaiTeam/cocogoat/issues" target="_blank">
                    <fa-icon :icon="['far', 'circle-dot']" />
                    <h4>功能反馈</h4>
                    <div>无论遇到问题还是请求新功能，都可以前往 GitHub Issues 反馈</div>
                </a>
                <a :class="$style.card" href="https://github.com/YuehaiTeam/cocogoat/discussions" target="_blank">
                    <fa-icon icon="message" />
                    <h4>社区交流</h4>
                    <div>前往 GitHub Discussions 进行聊天吹水和其他非正式讨论</div>
                </a>
            </div>
            <div :class="$style.copyright">&copy;2022-2024 YuehaiTeam cocogoat.work <build-info /></div>
        </div>
    </Layout>
</template>

<script lang="ts">
import { ref, defineComponent, watch } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
    faBoxOpen,
    faFileZipper,
    faFolderTree,
    faInfinity,
    faMapLocationDot,
    faMessage,
    faTerminal,
} from '@fortawesome/free-solid-svg-icons'
import { faCircleDot } from '@fortawesome/free-regular-svg-icons'
import { faGithubAlt } from '@fortawesome/free-brands-svg-icons'
library.add(
    faBoxOpen,
    faCircleDot,
    faFileZipper,
    faFolderTree,
    faGithubAlt,
    faInfinity,
    faMapLocationDot,
    faMessage,
    faTerminal,
)

import IconCocogoat from '@/components/Icons/cocogoat.vue'
import BuildInfo from '@/components/BuildInfo.vue'
import { options } from '@/store'
import { apibase, apistatus } from '@/utils/apibase'
import { clicktxc } from '@/utils/txc'

export default defineComponent({
    name: 'HomeView',
    components: {
        IconCocogoat,
        BuildInfo,
    },
    setup() {
        const ad = ref(null as HTMLElement | null)
        const please = ref(false)
        apibase('/')
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
        return { ad, please, options, apistatus, clicktxc }
    },
})
</script>
<style lang="scss" module>
.home {
    background: var(--c-background);
}
.root {
    padding: 20px;
}
.apistatus {
    padding: 0 10px;
    margin-bottom: 10px;
}
:global(.m) {
    .root {
        padding: 20px 5px;
    }
    .title {
        padding: 0;
        text-align: center;
        small {
            display: block;
            padding: 10px 0;
        }
    }
}
.title {
    margin: 0;
    color: var(--c-text-theme-sub);
    font-family: genshin;
    font-weight: normal;
    font-size: 40px;
    padding: 15px;
    small {
        font-family: ui-serif;
        font-size: 15px;
        color: var(--c-text-mid);
    }
}
.card-list {
    display: flex;

    @media screen and (max-width: 768px) {
        flex-wrap: wrap;
    }
}

.card {
    flex: 1;
    margin: 10px;
    background: var(--c-white);
    border-radius: 3px;
    padding: 15px;
    box-shadow: var(--el-box-shadow-base);
    font-size: 14px;
    position: relative;
    color: var(--c-text-theme-sub);
    transition: all 0.3s;

    @media screen and (max-width: 768px) {
        min-width: 40%;
    }
    h4 {
        margin: 0;
        font-size: 30px;
        opacity: 0.7;
        position: absolute;
        top: 18px;
        right: 15px;
        text-align: right;
        vertical-align: top;
        font-weight: 100;
    }
    svg {
        font-size: 50px;
        display: block;
        height: 50px;
        width: 50px;
    }
    & > div {
        color: var(--c-text-sub);
        margin-top: 15px;
    }
    @media screen and (max-width: 1000px) {
        h4 {
            font-size: 20px;
        }
        svg {
            font-size: 30px;
            height: 30px;
            width: 30px;
        }
    }
    :global {
        .card-title {
            margin-top: -5px;
            font-size: 17px;
            font-weight: normal;
            border-bottom: 1px solid var(--c-border);
            padding-bottom: 10px;
            margin-bottom: 10px;
        }
    }
    &:global(.plz-card) {
        padding: 0px;
        position: relative;
        height: 120px;
        text-align: center;
        :global(.please) {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            padding: 15px;
            box-sizing: border-box;
        }
        :global(.adswrapper) {
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
a.card {
    cursor: pointer;
    text-decoration: none !important;
    &:hover {
        transform: translateY(-5px);
    }
}
.extra-one {
    width: 120px;
    height: 148px;
    display: inline-block;
    box-sizing: border-box;
    padding: 10px;
    text-align: center;
    border-radius: 3px;
    transition: all 0.2s;
    color: #af7400;
    margin: 10px;
    text-decoration: none !important;
    &:hover {
        background: var(--c-background);
    }
    :global {
        .text {
            font-size: 13px;
            line-height: 13px;
            padding-top: 10px;
        }
        .circle {
            position: relative;
            width: 88px;
            height: 88px;
            margin: 0 auto;
            padding-right: 5px;
            img,
            .img {
                width: 100%;
                height: 100%;
                border-radius: 100%;
                border: 2px solid #e3c996;
                &.img {
                    display: flex;
                    align-content: center;
                    justify-content: center;
                    align-items: center;
                    box-sizing: border-box;
                }
                .svg-inline--fa {
                    width: 40px;
                    &.fa-file-zipper {
                        width: 30px;
                    }
                }
            }

            .svg-w {
                position: absolute;
                bottom: -5px;
                right: -5px;
                width: 40px;
                height: 40px;
                background: #e3c996;
                border-radius: 100%;
                svg {
                    width: 35px;
                    height: 32px;
                    display: block;
                    margin: 0 auto;
                    padding-top: 4px;
                    fill: #af7400;
                }
            }
        }
    }
}
.copyright {
    color: #555;
    font-size: 12px;
    text-align: center;
    margin-top: 10px;
}
</style>
