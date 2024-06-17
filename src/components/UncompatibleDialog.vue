<template>
    <el-dialog
        class="uncompatible-dialog"
        title="当前浏览器版本过低"
        :modelValue="dialogVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
    >
        <div class="dialog-content">
            <p style="margin-top: -10px">
                您当前使用的浏览器版本过低，部分功能可能无法正常使用。如需获得更好的体验，请升级或更换浏览器。
            </p>
            <div>
                推荐的浏览器：
                <ul>
                    <li><a href="https://www.google.cn/chrome/" target="_blank"> Google Chrome</a> v85及以上</li>
                    <li>
                        <a href="https://www.microsoft.com/zh-cn/windows/microsoft-edge" target="_blank">
                            Microsoft Edge</a
                        >
                        v85及以上
                    </li>
                </ul>
            </div>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <div class="continue-text">或者，您也可以选择</div>
                <el-button type="danger" size="large" plain class="continue-button" @click="dialogVisible = false">
                    在功能不完整的情况下继续使用当前浏览器
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script>
import { ref } from 'vue'
export default {
    setup() {
        const dialogVisible = ref(true)
        return {
            dialogVisible,
        }
    },
}
</script>

<style lang="scss">
.uncompatible-dialog {
    width: 400px;
    max-width: 90%;
    .dialog-content {
        a {
            color: #fe6565;
            &:hover {
                color: #d14444;
            }
        }
    }
    .continue-button {
        width: 100%;
        margin-top: 10px;
    }
    .continue-text {
        text-align: center;
        font-size: 14px;
        color: #666;
        margin-top: -25px;
    }
}
</style>
