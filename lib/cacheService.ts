const NodeCache = require('node-cache')
const cache = new NodeCache()

export const setKey = (key: string, value: any) => {
    cache.set(key, value)
}

export const setBulkKeys = (keys: []) => {
    cache.mset(keys)
}

export const getKey = (key: string) => cache.get(key)

export const getBulkKeys = (keys: string[]) => cache.mget(keys)
