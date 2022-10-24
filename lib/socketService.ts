import { Socket } from 'socket.io'
import { Metaverse } from '../types/metaverse'

export const renderMetaverseChunk = (
    socket: Socket,
    lands: any
) => {
    if (lands) {
        let metaverseValues = Object.values(lands)

        metaverseValues.forEach((land: any) => {
           socket.emit('render', land)
        })
    }
}
