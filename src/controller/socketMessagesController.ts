import { Socket } from 'socket.io'
import { renderMetaverse } from '../../lib/socketService'
import { Metaverse } from '../../types/metaverse'
import { Controller } from '../../types/socket'

export const socketMessagesController = (socket: Socket) => {
    return {
        render: async (metaverse: Metaverse) => {
           await renderMetaverse(socket, metaverse)
        },
    } as Controller
}
