import cvLoader from '@/plugins/opencv.js'
import type OpenCV from './opencv.d'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cv: OpenCV
export interface ICVMat {
    rows: number
    cols: number
    type: number
    data: Uint8Array
}
export function toIMat(cv: OpenCV, mat: InstanceType<OpenCV['Mat']>): ICVMat {
    return {
        rows: mat.rows,
        cols: mat.cols,
        type: mat.type(),
        data: new Uint8Array(mat.data),
    }
}
export function fromIMat(cv: OpenCV, imat: ICVMat): InstanceType<OpenCV['Mat']> {
    const mat = new cv.Mat(imat.rows, imat.cols, cv.CV_8UC4)
    mat.data.set(imat.data)
    return mat
}
export async function getCV(): Promise<OpenCV> {
    if (cv) return cv
    cv = await cvLoader()
    return cv
}
export function cvTranslateError(cv: OpenCV, err: unknown): Error | undefined {
    let errorStatement: Error | undefined

    if (typeof err === 'undefined') {
        errorStatement = new Error('')
    } else if (typeof err === 'number') {
        if (!isNaN(err)) {
            if (typeof cv !== 'undefined') {
                errorStatement = new Error(cv.exceptionFromPtr(err).msg)
                errorStatement.name = 'CVException'
            }
        }
    } else if (typeof err === 'string') {
        const ptr = Number(err.split(' ')[0])
        if (!isNaN(ptr)) {
            errorStatement = new Error(cv.exceptionFromPtr(err).msg)
            errorStatement.name = 'CVException'
        }
    } else if (err instanceof Error) {
        errorStatement = err
    }

    return errorStatement
}
