import { Socket } from 'socket.io'
import { getLand } from '../../lib/cacheService'
import {
    clientDisconnect,
    getLandByToken,
    renderStart,
} from '../../lib/socketService'
import { Metaverse } from '../../types/metaverse'
import {
    Controller,
    socketReceiverMessages,
    socketSenderMessages,
} from '../../types/socket'

export const socketMessagesController = (socket: any) => {
    return {
        [socketReceiverMessages.socketDisconnect]: (
            disconnectReason: string
        ) => {
            clientDisconnect(disconnectReason, socket)
        },
        [socketReceiverMessages.renderStart]: async (args) => {
            const metaverse: Metaverse = args[0]
            const landIndex: number = args[1]

            await renderStart(socket, metaverse, landIndex)
        },
        [socketReceiverMessages.getLand]: async ([metaverse, tokenId]) => {
            await getLandByToken(socket, metaverse, tokenId)
        },
        [socketReceiverMessages.renderBulk]: async (
            metaverse: Metaverse,
        ) => {
            /* await rendernewLandBulkData(socket, metaverse) */
        },
    } as Controller
}
