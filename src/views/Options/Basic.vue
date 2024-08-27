<template>
    <section :class="[$style.optionBasic, { [$style.optionBasicMoblie]: isMobile }]">
        <el-form label-position="right" label-width="130px">
            <el-form-item label="语言 (Language)">
                <div class="form-content">
                    <div class="select">
                        <el-select v-model="options.lang">
                            <el-option v-for="(i, a) in langNames" :key="a" :label="i" :value="a" />
                        </el-select>
                    </div>
                    <div class="desc">包含界面语言与识别器 OCR 语言。目前界面翻译基本未完成。</div>
                </div>
            </el-form-item>
            <el-form-item label="颜色模式">
                <div class="form-content">
                    <div class="select">
                        <el-select v-model="configuredMode">
                            <el-option label="跟随系统" value="auto" />
                            <el-option label="浅色模式" value="light" />
                            <el-option label="深色模式" value="dark" />
                        </el-select>
                    </div>
                </div>
            </el-form-item>
            <el-form-item label="错误报告和统计">
                <div class="form-content">
                    <div class="select">
                        <el-switch v-model="options.reporting"></el-switch>
                    </div>
                    <div class="desc">关闭后刷新页面生效。</div>
                </div>
            </el-form-item>
            <el-form-item label="展示广告">
                <div class="form-content">
                    <div class="select">
                        <el-switch v-model="options.showads"></el-switch>
                    </div>
                    <div class="desc">仅在首页出现的广告不会影响浏览，希望您能支持我们。</div>
                </div>
            </el-form-item>
        </el-form>
        <h4>关于</h4>
        <section class="about">
            <div class="logo"><icon-cocogoat /> 椰羊 cocogoat</div>
            <div class="copyright">&copy;2022-2024 YuehaiTeam <build-info /></div>
            <div v-if="options.reporting" class="logreport">
                <el-link @click="report">上传日志</el-link>
            </div>
        </section>
    </section>
</template>

<script>
import { toRef } from 'vue'
import bus from '@/bus'
import { langNames } from '@/i18n'
import { options } from '@/store'
import { configuredMode } from '@/utils/darkmode'
import IconCocogoat from '@/components/Icons/cocogoat.vue'
import BuildInfo from '@/components/BuildInfo.vue'
export default {
    components: {
        IconCocogoat,
        BuildInfo,
    },
    setup() {
        const report = async () => {
            const reporting = await import('@/utils/reporting')
            reporting.report()
        }
        return {
            isMobile: toRef(bus(), 'isMobile'),
            langNames,
            options,
            report,
            configuredMode,
        }
    },
}
</script>

<style lang="scss" module>
.option-basic {
    padding: 0 20px;
    :global {
        .select {
            width: 200px;
        }
        .about {
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 320px;
            align-items: center;
            text-align: center;
            .logo {
                height: 50px;
                color: var(--c-text);
                fill: var(--c-text);
                font-family: genshin;
                font-size: 30px;
                vertical-align: middle;
                svg {
                    width: 50px;
                    height: 50px;
                    vertical-align: top;
                    position: relative;
                    top: -4px;
                }
            }

            .copyright {
                font-family: Consolas, monospace;
                font-size: 16px;
            }

            .logreport {
                margin-top: 12px;
            }
        }
    }
}
.option-basic.option-basic-moblie {
    :global {
        .form-content {
            width: 100%;
        }
        .select {
            width: 100%;
        }
        .about {
            width: 100%;
        }
    }
}
</style>
