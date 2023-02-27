import axios from 'axios'
import { Metaverse, metaverseObject } from '../../types/metaverse'
import {
    metaverseUrl,
    heatmapMvLandsPerRequest,
} from '../../lib/utils/metaverseUtils'
import { ProcessMessages } from '../../types/process'

const requestMetaverseMap = async (i: number, metaverse: Metaverse) => {
    try {
        const landsChunkLimit = heatmapMvLandsPerRequest[metaverse].lands
        const requestLandsUrl: string = `${metaverseUrl(
            metaverse
        )}?from=${i}&size=${landsChunkLimit}&reduced=true`
        let requestLandChunk

        try {
            requestLandChunk = await axios.get(requestLandsUrl, {
                headers: {
                    Accept: 'application/json',
                },
            })
        } catch (err) {
            console.log(err)
            console.log('Retrying')
            requestLandChunk = await axios.get(requestLandsUrl, {
                headers: {
                    Accept: 'application/json',
                },
            })
        }

        const landChunk = requestLandChunk.data
        const landChunkKeys = Object.keys(requestLandChunk.data)

        if (landChunkKeys.length < 1) {
            console.log('Metaverse finish')
            return false
        }
        const landsFormatted = landChunkKeys.map((key: any) => {
            const land: any = landChunk[key]
            land.tokenId = key
            return land
        })
        sendParentMessage(ProcessMessages.newMetaverseChunk, { metaverse, chunk: landsFormatted })

        console.log(
            /*             new Date(), */
            'RESPONSE',
            `metaverse: ${metaverse};`,
            `land_amount: ${landChunkKeys.length};`,
            `metaverse_chunk_limit: ${landsChunkLimit};`,
            `from: ${i};`,
            `to: ${i + landsChunkLimit};`
        )
    } catch (error) {
        console.log(error)
    }

    return true
}

const requestMetaverseLands = async (metaverse: Metaverse) => {
    const chunkSize = heatmapMvLandsPerRequest[metaverse].lands
    let chunkIndex = 0
    let areLandsLeft = true
    while (areLandsLeft) {
        areLandsLeft = await requestMetaverseMap(chunkIndex, metaverse)
        chunkIndex += chunkSize
    }
}

const getListings = async (metaverse: Metaverse) => {
    const landsChunkLimit = heatmapMvLandsPerRequest[metaverse].lands
    const listingUrl =
        process.env.OPENSEA_SERVICE_URL +
        `/opensea/collections/${metaverse}/listings`
    let listings: Array<any> = []
    try {
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
    } catch (err) {
        console.log(err)
        return []
    }
    

}

const setListings = async (metaverse: Metaverse) => {
    const listings = await getListings(metaverse as Metaverse)
    console.log(listings)
    for (const listing of listings) {
        try {
            let { tokenId } = listing
            sendParentMessage(ProcessMessages.getCacheKey, { tokenId, metaverse })
            const getLandPromise = new Promise<any>((resolve) => {
                process.once('message', ({ message, data }) => {
                    if (message == ProcessMessages.sendCacheKey) resolve(data)
                })
            })
            const land = await getLandPromise
            const { currentPrice } = listing
            if (currentPrice) land.current_price_eth = currentPrice.eth_price

            sendParentMessage(ProcessMessages.setCacheKey, {
                metaverse,
                land,
            })
        } catch (error) {
        }
    }
}

const updateMetaverses = async () => {
    const metaverses: Metaverse[] = Object.keys(metaverseObject) as Metaverse[]
    for (const metaverse of metaverses) {
        try {
            await requestMetaverseLands(metaverse)
            await setListings(metaverse)
            sendParentMessage(ProcessMessages.setMetaverseCalcs, metaverse)
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
