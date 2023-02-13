<template>
    <div :class="$style.syncInstaller">
        <div class="slide" :style="`transform: translateX(${-280 * (step - 1)}px)`">
            <div>
                <span class="big-icon">
                    <fa-icon :icon="['fab', 'microsoft']" />
                </span>

                <el-button size="large" type="primary" color="#0079cc" class="submit-button" @click="loginMsft">
                    Sign In With Microsoft
                </el-button>
                <div class="mail-desc">OneDrive 在中国大陆地区响应较慢，并可能出现网络错误等情况，请知悉</div>
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
const clientId = `93a5cb17-1ee8-4abf-b1a3-c384a4f6952f`
import { decode } from 'js-base64'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faMicrosoft } from '@fortawesome/free-brands-svg-icons'
import { faCheckCircle, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { ElMessageBox } from 'element-plus'
import { defineComponent, onMounted, ref } from 'vue'
import { apibase } from '@/utils/apibase'
library.add(faMicrosoft, faCheckCircle, faCircleNotch)
export const name = 'OneDrive'
export default defineComponent({
    emits: ['submit'],
    setup(props, { emit }) {
        const dtserver = ref('')
        const dtlocal = ref('')
        let idToken = ''
        let idCode = ''
        try {
            idToken = location.hash.split('id_token=')[1].split('&')[0]
            idCode = location.hash.split('code=')[1].split('&')[0]
            location.replace('#')
        } catch (e) {}
        const step = ref(idToken && idCode ? 2 : 1)
        const loginMsft = () => {
            const redirectUrl = location.href.replace(location.search, '').replace(location.hash, '')
            sessionStorage.setItem('msftTempRedirectUrl', redirectUrl)
            step.value = 2
            location.href =
                `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id=` +
                clientId +
                `&response_type=code%20id_token&redirect_uri=` +
                encodeURIComponent(redirectUrl) +
                `&scope=openid,profile,offline_access,Files.ReadWrite.AppFolder&response_mode=fragment&state=cocogoat-msft&nonce=` +
                new Date().getTime()
        }
        const tokenMsft = async () => {
            const res = await fetch(await apibase('/v2/aether/microsoft'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: idCode,
                    redirect_uri: sessionStorage.getItem('msftTempRedirectUrl'),
                }),
            })
            if (res.status !== 200 || res.headers.get('content-type') !== 'application/json') {
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
                access_token: string
                expires_in: number
                id_token: string
                refresh_token: string
                scope: string
                token_type: string
                last_updated: number
            }
            data.id_token = idToken
            data.last_updated = Date.now()
            const pfun = getUserFromJWT(idToken).replace(/\./g, '_').replace(/@/g, '_').replace(/-/g, '_')
            emit('submit', { key: pfun, data })
        }
        onMounted(() => {
            if (idToken && idCode) {
                tokenMsft()
            }
        })
        return {
            step,
            dtserver,
            dtlocal,
            loginMsft,
        }
    },
})
function getUserFromJWT(token: string) {
    const parts = token.split('.')
    if (parts.length !== 3) {
        return ''
    }
    const payload = JSON.parse(decode(parts[1]))
    return payload.preferred_username
}
</script>

<style lang="scss" module>
.sync-installer {
    overflow: hidden;
    :global {
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
            width: 90%;
            white-space: normal;
            margin: 0 auto;
            margin-top: 20px;
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
