<template>
    <Layout full-height>
        <template #title>
            <span style="font-family: genshin">Code Playground</span>
        </template>
        <iframe ref="contentFrame" :class="$style.fr" :src="frameUrl" frameborder="0"></iframe>
    </Layout>
</template>

<script lang="ts">
import { ref, defineComponent, onBeforeUnmount, watch } from 'vue'
import { getUrl } from '@/router'
import { get, set } from '@/store/impl'
import { debounce } from 'lodash-es'

export default defineComponent({
    setup() {
        const frameUrl = getUrl('frames.playground')
        const contentFrame = ref<HTMLIFrameElement | null>(null)
        const setCode = (code: string) => {
            set('playground.code', code)
        }
        const debouncedSrtCode = debounce(setCode, 4000)
        const messageHandler = async (ev: MessageEvent) => {
            const { app, event, data } = ev.data
            if (app !== 'cocogoat.playground') return
            switch (event) {
                case 'code':
                    debouncedSrtCode(data)
            }
        }
        window.addEventListener('message', messageHandler)
        onBeforeUnmount(() => {
            window.removeEventListener('message', messageHandler)
        })
        function send<T>(event: string, data: T) {
            contentFrame.value?.contentWindow?.postMessage(
                {
                    app: 'cocogoat.playground',
                    event,
                    data: JSON.parse(JSON.stringify(data)),
                },
                '*',
            )
        }
        watch(contentFrame, (fr) => {
            fr?.addEventListener('load', () => {
                const code = get('playground.code')
                if (code) send('code', code)
            })
        })
        return {
            contentFrame,
            frameUrl,
        }
    },
})
</script>

<style lang="scss" module>
.fr {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
}
</style>
