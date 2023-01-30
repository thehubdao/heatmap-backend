import { Socket } from 'socket.io'
import { defineHandlers } from './lib/utils/socketUtils'
import { socketMessagesController } from './src/controller/socketMessagesController'
import cors from 'cors'
import { getLimitsController } from './src/controller/limitsController'
import { clientConnect } from './lib/socketService'
import { socketReceiverMessages } from './types/socket'
import { fork } from 'child_process'
import { getKey, setBulkKeys, setKey } from './lib/cacheService'
import { ProcessMessages } from './types/process'
import {config} from 'dotenv'

config()

const app = require('express')()
const fs = require('fs');
app.use(cors())
const privateKey = fs.readFileSync('/etc/letsencrypt/live/heatmap.itrmachines.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/heatmap.itrmachines.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/heatmap.itrmachines.com/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};


const server = require('https').createServer(credentials,app)
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

const child = fork('./src/process/downloadMetaverseProcess.ts')

const processMessages: any = {
    [ProcessMessages.newMetaverseChunk](chunk: any) {
        setBulkKeys(chunk)
    },
    [ProcessMessages.getCacheKey](key: string) {
        const cacheValue = getKey(key)
        sendChildMessage(ProcessMessages.sendCacheKey, cacheValue)
    },
    [ProcessMessages.setCacheKey]({ key, data }: any) {
        setKey(key, data)
    },
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
