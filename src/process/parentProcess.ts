/* import { getKey, setBulkKeys, setKey } from '../../lib/cacheService'
import {ProcessMessages} from '../../types/process'
/* const {fork} = require('child_process')
const child = fork('./downloadMetaverseProcess.js') 
import {child} from '../../index'
const processMessages: any = {
    [ProcessMessages.newMetaverseChunk](chunk: any) {
        setBulkKeys(chunk)
    },
    [ProcessMessages.getLand](key: string) {
        const land = getKey(key)
        sendChildMessage(ProcessMessages.sendLand, land)
    },
    [ProcessMessages.setLand]({ key, land }: any) {
        setKey(key, land)
    },
}

const sendChildMessage = (message: any, data?: any) => {
    console.log(child)
    const { send }: any = child
    send({ message, data })
}

export const downloadStart = () => {
    sendChildMessage(ProcessMessages.downloadStart)
}

process.on('message', async ({ message, data }: any) => {
    const messageHandler = processMessages[message]
    if (!messageHandler) return
    await messageHandler(data)
})
 */
export const downloadStart = () => {}