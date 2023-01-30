import axios from 'axios'
import { getMetaverseCalcs } from '../controller/limitsController'
import { Metaverse, metaverseObject } from '../../types/metaverse'
import {
    metaverseUrl,
    heatmapMvLandsPerRequest,
} from '../../lib/utils/metaverseUtils'
import { ProcessMessages } from '../../types/process'

let chunkSize = 0

const metaverses: Record<Metaverse, Array<any>> = {
    decentraland: [],
    'somnium-space': [],
    sandbox: [],
    'axie-infinity': [],
}

const requestMetaverseMap = async (i: number, metaverse: Metaverse) => {
    try {
        const landsChunkLimit = heatmapMvLandsPerRequest[metaverse].lands
        const requestLandsUrl: string = `${metaverseUrl(
            metaverse
        )}?from=${i}&size=${landsChunkLimit}&reduced=true`
        const requestLandChunk = await axios.get(requestLandsUrl, {
            headers: {
                Accept: 'application/json',
            },
        })
        const landChunk = requestLandChunk.data
        const landChunkKeys = Object.keys(landChunk)

        if (landChunkKeys.length < 1) return
        const keyArray:any[] = []
        const landsFormatted = landChunkKeys.map((key: any) => {
            const land = landChunk[key]
            landChunk[key].tokenId = key
            key = metaverse + key //Each key has metaverse name concat
            keyArray.push(key)
            return { key, val: land }
        })
        const keyArrayKey = `${metaverse}-keys`
        
        sendParentMessage(ProcessMessages.setBulkMetaverseKeys, {
            metaverse,
            keys: keyArray,
        })
        sendParentMessage(ProcessMessages.setCacheKey, {
            key: keyArrayKey,
            data: keyArray,
        })
        sendParentMessage(ProcessMessages.newMetaverseChunk, landsFormatted)

        console.log(
            'Response',
            landChunkKeys.length,
            new Date(),
            i,
            landsChunkLimit
        )
    } catch (error) {
        console.log(error)
    }

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

const requestMetaverseLands = (metaverse: Metaverse) => {
    chunkSize = heatmapMvLandsPerRequest[metaverse].lands
    return arrayFromAsync(
        iterateAllAsync((i: number) => requestMetaverseMap(i, metaverse), 0)
    )
}

const getListings = async (metaverse: Metaverse) => {
    const landsChunkLimit = heatmapMvLandsPerRequest[metaverse].lands
    const listingUrl =
        process.env.OPENSEA_SERVICE_URL +
        `/opensea/collections/${metaverse}/listings`
    let listings: Array<any> = []

    for (let i = 0; ; i += landsChunkLimit) {
        const listingRequestUrl = `${listingUrl}?from=${i}&size=${landsChunkLimit}`
        const listingsRequest = await axios.get(listingRequestUrl, {
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const listingsChunk = listingsRequest.data.result

        if (listingsChunk.length == 0) return listings

        listings = listings.concat(listingsChunk)
    }
}

const updateMetaverses = async () => {
    const metaverses = Object.keys(metaverseObject)
    for (const metaverse of metaverses) {
        try {
            await requestMetaverseLands(metaverse as Metaverse)
            const listings = await getListings(metaverse as Metaverse)
            for (const listing of listings) {
                let key = metaverse + listing.tokenId
                sendParentMessage(ProcessMessages.getCacheKey, key)
                const getLandPromise = new Promise<any>((resolve) => {
                    process.once('message', ({ message, data }) => {
                        if (message == ProcessMessages.sendCacheKey)
                            resolve(data)
                    })
                })
                const land = await getLandPromise
                const { currentPrice } = listing
                if (currentPrice)
                    land.current_price_eth = currentPrice.eth_price

                sendParentMessage(ProcessMessages.setCacheKey, {
                    key,
                    data: land,
                })
            }
            const metaverseGeneralData = getMetaverseCalcs(
                metaverse as Metaverse
            )
            sendParentMessage(ProcessMessages.setCacheKey, {
                key: `${metaverse}-generalData`,
                data: metaverseGeneralData,
            })
        } catch (err) {
            console.log(err)
        }
    }
}
const processMessages: any = {
    async [ProcessMessages.downloadStart]() {
        await updateMetaverses()
    },
}

process.on('message', async ({ message }: any) => {
    const messageHandler = processMessages[message]
    if (!messageHandler) return
    await messageHandler()
})

const sendParentMessage = (message: any, data?: any) => {
    const moldableProcess = process as any
    if (!moldableProcess) return
    moldableProcess.send({ message, data })
}
