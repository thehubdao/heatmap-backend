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
import { Metaverse } from './types/metaverse'
import { join } from 'path'

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

app.get('/',(req:any,res:any)=>{res.send("SERVER WORKING")})

const child = fork(
    join(__dirname, '/src/process/downloadMetaverseProcess'), ['node --max-old-space-size=8192 build/index.js']
)


const processMessages: any = {
    [ProcessMessages.newMetaverseChunk]({ chunk, metaverse }: any) {
        setLands(chunk, metaverse)
    },
    [ProcessMessages.getCacheKey]({ tokenId, metaverse }: any) {
        const cacheValue = getLand(tokenId, metaverse)
        sendChildMessage(ProcessMessages.sendCacheKey, cacheValue)
    },
    [ProcessMessages.setCacheKey]({ land, metaverse }: any) {
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
    /* pidusage(child.pid, function (err:any, stats:any) {
        console.log(message,err,stats, new Date().toISOString());
        
        }); */
    const messageHandler = processMessages[message]
    if (!messageHandler) return
    await messageHandler(data)
})

child.on('error', (err) => {
    console.log(err, child.exitCode)
    child.disconnect()
})

child.on('exit', (err) => {
    console.log(err, child.exitCode)
    child.disconnect()
})


downloadStart()
setInterval(downloadStart, 600000)
