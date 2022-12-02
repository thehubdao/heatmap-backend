import { Socket } from 'socket.io'
import { defineHandlers } from './lib/utils/socketUtils'
import { socketMessagesController } from './src/controller/socketMessagesController'
import './src/process/metaverseProcess'
import cors from 'cors'
import { getMetaverse } from './lib/metaverseService'
import { getLimitsController } from './src/controller/limitsController'
const app = require('express')()
app.use(cors())
const server = require('http').createServer(app)
const Server = require('socket.io').Server
const port = process.env.PORT || 8080
const io = new Server(server, {
    path: '/heatmap-backend',
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})

io.on('connection', async (socket: Socket) => {
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