import type { ICVMat } from '../cv'
import type { diffCached } from './measurement.worker'
export async function measureLatency(
    client: typeof diffCached,
    capture: () => ICVMat,
    control: () => Promise<unknown>,
) {
    // clear client cache
    await client(false)
    // put first image in
    const captureReady = performance.now()
    await client(await capture())
    await control()
    const controlSent = performance.now()
    return (await new Promise((resolve, reject) => {
        const check = async () => {
            const diffFound = performance.now()
            if (diffFound - captureReady >= 1000) {
                reject(new Error('Latency measurement timeout'))
            }
            const image = capture()
            const result = await client(image)
            if (result > 10) {
                resolve({
                    latency: diffFound - controlSent,
                    result,
                    captureReady,
                    controlSent,
                    diffFound,
                    image,
                })
            } else {
                requestAnimationFrame(check)
            }
        }
        requestAnimationFrame(check)
    })) as {
        latency: number
        result: number
        captureReady: number
        controlSent: number
        diffFound: number
        image: ICVMat
    }
}
export async function tillChanged(
    client: typeof diffCached,
    capture: (() => ICVMat) | (() => Promise<ICVMat>),
    {
        timeout = 30 * 1e3,
        interval = 0,
        threhold = 10,
        signal = new AbortSignal(),
        afterCapture = async () => {
            /* empty func */
        },
    },
) {
    // clear client cache
    await client(false)
    // put first image in
    const captureReady = performance.now()
    await client(await capture())
    await afterCapture()
    return (await new Promise((resolve, reject) => {
        const check = async () => {
            const diffFound = performance.now()
            if (diffFound - captureReady >= timeout) {
                reject(new Error('Measurement timeout'))
            }
            const image = await capture()
            const result = await client(image)
            console.log(result)
            if (result > threhold) {
                resolve({
                    latency: diffFound - captureReady,
                    result,
                    captureReady,
                    diffFound,
                    image,
                })
            } else {
                if (!signal.aborted) runCheck()
            }
        }
        const runCheck = () => {
            interval === 0 ? requestAnimationFrame(check) : setTimeout(check, interval)
        }
        runCheck()
    })) as {
        latency: number
        result: number
        captureReady: number
        diffFound: number
        image: ICVMat
    }
}
