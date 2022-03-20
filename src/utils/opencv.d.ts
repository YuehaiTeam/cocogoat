/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
declare type MatType = any

export class NativeObject {
    delete: () => void
}

export class MatData extends ArrayBuffer {
    set: (data: ArrayBuffer) => void
}

export class Range {
    start: number
    end: number
    constructor(start: number, end: number)
}

export class Point {
    x: number
    y: number
    constructor(x: number, y: number)
}

export class Size {
    width: number
    height: number
    constructor(width: number, height: number)
}

export class Rect {
    x: number
    y: number
    width: number
    height: number
    constructor()
    constructor(rect: Rect)
    constructor(point: Point, size: Size)
    constructor(x: number, y: number, width: number, height: number)
}

export class Mat extends NativeObject {
    data: MatData
    constructor()
    constructor(width: number, height: number, type: number)
    constructor(width: number, height: number, type: number, dayata: ArrayLike)
    size: () => { width: number; height: number }
    cols: number
    rows: number
    channels: number
    empty: () => boolean
    clone: () => Mat
    copyTo: (dest: Mat) => void
    setTo: (value: number) => void
    get: (row: number, col: number) => number
    set: (row: number, col: number, value: number) => void
    roi: (rect: Rect) => Mat
    type: () => MatType
    static ones: (rows: number, cols: number, type: number) => Mat
    ucharPtr: (row: number, col: number) => Uint8Array
}

export class RotateRect {
    center: Point
    size: Size
    angle: number
    constructor()
    constructor(center: Point, size: Size, angle: number)
    static points: (obj: any) => any
    static boundingRect: (obj: any) => any
    static boundingRect2f: (obj: any) => any
}

export class Scalar extends Array {
    static all(v: number): Scalar
    constructor(v0: number, v1: number, v2: number, v3: number)
}

export class MinMaxLoc {
    minVal: number
    maxVal: number
    minLoc: Point
    maxLoc: Point
    constructor()
    constructor(minVal: number, maxVal: number, minLoc: Point, maxLoc: Point)
}

export class Circle {
    center: Point
    radius: number
    constructor()
    constructor(center: Point, radius: number)
}

export class TermCriteria {
    type: number
    maxCount: number
    epsilon: number
    constructor()
    constructor(type: number, maxCount: number, epsilon: number)
}

export interface _OpenCV {
    CV_8U: MatType
    CV_8UC1: MatType
    CV_8UC2: MatType
    CV_8UC3: MatType
    CV_8UC4: MatType
    CV_8S: MatType
    CV_8SC1: MatType
    CV_8SC2: MatType
    CV_8SC3: MatType
    CV_8SC4: MatType
    CV_16U: MatType
    CV_16UC1: MatType
    CV_16UC2: MatType
    CV_16UC3: MatType
    CV_16UC4: MatType
    CV_16S: MatType
    CV_16SC1: MatType
    CV_16SC2: MatType
    CV_16SC3: MatType
    CV_16SC4: MatType
    CV_32S: MatType
    CV_32SC1: MatType
    CV_32SC2: MatType
    CV_32SC3: MatType
    CV_32SC4: MatType
    CV_32F: MatType
    CV_32FC1: MatType
    CV_32FC2: MatType
    CV_32FC3: MatType
    CV_32FC4: MatType
    CV_64F: MatType
    CV_64FC1: MatType
    CV_64FC2: MatType
    CV_64FC3: MatType
    CV_64FC4: MatType

    matFromImageData(imgData: ImageData): Mat
    matFromArray(rows: number, cols: number, type: MatType, array: ArrayBuffer | number[]): Mat
    imshow(cvs: HTMLCanvasElement | string, mat: Mat): void
    imread(source: string | HTMLCanvasElement | HTMLImageElement): Mat
    cvtColor(source: Mat, dest: Mat, mode: MatType, _: number): unknown
    Mat: typeof Mat
    Rect: typeof Rect
    Point: typeof Point
}

export type OpenCV = {
    [key: string]: any
} & _OpenCV

export default OpenCV
