import axios from 'axios'
import { Socket } from 'socket.io'
import { Metaverse, metaverseObject } from '../types/metaverse'
import { renderMetaverseChunk } from './socketService'
import {
    getMetaverseAddress,
    metaverseUrl,
    heatmapMvLandsPerRequest,
} from './utils/metaverseUtils'

let chunkSize = 0

const requestMetaverseMap = async (
    socket: Socket,
    i: number,
    metaverse: Metaverse
) => {
    let response: any
    let tokenIds

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
        tokenIds = Object.keys(response)
        if (tokenIds.length < 1) return
        console.log(
            'Response',
            Object.keys(response).length,
            new Date(),
            i,
            heatmapMvLandsPerRequest[metaverse].lands
        )
    } catch {
        console.log(
            `${metaverseUrl(metaverse)}/${
                metaverse === 'axie-infinity' ? 'requestMap' : 'map'
            }?from=${i}&size=${heatmapMvLandsPerRequest[metaverse].lands}`,
            'Empty array'
        )
        response = {}
    }

    let ores,
        cnt = 0,
        metaverseAddress = getMetaverseAddress(metaverse)
    if (metaverseAddress !== 'None') {
        do {
            try {
                ores = await axios({
                    method: 'post',
                    url: process.env.OPENSEA_SERVICE_URL + '/service/getTokens',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: JSON.stringify({
                        collection: metaverseAddress,
                        tokenIds,
                    }),
                })
                ores = await ores.data
                for (let value of ores.results) {
                    let pred_price = response[value.token_id].predicted_price
                    if (value.current_price) {
                        response[value.token_id].current_price_eth =
                            value.current_price
                                ? value.current_price.eth_price
                                : undefined
                        response[value.token_id].percent = value.current_price
                            ? 100 *
                              (value.current_price.eth_price / pred_price - 1)
                            : undefined
                    }
                    response[value.token_id].best_offered_price_eth =
                        value.best_offered_price
                            ? value.best_offered_price.eth_price
                            : undefined
                }
            } catch (error) {
                ores = undefined
                cnt = cnt + 1
                console.log('Error trying again...', error)
            }
        } while (ores == undefined && cnt < 10)
    }
    renderMetaverseChunk(socket, response,i)


    return response
}

async function* iterateAllAsync(fn: Function, i:number) {
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

export const renderMetaverse = async (socket: Socket, metaverse: Metaverse, checkpoint:number) => {
    chunkSize = heatmapMvLandsPerRequest[metaverse].lands
    await arrayFromAsync(
        iterateAllAsync((i: number) =>
            requestMetaverseMap(socket, i, metaverse),checkpoint
        )
    )
    
}
