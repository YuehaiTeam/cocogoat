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
                </div>
            </el-form-item>
            <el-form-item v-if="options.reporting" label="手动发送错误报告">
                <div>
                    <el-button @click="report">点击发送错误报告</el-button>
                    <div class="report">
                        错误报告为匿名信息，无法提供任何反馈或修复通知。如需反馈问题，请在Github上发送issue或加入QQ交流群，并附上错误报告ID。
                    </div>
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
