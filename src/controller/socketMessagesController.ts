import { Socket } from 'socket.io'
import { renderMetaverse } from '../../lib/metaverseService'
import { Metaverse } from '../../types/metaverse'
import { Controller } from '../../types/socket'

export const socketMessagesController = (socket: Socket) => {
    return {
        render: (metaverse: Metaverse, checkpoint: number) => {
            console.log(metaverse)
            renderMetaverse(socket, metaverse, checkpoint)
        },
    } as Controller
}
