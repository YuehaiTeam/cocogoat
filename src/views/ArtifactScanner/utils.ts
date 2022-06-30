import * as commonUtils from '@/components/Scanner/utils'

export function send<T>(event: string, data: T) {
    return commonUtils.send(event, data, 'artifact')
}
