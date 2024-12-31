import { Watermark } from '@pansy/watermark'
export function installWatermark() {
    const watermark = new Watermark({
        text: [process.env.VUE_APP_GIT_BRC as string, `#${process.env.VUE_APP_GIT_SHA}`],
        monitor: false,
        fontFamily: 'Consolas, monospace',
        gapX: 250,
        gapY: 250,
        fontSize: 20,
    })
    return watermark
}
