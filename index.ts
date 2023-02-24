import { Socket } from 'socket.io'
import { defineHandlers } from './lib/utils/socketUtils'
import { socketMessagesController } from './src/controller/socketMessagesController'
import cors from 'cors'
import { getLimitsController, setMetaverseCalcs } from './src/controller/limitsController'
import { clientConnect } from './lib/socketService'
import { socketReceiverMessages } from './types/socket'
import { fork } from 'child_process'
import { getLand, setLands, setLand } from './lib/cacheService'
import { ProcessMessages } from './types/process'
import { config } from 'dotenv'
import { setBulkMetaverseKeys } from './lib/utils/metaverseService'
import { Metaverse } from './types/metaverse'

config()

const app = require('express')()
app.use(cors())
const server = require('http').createServer(app)
const Server = require('socket.io').Server
const port = process.env.PORT || 3005
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})

io.on(socketReceiverMessages.socketConnect, async (socket: Socket) => {
    clientConnect(socket)
    socket.on('connect_error', (err) => {
        console.log(`connect_error due to ${err.message}`)
    })
    defineHandlers(socket, socketMessagesController(socket))
})

server.listen(port, () => {
    console.log('Sockets listening on port: ' + port)
})

app.get('/limits', getLimitsController)

const child = fork('./src/process/downloadMetaverseProcess.ts', { detached: true })

const processMessages: any = {
    [ProcessMessages.newMetaverseChunk]({ chunk, metaverse }: any) {
        setLands(chunk, metaverse)
    },
    [ProcessMessages.getCacheKey]({ key, metaverse }: any) {
        const cacheValue = getLand(key, metaverse)
        sendChildMessage(ProcessMessages.sendCacheKey, cacheValue)
    },
    [ProcessMessages.setCacheKey]({ land, metaverse }: any) {
        console.log(land,metaverse)
        setLand(land, metaverse)
    },
    [ProcessMessages.setMetaverseCalcs](metaverse: Metaverse) {
        setMetaverseCalcs(metaverse)
    }
}

const sendChildMessage = (message: any, data?: any) => {
    child.send({ message, data })
}

const downloadStart = () => {
    sendChildMessage(ProcessMessages.downloadStart)
}

child.on('message', async ({ message, data }: any) => {
    const messageHandler = processMessages[message]
    if (!messageHandler) return
    await messageHandler(data)
})

downloadStart()
setInterval(downloadStart, 10000000)
