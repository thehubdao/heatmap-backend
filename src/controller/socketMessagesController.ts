import { Socket } from 'socket.io'
import { clientDisconnect, giveLand, renderStart } from '../../lib/socketService'
import { Metaverse } from '../../types/metaverse'
import { Controller, socketReceiverMessages, socketSenderMessages } from '../../types/socket'

export const socketMessagesController = (socket: Socket) => {
    return {
        [socketReceiverMessages.socketDisconnect]: (
            disconnectReason: string
        ) => {
            clientDisconnect(disconnectReason, socket)
        },
        [socketReceiverMessages.renderStart]: async (metaverse: Metaverse) => {
            await renderStart(socket, metaverse)
        },
        [socketReceiverMessages.getLand]: async (metaverse:Metaverse, index:number)=>{
            await giveLand(socket,metaverse,index)
        },
        [socketReceiverMessages.renderContinue]:()=>{
            
        }
    } as Controller
}
