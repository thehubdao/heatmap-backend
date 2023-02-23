import axios from 'axios'
import { Metaverse, metaverseObject } from '../../types/metaverse'
import {
    metaverseUrl,
    heatmapMvLandsPerRequest,
} from '../../lib/utils/metaverseUtils'
import { ProcessMessages } from '../../types/process'
import { writeFileSync } from 'fs'
import { getGeneralData } from '../controller/limitsController'

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
        const landChunkKeys = Object.keys(landChunk)
        console.log(
            'RESPONSE',
            `metaverse: ${metaverse};`,
            `land_amount: ${landChunkKeys.length};`,
            `metaverse_chunk_limit: ${landsChunkLimit};`,
            `from: ${i};`,
            `to: ${i + landsChunkLimit};`
        )
        return landChunk
    } catch (error) {
        console.log(error)
    }

}

const requestMetaverseLands = async (metaverse: Metaverse) => {
    const chunkSize = heatmapMvLandsPerRequest[metaverse].lands
    let chunkIndex = 0
    let areLandsLeft = true
    let metaverseLands = {}

    while (areLandsLeft) {
        const landChunk = await requestMetaverseMap(chunkIndex, metaverse)
        const landChunkKeys = Object.keys(landChunk).length
        metaverseLands = { ...metaverseLands, ...landChunk }
        areLandsLeft = landChunkKeys != 0
        chunkIndex += chunkSize
    }

    return metaverseLands
}

const getListings = async (metaverse: Metaverse) => {
    const landsChunkLimit = heatmapMvLandsPerRequest[metaverse].lands
    const listingUrl =
        process.env.OPENSEA_SERVICE_URL +
        `/opensea/collections/${metaverse}/listings`
    let listings: Array<any> = []

    for (let i = 0; ; i += landsChunkLimit) {
        try {
            const listingRequestUrl = `${listingUrl}?from=${i}&size=${landsChunkLimit}`
            const listingsRequest = await axios.get(listingRequestUrl, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const listingsChunk = listingsRequest.data.result
            if (listingsChunk.length == 0) return listings

            listings = listings.concat(listingsChunk)
        } catch (err) {
            console.log(err)
        }
    }
}

const setListings = async (metaverse: Metaverse, metaverseLands: any) => {
    const listings = await getListings(metaverse as Metaverse)

    for (const listing of listings) {
        try {
            let key = listing.tokenId
            const land = metaverseLands[key]
            const { currentPrice } = listing
            if (currentPrice) land.current_price_eth = currentPrice.eth_price
            metaverseLands[key] = land
        } catch (err) {
            console.log(err)
        }
    }
}

const updateMetaverses = async () => {
    const metaverses: Metaverse[] = Object.keys(metaverseObject) as Metaverse[]
    for (const metaverse of metaverses) {
        try {
            const metaverseLands = await requestMetaverseLands(metaverse)
            await setListings(metaverse, metaverseLands)
            const generalData = getGeneralData(metaverseLands)
            writeFileSync(`data/${metaverse}.json`, JSON.stringify(metaverseLands))
            writeFileSync(`data/${metaverse}GeneralData.json`, JSON.stringify(generalData))
            console.log(metaverse + ': Metaverse download finish')
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