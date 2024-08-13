<template>
    <!-- eslint-disable vue/no-parsing-error -->
    <div style="margin-top: -5px">
        <el-tabs v-model="activeName" stretch>
            <el-tab-pane label="本地导入" name="text">
                <div
                    :class="$style.textareaBox"
                    @dragover.prevent.stop
                    @dragleave.prevent
                    @drop.prevent.stop="onFileDrop"
                >
                    <el-input
                        v-model="content"
                        type="textarea"
                        :class="$style.textarea"
                        placeholder="在此粘贴导入内容、在右下方选择文件，或拖动文件到这里&#13;&#13;支持的导入项目：&#13; - 椰羊 JSON&#13; - Paimon.moe JSON&#13; - SEELIE.me JSON&#13; - 在 F12 页面执行的 JS 代码（椰羊、Paimon.moe、SEELIE.me）"
                    >
                    </el-input>
                    <el-button class="file-button" @click="fileEl?.click()">选择文件</el-button>
                    <input ref="fileEl" type="file" accept="text/plain,.json" @change="onSelectFile" />
                </div>
            </el-tab-pane>
            <el-tab-pane label="分享导入" name="memo">
                <div :class="$style.memoBox">
                    <div class="icon">
                        <fa-icon icon="cloud-bolt" />
                    </div>
                    <div class="desc">输入九位分享码，从分享数据导入成就</div>
                    <el-input
                        v-model="inputMemoId"
                        :disabled="memoLoading"
                        maxlength="9"
                        minlength="9"
                        size="large"
                        placeholder="INPUTCODE"
                    ></el-input>
                </div>
            </el-tab-pane>
        </el-tabs>
        <el-button :class="$style.importButton" size="large" type="primary" :disabled="!allowed" @click="doImport">
            {{ memoLoading ? '处理中' : importText }}
        </el-button>
    </div>
</template>

<script lang="ts">
import { debounce } from 'lodash-es'
import { useImport } from './useImport'
import { defineComponent, ref, toRef, watch } from 'vue'
import { apibase } from '@/utils/apibase'
import { ElNotification } from 'element-plus'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCloudBolt } from '@fortawesome/free-solid-svg-icons'
library.add(faCloudBolt)

export default defineComponent({
    props: {
        memoId: {
            type: String,
            required: true,
        },
    },
    emits: ['close'],
    setup(props, { emit }) {
        const content = ref('')
        const allowed = ref(false)
        const importText = ref('未识别到可导入的内容')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const importData = ref(null as any)
        const memoLoading = ref(false)
        const { checkContent, importToStore } = useImport(content, allowed, importText, importData)
        const debouncedCheck = debounce(() => {
            checkContent()
            memoLoading.value = false
            if (props.memoId && props.memoId === inputMemoId.value) {
                // autoimport
                importToStore()
                emit('close', inputMemoId.value)
                ElNotification.success({
                    title: '导入成功',
                    message: '已' + importText.value,
                })
            }
        }, 200)
        const inputMemoId = toRef(props, 'memoId')
        watch(
            () => props.memoId,
            (val) => {
                inputMemoId.value = val
            },
        )
        const checkMemo = async (val: string) => {
            if (val.length !== 9) {
                content.value = ''
                return
            }
            memoLoading.value = true
            try {
                const res = await fetch(await apibase('/v2/memo/' + val))
                if (res.ok) {
                    const data = await res.json()
                    if (data.id && data.id === val) {
                        content.value = JSON.stringify(data, null, 4)
                    } else {
                        throw new Error('memo not found')
                    }
                } else {
                    throw new Error('memo not found')
                }
            } catch (e) {
                memoLoading.value = false
            }
        }
        watch(inputMemoId, checkMemo, { immediate: true })
        watch(content, debouncedCheck)
        // eslint-disable-next-line vue/no-ref-object-destructure
        const activeName = ref(inputMemoId.value ? 'memo' : 'text')
        const doImport = async () => {
            if (!allowed.value) return
            importToStore()
            // eslint-disable-next-line vue/no-ref-object-destructure
            emit('close', inputMemoId.value)
        }
        const onFile = async (e: File) => {
            // ensure file is json
            if (e.type.includes('image/') || e.type.includes('video/') || e.type.includes('audio/')) {
                ElNotification.error({
                    title: '似乎找错了位置',
                    message: '如需扫描图片或者视频中的成就，请使用【扫描】功能',
                })
                return
            }
            // read to content
            const reader = new FileReader()
            reader.onload = (e) => {
                if (e.target?.result) {
                    content.value = e.target.result as string
                }
            }
            reader.readAsText(e)
        }
        const onSelectFile = (e: Event) => {
            if (!e.target) return
            const files = (e.target as HTMLInputElement).files
            if (!files) return
            onFile(files[0])
        }
        const onFileDrop = (e: DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            const files = (e.dataTransfer as DataTransfer).files
            if (!files) return
            onFile(files[0])
        }
        return {
            content,
            allowed,
            importText,
            doImport,
            activeName,
            memoLoading,
            inputMemoId,
            onSelectFile,
            onFileDrop,
            fileEl: ref(null as HTMLInputElement | null),
        }
    },
})
</script>

<style lang="scss" module>
.textarea textarea {
    font-size: 12px;
    height: 240px;
    font-family: Consolas, monospace;
}
.textarea-box {
    position: relative;

    :global {
        .file-button {
            position: absolute;
            bottom: 10px;
            right: 10px;
        }
        input[type='file'] {
            display: none;
        }
    }
}
.memo-box {
    height: 240px;
    padding-top: 20px;
    box-sizing: border-box;
    :global {
        .icon {
            text-align: center;
            font-size: 55px;
            padding: 10px;
            box-sizing: border-box;
            color: var(--c-text-mid);
        }
        .desc {
            text-align: center;
            margin-top: -5px;
            margin-bottom: 20px;
            font-size: 12px;
            color: var(--c-text-sub);
        }
        .el-input {
            width: 250px;
            display: block;
            margin: 0 auto;
            input {
                text-align: center;
                height: 50px;
                font-size: 25px;
                font-family: Consolas, monospace;
                border-radius: 0;
            }
        }
    }
}
.import-button {
    display: block;
    margin-top: 15px;
    width: calc(100% + var(--el-dialog-padding-primary) * 2);
    margin-bottom: -30px;
    margin-left: calc(-1 * var(--el-dialog-padding-primary));
    height: 50px;
    border-radius: 0;
    border-left: 0;
    border-right: 0;
    border-bottom: 0;
}
</style>
