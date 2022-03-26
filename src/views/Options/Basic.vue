<template>
    <section :class="$style.optionBasic">
        <el-form>
            <el-form-item label="语言(Language)">
                <div>
                    <div class="select">
                        <el-select v-model="options.lang">
                            <el-option v-for="(i, a) in langNames" :key="a" :label="i" :value="a" />
                        </el-select>
                    </div>
                    <div class="desc">包含界面语言与识别器OCR语言。目前界面翻译基本未完成。</div>
                </div>
            </el-form-item>
            <el-form-item label="错误报告和统计">
                <div>
                    <div class="select">
                        <el-switch v-model="options.reporting"></el-switch>
                    </div>
                    <div class="desc">关闭后刷新页面生效。</div>
                    <el-button v-if="options.reporting" @click="report">问题反馈</el-button>
                </div>
            </el-form-item>
        </el-form>
    </section>
</template>

<script>
import { langNames } from '@/i18n'
import { options } from '@/store'
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
        }
    },
}
</script>

<style lang="scss" module>
.option-basic {
    padding: 0 20px;
}
</style>
