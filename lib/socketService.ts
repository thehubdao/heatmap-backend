import { Socket } from 'socket.io'
import { Metaverse } from '../types/metaverse'
import { getMetaverse } from './metaverseService'

export const renderMetaverse = (socket: Socket, metaverse: Metaverse) => {
    let metaverseData = getMetaverse(metaverse)
    if (metaverseData) {
        let metaverseKeys = Object.entries(metaverseData)
        metaverseKeys.forEach((land: any, i: number) => {
            if (i === metaverseKeys.length - 1) socket.emit('render-finish')
            else socket.emit('render', land)
        })
    }
}
