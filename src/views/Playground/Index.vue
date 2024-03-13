<template>
    <div v-if="loading" class="scanner-loading">
        <div :class="$style.loader">
            <div class="loader-animation">
                <span class="cssload-loader"><span class="cssload-loader-inner"></span></span>
            </div>
            <div class="loader-text">椰羊正在饮甘露，马上就来</div>
            <div class="loader-progress">
                <div class="loader-progress-bar" :style="{ width: progress + '%' }"></div>
            </div>
            <div class="loader-progress-text">
                <span>{{ progressText || `${progress.toFixed(2)}%` }}</span>
            </div>
        </div>
    </div>
    <div v-else :class="$style.main">
        <MonacoEditor
            :class="$style.left"
            theme="vs-dark"
            language="javascript"
            :value="code"
            :amdRequire="amdRequire"
            @change="editorChange"
            @editor-will-mount="editorMount"
        />
        <div :class="$style.right">
            <div class="preview">
                <div>
                    <span class="sel-span" @click="file1?.click()">点此选择输入图片（<code>cv_in</code>）</span>
                    <div class="cc" @click=";($event.currentTarget as HTMLElement)?.classList.toggle('click')">
                        <img :src="imgsrc" />
                    </div>
                </div>
                <div>
                    <span class="sel-span" @click="file2?.click()">点此选择第二输入（<code>cv_sub</code>）</span>
                    <div class="cc" @click=";($event.currentTarget as HTMLElement)?.classList.toggle('click')">
                        <img :src="imgsrc2" />
                    </div>
                </div>
                <div>
                    <span>输出结果（<code>cv_canvas</code>）</span>
                    <div class="cc" @click=";($event.currentTarget as HTMLElement)?.classList.toggle('click')">
                        <canvas ref="cvsel" />
                    </div>
                </div>
            </div>
            <div class="bottom-bar">
                <el-popover placement="top-end" title="代码提示" :width="360" trigger="click">
                    <template #reference>
                        <el-link type="primary">代码提示</el-link>
                    </template>
                    <div :class="$style.popover">
                        内置的全局变量：
                        <li><code>cv</code>：OpenCV.js</li>
                        <li><code>cv_in</code>：输入图片（<code>HTMLImageElement</code>）</li>
                        <li><code>cv_sub</code>：输入图片 2（<code>HTMLImageElement</code>）</li>
                        <li><code>cv_canvas</code>：输出 Canvas（<code>HTMLCanvasElement</code>）</li>
                        <br /><br />
                        请在开发者工具中查看 Console 输出。
                    </div>
                </el-popover>
                <el-button class="run-btn" type="primary" @click="run">Run!</el-button>
            </div>
            <input ref="file1" type="file" @change="onImageChange($event, 1)" />
            <input ref="file2" type="file" @change="onImageChange($event, 2)" />
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment,@typescript-eslint/no-explicit-any */
import { init as initOcr } from '@/modules/ocr'
import { init as initYas } from '@/modules/yas'
import { requireAsBlob, speedTest } from '@/resource-main'
import { hasSIMD } from '@/utils/compatibility'
import { getCV, cvTranslateError, toIMat, fromIMat } from '@/utils/cv'
import { h, defineComponent, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import MonacoEditor from 'vue-monaco'
import cvdts from './opencv.d.ts.txt?raw'
import pldts from './playground.d.ts.txt?raw'
import * as achievementScanner from '@/views/AchievementScanner/scanner/scanner.worker.expose'
import * as artifactScanner from '@/views/ArtifactScanner/scanner/scanner.expose'
import { IMatFromImageElement, toCanvas } from '@/utils/IMat'
import { initMap } from '../ArtifactScanner/scanner/map'
import achevementsAmos from '@/generated/amos-data/amos/achievements'
import charactersAmos from '@/generated/amos-data/amos/characters'
import artifactAmos from '@/generated/amos-data/amos/artifacts'
import { initAchievementMap } from '../AchievementScanner/scanner/achievementsList'
import { i18n } from '@/i18n'
import { cloneDeep } from 'lodash-es'
MonacoEditor.render = () => h('div')
export default defineComponent({
    components: {
        MonacoEditor,
    },
    setup() {
        const code = ref(`const src = cv.imread(cv_in)
cv.imshow(cv_canvas,src)
src.delete()`)
        const progress = ref(0)
        const progressText = ref('')
        const amdRequire = ref(null as any)
        const loading = ref(true)
        const imgel = new Image()
        const imgel2 = new Image()
        const imgsrc = ref('')
        const imgsrc2 = ref('')
        const cvsel = ref(null as HTMLCanvasElement | null)
        function loadScript(src: string) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script')
                script.src = src
                script.onload = resolve
                script.onerror = reject
                document.head.appendChild(script)
            })
        }
        onMounted(async () => {
            const [race, all] = speedTest()
            const ortWasm = hasSIMD ? 'ort-wasm-simd.wasm' : 'ort-wasm.wasm'
            const ocvWasm = hasSIMD ? 'opencv-simd.wasm' : 'opencv-normal.wasm'
            await race
            await requireAsBlob(
                [ortWasm, ocvWasm, 'ppocr.ort', 'yas.ort'],
                (e) => {
                    progress.value = e
                },
                all,
            )
            progressText.value = '应用初始化'
            const [cv] = await Promise.all([getCV(), initOcr()])
            await initYas()
            // @ts-ignore
            const webpackJsonp = window.define
            try {
                // @ts-ignore
                window.require.reset()
            } catch (e) {}
            const monacoBase = 'https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/monaco-editor/0.31.1/min/vs'
            await Promise.all([
                loadScript(monacoBase + '/loader.min.js'),
                loadScript('https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/lodash.js/4.17.21/lodash.min.js'),
            ])
            // @ts-ignore
            window.define.push = webpackJsonp.push
            // @ts-ignore
            window.define.webpackJsonp = webpackJsonp
            // @ts-ignore
            amdRequire.value = window.require
            // @ts-ignore
            window.c = {
                achievement: achievementScanner.W,
                artifact: artifactScanner.W,
                toIMat,
                fromIMat,
                toCanvas,
                IMatFromImageElement,
            }
            amdRequire.value.config({ paths: { vs: monacoBase } })
            loading.value = false
            // @ts-ignore
            window.cv = cv
            // @ts-ignore
            window.cvTranslateError = cvTranslateError
            const i18nAmos = cloneDeep(i18n.amos)
            initMap({
                map: artifactAmos,
                params: i18n.atifactParams,
                characters: charactersAmos,
                amos: i18nAmos,
            })
            initAchievementMap(achevementsAmos, i18nAmos)
        })
        watch(
            () => cvsel.value,
            () => {
                if (!cvsel.value) {
                    return
                }
                // @ts-ignore
                window.cv_in = imgel
                // @ts-ignore
                window.cv_sub = imgel2
                // @ts-ignore
                window.cv_canvas = cvsel.value
            },
        )
        const onImageChange = (e: Event, n: number) => {
            const files = (e.target as HTMLInputElement).files
            if (!files || !files[0]) return
            const file = files[0]
            const bloburi = URL.createObjectURL(file)
            const el = n === 1 ? imgel : imgel2
            const sr = n === 1 ? imgsrc : imgsrc2
            if (el) {
                try {
                    URL.revokeObjectURL(sr.value)
                } catch (e) {}
                sr.value = bloburi
                el.src = bloburi
            }
        }
        const editorChange = (ev: unknown) => {
            if (typeof ev === 'string') {
                code.value = ev
            }
        }
        const editorMount = (monaco: any) => {
            monaco.languages.typescript.javascriptDefaults.addExtraLib(cvdts, 'opencv.d.ts')
            monaco.languages.typescript.javascriptDefaults.addExtraLib(pldts, 'playground.d.ts')
        }
        const run = function () {
            let AsyncFunction
            try {
                // eslint-disable-next-line no-new-func
                AsyncFunction = Object.getPrototypeOf(new Function('return async function () {}')()).constructor
            } catch (e) {
                AsyncFunction = Function
            }
            const execWrap = new AsyncFunction(
                `try {;${code.value};} catch (e) {if (typeof e === 'number') {console.error(cvTranslateError(cv, e))}else{console.error(e)}}`,
            )
            try {
                execWrap.bind(window)()
            } catch (e) {
                console.error(e)
            }
        }
        const messageHandler = async (ev: MessageEvent) => {
            const { app, event, data } = ev.data
            if (app !== 'cocogoat.playground') return
            switch (event) {
                case 'code':
                    code.value = data
                    break
                case 'run':
                    run()
                    break
            }
        }
        window.addEventListener('message', messageHandler)
        onBeforeUnmount(() => {
            window.removeEventListener('message', messageHandler)
        })
        function send<T>(event: string, data: T) {
            parent &&
                window !== parent &&
                parent.postMessage(
                    {
                        app: 'cocogoat.playground',
                        event,
                        data: JSON.parse(JSON.stringify(data)),
                    },
                    '*',
                )
        }
        watch(code, (v) => {
            send('code', v)
        })
        return {
            loading,
            progress,
            progressText,
            code,
            imgsrc,
            imgsrc2,
            cvsel,
            onImageChange,
            editorChange,
            editorMount,
            amdRequire,
            file1: ref(null as HTMLInputElement | null),
            file2: ref(null as HTMLInputElement | null),
            run,
        }
    },
})
</script>

<style lang="scss" module>
.popover {
    font-family:
        Sarasa Term SC,
        Consolas,
        Microsoft Yahei;
    code {
        font-family:
            Sarasa Term SC,
            Consolas,
            Microsoft Yahei;
        color: var(--c-theme);
    }
}
.main {
    height: 100vh;
    position: relative;
    background: #1e1e1e;
    overflow: hidden;
    .left {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 200px;
    }
    .right {
        position: absolute;
        bottom: 0;
        right: 0;
        left: 0;
        height: 200px;
        background: #1e1e1e;
        :global {
            .preview {
                height: calc(100% - 50px);
                display: flex;
                color: #aaa;
                font-family:
                    Sarasa Term SC,
                    Microsoft Yahei;
                text-align: center;
                & > div {
                    flex: 1;
                    code {
                        background: #000;
                        font-family:
                            Sarasa Term SC,
                            Consolas,
                            Microsoft Yahei;
                        color: #fff;
                    }
                    span.sel-span {
                        cursor: default;
                        height: 20px;
                        display: block;
                        width: 100%;
                    }
                    .sel-span {
                        cursor: pointer;
                        &:hover {
                            opacity: 0.8;
                        }
                    }
                    .cc {
                        height: calc(100% - 20px);
                        display: flex;
                        padding: 10px;
                        align-items: center;
                        justify-content: center;
                        box-sizing: border-box;
                        &.click {
                            position: fixed;
                            top: 50px;
                            left: 50px;
                            right: 50px;
                            height: calc(100vh - 100px) !important;
                            background: rgba(255, 255, 255, 0.3);
                            border-radius: 10px;
                            z-index: 5;
                        }
                        img,
                        canvas {
                            border: 2px dashed var(--c-theme);
                            width: auto;
                            height: auto;
                            max-width: 100%;
                            max-height: 100%;
                        }
                    }
                }
            }
            .bottom-bar {
                height: 50px;
                line-height: 50px;
                .el-link {
                    padding-left: 20px;
                }
                .run-btn {
                    border-radius: 3px;
                    width: 120px;
                    float: right;
                    margin-right: 20px;
                    margin-top: 10px;
                }
            }
        }
        input {
            display: none;
        }
    }
}

.loader {
    width: 200px;
    padding-top: 40vh;
    color: #666;
    text-align: center;
    font-size: 14px;
    margin: 0 auto;
    :global {
        .loader-text {
            padding-top: 15px;
        }
        .cssload-loader {
            display: block;
            margin: 0 auto;
            width: 30px;
            height: 30px;
            position: relative;
            border: 3px solid #333;
            &:local {
                animation: scanner-cssload-loader 2.3s infinite ease;
            }
        }
        .cssload-loader-inner {
            vertical-align: top;
            display: inline-block;
            width: 100%;
            background-color: #333;
            &:local {
                animation: scanner-cssload-loader-inner 2.3s infinite ease-in;
            }
        }
        .loader-progress {
            width: 170px;
            height: 2px;
            background: #ddd;
            margin: 0 auto;
            margin-top: 20px;
            position: relative;
            .loader-progress-bar {
                width: 0;
                height: 100%;
                background: var(--c-text);
                position: absolute;
                left: 0;
                top: 0;
            }
        }
        .loader-progress-text {
            font-size: 12px;
            position: relative;
            top: -12px;
            background: #fff;
            display: inline-block;
            padding: 0 4px;
        }
    }
}
@keyframes scanner-cssload-loader {
    0% {
        transform: rotate(0deg);
    }

    25% {
        transform: rotate(180deg);
    }

    50% {
        transform: rotate(180deg);
    }

    75% {
        transform: rotate(360deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
@keyframes scanner-cssload-loader-inner {
    0% {
        height: 0%;
    }

    25% {
        height: 0%;
    }

    50% {
        height: 100%;
    }

    75% {
        height: 100%;
    }

    100% {
        height: 0%;
    }
}
</style>
