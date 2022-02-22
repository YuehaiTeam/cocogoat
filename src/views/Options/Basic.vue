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
        </el-form>
    </section>
</template>

<script>
import { langNames } from '@/i18n'
import { options } from '@/store'
export default {
    setup() {
        return {
            langNames,
            options,
        }
    },
}
</script>

<style lang="scss" module>
.option-basic {
    padding: 0 20px;
}
</style>
