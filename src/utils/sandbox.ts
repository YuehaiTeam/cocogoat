/* https://github.com/syumai/sandboxed-eval - MIT Licensed */
const srcdoc = (origin: string, senderId: string, receiverId: string) =>
    `<!doctype html>
<html>
<body>
<script>
delete window.fetch;
delete window.XMLHttpRequest;
const origin = "${origin}";
const senderId = "${senderId}";
const receiverId = "${receiverId}";
const handleMessage = async (event) => {
  if (event.source !== window.parent) {
    return;
  }
  if (event.origin !== origin) {
    return;
  }
  const { id, src, scope } = event.data || {};
  if (id !== receiverId) {
    return;
  }
  try {
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const fun = new AsyncFunction(...Object.keys(scope), src);
    const result = await fun(...Object.values(scope));
    window.parent.postMessage({ id: senderId, result }, origin);
  } catch (error) {
    window.parent.postMessage({ id: senderId, error }, origin);
  }
  window.removeEventListener("message", handleMessage);
};
window.addEventListener("message", handleMessage);
window.parent.postMessage({ id: senderId, ready: true }, origin);
</script>
</body>
</html>`

function genId() {
    return Array.from(crypto.getRandomValues(new Uint32Array(4)))
        .map((n) => n.toString(36))
        .join('')
}

export function sandboxedEval(src: string, scope = {}) {
    const iframe = document.createElement('iframe')
    iframe.setAttribute('sandbox', 'allow-scripts')
    iframe.setAttribute('style', 'display: none;')
    const senderId = genId()
    const receiverId = genId()

    return new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
            if (event.source !== iframe.contentWindow) {
                return
            }
            const { id, result, error, ready } = event.data ?? {}
            if (id !== senderId) {
                return
            }
            if (ready && iframe.contentWindow) {
                iframe.contentWindow.postMessage({ id: receiverId, src, scope }, '*')
                return
            }
            if (error) {
                reject(error)
            } else {
                resolve(result)
            }
            window.removeEventListener('message', handleMessage)
            document.body.removeChild(iframe)
        }
        window.addEventListener('message', handleMessage)

        iframe.srcdoc = srcdoc(window.location.origin, senderId, receiverId)
        document.body.appendChild(iframe)
    })
}
