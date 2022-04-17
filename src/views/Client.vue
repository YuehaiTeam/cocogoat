<template>
    <Layout full-height>
        <template #title><span style="font-family: genshin">椰羊 · </span>霜华插件</template>
        <div :class="$style.client">
            <div class="center">
                <el-link :href="url" type="primary">如果下载没有自动开始，请点击这里</el-link>
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
                        data-ad-slot="9527722224"
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
import { defineComponent, onMounted, ref, watch } from 'vue'
import latest from '@yuehaiteam/shuanghua-last-version'
export default defineComponent({
    setup() {
        onMounted(() => {
            // iframe download
            const iframe = document.createElement('iframe')
            iframe.style.display = 'none'
            iframe.src = latest.url
            document.body.appendChild(iframe)
        })
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
        return {
            url: latest.url,
            options,
            please,
            ad,
        }
    },
})
</script>
<style lang="scss" module>
.client {
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 200px;
    box-sizing: border-box;
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
