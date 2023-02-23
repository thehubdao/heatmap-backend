import { Socket } from 'socket.io'
import { Metaverse } from '../types/metaverse'
import { socketReceiverMessages, socketSenderMessages } from '../types/socket'
import { getBulkKeys, getKey } from './cacheService'
import { updateStats } from './firebaseService'
import { getMetaverseKeys } from './utils/metaverseService'
import { readFileSync } from 'fs'

export const renderStart = async (socket: Socket, metaverse: Metaverse) => {
    const metaverseLands = JSON.parse(readFileSync(`data/${metaverse}.json`, {encoding:"utf8"}))
    console.log('render-start', metaverse)
    updateStats(metaverse)
    await renderLands(socket, metaverseLands)
}

export const renderContinue = async (
    socket: Socket,
    metaverse: Metaverse,
    keyIndex: number
) => {
    const metaverseLands = JSON.parse(readFileSync(`data/${metaverse}.json`, {encoding:"utf8"}))
    console.log('render-continue', metaverse)
    const metaverseLeftLands = metaverseLands.slice(
        keyIndex,
        metaverseLands.length
    ) 
    await renderLands(socket, metaverseLeftLands)
}

const renderLands = async (
    socket: Socket,
    metaverseLands: any
) => {
    for (const landIndex in metaverseLands) {
        const land = metaverseLands[landIndex]
        socket.emit(socketSenderMessages.newLandData, land, landIndex)
    }
    socket.emit(socketSenderMessages.renderFinish)
}

/* export const giveLand = async (
    socket: Socket,
    metaverse: Metaverse,
    index: number
) => {
    const land = await getKey(getLandKey(metaverse, index))
    let prevIndex: number | null = index - 1
    let nextIndex: number | null = index + 1
    if (prevIndex < 0) prevIndex = null
    if (nextIndex >= metaverseKeyTotalAmount(metaverse)) nextIndex = null

    socket.emit(socketSenderMessages.giveLand, land, prevIndex, nextIndex)
} */

export const rendernewLandBulkData = async (
    socket: Socket,
    metaverse: Metaverse,
) => {
    const keyLimit: number = 100
    const landKeys: string[] = getMetaverseKeys(metaverse)
    let startLandKeysIndex: number = 0
    while (true) {
        const limitedLandKeys = landKeys.slice(
            startLandKeysIndex,
            startLandKeysIndex + keyLimit
        )
        const lands = await getBulkKeys(limitedLandKeys)
        socket.emit(socketSenderMessages.newBulkData, lands)

        if (startLandKeysIndex >= landKeys.length)
            return socket.emit(socketSenderMessages.renderFinish)


        startLandKeysIndex += keyLimit
    }
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
