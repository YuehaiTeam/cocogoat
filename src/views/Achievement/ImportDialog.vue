<template>
    <!-- eslint-disable vue/no-parsing-error -->
    <div>
        <el-input
            v-model="content"
            type="textarea"
            :class="$style.textarea"
            placeholder="支持的导入项目：&#13; - 椰羊JSON&#13; - Paimon.moe JSON&#13; - 在F12页面执行的JS代码(椰羊、Paimon.moe、Seelie.me)"
        ></el-input>
        <el-button :class="$style.importButton" size="large" type="primary" :disabled="!allowed" @click="doImport">
            {{ importText }}
        </el-button>
    </div>
</template>

<script lang="ts">
import { debounce } from 'lodash'
import { useImport } from './useImport'
import { defineComponent, ref, watch } from 'vue'
export default defineComponent({
    emits: ['close'],
    setup(props, { emit }) {
        const content = ref('')
        const allowed = ref(false)
        const importText = ref('未识别到可导入的内容')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const importData = ref(null as any)
        const importType = ref('')
        const { checkContent, importToStore } = useImport(content, allowed, importText, importData, importType)
        const debouncedCheck = debounce(checkContent, 200)
        watch(content, debouncedCheck)
        const doImport = async () => {
            if (!allowed.value) return
            importToStore()
            emit('close')
        }
        return {
            content,
            allowed,
            importText,
            doImport,
        }
    },
})
</script>

<style lang="scss" module>
.textarea textarea {
    font-size: 12px;
    height: 300px;
    font-family: Consolas, monospace;
}
.import-button {
    display: block;
    margin-top: 20px;
    width: calc(100% + 40px);
    margin-bottom: -30px;
    margin-left: -20px;
    height: 50px;
    border-radius: 0;
    border-left: 0;
    border-right: 0;
    border-bottom: 0;
}
</style>
