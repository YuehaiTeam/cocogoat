import { getCV } from '@/utils/cv'
import { Mat, Rect } from '@/utils/opencv'
import { mean, meanBy } from 'lodash-es'
export async function normalizeToYas(
    src: Mat,
    makeroi = true,
    { pre, post }: { pre?: (mat: Mat) => void; post?: (mat: Mat) => void } = {},
) {
    const cv = await getCV()
    const raw = src.clone()
    let roi
    if (makeroi) {
        if (!pre) {
            cv.threshold(src, src, 120, 255, cv.THRESH_BINARY)
            cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0)
        } else {
            pre(src)
        }
        const contours = new cv.MatVector()
        const hierarchy = new cv.Mat()
        cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE)
        let minL = 9999
        let minT = 9999
        let maxB = 0
        let maxR = 0
        for (let i = 0; i < contours.size(); ++i) {
            const rect = cv.boundingRect(contours.get(i))
            if (rect.width >= src.cols && rect.height >= src.rows) continue
            minL = Math.min(minL, rect.x)
            minT = Math.min(minT, rect.y)
            maxB = Math.max(maxB, rect.y + rect.height)
            maxR = Math.max(maxR, rect.x + rect.width)
        }
        roi = raw.roi(new cv.Rect(minL + 1, minT + 1, maxR - minL - 2, maxB - minT - 2))
        try {
            src.delete()
        } catch (e) {}
        try {
            raw.delete()
        } catch (e) {}
    } else {
        roi = raw
    }
    cv.resize(roi, roi, new cv.Size((roi.cols / roi.rows) * 32, 32), 0, 0, cv.INTER_LINEAR)
    if (post) {
        post(roi)
    } else {
        cv.threshold(roi, roi, 155, 255, cv.THRESH_BINARY)
        cv.cvtColor(roi, roi, cv.COLOR_RGBA2GRAY, 0)
        cv.bitwise_not(roi, roi)
    }
    const dst = new cv.Mat()
    cv.copyMakeBorder(roi, dst, 0, 0, 0, 384 - roi.cols, cv.BORDER_CONSTANT, new cv.Scalar(0, 0, 0, 255))
    roi.delete()
    return dst
}
export async function analyzeBag(src: Mat) {
    const cv = await getCV()
    const dst = new cv.Mat()
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0)
    cv.adaptiveThreshold(dst, dst, 255, cv.ADAPTIVE_THRESH_GUASS_C, cv.THRESH_BINARY, 3, 4)

    const M2 = cv.Mat.ones(3, 6, cv.CV_8U)
    cv.erode(dst, dst, M2)
    M2.delete()

    const contours = new cv.MatVector()
    const hierarchy = new cv.Mat()
    cv.findContours(dst, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
    let panelRect: Rect | null = null
    const rects = [] as Rect[]
    for (let i = 0; i < contours.size(); ++i) {
        const rect = cv.boundingRect(contours.get(i))
        if (rect.width === src.cols) continue
        if (rect.width < 16 || rect.height < 16) continue
        if (rect.height / rect.width > 10) continue
        if (rect.height > src.rows / 2) {
            if (panelRect && panelRect.x > rect.x) continue
            panelRect = rect
            continue
        }
        rects.push(rect)
    }
    if (!panelRect) {
        hierarchy.delete()
        contours.delete()
        dst.delete()
        throw new Error('Panel not found')
    }
    const borderR = panelRect.x - 10
    const borderL = src.cols - panelRect.x - panelRect.width - 10
    const borderT = panelRect.y - 10
    const borderB = panelRect.y + panelRect.height + 10
    const centerRect = new cv.Rect(borderL, borderT, borderR - borderL, borderB - borderT)
    const countRect = rects
        .filter((e) => e.x > borderR && e.y < borderT && e.width / e.height > 1.1)
        .sort((a, b) => b.x - a.x)[0]
    const deleteRect = rects.filter((e) => e.x < borderL && e.y > borderB).sort((a, b) => a.x - b.x)[0]
    const ptopRect = rects
        .filter(
            (e) => panelRect && e.x >= panelRect.x - 10 && e.y <= panelRect.y && e.y > countRect.y + countRect.height,
        )
        .sort((a, b) => a.y - b.y)[0]
    if (ptopRect) {
        panelRect.y = ptopRect.y - 10
        centerRect.y = ptopRect.y - 10
    }
    if (deleteRect) {
        panelRect.height = deleteRect.y - panelRect.y - 5
        centerRect.height = deleteRect.y - panelRect.y - 5
    }
    dst.delete()
    hierarchy.delete()
    contours.delete()
    return { panelRect, centerRect, countRect }
}
export async function analyzeBlocks(src: Mat, centerRect: Rect) {
    const cv = await getCV()
    const dst = new cv.Mat()
    const dst2 = new cv.Mat()
    const mask = new cv.Mat()
    const contours = new cv.MatVector()
    const hierarchy = new cv.Mat()
    const center = src.roi(centerRect)
    const rgbaPlanes = new cv.MatVector()
    cv.split(center, rgbaPlanes)
    const dtype = -1
    cv.subtract(rgbaPlanes.get(3), rgbaPlanes.get(2), dst, mask, dtype)
    cv.threshold(dst, dst, 40, 255, cv.THRESH_BINARY_INV)
    cv.subtract(rgbaPlanes.get(1), rgbaPlanes.get(2), dst2, mask, dtype)
    cv.threshold(dst2, dst2, 40, 255, cv.THRESH_BINARY_INV)
    cv.subtract(dst2, dst, dst, mask, dtype)
    const M3 = cv.Mat.ones(8, 3, cv.CV_8U)
    cv.erode(dst, dst, M3)
    M3.delete()
    cv.findContours(dst, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
    const xs = {} as Record<number, number>
    const ys = {} as Record<number, number>
    let blockRects = []
    for (let i = 0; i < contours.size(); ++i) {
        const rect = cv.boundingRect(contours.get(i))
        if (rect.width < center.cols / 14) continue
        if (rect.width > center.cols / 5) continue
        if (rect.height / rect.width > 2) continue
        blockRects.push(rect)
    }
    const avgW = meanBy(blockRects, 'width') / 2
    const avgH = meanBy(blockRects, 'height') / 2
    blockRects = blockRects.filter((e) => e.width > avgW && e.height > avgH)
    blockRects.forEach((rect) => {
        const dx = Math.round(Math.round((rect.x + rect.width / 2) / avgW) * avgW)
        const dy = Math.round(Math.round((rect.y + rect.height / 2) / avgH) * avgH)
        xs[dx] = xs[dx] + 1 || 1
        ys[dy] = ys[dy] + 1 || 1
    })
    const avgx = mean(Object.values(xs)) / 2
    const avgy = mean(Object.values(xs)) / 2
    const blocks = {
        x: [] as number[],
        y: [] as number[],
    }
    for (const i of Object.keys(xs)) {
        if (xs[Number(i)] < avgx) continue
        blocks.x.push(Number(i))
    }
    for (const i of Object.keys(ys)) {
        if (ys[Number(i)] < avgy) continue
        blocks.y.push(Number(i))
    }
    dst.delete()
    dst2.delete()
    mask.delete()
    hierarchy.delete()
    contours.delete()
    center.delete()
    return blocks
}
