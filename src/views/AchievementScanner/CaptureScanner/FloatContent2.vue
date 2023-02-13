<template>
    <div></div>
</template>

<script lang="ts">
const iconWait = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024' fill='%23fff'%3E%3Cpath d='M421.646 361.414v-93.081c0-7.562 2.678-13.996 8.038-19.366 5.354-5.346 11.812-8.022 19.366-8.022h246.373c7.562 0 14.012 2.676 19.356 8.022 5.37 5.372 8.038 11.804 8.038 19.366v246.405c0 7.554-2.668 13.988-8.038 19.358-5.346 5.328-11.794 8.024-19.356 8.024H602.35v202.605c0 10.576-3.736 19.582-11.254 27.102-7.484 7.462-16.514 11.232-27.1 11.232H219.07c-10.574 0-19.616-3.77-27.112-11.232-7.508-7.52-11.254-16.526-11.254-27.102V399.758c0-10.588 3.748-19.594 11.254-27.112 7.496-7.484 16.538-11.232 27.112-11.232h202.573zm0 60.234H279.31c-10.574 0-19.618 3.748-27.112 11.232-7.508 7.52-11.254 16.526-11.254 27.112v224.497c0 10.576 3.748 19.582 11.254 27.102 7.494 7.462 16.538 11.232 27.112 11.232h224.455c10.586 0 19.616-3.77 27.1-11.232 7.52-7.52 11.254-16.526 11.254-27.102V542.118h-93.066c-7.554 0-14.012-2.694-19.366-8.024-5.362-5.37-8.038-11.804-8.038-19.358v-93.088zm87.64-120.47c-7.554 0-14.012 2.678-19.366 8.024-5.362 5.37-8.038 11.804-8.038 19.368v125.936c0 7.554 2.678 13.988 8.038 19.358 5.354 5.33 11.812 8.024 19.366 8.024h125.906c7.562 0 14.012-2.694 19.356-8.024 5.37-5.37 8.037-11.804 8.037-19.358V328.57c0-7.562-2.667-13.996-8.037-19.368-5.346-5.346-11.794-8.024-19.356-8.024H509.288zM225.169 85.038l-49.932-28.83c-14.406-8.319-19.342-26.737-11.024-41.14s26.736-19.343 41.14-11.025l104.332 60.234c14.404 8.318 19.342 26.736 11.024 41.14L260.473 209.75c-8.318 14.406-26.736 19.342-41.14 11.024s-19.342-26.736-11.024-41.14l23.282-40.326c-40.44 15.522-74.804 37.426-103.092 65.712-42.704 42.704-71.337 99.733-85.903 171.087L.002 333.512c14.744-71.535 43.36-128.545 85.85-171.037 36.211-36.212 82.65-62.026 139.315-77.442zm536.998 808.386l49.932 28.828c14.404 8.318 19.342 26.736 11.024 41.14s-26.736 19.342-41.14 11.024L677.651 914.18c-14.404-8.318-19.341-26.736-11.024-41.14l60.236-104.331c8.318-14.404 26.736-19.342 41.14-11.024s19.342 26.736 11.024 41.14l-23.282 40.326c40.44-15.52 74.804-37.424 103.092-65.712 42.704-42.704 71.338-99.734 85.904-171.09l42.591 42.592c-14.744 71.534-43.36 128.548-85.85 171.038-36.211 36.212-82.649 62.025-139.315 77.441z'/%3E%3C/svg%3E`
const iconProcess = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024' fill='%23fff'%3E%3Cpath d='M468.867 212.468a43.133 43.133 0 1 0 86.266 0 43.133 43.133 0 1 0-86.266 0zM468.867 383.4a43.133 43.133 0 1 0 86.266 0 43.133 43.133 0 1 0-86.266 0zM468.867 554.334a43.133 43.133 0 1 0 86.266 0 43.133 43.133 0 1 0-86.266 0zM609.448 651.782L512 749.229l-97.448-97.447c-17.572-17.573-43.132-17.573-59.107 0s-17.573 43.132 0 59.107l127.8 127.8c7.987 7.988 20.767 12.78 30.353 12.78s20.767-4.792 30.352-12.78l127.8-127.8c17.573-17.572 17.573-43.132 0-59.107-19.17-17.573-44.73-17.573-62.302 0z'/%3E%3Cpath d='M555.133 0h-84.668C302.727 0 171.732 132.593 171.732 298.733v426.534c0 166.14 132.592 298.733 298.733 298.733h84.668c166.14 0 298.733-132.593 298.733-298.733V298.733C852.268 132.593 721.273 0 555.133 0zM767.6 723.67c0 119.812-94.253 212.467-212.468 212.467h-84.668c-119.813 0-212.468-94.252-212.468-212.468V298.733c0-119.813 94.253-212.468 212.468-212.468h84.668c119.812 0 212.468 94.253 212.468 212.468V723.67z'/%3E%3C/svg%3E`
const imWait = new Image()
imWait.src = iconWait
const imProcess = new Image()
imProcess.src = iconProcess

import { defineComponent, inject, watch, Ref, onMounted } from 'vue'

export default defineComponent({
    props: {
        state: Number,
        success: Number,
        fail: Number,
        duplicate: Number,
        scanned: Number,
        webControlEnabled: Number,
    },
    setup(props) {
        const canvas = inject('canvas') as Ref<HTMLCanvasElement>
        function drawWaitingPage() {
            const ctx = canvas.value.getContext('2d') as CanvasRenderingContext2D
            ctx.textAlign = 'left'
            ctx.fillStyle = '#fff'
            ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)
            ctx.fillStyle = '#7e7e7e'
            ctx.fillRect(0, 0, (70 / 250) * canvas.value.width, canvas.value.height)
            ctx.drawImage(
                imWait,
                (12.5 / 250) * canvas.value.width,
                (28 / 250) * canvas.value.width,
                (45 / 250) * canvas.value.width,
                (45 / 250) * canvas.value.width,
            )
            ctx.fillStyle = '#999'
            ctx.font = `${(14 / 250) * canvas.value.width}px 微软雅黑`
            ctx.fillText('请切换到游戏窗口', (105 / 250) * canvas.value.width, (45 / 250) * canvas.value.width)
            ctx.fillText('打开任意成就页面', (105 / 250) * canvas.value.width, (65 / 250) * canvas.value.width)
        }
        function drawProcessPage() {
            const ctx = canvas.value.getContext('2d') as CanvasRenderingContext2D
            ctx.textAlign = 'left'
            ctx.fillStyle = '#fff'
            ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)
            ctx.fillStyle = '#4096fe'
            ctx.fillRect(0, 0, (70 / 250) * canvas.value.width, canvas.value.height)
            ctx.drawImage(
                imProcess,
                (12.5 / 250) * canvas.value.width,
                (28 / 250) * canvas.value.width,
                (45 / 250) * canvas.value.width,
                (45 / 250) * canvas.value.width,
            )
            ctx.font = `${(11 / 250) * canvas.value.width}px 微软雅黑`
            if (props.webControlEnabled && props.webControlEnabled > 0) {
                ctx.fillText(
                    '自动翻页进行中，请勿移动鼠标',
                    (87 / 250) * canvas.value.width,
                    (73 / 250) * canvas.value.width,
                )
                ctx.fillText(
                    '如需中断，请按 Win 键停止识别',
                    (89 / 250) * canvas.value.width,
                    (88 / 250) * canvas.value.width,
                )
            } else {
                ctx.fillText(
                    '匀速向下翻页 完成后点此结束',
                    (87 / 250) * canvas.value.width,
                    (73 / 250) * canvas.value.width,
                )
                ctx.fillText(
                    '尽量将鼠标保持在左侧图标处',
                    (89 / 250) * canvas.value.width,
                    (88 / 250) * canvas.value.width,
                )
            }
            ctx.fillText('扫描', (85 / 250) * canvas.value.width, (23 / 250) * canvas.value.width)
            ctx.fillStyle = '#00b57a'
            ctx.fillText('成功', (127 / 250) * canvas.value.width, (23 / 250) * canvas.value.width)
            ctx.fillStyle = '#cf0000'
            ctx.fillText('失败', (169 / 250) * canvas.value.width, (23 / 250) * canvas.value.width)
            ctx.fillStyle = '#999'
            ctx.fillText('重复', (211 / 250) * canvas.value.width, (23 / 250) * canvas.value.width)
            drawProcessCount()
        }
        function drawProcessCount() {
            if (props.state === 0) return
            const ctx = canvas.value.getContext('2d') as CanvasRenderingContext2D
            ctx.fillStyle = '#fff'
            ctx.fillRect(
                (70 / 250) * canvas.value.width,
                (28 / 250) * canvas.value.width,
                (1 - 70 / 250) * canvas.value.width,
                (30 / 250) * canvas.value.width,
            )
            ctx.font = `${(20 / 250) * canvas.value.width}px 微软雅黑`
            ctx.textAlign = 'center'
            ctx.fillStyle = '#4096fe'
            ctx.fillText(
                (props.scanned || 0).toString(),
                (95 / 250) * canvas.value.width,
                (50 / 250) * canvas.value.width,
            )
            ctx.fillStyle = '#00b57a'
            ctx.fillText(
                (props.success || 0).toString(),
                (138 / 250) * canvas.value.width,
                (50 / 250) * canvas.value.width,
            )
            ctx.fillStyle = '#cf0000'
            ctx.fillText(
                (props.fail || 0).toString(),
                (180 / 250) * canvas.value.width,
                (50 / 250) * canvas.value.width,
            )
            ctx.fillStyle = '#999'
            ctx.fillText(
                (props.duplicate || 0).toString(),
                (222 / 250) * canvas.value.width,
                (50 / 250) * canvas.value.width,
            )
        }
        watch(
            () => props.state,
            (s) => {
                if (s === 0) {
                    drawWaitingPage()
                } else {
                    drawProcessPage()
                }
            },
        )
        watch(
            props,
            () => {
                drawProcessCount()
            },
            {
                deep: true,
            },
        )
        onMounted(() => {
            if (props.state === 0) {
                drawWaitingPage()
            } else {
                drawProcessPage()
            }
        })
        return {}
    },
})
</script>
