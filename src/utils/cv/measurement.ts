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
            const result = await client(capture())
            if (result > 10) {
                resolve({
                    latency: diffFound - controlSent,
                    result,
                    captureReady,
                    controlSent,
                    diffFound,
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
    }
}
export async function tillChanged(
    client: typeof diffCached,
    capture: () => ICVMat,
    { timeout = 30 * 1e3, interval = 0 },
) {
    // clear client cache
    await client(false)
    // put first image in
    const captureReady = performance.now()
    await client(capture())
    await new Promise((resolve, reject) => {
        const check = async () => {
            const diffFound = performance.now()
            if (diffFound - captureReady >= timeout) {
                reject(new Error('Measurement timeout'))
            }
            const result = await client(capture())
            if (result > 10) {
                resolve({
                    latency: diffFound - captureReady,
                    result,
                    captureReady,
                    diffFound,
                })
            } else {
                runCheck()
            }
        }
        const runCheck = () => {
            interval == 0 ? requestAnimationFrame(check) : setTimeout(check, interval)
        }
        runCheck()
    })
}
