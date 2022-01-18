import * as ort from 'onnxruntime-web/dist/ort.wasm-core.min.js'
import ocrString from '@/plugins/ocr/ppocr.txt?txt'

import resources from '@/resources'

import * as nd from 'nd4js'

import { getCV, ICVMat } from '@/utils/cv'

const ocrMap: string[] = ocrString.toString().trim().replace(/\r/g, '').split('\n')
ocrMap.unshift('\0')
ocrMap.push(' ')

ort.env.wasm.wasmPaths = resources

let session: ort.InferenceSession | null = null

export async function init() {
    const [s] = await Promise.all([ort.InferenceSession.create(resources['ppocr.ort']), getCV()])
    session = s
    return session
}

export function transform(data: Uint8Array, shape = [64, 64, 4]) {
    // 传入图片为RGBA
    let mat = nd.array('float32', { shape: Int32Array.from(shape), data: Float32Array.from(data) })
    // 转置
    mat = mat.transpose(2, 0, 1)
    let ary: number[] = mat.toNestedArray()
    // 去除透明通道
    ary.splice(3, 1)
    ary = ary.flat(2)
    // 转为Tensor
    ary = ary.map((x) => x / 255)
    return Float32Array.from(ary)
}

export async function recognize(data: ICVMat) {
    if (!session) await init()
    if (session) {
        const tensor = new ort.Tensor(transform(data.data, [data.rows, data.cols, 4]), [1, 3, data.rows, data.cols])
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
            text: str_res
                .join('')
                .replace(/(.)\1+/g, '$1')
                .replace(/\0/g, ''),
            confidence: parseFloat(((score / count) * 100).toFixed(2)),
        }
    } else {
        throw new Error('init faild')
    }
}
