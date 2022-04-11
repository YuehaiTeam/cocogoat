import * as ort from 'onnxruntime-web/dist/ort.wasm-core.min.js'
import ocrString from '@/plugins/ocr/ppocr.txt?txt'

import resources from '@/resources'

import { ICVMat } from '@/utils/cv'

const ocrMap: string[] = ocrString.toString().trim().replace(/\r/g, '').split('\n')
ocrMap.unshift('\0')
ocrMap.push(' ')

ort.env.wasm.wasmPaths = resources
// disable MultiThreading
ort.env.wasm.numThreads = 1

let session: ort.InferenceSession | null = null

export async function init() {
    session = await ort.InferenceSession.create(resources['ppocr.ort'])
    return session
}

export function transform(data: Uint8Array, shape = [64, 64, 3]) {
    // hwc to chw & to float32
    const [h, w, c] = shape
    const tmp = new Float32Array(h * w * c)
    for (let hh = 0; hh < h; hh++) {
        for (let ww = 0; ww < w; ww++) {
            for (let cc = 0; cc < c; cc++) {
                tmp[cc * h * w + hh * w + ww] = data[hh * w * c + ww * c + cc] / 255
            }
        }
    }
    return tmp
}

export async function recognize(data: ICVMat) {
    if (!session) await init()
    if (session) {
        const tensor = new ort.Tensor(transform(data.data, [data.rows, data.cols, 3]), [1, 3, data.rows, data.cols])
        const feeds = { [session.inputNames[0]]: tensor }
        const results = await session.run(feeds)
        const output = results[session.outputNames[0]].data as Float32Array
        const predict_shape = results[session.outputNames[0]].dims
        let count = 0
        let score = 0
        const str_res = []
        for (let n = 0; n < predict_shape[1]; n++) {
            const slice = output.slice(n * predict_shape[2], (n + 1) * predict_shape[2])
            const max_value = Math.max(...slice)
            const argmax_idx = slice.indexOf(max_value)
            if (argmax_idx > 0) {
                score += max_value
                count += 1
                str_res.push(ocrMap[argmax_idx])
            }
        }
        return {
            text: str_res.join('').replace(/([^0-9])\1+/g, '$1'),
            confidence: parseFloat(((score / count) * 100).toFixed(2)),
        }
    } else {
        throw new Error('init faild')
    }
}
