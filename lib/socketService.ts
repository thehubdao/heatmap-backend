import { Socket } from 'socket.io'
import { Metaverse } from '../types/metaverse'
import { socketReceiverMessages, socketSenderMessages } from '../types/socket'
import { getMetaverse, getLand } from './cacheService'
import { updateStats } from './firebaseService'
import { getMetaverseKeys } from './utils/metaverseService'

export const renderStart = async (socket: Socket, metaverse: Metaverse, landIndex: number = 0) => {
    const metaverseLands = Object.values(getMetaverse(metaverse))
    console.log('render-start', metaverse, landIndex, metaverseLands.length - landIndex)
    updateStats(metaverse)
    await renderLands(socket, metaverseLands, landIndex)
}


const renderLands = async (
    socket: Socket,
    lands: any[],
    landCurrentIndex: number
) => {
    for (let landIndex = landCurrentIndex; landIndex < lands.length; landIndex++) {
        socket.emit(socketSenderMessages.newLandData, lands[landIndex], landIndex)
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
