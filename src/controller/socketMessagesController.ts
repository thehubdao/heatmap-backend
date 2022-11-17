import { Socket } from 'socket.io'
import { renderMetaverse } from '../../socketService'
import { Metaverse } from '../../types/metaverse'
import { Controller } from '../../types/socket'

export const socketMessagesController = (socket: Socket) => {
    return {
        render: async (metaverse: Metaverse) => {
            console.log(metaverse)
           await renderMetaverse(socket, metaverse)
        },
    } as Controller
}
