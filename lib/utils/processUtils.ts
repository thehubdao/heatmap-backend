export const timeout = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export const resetAtMidnight = async (process: Function) => {
    var now = new Date()
    var night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0
    )
    var msToMidnight = night.getTime() - now.getTime()
    await process()
    timeout(10000000).then(async () => {
        resetAtMidnight(process)
    })
}
