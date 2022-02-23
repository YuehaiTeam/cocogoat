/*
 * Baidu Tongji / 百度统计
 * 内嵌并修改代码以实现统计file://下的页面
 */
function fakeLocation() {
    if (location.protocol === 'file:') {
        // file://下的页面，需要替换
        return {
            protocol: 'https:',
            host: 'file.local',
            hostname: 'file.local',
            port: '',
            pathname: location.hash.replace('#', ''),
            search: '',
            hash: '',
            href: 'https://file.local' + location.hash,
        }
    }
    return location
}
;(function () {
    var h = {},
        mt = {},
        c = {
            id: '9fa0c980766e6a8646c0f814aa40b130',
            dm: ['cocogoat.work'],
            js: 'tongji.baidu.com/hm-web/js/',
            etrk: [],
            cetrk: [],
            cptrk: [],
            icon: '',
            ctrk: [],
            nv: -1,
            vdur: 1800000,
            age: 31536000000,
            rec: 0,
            rp: [],
            trust: 0,
            vcard: 0,
            qiao: 0,
            lxb: 0,
            kbtrk: 0,
            pt: 0,
            spa: 0,
            oc: 0,
            aet: '',
            hca: '5044A4C774051DBD',
            conv: 0,
            ab: 0,
            med: 0,
            cvcc: '',
            cvcf: [],
            apps: '',
        }
    var s = void 0,
        u = !0,
        v = null,
        w = !1
    mt.cookie = {}
    mt.cookie.set = function (a, b, d) {
        var e
        d.Q && ((e = new Date()), e.setTime(e.getTime() + d.Q))
        document.cookie =
            a +
            '=' +
            b +
            (d.domain ? '; domain=' + d.domain : '') +
            (d.path ? '; path=' + d.path : '') +
            (e ? '; expires=' + e.toGMTString() : '') +
            (d.Mc ? '; secure' : '')
    }
    mt.cookie.get = function (a) {
        return (a = RegExp('(^| )' + a + '=([^;]*)(;|$)').exec(document.cookie)) ? a[2] : v
    }
    mt.cookie.fc = function (a, b) {
        try {
            var d = 'Hm_ck_' + +new Date()
            mt.cookie.set(d, 'is-cookie-enabled', {
                domain: a,
                path: b,
                Q: s,
            })
            var e = 'is-cookie-enabled' === mt.cookie.get(d) ? '1' : '0'
            mt.cookie.set(d, '', {
                domain: a,
                path: b,
                Q: -1,
            })
            return e
        } catch (f) {
            return '0'
        }
    }
    mt.lang = {}
    mt.lang.m = function (a, b) {
        return '[object ' + b + ']' === {}.toString.call(a)
    }
    mt.lang.w = function (a) {
        return mt.lang.m(a, 'Function')
    }
    mt.lang.g = function (a) {
        return mt.lang.m(a, 'Object')
    }
    mt.lang.Wa = function (a) {
        return mt.lang.m(a, 'Number') && isFinite(a)
    }
    mt.lang.I = function (a) {
        return mt.lang.m(a, 'String')
    }
    mt.lang.isArray = function (a) {
        return mt.lang.m(a, 'Array')
    }
    mt.lang.h = function (a) {
        return a.replace ? a.replace(/'/g, "'0").replace(/\*/g, "'1").replace(/!/g, "'2") : a
    }
    mt.lang.trim = function (a) {
        return a.replace(/^\s+|\s+$/g, '')
    }
    mt.lang.H = function (a, b) {
        var d = w
        if (a == v || !mt.lang.m(a, 'Array') || b === s) return d
        if (Array.prototype.indexOf) d = -1 !== a.indexOf(b)
        else
            for (var e = 0; e < a.length; e++)
                if (a[e] === b) {
                    d = u
                    break
                }
        return d
    }
    mt.lang.find = function (a, b, d) {
        for (var e = a.length, f = 0; f < e; f++) if (f in a && b.call(d || a, a[f], f)) return a[f]
        return v
    }
    mt.lang.filter = function (a, b, d) {
        var e = [],
            f = 0,
            m = a.length,
            g,
            l
        if (mt.lang.w(b)) for (l = 0; l < m; l++) if (((g = a[l]), u === b.call(d || a, g, l))) e[f++] = g
        return e
    }
    mt.lang.unique = function (a, b) {
        var d = a.length,
            e = a.slice(0),
            f,
            m
        for (
            mt.lang.w(b) ||
            (b = function (e, a) {
                return e === a
            });
            0 < --d;

        ) {
            m = e[d]
            for (f = d; f--; )
                if (b(m, e[f])) {
                    e.splice(d, 1)
                    break
                }
        }
        return e
    }
    mt.lang.Lc = function (a, b) {
        function d(a) {
            a = (e + e + Number(a).toString(2)).slice(-64)
            return [parseInt(a.slice(0, 32), 2), parseInt(a.slice(-32), 2)]
        }
        for (var e = '', f = 0; 32 > f; f++) e += '0'
        var f = d(a),
            m = d(b)
        return parseInt(
            (e + ((f[0] | m[0]) >>> 0).toString(2)).slice(-32) + (e + ((f[1] | m[1]) >>> 0).toString(2)).slice(-32),
            2,
        )
    }
    mt.url = {}
    mt.url.j = function (a, b) {
        var d = a.match(RegExp('(^|&|\\?|#)(' + b + ')=([^&#]*)(&|$|#)', ''))
        return d ? d[3] : v
    }
    mt.url.Gc = function (a) {
        return (a = a.match(/^(https?:)\/\//)) ? a[1] : v
    }
    mt.url.Kb = function (a) {
        return (a = a.match(/^(https?:\/\/)?([^\/\?#]*)/)) ? a[2].replace(/.*@/, '') : v
    }
    mt.url.T = function (a) {
        return (a = mt.url.Kb(a)) ? a.replace(/:\d+$/, '') : a
    }
    mt.url.sa = function (a) {
        return (a = a.match(/^(https?:\/\/)?[^\/]*(.*)/)) ? a[2].replace(/[\?#].*/, '').replace(/^$/, '/') : v
    }
    mt.url.Xa = function (a, b) {
        a = a.replace(/^https?:\/\//, '')
        return 0 === a.indexOf(b)
    }
    mt.url.za = function (a, b) {
        a = '.' + a.replace(/:\d+/, '')
        b = '.' + b.replace(/:\d+/, '')
        var d = a.indexOf(b)
        return -1 < d && d + b.length === a.length
    }
    ;(function () {
        var a = mt.lang,
            b = mt.url
        mt.f = {}
        mt.f.Cb = function (a) {
            return document.getElementById(a)
        }
        mt.f.qa = function (a) {
            if (!a) return v
            try {
                a = String(a)
                if (0 === a.indexOf('!HMCQ!')) return a
                if (0 === a.indexOf('!HMCC!')) return document.querySelector(a.substring(6, a.length))
                for (var e = a.split('>'), b = document.body, m = e.length - 1; 0 <= m; m--)
                    if (-1 < e[m].indexOf('#')) {
                        var g = e[m].split('#')[1]
                        ;(b = document.getElementById(g)) || (b = document.getElementById(decodeURIComponent(g)))
                        e = e.splice(m + 1, e.length - (m + 1))
                        break
                    }
                for (a = 0; b && a < e.length; ) {
                    var l = String(e[a]).toLowerCase()
                    if (!('html' === l || 'body' === l)) {
                        var m = 0,
                            p = e[a].match(/\[(\d+)\]/i),
                            g = []
                        if (p) (m = p[1] - 1), (l = l.split('[')[0])
                        else if (1 !== b.childNodes.length) {
                            for (var q = 0, t = 0, r = b.childNodes.length; t < r; t++) {
                                var x = b.childNodes[t]
                                1 === x.nodeType && x.nodeName.toLowerCase() === l && q++
                                if (1 < q) return v
                            }
                            if (1 !== q) return v
                        }
                        for (q = 0; q < b.childNodes.length; q++)
                            1 === b.childNodes[q].nodeType &&
                                b.childNodes[q].nodeName.toLowerCase() === l &&
                                g.push(b.childNodes[q])
                        if (!g[m]) return v
                        b = g[m]
                    }
                    a++
                }
                return b
            } catch (k) {
                return v
            }
        }
        mt.f.sa = function (a, e) {
            var b = [],
                m = []
            if (!a) return m
            for (; a.parentNode != v; ) {
                for (var g = 0, l = 0, p = a.parentNode.childNodes.length, q = 0; q < p; q++) {
                    var t = a.parentNode.childNodes[q]
                    if (t.nodeName === a.nodeName && (g++, t === a && (l = g), 0 < l && 1 < g)) break
                }
                if ((p = '' !== a.id) && e) {
                    b.unshift('#' + encodeURIComponent(a.id))
                    break
                } else
                    p &&
                        ((p = '#' + encodeURIComponent(a.id)),
                        (p = 0 < b.length ? p + '>' + b.join('>') : p),
                        m.push(p)),
                        b.unshift(encodeURIComponent(String(a.nodeName).toLowerCase()) + (1 < g ? '[' + l + ']' : ''))
                a = a.parentNode
            }
            m.push(b.join('>'))
            return m
        }
        mt.f.ta = function (a) {
            return (a = mt.f.sa(a, u)) && a.length ? String(a[0]) : ''
        }
        mt.f.Nb = function (a) {
            return mt.f.sa(a, w)
        }
        mt.f.Db = function (a) {
            var e
            for (e = 'A'; (a = a.parentNode) && 1 == a.nodeType; ) if (a.tagName == e) return a
            return v
        }
        mt.f.Gb = function (a) {
            return 9 === a.nodeType ? a : a.ownerDocument || a.document
        }
        mt.f.Lb = function (a) {
            var e = {
                top: 0,
                left: 0,
            }
            if (!a) return e
            var b = mt.f.Gb(a).documentElement
            'undefined' !== typeof a.getBoundingClientRect && (e = a.getBoundingClientRect())
            return {
                top: e.top + (window.pageYOffset || b.scrollTop) - (b.clientTop || 0),
                left: e.left + (window.pageXOffset || b.scrollLeft) - (b.clientLeft || 0),
            }
        }
        mt.f.getAttribute = function (a, e) {
            var b = (a.getAttribute && a.getAttribute(e)) || v
            if (!b && a.attributes && a.attributes.length)
                for (var m = a.attributes, g = m.length, l = 0; l < g; l++) m[l].nodeName === e && (b = m[l].nodeValue)
            return b
        }
        mt.f.S = function (a) {
            var e = 'document'
            a.tagName !== s && (e = a.tagName)
            return e.toLowerCase()
        }
        mt.f.Rb = function (b) {
            var e = ''
            b.textContent ? (e = a.trim(b.textContent)) : b.innerText && (e = a.trim(b.innerText))
            e && (e = e.replace(/\s+/g, ' ').substring(0, 255))
            return e
        }
        mt.f.R = function (d, e) {
            var f
            a.I(d) && 0 === String(d).indexOf('!HMCQ!')
                ? ((f = String(d)), (f = b.j(fakeLocationhref, f.substring(6, f.length))))
                : a.I(d) ||
                  ((f = mt.f.S(d)),
                  'input' === f && e && ('button' === d.type || 'submit' === d.type)
                      ? (f = a.trim(d.value) || '')
                      : 'input' === f && !e && 'password' !== d.type
                      ? (f = a.trim(d.value) || '')
                      : 'img' === f
                      ? ((f = mt.f.getAttribute), (f = f(d, 'alt') || f(d, 'title') || f(d, 'src')))
                      : (f = 'body' === f || 'html' === f ? ['(hm-default-content-for-', f, ')'].join('') : mt.f.Rb(d)))
            return String(f || '').substring(0, 255)
        }
        ;(function () {
            ;(mt.f.ic = (function () {
                function a() {
                    if (!a.ea) {
                        a.ea = u
                        for (var b = 0, e = m.length; b < e; b++) m[b]()
                    }
                }
                function b() {
                    try {
                        document.documentElement.doScroll('left')
                    } catch (f) {
                        setTimeout(b, 1)
                        return
                    }
                    a()
                }
                var f = w,
                    m = [],
                    g
                document.addEventListener
                    ? (g = function () {
                          document.removeEventListener('DOMContentLoaded', g, w)
                          a()
                      })
                    : document.attachEvent &&
                      (g = function () {
                          'complete' === document.readyState && (document.detachEvent('onreadystatechange', g), a())
                      })
                ;(function () {
                    if (!f)
                        if (((f = u), 'complete' === document.readyState)) a.ea = u
                        else if (document.addEventListener)
                            document.addEventListener('DOMContentLoaded', g, w), window.addEventListener('load', a, w)
                        else if (document.attachEvent) {
                            document.attachEvent('onreadystatechange', g)
                            window.attachEvent('onload', a)
                            var l = w
                            try {
                                l = window.frameElement == v
                            } catch (m) {}
                            document.documentElement.doScroll && l && b()
                        }
                })()
                return function (b) {
                    a.ea ? b() : m.push(b)
                }
            })()).ea = w
        })()
        return mt.f
    })()
    mt.event = {}
    mt.event.d = function (a, b, d) {
        a.attachEvent
            ? a.attachEvent('on' + b, function (b) {
                  d.call(a, b)
              })
            : a.addEventListener && a.addEventListener(b, d, w)
    }
    mt.event.preventDefault = function (a) {
        a.preventDefault ? a.preventDefault() : (a.returnValue = w)
    }
    ;(function () {
        var a = mt.event
        mt.e = {}
        mt.e.Va = /msie (\d+\.\d+)/i.test(navigator.userAgent)
        mt.e.Fc = function () {
            if (document.documentMode) return document.documentMode
            var a = /msie (\d+\.\d+)/i.exec(navigator.userAgent)
            return a ? +a[1] || 0 : 0
        }
        mt.e.Ic = function () {
            try {
                return (
                    !!navigator.userAgent.match(/safari/i) &&
                    !navigator.userAgent.match(/chrome/i) &&
                    'undefined' !== typeof document.body.style.webkitFilter &&
                    !window.chrome
                )
            } catch (a) {
                return w
            }
        }
        mt.e.cookieEnabled = navigator.cookieEnabled
        mt.e.javaEnabled = navigator.javaEnabled()
        mt.e.language =
            navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage || ''
        mt.e.kc = (window.screen.width || 0) + 'x' + (window.screen.height || 0)
        mt.e.colorDepth = window.screen.colorDepth || 0
        mt.e.Pb = function () {
            var a
            a = a || document
            return parseInt(window.pageYOffset || a.documentElement.scrollTop || (a.body && a.body.scrollTop) || 0, 10)
        }
        mt.e.Sa = function () {
            var a = document
            return parseInt(
                window.innerHeight || a.documentElement.clientHeight || (a.body && a.body.clientHeight) || 0,
                10,
            )
        }
        mt.e.G = function () {
            return mt.e.Pb() + mt.e.Sa()
        }
        mt.e.mb = 0
        mt.e.Tb = function () {
            var a = document
            return parseInt(window.innerWidth || a.documentElement.clientWidth || a.body.offsetWidth || 0, 10)
        }
        mt.e.orientation = 0
        ;(function () {
            function b() {
                var a = 0
                window.orientation !== s && (a = window.orientation)
                screen && screen.orientation && screen.orientation.angle !== s && (a = screen.orientation.angle)
                mt.e.orientation = a
                mt.e.mb = mt.e.Tb()
            }
            b()
            a.d(window, 'orientationchange', b)
        })()
        return mt.e
    })()
    mt.A = {}
    mt.A.parse = function (a) {
        return new Function('return (' + a + ')')()
    }
    mt.A.stringify = (function () {
        function a(a) {
            ;/["\\\x00-\x1f]/.test(a) &&
                (a = a.replace(/["\\\x00-\x1f]/g, function (a) {
                    var b = d[a]
                    if (b) return b
                    b = a.charCodeAt()
                    return '\\u00' + Math.floor(b / 16).toString(16) + (b % 16).toString(16)
                }))
            return '"' + a + '"'
        }
        function b(a) {
            return 10 > a ? '0' + a : a
        }
        var d = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\',
        }
        return function (e) {
            switch (typeof e) {
                case 'undefined':
                    return 'undefined'
                case 'number':
                    return isFinite(e) ? String(e) : 'null'
                case 'string':
                    return a(e)
                case 'boolean':
                    return String(e)
                default:
                    if (e === v) return 'null'
                    if (e instanceof Array) {
                        var f = ['['],
                            d = e.length,
                            g,
                            l,
                            p
                        for (l = 0; l < d; l++)
                            switch (((p = e[l]), typeof p)) {
                                case 'undefined':
                                case 'function':
                                case 'unknown':
                                    break
                                default:
                                    g && f.push(','), f.push(mt.A.stringify(p)), (g = 1)
                            }
                        f.push(']')
                        return f.join('')
                    }
                    if (e instanceof Date)
                        return (
                            '"' +
                            e.getFullYear() +
                            '-' +
                            b(e.getMonth() + 1) +
                            '-' +
                            b(e.getDate()) +
                            'T' +
                            b(e.getHours()) +
                            ':' +
                            b(e.getMinutes()) +
                            ':' +
                            b(e.getSeconds()) +
                            '"'
                        )
                    g = ['{']
                    l = mt.A.stringify
                    for (d in e)
                        if (Object.prototype.hasOwnProperty.call(e, d))
                            switch (((p = e[d]), typeof p)) {
                                case 'undefined':
                                case 'unknown':
                                case 'function':
                                    break
                                default:
                                    f && g.push(','), (f = 1), g.push(l(d) + ':' + l(p))
                            }
                    g.push('}')
                    return g.join('')
            }
        }
    })()
    mt.localStorage = {}
    mt.localStorage.ka = function () {
        if (!mt.localStorage.l)
            try {
                ;(mt.localStorage.l = document.createElement('input')),
                    (mt.localStorage.l.type = 'hidden'),
                    (mt.localStorage.l.style.display = 'none'),
                    mt.localStorage.l.addBehavior('#default#userData'),
                    document.getElementsByTagName('head')[0].appendChild(mt.localStorage.l)
            } catch (a) {
                return w
            }
        return u
    }
    mt.localStorage.set = function (a, b, d) {
        var e = new Date()
        e.setTime(e.getTime() + (d || 31536e6))
        try {
            window.localStorage
                ? ((b = e.getTime() + '|' + b), window.localStorage.setItem(a, b))
                : mt.localStorage.ka() &&
                  ((mt.localStorage.l.expires = e.toUTCString()),
                  mt.localStorage.l.load(fakeLocation().hostname),
                  mt.localStorage.l.setAttribute(a, b),
                  mt.localStorage.l.save(fakeLocation().hostname))
        } catch (f) {}
    }
    mt.localStorage.get = function (a) {
        if (window.localStorage) {
            if ((a = window.localStorage.getItem(a))) {
                var b = a.indexOf('|'),
                    d = a.substring(0, b) - 0
                if (d && d > new Date().getTime()) return a.substring(b + 1)
            }
        } else if (mt.localStorage.ka())
            try {
                return mt.localStorage.l.load(fakeLocation().hostname), mt.localStorage.l.getAttribute(a)
            } catch (e) {}
        return v
    }
    mt.localStorage.remove = function (a) {
        if (window.localStorage) window.localStorage.removeItem(a)
        else if (mt.localStorage.ka())
            try {
                mt.localStorage.l.load(fakeLocation().hostname),
                    mt.localStorage.l.removeAttribute(a),
                    mt.localStorage.l.save(fakeLocation().hostname)
            } catch (b) {}
    }
    mt.sessionStorage = {}
    mt.sessionStorage.set = function (a, b) {
        try {
            window.sessionStorage && window.sessionStorage.setItem(a, b)
        } catch (d) {}
    }
    mt.sessionStorage.get = function (a) {
        try {
            return window.sessionStorage ? window.sessionStorage.getItem(a) : v
        } catch (b) {
            return v
        }
    }
    mt.sessionStorage.remove = function (a) {
        try {
            window.sessionStorage && window.sessionStorage.removeItem(a)
        } catch (b) {}
    }
    ;(function () {
        var a = mt.A
        mt.P = {}
        mt.P.log = function (a, d) {
            var e = new Image(),
                f = 'mini_tangram_log_' + Math.floor(2147483648 * Math.random()).toString(36)
            window[f] = e
            e.onload = function () {
                e.onload = v
                e = window[f] = v
                d && d(a)
            }
            e.src = a
        }
        mt.P.get = function (a, d) {
            return mt.P.rb({
                url: a,
                method: 'GET',
                data: d.data,
                timeout: d.timeout,
                noCache: u,
                success: d.success,
                fail: d.fail,
            })
        }
        mt.P.rb = function (b) {
            function d(n) {
                var e = b[n]
                if (e)
                    if ((t && clearTimeout(t), 'success' !== n)) e && e(q)
                    else {
                        var f
                        try {
                            f = a.parse(q.responseText)
                        } catch (r) {
                            e && e(q)
                            return
                        }
                        e && e(q, f)
                    }
            }
            b = b || {}
            var e = (function (a) {
                    var b = [],
                        e
                    for (e in a) a.hasOwnProperty(e) && b.push(encodeURIComponent(e) + '=' + encodeURIComponent(a[e]))
                    return b.join('&')
                })(b.data || {}),
                f = b.url,
                m = (b.method || 'GET').toUpperCase(),
                g = b.headers || {},
                l = b.timeout || 0,
                p = b.noCache || w,
                q,
                t
            try {
                a: if (window.XMLHttpRequest) q = new XMLHttpRequest()
                else {
                    try {
                        q = new ActiveXObject('Microsoft.XMLHTTP')
                        break a
                    } catch (r) {}
                    q = s
                }
                'GET' === m &&
                    (e && ((f += (0 <= f.indexOf('?') ? '&' : '?') + e), (e = v)),
                    p && (f += (0 <= f.indexOf('?') ? '&' : '?') + 'b' + +new Date() + '=1'))
                q.open(m, f, u)
                q.onreadystatechange = function () {
                    if (4 === q.readyState) {
                        var a = 0
                        try {
                            a = q.status
                        } catch (e) {
                            d('fail')
                            return
                        }
                        ;(200 <= a && 300 > a) || 304 === a || 1223 === a ? d('success') : d('fail')
                    }
                }
                for (var x in g) g.hasOwnProperty(x) && q.setRequestHeader(x, g[x])
                l &&
                    (t = setTimeout(function () {
                        q.onreadystatechange = function () {}
                        q.abort()
                        d('fail')
                    }, l))
                q.send(e)
            } catch (k) {
                d('fail')
            }
            return q
        }
        return mt.P
    })()
    mt.jb = {}
    mt.jb.Sb = function () {
        var a = ''
        if (navigator.plugins && navigator.mimeTypes.length) {
            var b = navigator.plugins['Shockwave Flash']
            b && b.description && (a = b.description.replace(/^.*\s+(\S+)\s+\S+$/, '$1'))
        } else if (window.ActiveXObject)
            try {
                if ((b = new ActiveXObject('ShockwaveFlash.ShockwaveFlash')))
                    (a = b.GetVariable('$version')) && (a = a.replace(/^.*\s+(\d+),(\d+).*$/, '$1.$2'))
            } catch (d) {}
        return a
    }
    h.D = {
        Hc: 'http://tongji.baidu.com/hm-web/welcome/ico',
        fb: 'hm.baidu.com/hm.gif',
        sb: /^(tongji|hmcdn).baidu.com$/,
        vc: 'tongji.baidu.com',
        Xb: 'hmmd',
        Yb: 'hmpl',
        yc: 'utm_medium',
        Wb: 'hmkw',
        Ac: 'utm_term',
        Ub: 'hmci',
        xc: 'utm_content',
        Zb: 'hmsr',
        zc: 'utm_source',
        Vb: 'hmcu',
        wc: 'utm_campaign',
        O: 0,
        L: Math.round(+new Date() / 1e3),
        protocol: 'https:' === fakeLocation().protocol ? 'https:' : 'http:',
        Aa: 'https:',
        Jc: 0,
        Cc: 6e5,
        Kc: 6e5,
        lc: 5e3,
        Dc: 5,
        Pa: 1024,
        Bc: 1,
        Ca: 2147483647,
        lb: 'hca kb cc cf ci ck cl cm cp cu cw ds vl ep et fl ja ln lo lt rnd si su v cv lv api sn r ww p ct u tt'.split(
            ' ',
        ),
        U: u,
        Ma: ['a', 'input', 'button'],
        Ja: {
            id: 'data-hm-id',
            Z: 'data-hm-class',
            Y: 'data-hm-xpath',
            content: 'data-hm-content',
            ga: 'data-hm-tag',
            link: 'data-hm-link',
        },
        La: 'data-hm-enabled',
        Ka: 'data-hm-disabled',
        hc: 'https://hmcdn.baidu.com/static/tongji/plugins/',
        eb: ['UrlChangeTracker', 'OcpcCbHm'],
    }
    ;(function () {
        var a = {
            F: {},
            d: function (a, d) {
                this.F[a] = this.F[a] || []
                this.F[a].push(d)
            },
            M: function (a, d) {
                this.F[a] = this.F[a] || []
                for (var e = this.F[a].length, f = 0; f < e; f++) this.F[a][f](d)
            },
        }
        return (h.z = a)
    })()
    ;(function () {
        var a = mt.lang,
            b = /^https?:\/\//,
            d = {
                Fb: function (a) {
                    var b
                    try {
                        b = JSON.parse(decodeURIComponent(a[0]))
                    } catch (d) {}
                    return b
                },
                Ya: function (a, b) {
                    return d.Za(h.c && h.c.b && h.c.b.u, a, b) || d.Za(fakeLocation().href, a, b)
                },
                Za: function (a, f, d) {
                    if (a === s) return w
                    b.test(f) || (a = a.replace(b, ''))
                    f = f.replace(/\/$/, '')
                    a = a.replace(/\/$/, '')
                    d && (a = a.replace(/^(https?:\/\/)?www\./, '$1'))
                    return RegExp('^' + f.replace(/[?.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$').test(a)
                },
                ba: function (b, f) {
                    var m = d.Fb(b)
                    if (!a.m(m, 'Undefined')) {
                        if (a.isArray(m)) {
                            for (var g = 0; g < m.length; g++) if (d.Ya(m[g], f)) return u
                            return w
                        }
                        if (a.g(m)) {
                            var g = [],
                                l
                            for (l in m) m.hasOwnProperty(l) && d.Ya(l, f) && (g = g.concat(m[l]))
                            return g
                        }
                    }
                },
            }
        return (h.na = d)
    })()
    ;(function () {
        function a(a, e) {
            var f = document.createElement('script')
            f.charset = 'utf-8'
            b.w(e) &&
                (f.readyState
                    ? (f.onreadystatechange = function () {
                          if ('loaded' === f.readyState || 'complete' === f.readyState) (f.onreadystatechange = v), e()
                      })
                    : (f.onload = function () {
                          e()
                      }))
            f.src = a
            var m = document.getElementsByTagName('script')[0]
            m.parentNode.insertBefore(f, m)
        }
        var b = mt.lang
        return (h.load = a)
    })()
    ;(function () {
        var a = mt.url,
            b = mt.cookie,
            d = mt.localStorage,
            e = mt.sessionStorage,
            f = {
                getData: function (a) {
                    try {
                        return b.get(a) || e.get(a) || d.get(a)
                    } catch (f) {}
                },
                setData: function (a, g, l) {
                    try {
                        b.set(a, g, {
                            domain: f.ca(),
                            path: f.pa(),
                            Q: l,
                        }),
                            l ? d.set(a, g, l) : e.set(a, g)
                    } catch (p) {}
                },
                removeData: function (a) {
                    try {
                        b.set(a, '', {
                            domain: f.ca(),
                            path: f.pa(),
                            Q: -1,
                        }),
                            e.remove(a),
                            d.remove(a)
                    } catch (g) {}
                },
                ca: function () {
                    for (var b = fakeLocation().hostname, e = 0, f = c.dm.length; e < f; e++)
                        if (a.za(b, c.dm[e])) return c.dm[e].replace(/(:\d+)?[/?#].*/, '')
                    return b
                },
                pa: function () {
                    for (var b = 0, e = c.dm.length; b < e; b++) {
                        var f = c.dm[b]
                        if (-1 < f.indexOf('/') && a.Xa(fakeLocation().href, f))
                            return f.replace(/^[^/]+(\/.*)/, '$1') + '/'
                    }
                    return '/'
                },
            }
        return (h.$ = f)
    })()
    ;(function () {
        var a = mt.lang,
            b = mt.A,
            d = h.$,
            e = {
                pageview: {},
                session: {},
                autoEventTracking: {},
                customEvent: {},
                user: {},
            },
            f = {
                user: 1,
                session: 2,
                pageview: 3,
                autoEventTracking: 3,
                customEvent: 3,
                others: 3,
            },
            m = ['session', 'user'],
            g = 'Hm_up_' + c.id,
            l = {
                init: function () {
                    l.bc()
                },
                bc: function () {
                    try {
                        var f = b.parse(decodeURIComponent(d.getData(g)))
                        a.g(f) && (e.user = f)
                    } catch (q) {}
                },
                t: function (a) {
                    var b = {}
                    e[a] !== s && (b = e[a])
                    a = this.ua()
                    for (var f in b) b.hasOwnProperty(f) && (a[f] = b[f])
                    return a
                },
                ua: function () {
                    for (var a = {}, b, f = m.length - 1; 0 <= f; f--) {
                        b = e[m[f]]
                        for (var r in b) b.hasOwnProperty(r) && (a[r] = b[r])
                    }
                    return a
                },
                setProperty: function (f, d, g) {
                    var r = e[f]
                    if (a.g(r) && a.g(d)) {
                        for (var x in d)
                            if (d.hasOwnProperty(x)) {
                                var k = a.h(String(x))
                                if (
                                    g ||
                                    (!/^_/.test(k) && !/_$/.test(k)) ||
                                    /^(_iden|ei_|ec_|ex_|en_|et_|el_)$/.test(k)
                                ) {
                                    var n = d[x]
                                    if (n == v) delete r[k]
                                    else {
                                        if (a.g(n) || a.isArray(n)) n = b.stringify(n)
                                        n = a.h(String(n))
                                        l.ec(f, k, n) &&
                                            (r[k] = {
                                                value: n,
                                                scope: l.Ra(f),
                                            })
                                    }
                                }
                            }
                        'user' === f && l.Ea()
                    }
                },
                o: function (b) {
                    b !== s &&
                        ('userId' === b && a.g(e.user)
                            ? (delete e.user.uid_, l.Ea())
                            : 'user' === b && a.g(e.user)
                            ? ((b = e.user.uid_),
                              (e.user =
                                  b === s
                                      ? {}
                                      : {
                                            uid_: b,
                                        }),
                              l.Ea())
                            : e[b] !== s && (e[b] = {}))
                },
                Ea: function () {
                    try {
                        d.setData(g, encodeURIComponent(b.stringify(e.user)), c.age)
                    } catch (a) {}
                },
                ec: function (a, b, f) {
                    var r = u,
                        d = e[a]
                    if (256 < encodeURIComponent(String(b)).length || 256 < encodeURIComponent(String(f)).length) r = w
                    else {
                        var k = d[b]
                        d[b] = {
                            value: f,
                            scope: l.Ra(a),
                        }
                        a = l.K(l.t(a))
                        2048 < encodeURIComponent(a).length && (k !== s ? (d[b] = k) : delete d[b], (r = w))
                    }
                    return r
                },
                K: function (a) {
                    var b = [],
                        e,
                        f
                    for (f in a)
                        a.hasOwnProperty(f) &&
                            ((e = [f, a[f].value]),
                            (1 === a[f].scope || 2 === a[f].scope) && e.push(a[f].scope),
                            b.push(e.join('*')))
                    return b.join('!')
                },
                Ra: function (a) {
                    a = f[a]
                    return a !== s ? a : f.others
                },
            }
        return (h.N = l)
    })()
    ;(function () {
        var a = mt.f,
            b = mt.lang,
            d = h.z,
            e = h.na,
            f = h.N,
            m = f.K
        if (b.isArray(c.cptrk) && 0 < c.cptrk.length) {
            var g = {
                cb: {},
                ha: {},
                init: function () {
                    for (var a, f = e.ba(c.cptrk) || [], d = 0; d < f.length; d++)
                        if (((a = f[d]), a.a !== s && b.g(a.a))) {
                            a = a.a
                            for (var m in a) a.hasOwnProperty(m) && (g.ha[m] = String(a[m]))
                        }
                },
                bb: function () {
                    var b, e, f
                    for (f in g.ha)
                        if (g.ha.hasOwnProperty(f) && g.cb[f] === s && ((b = g.ha[f]), (b = a.qa(b))))
                            (e = e === s ? {} : e), (e[f] = a.R(b, w)), (g.cb[f] = u)
                    return e
                },
                wa: function () {
                    var a = g.bb()
                    a && g.nc(a)
                },
                ac: function () {
                    'MutationObserver' in window && document.body
                        ? new MutationObserver(g.wa).observe(document.body, {
                              childList: u,
                              subtree: u,
                          })
                        : window.setInterval(g.wa, 15e3)
                },
                nc: function (a) {
                    if (b.g(a)) {
                        f.setProperty('pageview', a)
                        a = h.c.b.p
                        var e = h.c.b.ep
                        h.c.b.et = 9
                        h.c.b.ep = ''
                        h.c.b.p = m(f.t('pageview'))
                        h.c.n()
                        h.c.b.p = a
                        h.c.b.ep = e
                        f.o('pageview')
                    }
                },
            }
            g.init()
            d.d('pv-b', function () {
                var a = g.bb()
                a && f.setProperty('pageview', a)
            })
            g.ac()
            a.ic(g.wa)
        }
    })()
    ;(function () {
        var a = mt.lang,
            b = mt.f,
            d = h.na,
            e = {
                aa: function (a, m) {
                    return function (g) {
                        var l = g.target || g.srcElement
                        if (l) {
                            var p = d.ba(m) || [],
                                q = l.getAttribute(a.ia)
                            g = g.clientX + ':' + g.clientY
                            if (q && q === g) l.removeAttribute(a.ia)
                            else if (0 < p.length && (l = b.Nb(l)) && l.length)
                                if (((p = l.length), (q = l[l.length - 1]), 1e4 > p * q.split('>').length))
                                    for (q = 0; q < p; q++) e.ib(a, l[q])
                                else e.ib(a, q)
                        }
                    }
                },
                ib: function (b, e) {
                    for (var d = {}, l = String(e).split('>').length, p = 0; p < l; p++)
                        (d[e] = ''), (e = e.substring(0, e.lastIndexOf('>')))
                    b && a.g(b) && b.Na && b.Na(d)
                },
                jc: function (a, b) {
                    return function (e) {
                        ;(e.target || e.srcElement).setAttribute(a.ia, e.clientX + ':' + e.clientY)
                        a && a.s && (b ? a.s(b) : a.s('#' + encodeURIComponent(this.id), e.type))
                    }
                },
            }
        return (h.yb = e)
    })()
    ;(function () {
        var a = mt.f,
            b = mt.event,
            d = mt.lang,
            e = h.D,
            f = h.na,
            m = h.yb,
            g = h.N,
            l = g.K,
            p = {
                ia: 'HM_ce',
                nb: function () {
                    if (c.cetrk && 0 < c.cetrk.length) {
                        b.d(document, 'click', m.aa(p, c.cetrk))
                        for (var e = f.ba(c.cetrk) || [], d = 0, r = e.length; d < r; d++) {
                            var g = e[d],
                                k = g.p || ''
                            ;-1 === k.indexOf('>') &&
                                (0 === k.indexOf('#') && (k = k.substring(1)),
                                (k = a.Cb(k)) && b.d(k, 'click', m.jc(p, g)))
                        }
                    }
                },
                Na: function (a) {
                    for (var b = f.ba(c.cetrk) || [], e = 0; e < b.length; e++) {
                        var d = b[e],
                            k = p.Ib(d.p, a)
                        k && p.s(d, k)
                    }
                },
                Ib: function (a, b) {
                    a = String(a)
                    if (0 < a.indexOf('*')) {
                        var e = RegExp('^' + a.replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\*/, '\\d+') + '$'),
                            f
                        for (f in b) if (b.hasOwnProperty(f) && e.test(f)) return f
                        return v
                    }
                    return b.hasOwnProperty(a) ? a : v
                },
                s: function (b, e) {
                    h.c.b.et = 7
                    var f = (b && b.k) || '',
                        f = d.h(f),
                        x = {}
                    if (b && b.a && d.g(b.a)) {
                        var k = b.a,
                            n
                        for (n in k)
                            if (k.hasOwnProperty(n)) {
                                var y = p.Ob(k[n] || '', e),
                                    y = y ? a.R(y, w) : ''
                                x[n] = y
                            }
                    }
                    x = p.Eb(x, e || (b && b.p))
                    x._iden = f
                    g.setProperty('customEvent', x)
                    h.c.b.ep = ''
                    h.c.b.p = l(g.t('customEvent'))
                    h.c.n()
                    h.c.b.p = ''
                    g.o('customEvent')
                },
                Eb: function (b, f) {
                    var d = a.qa(f),
                        g = e.Ja
                    d &&
                        (c.aet && c.aet.length
                            ? ((b.ei_ = a.getAttribute(d, g.id) || a.getAttribute(d, 'id') || ''),
                              (b.ec_ = a.getAttribute(d, g.Z) || a.getAttribute(d, 'class') || ''),
                              (b.ex_ = a.getAttribute(d, g.Y) || a.ta(d)),
                              (b.en_ = a.getAttribute(d, g.content) || a.R(d, u)),
                              (b.et_ = a.getAttribute(d, g.ga) || a.S(d)),
                              (b.el_ = a.getAttribute(d, g.link) || a.getAttribute(d, 'href') || ''))
                            : ((b.ex_ = a.getAttribute(d, g.Y) || a.ta(d)),
                              (b.en_ = a.getAttribute(d, g.content) || a.R(d, u))))
                    return b
                },
                Ob: function (b, e) {
                    b = String(b)
                    e = String(e)
                    if (0 < b.indexOf('*')) {
                        var f = /.*\[(\d+)\]$/.exec(e)
                        b = b.replace('*', f ? f[1] : '1')
                    }
                    return a.qa(b)
                },
            }
        h.z.d('pv-b', p.nb)
        return p
    })()
    ;(function () {
        var a = mt.lang,
            b = mt.f,
            d = mt.event,
            e = mt.e,
            f = h.D,
            m = h.z,
            g = h.N,
            l = g.K,
            p = +new Date(),
            q = [],
            t = {
                aa: function () {
                    return function (e) {
                        if (h.c && h.c.U && c.aet && c.aet.length) {
                            var d = e.target || e.srcElement
                            if (d) {
                                var k = h.c.Ma,
                                    n = b.getAttribute(d, f.La) != v ? u : w
                                if (b.getAttribute(d, f.Ka) == v)
                                    if (n) t.la(t.ra(d, e))
                                    else {
                                        var g = b.S(d)
                                        if (a.H(k, '*') || a.H(k, g)) t.la(t.ra(d, e))
                                        else
                                            for (; d.parentNode != v; ) {
                                                var n = d.parentNode,
                                                    g = b.S(n),
                                                    z = 'a' === g && a.H(k, 'a') ? u : w,
                                                    g = 'button' === g && a.H(k, 'button') ? u : w,
                                                    A = b.getAttribute(n, f.La) != v ? u : w
                                                if (b.getAttribute(n, f.Ka) == v && (z || g || A)) {
                                                    t.la(t.ra(n, e))
                                                    break
                                                }
                                                d = d.parentNode
                                            }
                                    }
                            }
                        }
                    }
                },
                ra: function (d, g) {
                    var k = {},
                        n = f.Ja
                    k.id = b.getAttribute(d, n.id) || b.getAttribute(d, 'id') || ''
                    k.Z = b.getAttribute(d, n.Z) || b.getAttribute(d, 'class') || ''
                    k.Y = b.getAttribute(d, n.Y) || b.ta(d)
                    k.content = b.getAttribute(d, n.content) || b.R(d, u)
                    k.ga = b.getAttribute(d, n.ga) || b.S(d)
                    k.link = b.getAttribute(d, n.link) || b.getAttribute(d, 'href') || ''
                    k.type = g.type || 'click'
                    n = a.Wa(d.offsetTop) ? d.offsetTop : 0
                    'click' === g.type
                        ? (n = e.Va
                              ? g.clientY + Math.max(document.documentElement.scrollTop, document.body.scrollTop)
                              : g.pageY)
                        : 'touchend' === g.type && g.$a && g.$a.changedTouches && (n = g.$a.changedTouches[0].pageY)
                    k.uc = n
                    n = this.Hb(g)
                    k.Ba = n.Ba || 0
                    k.Da = n.Da || 0
                    k.Ia = n.Ia || 0
                    k.va = n.va || 0
                    k.Ga = n.Ga || 'b'
                    return k
                },
                Hb: function (d) {
                    var f = d.target || d.srcElement,
                        k
                    if (e.Va) {
                        var n = Math.max(document.documentElement.scrollTop, document.body.scrollTop)
                        k = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft)
                        k = d.clientX + k
                        d = d.clientY + n
                    } else (k = d.pageX), (d = d.pageY)
                    var g = (n = 0),
                        z = 0,
                        A = 0
                    if (
                        f &&
                        ((n = f.offsetWidth || f.clientWidth),
                        (g = f.offsetHeight || f.clientHeight),
                        (A = b.Lb(f)),
                        (z = A.left),
                        (A = A.top),
                        a.w(f.getBBox) && ((g = f.getBBox()), (n = g.width), (g = g.height)),
                        'html' === (f.tagName || '').toLowerCase())
                    )
                        (n = Math.max(n, f.clientWidth)), (g = Math.max(g, f.clientHeight))
                    return {
                        Ba: Math.round(100 * ((k - z) / n)),
                        Da: Math.round(100 * ((d - A) / g)),
                        Ia: n,
                        va: g,
                        Ga: ('a' === (f.tagName || '').toLowerCase() ? f : b.Db(f)) ? 'a' : 'b',
                    }
                },
                la: function (b) {
                    var e = a.h
                    b = [
                        +new Date() - (h.c.V !== s ? h.c.V : p),
                        e(b.id),
                        e(b.Z),
                        e(b.ga),
                        e(b.Y),
                        e(b.link),
                        e(b.content),
                        b.type,
                        b.uc,
                        b.Ba,
                        b.Da,
                        b.Ia,
                        b.va,
                        b.Ga,
                    ].join('*')
                    t.ma(b)
                    a.w(this.X()) && this.X()()
                },
                ma: function (a) {
                    var b = f.Pa
                    a.length > b ||
                        (encodeURIComponent(q.join('!') + a).length > b && 0 < q.length && (t.s(q.join('!')), (q = [])),
                        q.push(a))
                },
                s: function (a) {
                    h.c.b.et = 5
                    h.c.b.ep = a
                    g.setProperty(
                        'autoEventTracking',
                        {
                            view_h_: e.G(),
                        },
                        u,
                    )
                    h.c.b.p = l(g.t('autoEventTracking'))
                    h.c.n()
                    h.c.b.p = ''
                    g.setProperty(
                        'autoEventTracking',
                        {
                            view_h_: v,
                        },
                        u,
                    )
                },
                X: function () {
                    return function () {
                        q && q.length && (t.s(q.join('!')), (q = []))
                    }
                },
            }
        a.I(c.aet) &&
            '' !== c.aet &&
            m.d('pv-b', function () {
                d.d(document, 'click', t.aa())
                'ontouchend' in document && d.d(window, 'touchend', t.aa())
                d.d(window, 'unload', t.X())
            })
        return t
    })()
    ;(function () {
        var a = mt.lang,
            b = mt.event,
            d = mt.e,
            e = h.D,
            f = h.z,
            m = h.N,
            g = m.K,
            l = +new Date(),
            p = [],
            q = v,
            t = {
                pb: function () {
                    a.I(c.aet) && '' !== c.aet && setInterval(t.hb, e.lc)
                },
                hb: function () {
                    var a = d.G()
                    0 < a - h.c.b.vl && (h.c.b.vl = a)
                },
            },
            r = {
                xb: function () {
                    return function () {
                        h.c &&
                            h.c.U &&
                            c.aet &&
                            c.aet.length &&
                            (window.clearTimeout(q),
                            (q = window.setTimeout(function () {
                                r.ob(d.G())
                            }, 150)))
                    }
                },
                ob: function (a) {
                    r.ma([+new Date() - (h.c.V !== s ? h.c.V : l), a].join('*'))
                },
                ma: function (a) {
                    if (encodeURIComponent(p.join('!') + a).length > e.Pa || 3 < p.length) r.s(p.join('!')), (p = [])
                    p.push(a)
                },
                s: function (a) {
                    t.hb()
                    h.c.b.et = 6
                    h.c.b.vh = d.Sa()
                    h.c.b.ep = a
                    m.setProperty(
                        'autoEventTracking',
                        {
                            view_h_: d.G(),
                        },
                        u,
                    )
                    h.c.b.p = g(m.t('autoEventTracking'))
                    h.c.n()
                    h.c.b.p = ''
                    m.setProperty(
                        'autoEventTracking',
                        {
                            view_h_: v,
                        },
                        u,
                    )
                },
                X: function () {
                    return function () {
                        p && p.length && (r.s(p.join('!')), (p = []))
                    }
                },
            }
        a.I(c.aet) &&
            '' !== c.aet &&
            f.d('pv-b', function () {
                b.d(window, 'scroll', r.xb())
                b.d(window, 'unload', r.X())
                t.pb()
            })
        return r
    })()
    ;(function () {
        function a() {
            return function () {
                h.c.b.nv = 0
                h.c.b.st = 4
                h.c.b.et = 3
                h.c.b.ep = h.oa.Mb() + ',' + h.oa.Jb()
                h.c.b.hca = c.hca
                h.c.n()
            }
        }
        function b() {
            clearTimeout(z)
            var a
            n && (a = 'visible' == document[n])
            y && (a = !document[y])
            l = 'undefined' == typeof a ? u : a
            if ((!g || !p) && l && q) (k = u), (r = +new Date())
            else if (g && p && (!l || !q)) (k = w), (x += +new Date() - r)
            g = l
            p = q
            z = setTimeout(b, 100)
        }
        function d(a) {
            var b = document,
                n = ''
            if (a in b) n = a
            else
                for (var e = ['webkit', 'ms', 'moz', 'o'], d = 0; d < e.length; d++) {
                    var f = e[d] + a.charAt(0).toUpperCase() + a.slice(1)
                    if (f in b) {
                        n = f
                        break
                    }
                }
            return n
        }
        function e(a) {
            if (!('focus' == a.type || 'blur' == a.type) || !(a.target && a.target != window))
                (q = 'focus' == a.type || 'focusin' == a.type ? u : w), b()
        }
        var f = mt.event,
            m = h.z,
            g = u,
            l = u,
            p = u,
            q = u,
            t = +new Date(),
            r = t,
            x = 0,
            k = u,
            n = d('visibilityState'),
            y = d('hidden'),
            z
        b()
        ;(function () {
            var a = n.replace(/[vV]isibilityState/, 'visibilitychange')
            f.d(document, a, b)
            f.d(window, 'pageshow', b)
            f.d(window, 'pagehide', b)
            'object' == typeof document.onfocusin
                ? (f.d(document, 'focusin', e), f.d(document, 'focusout', e))
                : (f.d(window, 'focus', e), f.d(window, 'blur', e))
        })()
        h.oa = {
            Mb: function () {
                return +new Date() - t
            },
            Jb: function () {
                return k ? +new Date() - r + x : x
            },
        }
        m.d('pv-b', function () {
            f.d(window, 'unload', a())
        })
        m.d('duration-send', a())
        m.d('duration-done', function () {
            r = t = +new Date()
            x = 0
        })
        return h.oa
    })()
    ;(function () {
        var a = mt.lang,
            b = h.D,
            d = h.load,
            e = h.$,
            f = {
                $b: function (f) {
                    if ((window._dxt === s || a.m(window._dxt, 'Array')) && 'undefined' !== typeof h.c) {
                        var g = e.ca()
                        d([b.protocol, '//datax.baidu.com/x.js?si=', c.id, '&dm=', encodeURIComponent(g)].join(''), f)
                    }
                },
                tc: function (b) {
                    if (a.m(b, 'String') || a.m(b, 'Number'))
                        (window._dxt = window._dxt || []), window._dxt.push(['_setUserId', b])
                },
            }
        return (h.vb = f)
    })()
    ;(function () {
        function a(a, b, e, d) {
            if (!(a === s || b === s || d === s)) {
                if ('' === a) return [b, e, d].join('*')
                a = String(a).split('!')
                for (var f, g = w, k = 0; k < a.length; k++)
                    if (((f = a[k].split('*')), String(b) === f[0])) {
                        f[1] = e
                        f[2] = d
                        a[k] = f.join('*')
                        g = u
                        break
                    }
                g || a.push([b, e, d].join('*'))
                return a.join('!')
            }
        }
        function b(a) {
            for (var d in a)
                if ({}.hasOwnProperty.call(a, d)) {
                    var f = a[d]
                    e.g(f) || e.isArray(f) ? b(f) : (a[d] = String(f))
                }
        }
        var d = mt.url,
            e = mt.lang,
            f = mt.A,
            m = mt.e,
            g = h.D,
            l = h.z,
            p = h.vb,
            q = h.load,
            t = h.$,
            r = h.N,
            x = r.K,
            k = {
                W: [],
                fa: 0,
                ya: w,
                C: {
                    Ha: '',
                    page: '',
                },
                init: function () {
                    k.i = 0
                    r.init()
                    l.d('pv-b', function () {
                        k.wb()
                        k.zb()
                    })
                    l.d('pv-d', function () {
                        k.Ab()
                        k.C.page = ''
                    })
                    l.d('stag-b', function () {
                        h.c.b.api = k.i || k.fa ? k.i + '_' + k.fa : ''
                        h.c.b.ct = [decodeURIComponent(t.getData('Hm_ct_' + c.id) || ''), k.C.Ha, k.C.page].join('!')
                    })
                    l.d('stag-d', function () {
                        h.c.b.api = 0
                        k.i = 0
                        k.fa = 0
                    })
                },
                wb: function () {
                    var a = window._hmt || []
                    if (!a || e.m(a, 'Array'))
                        (window._hmt = {
                            id: c.id,
                            cmd: {},
                            push: function () {
                                for (var a = window._hmt, b = 0; b < arguments.length; b++) {
                                    var n = arguments[b]
                                    e.m(n, 'Array') &&
                                        (a.cmd[a.id].push(n),
                                        '_setAccount' === n[0] &&
                                            1 < n.length &&
                                            /^[0-9a-f]{31,32}$/.test(n[1]) &&
                                            ((n = n[1]), (a.id = n), (a.cmd[n] = a.cmd[n] || [])))
                                }
                            },
                        }),
                            (window._hmt.cmd[c.id] = []),
                            window._hmt.push.apply(window._hmt, a)
                },
                zb: function () {
                    var a = window._hmt
                    if (a && a.cmd && a.cmd[c.id])
                        for (
                            var b = a.cmd[c.id], e = /^_track(Event|MobConv|Order)$/, f = 0, d = b.length;
                            f < d;
                            f++
                        ) {
                            var g = b[f]
                            e.test(g[0]) ? k.W.push(g) : k.Fa(g)
                        }
                    a.cmd[c.id] = {
                        push: k.Fa,
                    }
                },
                Ab: function () {
                    if (0 < k.W.length) for (var a = 0, b = k.W.length; a < b; a++) k.Fa(k.W[a])
                    k.W = v
                },
                Fa: function (a) {
                    var b = a[0]
                    if (k.hasOwnProperty(b) && e.w(k[b])) k[b](a)
                },
                _setAccount: function (a) {
                    1 < a.length && /^[0-9a-f]{31,32}$/.test(a[1]) && (k.i |= 1)
                },
                _setAutoPageview: function (a) {
                    if (1 < a.length && ((a = a[1]), w === a || u === a)) (k.i |= 2), (h.c.Ta = a)
                },
                _trackPageview: function (a) {
                    1 < a.length &&
                        a[1].charAt &&
                        '/' === a[1].charAt(0) &&
                        ((k.i |= 4),
                        (h.c.b.sn = h.c.Qa()),
                        (h.c.b.et = 0),
                        (h.c.b.ep = ''),
                        (h.c.b.vl = m.G()),
                        (h.c.b.kb = 0),
                        h.c.xa ? ((h.c.b.nv = 0), (h.c.b.st = 4)) : (h.c.xa = u),
                        k.ya || (h.c.b.su = h.c.b.u || fakeLocation().href),
                        (h.c.b.u = g.protocol + '//' + fakeLocation().host + a[1]),
                        (h.c.b.p = x(r.t('pageview'))),
                        h.c.n(),
                        (h.c.b.p = ''),
                        (h.c.V = +new Date()),
                        r.o('pageview'))
                },
                _trackEvent: function (a) {
                    2 < a.length &&
                        ((k.i |= 8),
                        (h.c.b.nv = 0),
                        (h.c.b.st = 4),
                        (h.c.b.et = 4),
                        (h.c.b.ep =
                            e.h(a[1]) +
                            '*' +
                            e.h(a[2]) +
                            (a[3] ? '*' + e.h(a[3]) : '') +
                            (a[4] ? '*' + e.h(a[4]) : '')),
                        (h.c.b.p = x(r.ua())),
                        h.c.n(),
                        (h.c.b.p = ''))
                },
                _setCustomVar: function (a) {
                    if (!(4 > a.length)) {
                        var b = a[1],
                            f = a[4] || 3
                        if (0 < b && 6 > b && 0 < f && 4 > f) {
                            k.fa++
                            for (var d = (h.c.b.cv || '*').split('!'), g = d.length; g < b - 1; g++) d.push('*')
                            d[b - 1] = f + '*' + e.h(a[2]) + '*' + e.h(a[3])
                            h.c.b.cv = d.join('!')
                            a = h.c.b.cv.replace(/[^1](\*[^!]*){2}/g, '*').replace(/((^|!)\*)+$/g, '')
                            '' !== a
                                ? t.setData('Hm_cv_' + c.id, encodeURIComponent(a), c.age)
                                : t.removeData('Hm_cv_' + c.id)
                        }
                    }
                },
                _setUserTag: function (b) {
                    if (!(3 > b.length)) {
                        var f = e.h(b[1])
                        b = e.h(b[2])
                        if (f !== s && b !== s) {
                            var d = decodeURIComponent(t.getData('Hm_ct_' + c.id) || ''),
                                d = a(d, f, 1, b)
                            t.setData('Hm_ct_' + c.id, encodeURIComponent(d), c.age)
                        }
                    }
                },
                _setVisitTag: function (b) {
                    if (!(3 > b.length)) {
                        var f = e.h(b[1])
                        b = e.h(b[2])
                        if (f !== s && b !== s) {
                            var d = k.C.Ha,
                                d = a(d, f, 2, b)
                            k.C.Ha = d
                        }
                    }
                },
                _setPageTag: function (b) {
                    if (!(3 > b.length)) {
                        var d = e.h(b[1])
                        b = e.h(b[2])
                        if (d !== s && b !== s) {
                            var f = k.C.page,
                                f = a(f, d, 3, b)
                            k.C.page = f
                        }
                    }
                },
                _setReferrerOverride: function (a) {
                    1 < a.length &&
                        ((a = a[1]),
                        e.m(a, 'String')
                            ? ((h.c.b.su = '/' === a.charAt(0) ? g.protocol + '//' + window.location.host + a : a),
                              (k.ya = u))
                            : (k.ya = w))
                },
                _trackOrder: function (a) {
                    a = a[1]
                    e.g(a) &&
                        (b(a),
                        (k.i |= 16),
                        (h.c.b.nv = 0),
                        (h.c.b.st = 4),
                        (h.c.b.et = 94),
                        (h.c.b.ep = f.stringify(a)),
                        (h.c.b.p = x(r.ua())),
                        h.c.n(),
                        (h.c.b.p = ''))
                },
                _trackMobConv: function (a) {
                    if (
                        (a = {
                            webim: 1,
                            tel: 2,
                            map: 3,
                            sms: 4,
                            callback: 5,
                            share: 6,
                        }[a[1]])
                    )
                        (k.i |= 32), (h.c.b.et = 93), (h.c.b.ep = a), h.c.n()
                },
                _setDataxId: function (a) {
                    a = a[1]
                    p.$b()
                    p.tc(a)
                },
                _setUserId: function (a) {
                    a = a[1]
                    if (a !== s && (e.I(a) || e.Wa(a))) {
                        var b = r.t('user').uid_
                        if (!(b && b.value === e.h(String(a)))) {
                            var b = h.c.b.p,
                                f = h.c.b.ep
                            h.c.b.et = 8
                            h.c.b.ep = ''
                            h.c.b.p = 'uid_*' + e.h(String(a))
                            h.c.n()
                            var d = {}
                            d.uid_ = a
                            r.setProperty('user', d, u)
                            h.c.b.p = b
                            h.c.b.ep = f
                        }
                    }
                },
                _clearUserId: function (a) {
                    1 < a.length && u === a[1] && r.o('userId')
                },
                _setUserProperty: function (a) {
                    a = a[1]
                    e.g(a) && r.setProperty('user', a)
                },
                _clearUserProperty: function (a) {
                    1 < a.length && u === a[1] && r.o('user')
                },
                _setSessionProperty: function (a) {
                    a = a[1]
                    e.g(a) && r.setProperty('session', a)
                },
                _clearSessionProperty: function (a) {
                    1 < a.length && u === a[1] && r.o('session')
                },
                _setPageviewProperty: function (a) {
                    a = a[1]
                    e.g(a) && r.setProperty('pageview', a)
                },
                _clearPageviewProperty: function (a) {
                    1 < a.length && u === a[1] && r.o('pageview')
                },
                _setAutoEventTrackingProperty: function (a) {
                    a = a[1]
                    e.g(a) && r.setProperty('autoEventTracking', a)
                },
                _clearAutoEventTrackingProperty: function (a) {
                    1 < a.length && u === a[1] && r.o('autoEventTracking')
                },
                _setAutoTracking: function (a) {
                    if (1 < a.length && ((a = a[1]), w === a || u === a)) h.c.Ua = a
                },
                _setAutoEventTracking: function (a) {
                    if (1 < a.length && ((a = a[1]), w === a || u === a)) h.c.U = a
                },
                _trackPageDuration: function (a) {
                    1 < a.length
                        ? ((a = a[1]), 2 === String(a).split(',').length && ((h.c.b.et = 3), (h.c.b.ep = a), h.c.n()))
                        : l.M('duration-send')
                    l.M('duration-done')
                },
                _require: function (a) {
                    1 < a.length && ((a = a[1]), g.sb.test(d.T(a)) && q(a))
                },
                _providePlugin: function (a) {
                    if (1 < a.length) {
                        var b = window._hmt,
                            d = a[1]
                        a = a[2]
                        if (
                            e.H(g.eb, d) &&
                            e.w(a) &&
                            ((b.plugins = b.plugins || {}),
                            (b.J = b.J || {}),
                            (b.plugins[d] = a),
                            (b.B = b.B || []),
                            (a = b.B.slice()),
                            d && a.length && a[0][1] === d)
                        )
                            for (var f = 0, k = a.length; f < k; f++) {
                                var l = a[f][2] || {}
                                if (b.plugins[d] && !b.J[d]) (b.J[d] = new b.plugins[d](l)), b.B.shift()
                                else break
                            }
                    }
                },
                _requirePlugin: function (a) {
                    if (1 < a.length) {
                        var b = window._hmt,
                            d = a[1],
                            f = a[2] || {}
                        if (e.H(g.eb, d))
                            if (((b.plugins = b.plugins || {}), (b.J = b.J || {}), b.plugins[d] && !b.J[d]))
                                b.J[d] = new b.plugins[d](f)
                            else {
                                b.B = b.B || []
                                for (var f = 0, l = b.B.length; f < l; f++) if (b.B[f][1] === d) return
                                b.B.push(a)
                                k._require([v, g.hc + d + '.js'])
                            }
                    }
                },
                _fetchABTest: function (a) {
                    if (1 < a.length && ((a = a[1]), e.g(a))) {
                        var b = a.paramName,
                            d = a.defaultValue,
                            f = a.callback
                        h.ab &&
                            b &&
                            d !== s &&
                            e.w(f) &&
                            h.ab.Ec(b, function (a) {
                                f(a === v ? d : a)
                            })
                    }
                },
                _trackCustomEvent: function (a) {
                    if (1 < a.length) {
                        var b = a[1]
                        a = a[2]
                        e.g(a) || (a = {})
                        a._iden = b
                        r.setProperty('customEvent', a)
                        h.c.b.et = 7
                        h.c.b.ep = ''
                        h.c.b.p = x(r.t('customEvent'))
                        h.c.n()
                        h.c.b.p = ''
                        r.o('customEvent')
                    }
                },
            }
        k.init()
        h.tb = k
        return h.tb
    })()
    ;(function () {
        var a = h.z
        c.spa !== s &&
            '1' === String(c.spa) &&
            ((window._hmt = window._hmt || []),
            window._hmt.push(['_requirePlugin', 'UrlChangeTracker']),
            a.d('pv-b', function () {
                '' !== window.location.hash && (h.c.b.u = window.location.href)
            }))
    })()
    ;(function () {
        function a() {
            'undefined' === typeof window['_bdhm_loaded_' + c.id] &&
                ((window['_bdhm_loaded_' + c.id] = u),
                (this.b = {}),
                (this.Ua = this.Ta = u),
                (this.U = k.U),
                (this.Ma = f.I(c.aet) && 0 < c.aet.length ? c.aet.split(',') : ''),
                (this.xa = w),
                this.init())
        }
        var b = mt.url,
            d = mt.P,
            e = mt.jb,
            f = mt.lang,
            m = mt.cookie,
            g = mt.e,
            l = mt.sessionStorage,
            p = mt.A,
            q = mt.event,
            t = h.$,
            r = h.N,
            x = r.K,
            k = h.D,
            n = h.load,
            y = h.z
        a.prototype = {
            da: function (a) {
                for (var e = 0; e < c.dm.length; e++)
                    if (-1 < c.dm[e].indexOf('/')) {
                        if (b.Xa(a, c.dm[e])) return u
                    } else {
                        var d = b.T(a)
                        if (d && b.za(d, c.dm[e])) return u
                    }
                return w
            },
            Qb: function () {
                if (!document.referrer) return k.L - k.O > c.vdur ? 1 : 4
                var a = w
                this.da(document.referrer) && this.da(fakeLocation().href)
                    ? (a = u)
                    : ((a = b.T(document.referrer)), (a = b.za(a || '', fakeLocation().hostname)))
                return a ? (k.L - k.O > c.vdur ? 1 : 4) : 3
            },
            rc: function () {
                var a, b, e, d, f, g
                k.O = t.getData('Hm_lpvt_' + c.id) || 0
                13 === k.O.length && (k.O = Math.round(k.O / 1e3))
                b = this.Qb()
                a = 4 !== b ? 1 : 0
                if ((g = t.getData('Hm_lvt_' + c.id))) {
                    d = g.split(',')
                    for (f = d.length - 1; 0 <= f; f--) 13 === d[f].length && (d[f] = '' + Math.round(d[f] / 1e3))
                    for (; 2592e3 < k.L - d[0]; ) d.shift()
                    f = 4 > d.length ? 2 : 3
                    for (1 === a && d.push(k.L); 4 < d.length; ) d.shift()
                    g = d.join(',')
                    d = d[d.length - 1]
                } else (g = k.L), (d = ''), (f = 1)
                this.dc()
                    ? (t.setData('Hm_lvt_' + c.id, g, c.age),
                      t.setData('Hm_lpvt_' + c.id, k.L),
                      (e = m.fc(t.ca(), t.pa())))
                    : this.Bb()
                if (
                    0 === c.nv &&
                    this.da(fakeLocation().href) &&
                    ('' === document.referrer || this.da(document.referrer))
                )
                    (a = 0), (b = 4)
                this.b.nv = a
                this.b.st = b
                this.b.cc = e
                this.b.lt = d
                this.b.lv = f
            },
            dc: function () {
                var a = b.T(fakeLocation().href)
                return !f.H(
                    'sjh.baidu.com isite.baidu.com ls.wejianzhan.com bs.wejianzhan.com product.weijianzhan.com qianhu.weijianzhan.com aisite.wejianzhan.com'.split(
                        ' ',
                    ),
                    a,
                )
            },
            Bb: function () {
                for (var a = document.cookie.split(';'), b = 0; b < a.length; b++) {
                    var d = a[b].split('=')
                    d.length && /Hm_(up|ct|cv|lp?vt)_[0-9a-f]{31}/.test(String(d[0])) && t.removeData(d[0])
                    d.length && /Hm_ck_[0-9]{13}/.test(String(d[0])) && t.removeData(d[0])
                }
            },
            qc: function () {
                for (var a = [], b = this.b.et, d = 0, e = k.lb.length; d < e; d++) {
                    var f = k.lb[d],
                        g = this.b[f]
                    'undefined' !== typeof g &&
                        '' !== g &&
                        ('tt' !== f || ('tt' === f && 0 === b)) &&
                        ('ct' !== f || ('ct' === f && 0 === b)) &&
                        a.push(f + '=' + encodeURIComponent(g))
                }
                return a.join('&')
            },
            sc: function () {
                this.rc()
                this.b.si = c.id
                this.b.sn = this.Qa()
                this.b.su = document.referrer
                this.b.ds = g.kc
                this.b.cl = g.colorDepth + '-bit'
                this.b.ln = String(g.language).toLowerCase()
                this.b.ja = g.javaEnabled ? 1 : 0
                this.b.ck = g.cookieEnabled ? 1 : 0
                this.b.lo = 'number' === typeof _bdhm_top ? 1 : 0
                this.b.fl = e.Sb()
                this.b.v = '1.2.90'
                this.b.cv = decodeURIComponent(t.getData('Hm_cv_' + c.id) || '')
                this.b.tt = document.title || ''
                this.b.vl = g.G()
                var a = fakeLocation().href
                this.b.cm = b.j(a, k.Xb) || ''
                this.b.cp = b.j(a, k.Yb) || b.j(a, k.yc) || ''
                this.b.cw = b.j(a, k.Wb) || b.j(a, k.Ac) || ''
                this.b.ci = b.j(a, k.Ub) || b.j(a, k.xc) || ''
                this.b.cf = b.j(a, k.Zb) || b.j(a, k.zc) || ''
                this.b.cu = b.j(a, k.Vb) || b.j(a, k.wc) || ''
                true && (this.b.u = a)
            },
            init: function () {
                try {
                    this.sc(),
                        0 === this.b.nv ? this.pc() : this.Oa(),
                        (h.c = this),
                        this.ub(),
                        this.gc(),
                        y.M('pv-b'),
                        this.mc()
                } catch (a) {
                    var b = []
                    b.push('si=' + c.id)
                    b.push('n=' + encodeURIComponent(a.name))
                    b.push('m=' + encodeURIComponent(a.message))
                    b.push('r=' + encodeURIComponent(document.referrer))
                    d.log(k.Aa + '//' + k.fb + '?' + b.join('&'))
                }
            },
            mc: function () {
                function a() {
                    y.M('pv-d')
                }
                this.Ta
                    ? ((this.xa = u),
                      (this.b.et = 0),
                      (this.b.ep = ''),
                      (this.b.p = x(r.t('pageview'))),
                      (this.b.vl = g.G()),
                      this.n(a),
                      (this.b.p = ''))
                    : a()
                this.V = +new Date()
                r.o('pageview')
            },
            n: function (a) {
                if (this.Ua) {
                    var b = this
                    b.b.rnd = Math.round(Math.random() * k.Ca)
                    b.b.r = g.orientation
                    b.b.ww = g.mb
                    y.M('stag-b')
                    var e = k.Aa + '//' + k.fb + '?' + b.qc()
                    y.M('stag-d')
                    b.qb(e)
                    d.log(e, function (d) {
                        b.gb(d)
                        f.w(a) && a.call(b)
                    })
                }
            },
            ub: function () {
                try {
                    if (window.postMessage && window.self !== window.parent) {
                        var a = this
                        q.d(window, 'message', function (d) {
                            if (b.T(d.origin) === k.vc) {
                                d = d.data || {}
                                var e = d.jn || '',
                                    f = /^customevent$|^heatmap$|^pageclick$|^select$/.test(e)
                                if (RegExp(c.id).test(d.sd || '') && f)
                                    (a.b.rnd = Math.round(Math.random() * k.Ca)),
                                        n(k.protocol + '//' + c.js + e + '.js?' + a.b.rnd)
                            }
                        })
                        window.parent.postMessage(
                            {
                                id: c.id,
                                url: fakeLocation().href,
                                status: '__Messenger__hmLoaded',
                            },
                            '*',
                        )
                    }
                } catch (d) {}
            },
            gc: function () {
                try {
                    if (window.self === window.parent) {
                        var a = fakeLocation().href,
                            d = b.j(a, 'baidu-analytics-token'),
                            e = b.j(a, 'baidu-analytics-jn')
                        ;/^[a-f0-9]{32}\/?$/.test(d) &&
                            /^overlay\/?$/.test(e) &&
                            n(k.protocol + '//' + c.js + e + '.js?' + Math.round(Math.random() * k.Ca))
                    }
                } catch (f) {}
            },
            qb: function (a) {
                var b
                try {
                    b = p.parse(l.get('Hm_unsent_' + c.id) || '[]')
                } catch (d) {
                    b = []
                }
                var e = this.b.u ? '' : '&u=' + encodeURIComponent(fakeLocation().href)
                b.push(a.replace(/^https?:\/\//, '') + e)
                l.set('Hm_unsent_' + c.id, p.stringify(b))
            },
            gb: function (a) {
                var b
                try {
                    b = p.parse(l.get('Hm_unsent_' + c.id) || '[]')
                } catch (d) {
                    b = []
                }
                if (b.length) {
                    a = a.replace(/^https?:\/\//, '')
                    for (var e = 0; e < b.length; e++)
                        if (a.replace(/&u=[^&]*/, '') === b[e].replace(/&u=[^&]*/, '')) {
                            b.splice(e, 1)
                            break
                        }
                    b.length ? l.set('Hm_unsent_' + c.id, p.stringify(b)) : this.Oa()
                }
            },
            Oa: function () {
                l.remove('Hm_unsent_' + c.id)
            },
            pc: function () {
                var a = this,
                    b
                try {
                    b = p.parse(l.get('Hm_unsent_' + c.id) || '[]')
                } catch (e) {
                    b = []
                }
                if (b.length)
                    for (
                        var f = function (b) {
                                d.log(k.Aa + '//' + b, function (b) {
                                    a.gb(b)
                                })
                            },
                            g = 0;
                        g < b.length;
                        g++
                    )
                        f(b[g])
            },
            Qa: function () {
                return Math.round(+new Date() / 1e3) % 65535
            },
        }
        return new a()
    })()
    var B = h.D,
        C = h.load
    c.pt && C([B.protocol, '//ada.baidu.com/phone-tracker/insert_bdtj?sid=', c.pt].join(''))
})()
_hmt.push(['_setAutoPageview', false]);