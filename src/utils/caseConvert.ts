// 驼峰转下划线
export function camelToUnderline(str: string) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}
// 下划线转驼峰首字母大写
export function underlineToCamelW(str: string) {
    return ('_' + str).replace(/_([a-z])/g, (all, letter) => letter.toUpperCase())
}
