<template>
    <div>
        <div v-if="state === 0" class="wait-page">
            <div class="icon"></div>
            <div class="text">请切换到游戏窗口<br />打开"天地万象"页面</div>
        </div>
        <div v-if="state === 1" class="down-page">
            <div class="icon"></div>
            <div class="text">
                <div class="count">
                    <div class="scanned">
                        <div class="title">扫描</div>
                        <div class="number">
                            {{ scanned }}
                        </div>
                    </div>
                    <div class="success">
                        <div class="title">成功</div>
                        <div class="number">
                            {{ success }}
                        </div>
                    </div>
                    <div class="faild">
                        <div class="title">失败</div>
                        <div class="number">
                            {{ fail }}
                        </div>
                    </div>
                    <div class="dup">
                        <div class="title">重复</div>
                        <div class="number">
                            {{ duplicate }}
                        </div>
                    </div>
                </div>
                <div class="desc">慢慢向下翻页<br />到达底端后点击此处结束</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, watch, nextTick, inject, onMounted } from 'vue-demi'
export default defineComponent({
    props: {
        state: Number,
        success: Number,
        fail: Number,
        duplicate: Number,
        scanned: Number,
        capture: Boolean,
        inFloat: {
            type: Boolean,
            default: true,
        },
    },
    setup(props) {
        if (props.inFloat) {
            const refresh = inject<() => void>('refresh')
            watch(
                () => props,
                async () => {
                    await nextTick()
                    refresh && refresh()
                },
                {
                    deep: true,
                },
            )
            onMounted(async () => {
                console.log('onmounted')
                await nextTick()
                refresh && refresh()
            })
        }
        return {}
    },
})
</script>

<style lang="scss" scoped>
.icon {
    height: 100%;
    width: 70px;
    left: 0;
    top: 0;
    bottom: 0;
    position: absolute;
    background: #7e7e7e;
    fill: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    svg {
        width: 45px;
        height: auto;
    }
}

.text {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    left: 70px;
    background: #fefefe;
    padding: 10px;
    font-size: 12px;
    color: #999;
    text-align: center;
    padding-top: 32px;
}
.down-page {
    .icon {
        background: #4096fe;
        &.capture {
            background: #003f8d;
        }
    }
    .text {
        color: #4096fe;
        padding: 10px 0;
    }
    .down-page .text {
        padding-top: 12px;
    }

    .count {
        & > div {
            display: inline-block;
            width: 40px;
        }
        margin-bottom: 4px;
        .success {
            color: #00b57a;
        }

        .faild {
            color: #cf0000;
        }
        .dup {
            color: #999;
        }

        .number {
            font-size: 20px;
        }
    }
}
</style>
