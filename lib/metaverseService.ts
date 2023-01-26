import axios from 'axios'
const NodeCache = require('node-cache')
const _cache = new NodeCache()
import { Metaverse, metaverseObject } from '../types/metaverse'
import {
    getMetaverseAddress,
    metaverseUrl,
    heatmapMvLandsPerRequest,
} from './utils/metaverseUtils'

let chunkSize = 0

let metaverses: Record<Metaverse, any> = {
    decentraland: undefined,
    'somnium-space': undefined,
    sandbox: undefined,
    'axie-infinity': undefined,
}

const requestMetaverseMap = async (i: number, metaverse: Metaverse) => {
    let response: any
    try {
        response = await axios.get(
            `${metaverseUrl(metaverse)}/${
                metaverse === 'axie-infinity' ? 'requestMap' : 'map'
            }?from=${i}&size=${
                heatmapMvLandsPerRequest[metaverse].lands
            }&reduced=true`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            }
        )

        response = response.data as any
        if (Object.keys(response).length < 1) return
        ;(Object.keys(response) as any).forEach((key: any) => {
            response[key].tokenId = key
        })
        console.log(
            'Response',
            Object.keys(response).length,
            new Date(),
            i,
            heatmapMvLandsPerRequest[metaverse].lands
        )
    } catch {
        response = {}
    }
    _cache.mset(
        (Object.keys(response) as any).map((key: any) => {
            return { key: metaverse + key, val: response[key] }
        })
    )

    if (metaverses[metaverse])
        metaverses[metaverse] = metaverses[metaverse].concat(
            Object.keys(response).map((key) => metaverse + key)
        )
    else
        metaverses[metaverse] = Object.keys(response).map(
            (key) => metaverse + key
        )
    console.log(/* metaverses[metaverse], */_cache.getStats())
    return {}
}

async function* iterateAllAsync(fn: Function, i: number = 0) {
    while (true) {
        let res = await fn(i)
        if (!res) return
        yield res
        i += chunkSize
    }
}

const arrayFromAsync = async (asyncIterable: AsyncGenerator) => {
    let results: Record<string, any> = {}
    for await (let res of asyncIterable) {
        for (const [index, value] of Object.entries(res as Object)) {
            results[index] = value
        }
    }
    return results
}

export const requestMetaverseLands = (metaverse: Metaverse) => {
    chunkSize = heatmapMvLandsPerRequest[metaverse].lands
    metaverses[metaverse] = undefined
    return arrayFromAsync(
        iterateAllAsync((i: number) => requestMetaverseMap(i, metaverse), 0)
    )
}

export const getMetaverses = () => metaverses

export const getListings = async (metaverse: Metaverse) => {
    let listings: Array<any> = []
    for (let i = 0; ; i += heatmapMvLandsPerRequest[metaverse].lands) {
        let listingsChunk: Array<any> = await (
            await axios({
                method: 'get',
                url:
                    process.env.OPENSEA_SERVICE_URL +
                    `/opensea/collections/${metaverse}/listings?from=${i}&size=${heatmapMvLandsPerRequest[metaverse].lands}`,
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        ).data.result
        if (listingsChunk.length == 0) return listings
        listings = listings.concat(listingsChunk)
    }
}

export const updateMetaverses = async () => {
    for (let metaverse of Object.keys(metaverseObject)) {
        try {
            await requestMetaverseLands(metaverse as Metaverse)
            let listings = await getListings(metaverse as Metaverse)
            for (let value of listings) {
                let key = metaverse + value.tokenId
                let land = _cache.get(key)
                let pred_price = land?.eth_predicted_price
                if (value.currentPrice) {
                    land.current_price_eth = value.currentPrice
                        ? value.currentPrice.eth_price
                        : undefined
                    land.percent = value.currentPrice
                        ? 100 * (value.currentPrice.eth_price / pred_price - 1)
                        : undefined
                }
                land.best_offered_price_eth = value.bestOfferedPrice
                    ? value.bestOfferedPrice.eth_price
                    : undefined
                _cache.set(key, land)
            }
        } catch (err) {
            console.log(err)
        }
    }
}

export const getMetaverse = (metaverse: Metaverse) => {
    return metaverses[metaverse]
}

export const getLandKey=(metaverse: Metaverse, keyIndex:number)=>{
return metaverses[metaverse][keyIndex]
}

export const metaverseKeyTotalAmount = (metaverse: Metaverse)=>metaverses[metaverse].length

export const cache = _cache
