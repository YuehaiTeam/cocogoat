<template>
    <div :class="$style.syncInstaller">
        <div class="slide" :style="`transform: translateX(${-280 * (step - 1)}px)`">
            <div class="first">
                <icon-cocogoat class="logo" />
                <form @submit.prevent.stop="submitMail">
                    <input v-model="mail" placeholder="请输入邮箱地址" type="email" class="email-input" />
                    <el-button
                        size="large"
                        type="primary"
                        color="#0079cc"
                        class="submit-button"
                        :disabled="!isMail"
                        @click="submitMail"
                    >
                        <fa-icon icon="angle-right" />
                    </el-button>
                </form>
            </div>
            <div class="loading">
                <span class="big-icon">
                    <fa-icon icon="circle-notch" spin />
                </span>
                <div class="mail-desc">处理中，请稍候...</div>
            </div>
            <div class="second">
                <span class="big-icon">
                    <fa-icon icon="envelope-open-text" />
                </span>
                <div class="mail-desc">
                    一封邮件已经发送到您的邮箱
                    <br />请查收并点击邮件中的链接登录
                </div>
                <el-button size="small" class="retry" :disabled="timer > 0" @click="submitMail">{{
                    timer > 0 ? `没收到吗？${timer}s后重试` : '重发邮件'
                }}</el-button>
            </div>
            <div class="loading">
                <span class="big-icon">
                    <fa-icon icon="circle-notch" spin />
                </span>
                <div class="mail-desc">马上就好...</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import IconCocogoat from '@/components/Icons/cocogoat.vue'
import { apibase } from '@/utils/apibase'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
    faAngleRight,
    faEnvelopeOpenText,
    faCheckCircle,
    faCircleNotch,
    faBomb,
} from '@fortawesome/free-solid-svg-icons'
import { ElMessageBox } from 'element-plus'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
library.add(faAngleRight, faEnvelopeOpenText, faCheckCircle, faCircleNotch, faBomb)
export const name = '椰羊云同步'
export default defineComponent({
    components: {
        IconCocogoat,
    },
    emits: ['submit'],
    setup(props, { emit }) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let gtObj: any
        let gtOnSucc = () => {
            // placeholder
        }
        const step = ref(1)
        onMounted(() => {
            window.initGeetest4(
                {
                    captchaId: '2c9c8579b5bc9d3771a03e7939ac0c66',
                    product: 'bind',
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                function (captchaObj: any) {
                    captchaObj
                        .onReady(function () {
                            gtObj = captchaObj
                        })
                        .onSuccess(function () {
                            gtOnSucc()
                            gtOnSucc = () => {
                                // placeholder
                            }
                        })
                        .onClose(function () {
                            step.value = 1
                        })
                },
            )
        })
        let intervalId = 0 as unknown as ReturnType<typeof setTimeout>
        onBeforeUnmount(() => {
            intervalId && clearTimeout(intervalId)
        })
        let destroyed = false
        onBeforeUnmount(() => {
            destroyed = true
        })
        const mail = ref('')
        const isMail = computed(() => {
            // 正则判断是否邮件地址
            const mailRegex = /^\s*\w+(?:\.{0,1}[\w-]+)*@[a-zA-Z0-9]+(?:[-.][a-zA-Z0-9]+)*\.[a-zA-Z]+\s*$/
            return mailRegex.test(mail.value)
        })
        const timer = ref(0)
        const dtserver = ref('')
        const dtlocal = ref('')
        let dtoken = ''
        const submitMail = async () => {
            if (!isMail.value) return
            step.value = 2
            let gtres = null
            if (gtObj) {
                gtObj.showCaptcha()
                await new Promise<void>((resolve) => {
                    gtOnSucc = resolve
                })
                gtres = gtObj.getValidate()
            }
            const res = await fetch(await apibase('/v2/lumine'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: mail.value,
                    gt: gtres,
                }),
            })
            if (!res.ok || res.headers.get('content-type') !== 'application/json') {
                step.value = 1
                let errorText = await res.text()
                try {
                    const data = JSON.parse(errorText)
                    errorText = data.error || data.msg
                } catch (e) {}
                ElMessageBox.alert(errorText, '出错了！')
                return
            }
            const data = (await res.json()) as {
                ticket: string
            }
            dtoken = data.ticket

            timer.value = 180
            const dec = () => {
                timer.value--
                if (timer.value > 0) {
                    setTimeout(dec, 1000)
                }
            }
            setTimeout(dec, 1000)
            step.value = 3
            intervalId = setTimeout(checkLoginStatus, 3000)
        }
        const checkLoginStatus = async () => {
            if (destroyed) return
            try {
                const res = await fetch(await apibase('/v2/lumine/' + dtoken), {
                    method: 'DELETE',
                })
                if (res.status === 404) {
                    intervalId = setTimeout(checkLoginStatus, 2000)
                } else if (res.status === 200) {
                    const data = (await res.json()) as {
                        token: string
                        lastModified: number
                    }
                    data.lastModified = Date.now()
                    const key = mail.value.replace(/\./g, '_').replace(/@/g, '_').replace(/-/g, '_')
                    emit('submit', { key, data })
                } else {
                    step.value = 1
                    let errorText = await res.text()
                    try {
                        const data = JSON.parse(errorText)
                        errorText = data.error || data.msg
                    } catch (e) {}
                    ElMessageBox.alert(errorText, '出错了！')
                }
            } catch (e) {
                intervalId = setTimeout(checkLoginStatus, 2000)
            }
        }
        return {
            step,
            mail,
            submitMail,
            timer,
            dtserver,
            dtlocal,
            isMail,
        }
    },
})
</script>

<style lang="scss" module>
.sync-installer {
    overflow: hidden;
    :global {
        .logo {
            fill: #0079cc;
            width: 88px;
            height: 88px;
            display: block;
            margin: 0 auto;
        }
        .email-input {
            display: block;
            height: 45px;
            width: 90%;
            margin: 0 auto;
            border-radius: 5px;
            border: 1px solid #0078cc;
            text-align: center;
            font-size: 18px;
            font-family:
                Consolas,
                Microsoft Yahei;
            outline: 0;
            color: #0078cc;
            box-sizing: border-box;
            &::placeholder {
                color: #8ccfff;
                font-size: 15px;
            }
        }
        .submit-button {
            display: block;
            width: 90%;
            margin: 0 auto;
            font-size: 17px;
            margin-top: 10px;
        }
        .big-icon svg {
            width: 55px;
            height: 88px;
            display: block;
            margin: 0 auto;
            color: #0079cc;
        }
        .retry {
            width: 150px;
            display: block;
            margin: 0 auto;
            margin-top: 10px;
        }
        .mail-desc {
            text-align: center;
            color: #0079cc;
            font-size: 14px;
        }
        .slide {
            white-space: nowrap;
            overflow: visible;
            transform: translateX(0);
            transition: transform 0.3s;
            & > div {
                display: inline-block;
                vertical-align: top;
                width: 280px;
            }
        }
        h4 {
            color: #227acc;
            text-align: center;
            margin: 0;
            margin-bottom: 10px;
        }

        .conflict .el-button {
            display: block;
            width: 100%;
            height: 60px;
            margin: 15px 0;
        }
    }
}
</style>
