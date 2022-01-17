import { getCV } from '@/utils/cv'
import { Mat } from '@/utils/opencv'

export async function cvGetRect(src: Mat): Promise<{ x: number; y: number; width: number; height: number }> {
    const cv = await getCV()
    const dst = new cv.Mat()
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0)
    cv.threshold(dst, dst, 200, 250, cv.THRESH_BINARY)
    const contours = new cv.MatVector()
    const hierarchy = new cv.Mat()
    cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE)
    cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGB, 0)
    const dstsize = dst.size()
    const dw = dstsize.width / 2
    const dh = dstsize.height * 0.75
    let frect
    for (let i = 0; i < contours.size(); ++i) {
        const rect = cv.boundingRect(contours.get(i))
        if (rect.width < dw) continue
        if (rect.height < dh) continue
        if (Math.abs(rect.width - dstsize.width) < dw / 100) continue
        if (Math.abs(rect.height - dstsize.height) < dw / 100) continue
        const d2w = rect.width / 30
        const d2h = rect.height / 100
        rect.x += d2w
        rect.y += d2h
        rect.width -= 2 * d2w
        rect.height -= 2 * d2h
        frect = rect
    }
    dst.delete()
    hierarchy.delete()
    contours.delete()
    return frect
}

export async function cvDiffImage(m1: Mat, m2: Mat): Promise<Mat | false> {
    const cv = await getCV()
    const d1 = new cv.Mat()
    const d2 = new cv.Mat()
    cv.cvtColor(m1, d1, cv.COLOR_RGBA2GRAY, 0)
    cv.cvtColor(m2, d2, cv.COLOR_RGBA2GRAY, 0)
    cv.threshold(d1, d1, 160, 255, cv.THRESH_BINARY)
    cv.threshold(d2, d2, 160, 255, cv.THRESH_BINARY)
    const orb = new cv.ORB(300)
    const bf = new cv.BFMatcher(cv.NORM_HAMMING, true)
    const keypoints1 = new cv.KeyPointVector()
    const keypoints2 = new cv.KeyPointVector()
    const descriptors1 = new cv.Mat()
    const descriptors2 = new cv.Mat()
    orb.detectAndCompute(d1, new cv.Mat(), keypoints1, descriptors1)
    orb.detectAndCompute(d2, new cv.Mat(), keypoints2, descriptors2)
    d1.delete()
    d2.delete()
    const matches = new cv.DMatchVector()
    bf.match(descriptors1, descriptors2, matches)
    descriptors1.delete()
    descriptors2.delete()
    const count_diff = [] as number[]
    let store_diff = []
    for (let i = 0; i < matches.size(); i++) {
        if (matches.get(i).distance < 50) {
            const x1 = keypoints1.get(matches.get(i).queryIdx).pt.x
            const y1 = keypoints1.get(matches.get(i).queryIdx).pt.y
            const x2 = keypoints2.get(matches.get(i).trainIdx).pt.x
            const y2 = keypoints2.get(matches.get(i).trainIdx).pt.y
            if (y1 > y2 && x2 - x1 < 5) {
                const idx = Math.floor((y1 - y2) / 10)
                count_diff[idx] = (count_diff[idx] || 0) + 1
                store_diff.push(y1 - y2)
            }
        }
    }
    keypoints1.delete()
    keypoints2.delete()
    const mostDiffIndex = count_diff.indexOf(Math.max(...[...count_diff].map((e) => e || 0)))
    const diffMax = mostDiffIndex * 10 + 10
    const diffMin = mostDiffIndex * 10
    store_diff = store_diff.filter((e) => e >= diffMin && e <= diffMax)
    const diffMat = cv.matFromArray(store_diff.length, 1, cv.CV_32F, store_diff)
    const diffY = cv.mean(diffMat)[0] + m2.rows - m1.rows
    diffMat.delete()
    if (diffY < 32) {
        return false
    }
    const dst = m2.roi(new cv.Rect(0, m2.rows - diffY - 1, m2.cols, diffY))
    return dst
}

export async function cvSplitImage(src: Mat): Promise<number[]> {
    const cv = await getCV()
    const dst = src.roi(new cv.Rect(src.cols - src.cols / 3, 0, src.cols / 4, src.rows))
    cv.cvtColor(dst, dst, cv.COLOR_RGBA2GRAY, 0)
    cv.threshold(dst, dst, 223, 255, cv.THRESH_BINARY)
    const M7 = cv.Mat.ones(7, 7, cv.CV_8U)
    const M = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size((dst.cols / 3) * 2, 1))
    cv.erode(dst, dst, M7)
    cv.dilate(dst, dst, M)
    cv.dilate(dst, dst, M7)
    M7.delete()
    M.delete()
    const lines: number[] = []
    const contours = new cv.MatVector()
    const hierarchy = new cv.Mat()
    cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE)
    for (let i = 0; i < contours.size(); ++i) {
        const rect = cv.boundingRect(contours.get(i))
        if (rect.width < dst.cols * 0.9) continue
        lines.push(rect.y + rect.height)
    }
    lines.sort((a, b) => a - b)
    dst.delete()
    hierarchy.delete()
    contours.delete()
    return lines
}

export function cvSplitAchievement(cv: Awaited<ReturnType<typeof getCV>>, src: Mat) {
    const dst = new cv.Mat()
    const dst2 = new cv.Mat()
    const rgbaPlanes = new cv.MatVector()
    cv.split(src, rgbaPlanes)
    rgbaPlanes.get(2).copyTo(dst)
    rgbaPlanes.delete()
    cv.threshold(dst, dst, 170, 255, cv.THRESH_BINARY)
    const M7 = cv.Mat.ones(5, 15, cv.CV_8U)
    const MC = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(dst.cols / 5, 1))
    cv.dilate(dst, dst2, MC)
    cv.bitwise_not(dst2, dst2)
    cv.bitwise_or(dst, dst2, dst)
    cv.erode(dst, dst, M7)
    M7.delete()
    MC.delete()
    dst2.delete()
    const contours = new cv.MatVector()
    const hierarchy = new cv.Mat()
    cv.rectangle(
        dst,
        new cv.Point(1, 1),
        new cv.Point(dst.cols - 1, dst.rows - 1),
        new cv.Scalar(255, 255, 255, 255),
        1,
    )
    cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE)
    let rects = []
    for (let i = 0; i < contours.size(); ++i) {
        const rect = cv.boundingRect(contours.get(i))
        if (rect.width > dst.cols * 0.9) continue
        rects.push(rect)
    }
    dst.delete()
    hierarchy.delete()
    contours.delete()
    rects = rects.map((rect) => {
        let name = 'unknown'
        const roi = src.roi(rect)
        if (rect.x > 0.5 * src.cols) {
            // 右侧
            if (rect.width / rect.height <= 1.5) {
                name = 'reward'
                roi.delete()
            } else if (rect.y + rect.height > 0.8 * src.rows) {
                name = 'date'
                // 防止识别不完整
                rect.width = src.cols - rect.x - 1
                cv.resize(roi, roi, new cv.Size((roi.cols / roi.rows) * 32, 32), 0, 0, cv.INTER_AREA)
            } else {
                name = 'status'
                cv.resize(roi, roi, new cv.Size((roi.cols / roi.rows) * 32, 32), 0, 0, cv.INTER_AREA)
            }
        } else {
            // 左侧
            if (rect.width / rect.height <= 1.5) {
                name = 'icon'
                roi.delete()
                /*
                暂时不需要识别图标
                const low = new cv.Mat(roi.rows, roi.cols, roi.type(), [130, 100, 0, 255])
                const high = new cv.Mat(roi.rows, roi.cols, roi.type(), [255, 255, 255, 255])
                cv.inRange(roi, low, high, roi)
                low.delete()
                high.delete()
                cv.cvtColor(roi, roi, cv.COLOR_GRAY2RGBA, 0)
                */
            } else if (rect.y + rect.height / 2 < src.rows * 0.5) {
                name = 'title'
                cv.resize(roi, roi, new cv.Size((roi.cols / roi.rows) * 32, 32), 0, 0, cv.INTER_AREA)
            } else {
                name = 'subtitle'
                cv.resize(roi, roi, new cv.Size((roi.cols / roi.rows) * 32, 32), 0, 0, cv.INTER_AREA)
            }
        }
        return { name, rect: rect, roi }
    })
    rects = rects.filter((rect) => {
        // 去除过窄的矩形
        if (rect.rect.height < 5) return false
        // reward和icon都用不到，减少占用
        if (rect.name === 'reward') return false
        if (rect.name === 'icon') return false
        return true
    })
    src.delete()
    return rects
}
