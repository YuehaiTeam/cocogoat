export function levenshteinEditDistance(value: string, other: string): number {
    let distance: number
    let distanceOther: number
    const codes: number[] = []
    const cache: number[] = []

    if (value === other) {
        return 0
    }

    if (value.length === 0) {
        return other.length
    }

    if (other.length === 0) {
        return value.length
    }

    let index = 0

    while (index < value.length) {
        codes[index] = value.charCodeAt(index)
        cache[index] = ++index
    }

    let indexOther = 0
    let result
    while (indexOther < other.length) {
        const code = other.charCodeAt(indexOther)
        result = distance = indexOther++
        index = -1

        while (++index < value.length) {
            distanceOther = code === codes[index] ? distance : distance + 1
            distance = cache[index]
            cache[index] = result =
                distance > result
                    ? distanceOther > result
                        ? result + 1
                        : distanceOther
                    : distanceOther > distance
                      ? distance + 1
                      : distanceOther
        }
    }

    return result || Infinity
}
export function findBestMatch<T extends string, K extends { [P in T]: string }>(
    key: T,
    mainString: string,
    targetStrings: K[],
) {
    const ratings = []
    let bestMatchIndex = 0

    for (let i = 0; i < targetStrings.length; i++) {
        const currentTargetString = targetStrings[i]
        const currentRating = levenshteinEditDistance(mainString, currentTargetString[key])
        ratings.push({ target: currentTargetString, rating: currentRating })
        if (currentRating < ratings[bestMatchIndex].rating) {
            bestMatchIndex = i
        }
    }

    const bestMatch = ratings[bestMatchIndex]

    return { ratings: ratings, bestMatch: bestMatch, bestMatchIndex: bestMatchIndex }
}
// eslint-disable-next-line max-params
export function textBestmatch<T extends string, K extends { [P in T]: string }>(
    key: T,
    text: string,
    list: K[],
    fail = 3,
): K | null {
    const matches = findBestMatch(key, text.replace(/\s\s+/g, ' '), list)
    if (!/[\\u4E00-\\u9FFF]+/g.test(text) && matches.bestMatch.rating > fail) return null
    return matches.bestMatch.target
}
