import { fromIMat, getCV, ICVMat, toIMat } from '@/utils/cv'
import { recognize, init as getYas } from '@/modules/yas'
import { normalizeToYas } from './cvUtil'
import { Mat } from '@/utils/opencv'
import { closest } from 'color-diff'
export async function init() {
    await Promise.all([getCV(), getYas()])
}
export interface IArScannerLine {
    type: string
    text: string
    confidence: number
    rect: {
        x: number
        y: number
        width: number
        height: number
    }
}
export async function rawRecognizeArtifact(img: ICVMat) {
    const cv = await getCV()
    const src = fromIMat(cv, img)
    const { splitLine, rects: rects1 } = await splitBottom(src)
    const rects2 = await splitTop(src, splitLine)
    const rects = [...rects2, ...rects1]
    const needOCR = ['name', 'main', 'sub', 'mainval', 'user', 'level']
    const results = [] as IArScannerLine[]
    for (const rect of rects) {
        if (needOCR.includes(rect.type) && rect.roi) {
            const result = await recognize(toIMat(cv, rect.roi))
            rect.roi.delete()
            results.push({
                type: rect.type,
                rect: rect.rect,
                ...result,
            })
            continue
        } else if (rect.type === 'lock' && rect.roi) {
            const lock = rect.roi
            cv.cvtColor(lock, lock, cv.COLOR_RGBA2GRAY, 0)
            cv.threshold(lock, lock, 110, 255, cv.THRESH_BINARY_INV)
            const locked = cv.countNonZero(lock) > 10
            lock.delete()
            results.push({
                type: rect.type,
                rect: rect.rect,
                text: locked ? '1' : '0',
                confidence: 100,
            })
        } else if (rect.roi) {
            // unused blocks. delete.
            rect.roi.delete()
        }
    }
    const nameRect = rects.find((e) => e.type === 'name')
    if (nameRect) {
        const colorPoint = {
            x: 2 * nameRect.rect.x + nameRect.rect.width,
            y: nameRect.mid,
        }
        const star = detectStars([...src.ucharPtr(colorPoint.y, colorPoint.x)])
        results.push({
            type: 'stars',
            text: star.toString(),
            confidence: 100,
            rect: {
                x: colorPoint.x,
                y: colorPoint.y,
                width: 1,
                height: 1,
            },
        })
    }
    src.delete()
    return results
}
export async function splitBottom(src: Mat) {
    const cv = await getCV()
    const dst = src.clone()
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0)
    cv.threshold(dst, dst, 200, 255, cv.THRESH_BINARY)
    const contours = new cv.MatVector()
    const hierarchy = new cv.Mat()
    const M8 = cv.Mat.ones(1, 16, cv.CV_8U)
    const M7 = cv.Mat.ones(3, 8, cv.CV_8U)
    cv.erode(dst, dst, M8)
    cv.findContours(dst, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0)
    cv.threshold(dst, dst, 200, 255, cv.THRESH_BINARY)
    let rects = []
    let splitLine = 0
    for (let i = 0; i < contours.size(); ++i) {
        const rect = cv.boundingRect(contours.get(i))
        if (rect.width < 6 || rect.height < 6) continue
        if (rect.height > src.rows / 2) {
            splitLine = rect.y - 5
            continue
        }
        rects.push({
            mid: rect.y + rect.height / 2,
            rect,
            type: '',
            roi: null as Mat | null,
        })
    }
    rects = rects.filter((e) => e.mid > splitLine).sort((a, b) => a.mid - b.mid)
    const maybeUser = rects[rects.length - 1]
    rects = rects.slice(0, 6)
    if (src.rows - maybeUser.rect.y - maybeUser.rect.height < maybeUser.rect.height) {
        maybeUser.type = 'user'
        cv.erode(dst, dst, M7)
        const roi = dst.roi(maybeUser.rect)
        cv.findContours(roi, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE)
        let minL = 9999
        let minT = 9999
        let maxB = 0
        let maxR = 0
        for (let i = 0; i < contours.size(); ++i) {
            const rect = cv.boundingRect(contours.get(i))
            if (rect.width >= roi.cols - 1) continue
            if (rect.height >= (roi.rows * 2) / 3) continue
            if (rect.height <= 5) continue
            if (rect.width <= 5) continue
            minL = Math.min(minL, rect.x)
            minT = Math.min(minT, rect.y)
            maxB = Math.max(maxB, rect.y + rect.height)
            maxR = Math.max(maxR, rect.x + rect.width)
        }
        maybeUser.rect = new cv.Rect(
            maybeUser.rect.x + minL + 3,
            maybeUser.rect.y + minT + 2,
            maxR - minL - 6,
            maxB - minT - 4,
        )
        maybeUser.roi = await await normalizeToYas(src.roi(maybeUser.rect), false)
        rects.push(maybeUser)
    }
    let index = 0
    for (const el of rects) {
        if (index < 2) {
            el.type = el.rect.x < src.cols / 2 ? 'level' : 'lock'
            if (el.type === 'level') {
                const roi = dst.roi(el.rect)
                cv.findContours(roi, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE)
                let minL = 9999
                let minT = 9999
                let maxB = 0
                let maxR = 0
                for (let i = 0; i < contours.size(); ++i) {
                    const rect = cv.boundingRect(contours.get(i))
                    if (rect.width >= roi.cols - 1) continue
                    if (rect.height >= roi.rows - 1) continue
                    minL = Math.min(minL, rect.x)
                    minT = Math.min(minT, rect.y)
                    maxB = Math.max(maxB, rect.y + rect.height)
                    maxR = Math.max(maxR, rect.x + rect.width)
                }
                roi.delete()
                el.rect = new cv.Rect(el.rect.x + minL, el.rect.y + minT, maxR - minL, maxB - minT)
                el.roi = await await normalizeToYas(src.roi(el.rect), false, {
                    post: (mat) => {
                        cv.threshold(mat, mat, 155, 255, cv.THRESH_BINARY)
                        cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY, 0)
                    },
                })
            }
        } else {
            el.type = 'sub'
            const ldiff = (el.rect.height * 3) / 4
            el.rect.x += ldiff
            el.rect.width -= ldiff
            try {
                el.roi = await normalizeToYas(src.roi(el.rect))
            } catch (e) {
                el.type = ''
            }
        }
        if (!el.roi) {
            el.roi = src.roi(el.rect)
        }
        index++
    }
    dst.delete()
    contours.delete()
    hierarchy.delete()
    M8.delete()
    M7.delete()
    return { rects, splitLine }
}
export async function splitTop(src: Mat, splitLine: number) {
    const cv = await getCV()
    const top = src.roi(new cv.Rect(0, 0, src.cols, splitLine))
    const dst = new cv.Mat()
    cv.cvtColor(top, dst, cv.COLOR_RGBA2GRAY, 0)
    cv.threshold(dst, dst, 170, 255, cv.THRESH_BINARY_INV)
    const M8 = cv.Mat.ones(1, 30, cv.CV_8U)
    cv.erode(dst, dst, M8)
    const contours = new cv.MatVector()
    const hierarchy = new cv.Mat()
    cv.findContours(dst, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

    let rects = []
    for (let i = 0; i < contours.size(); ++i) {
        const rect = cv.boundingRect(contours.get(i))
        if (rect.width < 10 || rect.height < 10) continue
        if (rect.width >= top.cols - 1) continue
        if (rect.x >= top.cols / 2) continue
        rects.push({
            mid: rect.y + rect.height / 2,
            rect,
            type: '',
            roi: null as Mat | null,
        })
    }
    rects = rects.sort((a, b) => a.mid - b.mid)
    rects = [
        {
            ...rects[0],
            type: 'name',
        },
        {
            ...rects[2],
            type: 'main',
        },
        {
            ...rects[3],
            type: 'mainval',
        },
    ]
    for (const el of rects) {
        el.rect.y = el.rect.y - 2
        el.rect.height = el.rect.height + 4
        el.roi = await normalizeToYas(top.roi(el.rect), true, {
            pre:
                el.type === 'main'
                    ? (img) => {
                          cv.threshold(img, img, 140, 255, cv.THRESH_BINARY_INV)
                          cv.cvtColor(img, img, cv.COLOR_RGBA2GRAY, 0)
                      }
                    : (img) => {
                          cv.threshold(img, img, 210, 255, cv.THRESH_BINARY_INV)
                          cv.cvtColor(img, img, cv.COLOR_RGBA2GRAY, 0)
                      },
            post:
                el.type === 'main'
                    ? (img) => {
                          cv.cvtColor(img, img, cv.COLOR_RGBA2GRAY, 0)
                          cv.threshold(img, img, 140, 255, cv.THRESH_BINARY)
                      }
                    : (roi) => {
                          cv.cvtColor(roi, roi, cv.COLOR_RGBA2GRAY, 0)
                          cv.threshold(roi, roi, 200, 255, cv.THRESH_BINARY)
                      },
        })
    }
    top.delete()
    dst.delete()
    contours.delete()
    hierarchy.delete()
    M8.delete()
    return rects
}

const starColors = [
    { R: 189, G: 105, B: 50 }, // 五星
    { R: 162, G: 86, B: 225 }, // 四星
    { R: 80, G: 128, B: 204 }, // 三星
    { R: 41, G: 144, B: 114 }, // 两星
    { R: 115, G: 118, B: 141 }, // 一星
]
const starColorMap = {
    189: 5,
    162: 4,
    80: 3,
    41: 2,
    115: 1,
} as Record<number, number>

export function detectStars(color: number[]) {
    const mapColor = {
        R: color[0],
        G: color[1],
        B: color[2],
    }
    const closestColor = closest(mapColor, starColors)
    return starColorMap[closestColor.R] || 0
}
