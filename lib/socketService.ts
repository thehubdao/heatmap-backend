import { Socket } from 'socket.io'
import { Metaverse } from '../types/metaverse'
import { socketReceiverMessages, socketSenderMessages } from '../types/socket'
import { getMetaverse } from './cacheService'
import { updateStats } from './firebaseService'

export const renderStart = async (socket: Socket, metaverse: Metaverse, landIndex: number = 0) => {
    const metaverseLands = Object.values(getMetaverse(metaverse))
    console.log('render-start', metaverse, landIndex, metaverseLands.length - landIndex)
    updateStats(metaverse)
    await renderLands(socket, metaverseLands, landIndex, metaverse)
}

const formatLand = (land: any, metaverse: Metaverse) => {
    const { eth_predicted_price, floor_adjusted_predicted_price, tokenId } = land
    const { x, y } = land.coords ? land.coords:land.center
    let formattedLand = `${x};${y};${eth_predicted_price};${floor_adjusted_predicted_price};${tokenId}`

    if (metaverse != 'decentraland') return formattedLand

    const { type, top, left, topLeft } = land.tile

    formattedLand += type ?? `;${type}`
    formattedLand += top ?? `;${top}`
    formattedLand += left ?? `;${left}`
    formattedLand += topLeft ?? `;${topLeft}`

    return formattedLand
}
const renderLands = async (
    socket: Socket,
    lands: any[],
    landCurrentIndex: number,
    metaverse: Metaverse
) => {
    for (let landIndex = landCurrentIndex; landIndex < lands.length; landIndex++) {
        const land: any = lands[landIndex]
        const formattedLand = formatLand(land, metaverse)

        socket.emit(socketSenderMessages.newLandData, formattedLand, landIndex)
    }
    socket.emit(socketSenderMessages.renderFinish)
}

export const pingPong = (socket: any) => {
    const pingInterval = 5000,
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
    setPongInterval(socket)
}

export const clientConnect = (socket: Socket) => {
    pingPong(socket)
    console.log('CONNECTION', new Date().toISOString())
    console.log('ip: ' + socket.request.connection.remoteAddress)
    console.log('user-agent: ' + socket.request.headers['user-agent'])
    console.log(socket.id)
}

export const clientDisconnect = (disconnectReason: string, socket: Socket) => {
    console.log(disconnectReason)
    console.log('ip: ' + socket.request.connection.remoteAddress)
    console.log('user-agent: ' + socket.request.headers['user-agent'])
}
