<template>
    <div :class="$style.syncItemMsft">
        <div class="logo">
            <fa-icon :icon="['fab', 'microsoft']" />
        </div>
        <div class="content">
            <div class="title">
                <div class="username">OneDrive - {{ provider.name }}</div>
                <div class="status">{{ provider.user }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { faMicrosoft } from '@fortawesome/free-brands-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
library.add(faMicrosoft)

import OneDriveSyncProvider from './index'
import { PropType, defineComponent } from 'vue'
export default defineComponent({
    props: {
        provider: {
            type: Object as PropType<OneDriveSyncProvider>,
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
