import { Socket } from 'socket.io'
import { Metaverse } from '../types/metaverse'
import { getMetaverse, cache } from './metaverseService'

export const renderMetaverse = async (socket: Socket, metaverse: Metaverse) => {
    const metaverseKeys=Object.values(getMetaverse(metaverse))
    console.time('Redis time')
    const lands = await cache.mget(metaverseKeys)
    console.log(metaverseKeys.length,Object.values(lands).length)
    console.timeEnd('Redis time')
    
    for (const land of Object.values(lands)) {
        socket.emit('render', land)
        
    }
    
}
