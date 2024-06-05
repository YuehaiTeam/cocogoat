<template>
    <div>
        <div :class="$style.switcher">
            <a v-if="loading" href="javascript:">检测中</a>
            <a v-else-if="!modelValue" href="javascript:" @click="enable">{{
                gameNotFound
                    ? '未检测到支持的原神窗口，当前暂未支持云游戏等，点击重试'
                    : denied
                      ? '您拒绝了自动滚动所需的权限申请，点击重试'
                      : '当前需要进行部分手动操作，点我启用自动滚动'
            }}</a>
            <a v-else href="javascript:" @click="$emit('update:modelValue', 0)">关闭自动滚动</a>
        </div>
        <teleport to="body">
            <div v-if="showModel" :class="$style.modelBackdrop">
                <div class="model">
                    <div class="title">
                        {{ needUpdate ? '您的客户端版本过低' : '自动滚动需要客户端' }}
                        <small v-if="needUpdate">(v{{ version }})</small>
                    </div>
                    <div class="content">
                        由于浏览器限制，自动滚动无法在网页完成
                        <a class="dlink" href="/extra/client" target="_blank">
                            如果插件没有自动启动，请点击此处下载辅助插件<small>（v{{ cVersion }} {{ cSize }}）</small>
                        </a>
                        <button @click="enable">
                            {{ loading ? '检测中' : needUpdate ? '我已更新并重新运行客户端' : '我已下载并运行客户端' }}
                        </button>
                        <a class="cancel" href="javascript:" @click="showModel = false">取消</a>
                    </div>
                </div>
            </div>
        </teleport>
    </div>
</template>

<script lang="ts">
import { CocogoatWebControl } from '@/modules/webcontrol'
import { ref, defineComponent, PropType, toRef, Ref } from 'vue'
import DlUpdate from '@/utils/dlUpdate'
const latest = new DlUpdate('frostflake')
export default defineComponent({
    props: {
        modelValue: Number,
        w: {
            type: Object as PropType<CocogoatWebControl>,
            required: true,
        },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const w = toRef(props, 'w') as Ref<CocogoatWebControl>
        const loading = ref(false)
        const showModel = ref(false)
        const denied = ref(false)
        const gameNotFound = ref(false)
        const needUpdate = ref(false)
        const version = ref('')
        const enable = async () => {
            if (loading.value) return
            loading.value = true
            const alive = await w.value.check()
            if (!alive) {
                showModel.value = true
                loading.value = false
                needUpdate.value = false
                return
            } else if (w.value.version !== '1.0.4') {
                needUpdate.value = true
                showModel.value = true
                loading.value = false
                version.value = w.value.version
                return
            } else {
                needUpdate.value = false
                try {
                    const authorized = await w.value.authorize()
                    if (authorized) {
                        let windows = await w.value.listWindows()
                        windows = windows.filter(
                            (w) =>
                                (w.title.includes('原神') || w.title.toLowerCase().includes('genshin')) &&
                                w.classname === 'UnityWndClass',
                        )
                        if (windows.length === 0) {
                            showModel.value = false
                            loading.value = false
                            gameNotFound.value = true
                            return
                        }
                        emit('update:modelValue', windows[0].hWnd)
                    } else {
                        denied.value = true
                    }
                } catch (e) {}
                showModel.value = false
            }
            loading.value = false
        }
        return {
            loading,
            showModel,
            enable,
            denied,
            gameNotFound,
            needUpdate,
            version,
            cVersion: latest.version,
            cSize: latest.formattedSize,
        }
    },
})
</script>

<style lang="scss" module>
.switcher a {
    color: #0067d1;
    text-decoration: none;
    display: block;
    text-align: center;
    margin-top: 20px;
}

.model-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    :global {
        .model {
            width: 380px;
            height: 250px;
            max-width: 100%;
            background: #fff;
            border-radius: 10px;
            margin: 0 auto;
            margin-top: calc(30vh - 100px);
            text-align: center;
            padding: 20px;
            box-sizing: border-box;

            .title {
                font-size: 23px;
                margin-bottom: 10px;
            }
            button {
                width: 230px;
                height: 45px;
                background: #333;
                border-radius: 45px;
                border: 0;
                color: #fff;
                display: block;
                margin: 20px auto;
                margin-bottom: 15px;
                font-size: 15px;
                cursor: pointer;
                transition: all 0.2s;
            }

            a {
                color: #555;
                text-decoration: none;
                &.dlink {
                    margin-top: 8px;
                    display: block;
                    color: #0068b7;
                }
            }
        }
    }
}
</style>
