;(async function (s, c, a) {
    const p = new URL('/index.json', s.src)
    const j = await fetch(p).then((r) => r.json())
    window.$cocogoat = window.$cocogoat || {
        endpoint: s.dataset.endpoint || '',
        build: parseInt(j[0], 36),
    }
    ;(j[2] || []).forEach((e) => {
        const link = c('link')
        link.rel = 'stylesheet'
        link.href = e
        a(link)
    })
    ;(j[1] || []).forEach((e) => {
        a(c('script')).src = e
    })
})(document.currentScript, document.createElement, document.head.appendChild)
