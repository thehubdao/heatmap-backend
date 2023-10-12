import { Socket } from 'socket.io'
import { Metaverse } from '../types/metaverse'
import { socketSenderMessages } from '../types/socket'
import { getMetaverse, getLand } from './cacheService'
import { updateStats } from './firebaseService'

export const renderStart = async (socket: any, metaverse: Metaverse, landIndex: number = 0) => {
    const metaverseLands = Object.values(getMetaverse(metaverse))
    console.log('render-start', metaverse, landIndex, metaverseLands.length - landIndex)
    updateStats(metaverse)
    await renderLands(socket, metaverseLands, landIndex, metaverse)
}

export const getLandByToken = async (socket: any, metaverse: Metaverse, tokenId: string) => {
    const land = JSON.stringify(getLand(tokenId, metaverse))
    socket.send(`${socketSenderMessages.giveLand}|${land}`)
}


const formatLand = (land: any, metaverse: Metaverse) => {
    const { eth_predicted_price, floor_adjusted_predicted_price, tokenId, current_price_eth, history_amount, max_history_price, land_type } = land
    const { x, y } = land.coords ? land.coords : land.center
    let formattedLand = `${x};${y};${eth_predicted_price};${floor_adjusted_predicted_price}`

    formattedLand += current_price_eth ? `;${current_price_eth}` : `;`
    formattedLand += `;${history_amount};${max_history_price};${tokenId}`

    if (metaverse == 'sandbox') {
        if (land_type == 'Premium')
            formattedLand += `;${1}`
        return formattedLand
    }

    if (metaverse == 'somnium-space') {
        const { geometry } = land
        formattedLand += `;`
        geometry.forEach(({ x, y }: any, i: any) => {
            formattedLand += `${x}:${y}`
            if (i < geometry.length - 1) formattedLand += `/`
        });
        return formattedLand
    }


    const { type, top, left, topLeft } = land.tile

    formattedLand += type ? `;${type}` : ';'
    formattedLand += top ? `;${top}` : ';'
    formattedLand += left ? `;${left}` : ';'
    formattedLand += topLeft ? `;${topLeft}` : ';'

    return formattedLand
}
const renderLands = async (
    socket: any,
    lands: any[],
    landCurrentIndex: number,
    metaverse: Metaverse
) => {
    for (let landIndex = landCurrentIndex; landIndex < lands.length; landIndex++) {
        try {
            const land: any = lands[landIndex]
            const formattedLand = formatLand(land, metaverse)

            socket.send(`${socketSenderMessages.newLandData}|${formattedLand},${landIndex}`,)
        } catch (err) { console.log("Land error: " + err) }

    }
    socket.send(socketSenderMessages.renderFinish)
}

export const pingPong = (socket: any) => {
    /*     const pingInterval = 5000,
            pongInterval = 10000
        socket.pingInterval = setInterval(() => {
            socket.emit(socketSenderMessages.ping)
        }, pingInterval)
        const setPongInterval = (socket: any) => {
            clearInterval(socket.pongInterval)
            socket.pongInterval = setInterval(() => {
                console.log('Disconnect')
                socket.disconnect(true)
                clearInterval(socket.pingInterval)
                clearInterval(socket.pongInterval)
            }, pongInterval)
        }
        socket.on(socketReceiverMessages.pong, () => {
            setPongInterval(socket)
        })
        setPongInterval(socket) */
}

export const clientConnect = (socket: any) => {
    pingPong(socket)
    console.log('CONNECTION', new Date().toISOString())
}

export const clientDisconnect = (disconnectReason: string, socket: any) => {
    console.log(disconnectReason)
}
