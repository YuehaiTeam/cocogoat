export function send<T>(event: string, data: T, source: string) {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[POSTMSG] ${source} send ${event}`, data)
    }
    parent &&
        window !== parent &&
        parent.postMessage(
            {
                app: 'cocogoat.scanner.' + source,
                event,
                data: JSON.parse(JSON.stringify(data)),
            },
            '*',
        )
}
