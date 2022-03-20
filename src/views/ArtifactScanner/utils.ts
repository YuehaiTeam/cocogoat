export function send<T>(event: string, data: T) {
    parent &&
        window !== parent &&
        parent.postMessage(
            {
                app: 'cocogoat.scanner.artifact',
                event,
                data: JSON.parse(JSON.stringify(data)),
            },
            '*',
        )
}
