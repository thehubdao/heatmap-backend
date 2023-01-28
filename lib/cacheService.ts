const NodeCache = require('node-cache')
const cache = new NodeCache()

export const setKey = (key: string, value: any) => {
    cache.set(key, value)
}

export const setBulkKeys = (keys: []) => {
    cache.mset(keys)
    console.log(cache.getStats())
}

export const getKey = (key: string) => cache.get(key)