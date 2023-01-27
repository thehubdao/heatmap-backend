import { Socket } from 'socket.io'
import { Metaverse } from '../types/metaverse'
import {
    getMetaverse,
    cache,
    getLandKey,
    metaverseKeyTotalAmount,
} from './metaverseService'
import { socketReceiverMessages, socketSenderMessages } from '../types/socket'

export const renderStart = async (socket: Socket, metaverse: Metaverse) => {
    console.log('render-start', metaverse)
    const metaverseKeys = getMetaverse(metaverse) as [string]
    await renderLands(socket, metaverse, metaverseKeys)
}

export const renderContinue = async (
    socket: Socket,
    metaverse: Metaverse,
    keyIndex: number
) => {
    const metaverseKeys = getMetaverse(metaverse)
    const metaverseLeftKeys = metaverseKeys.slice(
        keyIndex,
        metaverseKeys.length
    ) as [string]
    await renderLands(socket, metaverse, metaverseLeftKeys)
}

const renderLands = async (
    socket: Socket,
    metaverse: Metaverse,
    landKeys: [string]
) => {
    for (const keyIndex in landKeys) {
        const land = await cache.get(landKeys[keyIndex])
        socket.emit(socketSenderMessages.newLandData, land, keyIndex)
    }
    socket.emit(socketSenderMessages.renderFinish)
}

export const giveLand = async (
    socket: Socket,
    metaverse: Metaverse,
    index: number
) => {
    const land = await cache.get(getLandKey(metaverse, index))
    let prevIndex: number | null = index - 1
    let nextIndex: number | null = index + 1
    if (prevIndex < 0) prevIndex = null
    if (nextIndex >= metaverseKeyTotalAmount(metaverse)) nextIndex = null

    socket.emit(socketSenderMessages.giveLand, land, prevIndex, nextIndex)
}

export const rendernewLandBulkData = async (
    socket: Socket,
    metaverse: Metaverse,
    landKeys: [string]
) => {
    const landKeysLimit = 10
    const startLandKeysIndex = 0
    const limitedLandKeys = landKeys.slice(startLandKeysIndex, landKeysLimit)
    const formattedLandKeys = limitedLandKeys.map(
        (landKey) => metaverse + landKey
    )
    const lands = await cache.mget(formattedLandKeys)
    socket.emit(socketSenderMessages.newBulkData, lands)
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
