export const defaultResources = {} as Record<string, string>

export interface IResourceItem {
    tag: string
    test: string
    prefix?: string
    resources: Record<string, string>
}
export interface IResourceInfo {
    urls: string[]
    blob: Blob | null
    tested: boolean
}

const resources = {
    ...defaultResources,
}
export const resourceInfo = {} as Record<string, IResourceInfo>
export default resources
export function setResources(r: typeof defaultResources) {
    for (const key in r) {
        if (Object.prototype.hasOwnProperty.call(r, key)) {
            resources[key] = r[key] || defaultResources[key]
        }
    }
}
export function setResourcesAndUpdateInfo(r: typeof defaultResources) {
    for (const key in r) {
        if (Object.prototype.hasOwnProperty.call(r, key)) {
            resources[key] = r[key] || defaultResources[key]
        }
    }
    Object.keys(resources).forEach((key) => {
        resourceInfo[key] = {
            urls: [],
            blob: null,
            tested: false,
        }
    })
}
