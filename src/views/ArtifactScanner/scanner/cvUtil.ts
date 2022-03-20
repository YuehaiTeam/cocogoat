import { getCV } from '@/utils/cv'
import { Mat } from '@/utils/opencv'
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
