import { Socket } from 'socket.io'
import {
    clientDisconnect,
    renderContinue,
    renderStart,
} from '../../lib/socketService'
import { Metaverse } from '../../types/metaverse'
import {
    Controller,
    socketReceiverMessages,
    socketSenderMessages,
} from '../../types/socket'

export const socketMessagesController = (socket: Socket) => {
    return {
        [socketReceiverMessages.socketDisconnect]: (
            disconnectReason: string
        ) => {
            clientDisconnect(disconnectReason, socket)
        },
        [socketReceiverMessages.renderStart]: async (metaverse: Metaverse, landIndex:number) => {
            await renderStart(socket, metaverse,landIndex)
        },
        /*         [socketReceiverMessages.getLand]: async (metaverse:Metaverse, index:number)=>{
            await giveLand(socket,metaverse,index)
        }, */
        [socketReceiverMessages.renderContinue]: async (metaverse: Metaverse, keyIndex:number) => {
            await renderContinue(socket,metaverse,keyIndex)
        },
        [socketReceiverMessages.renderBulk]: async (
            metaverse: Metaverse,
        ) => {
            /* await rendernewLandBulkData(socket, metaverse) */
        },
    } as Controller
}
