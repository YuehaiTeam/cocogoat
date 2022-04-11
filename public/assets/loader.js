;(async function (d, w) {
    const p = new URL('/index.json', d.currentScript.src)
    const j = await fetch(p).then((r) => r.json())
    w.$cocogoat = w.$cocogoat || {
        endpoint: d.currentScript.dataset.endpoint || '',
        build: parseInt(j[0], 36),
    }
    ;(j[2] || []).forEach((e) => {
        const link = d.createElement('link')
        link.rel = 'stylesheet'
        link.href = e
        d.head.appendChild(link)
    })
    ;(j[1] || []).forEach((e) => {
        d.head.appendChild(d.createElement('script')).src = e
    })
})(document, window)
