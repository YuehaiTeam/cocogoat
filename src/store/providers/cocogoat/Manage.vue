<template>
    <div :class="$style.syncItemMsft">
        <div class="logo">
            <icon-cocogoat />
        </div>
        <div class="content">
            <div class="title">
                <div class="username">清心 - {{ provider.email }}</div>
                <div class="status">{{ provider.email }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import IconCocogoat from '@/components/Icons/cocogoat.vue'
import Provider from './index'
import { PropType, defineComponent } from 'vue'
export default defineComponent({
    components: {
        IconCocogoat,
    },
    props: {
        provider: {
            type: Object as PropType<Provider>,
            required: true,
        },
    },
    setup() {
        return {}
    },
})
</script>

<style lang="scss" module>
.syncItemMsft {
    :global {
        .logo {
            float: left;
            font-size: 33px;
            display: flex;
            align-items: center;
            height: 40px;
            svg {
                width: 40px;
                height: 40px;
                margin-left: -5px;
                fill: #606266;
            }
        }
        .content {
            padding-left: 40px;
            box-sizing: border-box;
            .username {
                font-weight: bold;
            }
            .status {
                font-size: 13px;
                color: #555;
                margin-top: -5px;
            }
        }
    }
}
</style>
