import { Socket } from 'socket.io'
import { renderMetaverse } from '../../lib/socketService'
import { Metaverse } from '../../types/metaverse'
import { Controller } from '../../types/socket'

export const socketMessagesController = (socket: Socket) => {
    return {
        render: (metaverse: Metaverse) => {
            console.log(metaverse)
            renderMetaverse(socket, metaverse)
        },
    } as Controller
}
