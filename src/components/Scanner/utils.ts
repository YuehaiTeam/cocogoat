export function send<T>(event: string, data: T, source: string) {
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
