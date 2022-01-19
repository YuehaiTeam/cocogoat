/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-params */
import Fly from 'flyio/dist/npm/fly'
import type { Fly as FlyType, FlyError, FlyRequestConfig } from 'flyio'
interface RequestConfig extends FlyRequestConfig {
    params: Record<string, any>
}
export interface IWindow {
    hWnd: number
    title: string
    classname: string
    width: number
    height: number
    x: number
    y: number
}
export class CocogoatWebControl {
    port = 32333
    token = ''
    client: FlyType = new Fly()
    MOUSEEVENTF_ABSOLUTE = 0x8000
    MOUSEEVENTF_LEFTDOWN = 0x0002
    MOUSEEVENTF_LEFTUP = 0x0004
    MOUSEEVENTF_MIDDLEDOWN = 0x0020
    MOUSEEVENTF_MIDDLEUP = 0x0040
    MOUSEEVENTF_MOVE = 0x0001
    MOUSEEVENTF_RIGHTDOWN = 0x0008
    MOUSEEVENTF_RIGHTUP = 0x0010
    MOUSEEVENTF_WHEEL = 0x0800
    MOUSEEVENTF_XDOWN = 0x0080
    MOUSEEVENTF_XUP = 0x0100
    MOUSEEVENTF_HWHEEL = 0x01000
    constructor(_port = 32333) {
        this.port = _port
        this.client.config.baseURL = `http://localhost:${this.port}`
        this.client.interceptors.request.use((request) => {
            if (this.token) {
                request.headers['Authorization'] = `Bearer ${this.token}`
            }
            if (request.headers['Content-Type'] === '') {
                delete request.headers['Content-Type']
            }
            return request
        })
    }
    async check(): Promise<boolean> {
        try {
            await this.client.get(
                '/',
                {},
                {
                    timeout: 800,
                },
            )
            return true
        } catch (e) {
            return false
        }
    }
    async authorize() {
        try {
            const { data } = await this.client.post('/token')
            this.token = data.token
            return true
        } catch (e) {
            const er = e as FlyError
            if (er.status === 401) {
                return false
            }
            throw e
        }
    }
    async mouse_event(dwFlags: number, dx: number, dy: number, dwData: number, repeat = 1) {
        return this.client.post('/api/mouse_event', {}, {
            params: {
                dwFlags,
                dx,
                dy,
                dwData,
                repeat,
            },
        } as RequestConfig)
    }
    async keybd_event(bVk: number, bScan: number, dwFlags: number) {
        return this.client.post('/api/keybd_event', {}, {
            params: {
                bVk,
                bScan,
                dwFlags,
            },
        } as RequestConfig)
    }
    async sendMessage(hWnd: number, Msg: number, wParam: number, lParam: number) {
        return this.client.post('/api/sendMessage', {}, {
            params: {
                hWnd,
                Msg,
                wParam,
                lParam,
            },
        } as RequestConfig)
    }
    async SetCursorPos(x: number, y: number) {
        return this.client.post('/api/SetCursorPos', {}, {
            params: {
                x,
                y,
            },
        } as RequestConfig)
    }
    async listWindows(): Promise<IWindow[]> {
        return (await this.client.get('/api/windows')).data
    }
    async getWindow(id: number): Promise<IWindow> {
        return (await this.client.get('/api/windows/' + id)).data
    }
    async getMonitor(): Promise<IWindow> {
        return (await this.client.get('/api/monitors')).data
    }
    async toAbsolute(hWnd: number, x: number, y: number) {
        const win = await this.getWindow(hWnd)
        return { x: x + win.x, y: y + win.y }
    }
}
