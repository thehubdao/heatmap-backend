import { Socket } from 'socket.io'
import { Metaverse } from '../types/metaverse'
import { getMetaverse } from './metaverseService'

export const renderMetaverse = (socket: Socket, metaverse: Metaverse) => {
    let metaverseData = getMetaverse(metaverse)
    if (metaverseData) {
        let metaverseValues = Object.values(metaverseData)
        console.log(metaverseValues[0])
        metaverseValues.forEach((land: any, i: number) => {
            if (i === metaverseValues.length - 1) socket.emit('render-finish')
            else socket.emit('render', land)
        })
    }
}
