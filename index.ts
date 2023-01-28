import { Socket } from 'socket.io'
import { defineHandlers } from './lib/utils/socketUtils'
import { socketMessagesController } from './src/controller/socketMessagesController'
import './src/process/metaverseProcess'
import cors from 'cors'
import { getMetaverse } from './lib/metaverseService'
import { getLimitsController } from './src/controller/limitsController'
import { clientConnect } from './lib/socketService'
import { socketReceiverMessages } from './types/socket'
import './src/process/parentProcess'
import {fork} from 'child_process'
import { getKey, setBulkKeys, setKey } from './lib/cacheService'
import {ProcessMessages} from './types/process'

const app = require('express')()
app.use(cors())
const server = require('http').createServer(app)
const Server = require('socket.io').Server
const port = process.env.PORT || 8080
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})

io.on(socketReceiverMessages.socketConnect, async (socket: Socket) => {
    clientConnect(socket)
    socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
      })
    defineHandlers(socket, socketMessagesController(socket))
})

server.listen(port, () => {
    console.log('Sockets listening on port: ' + port)
})

app.get('/metaverse', (req: any, res: any) => {
    //console.log("Metaverse",req,getMetaverse(req.metaverse))
    return res.send(getMetaverse(req.query.metaverse))
})

app.get('/limits', getLimitsController)

const child = fork('./src/process/downloadMetaverseProcess.ts')

const processMessages: any = {
    [ProcessMessages.newMetaverseChunk](chunk: any) {
        setBulkKeys(chunk)
    },
    [ProcessMessages.getCacheKey](key: string) {
        const cacheValue = getKey(key)
        sendChildMessage(ProcessMessages.sendCacheKey, cacheValue)
    },
    [ProcessMessages.setCacheKey]({ key, land }: any) {
        setKey(key, land)
    },
}

const sendChildMessage = (message: any, data?: any) => {
    child.send({ message, data })
}

const downloadStart = () => {
    sendChildMessage(ProcessMessages.downloadStart)
}
downloadStart()

child.on('message', async ({ message, data }: any) => {
    const messageHandler = processMessages[message]
    if (!messageHandler) return
    await messageHandler(data)
})