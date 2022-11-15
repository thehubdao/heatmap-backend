import { Socket } from 'socket.io'
import { defineHandlers } from './lib/utils/socketUtils'
import { socketMessagesController } from './src/controller/socketMessagesController'
import cors from 'cors'
const app = require('express')()

app.use(cors())
const server = require('http').createServer(app)
const Server = require('socket.io').Server
const port = process.env.PORT || 8080
const io = new Server(server, {
    path: '/api/socket.io',
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})

io.on('connection', (socket: Socket) => {
    console.log('Connection')
    defineHandlers(socket, socketMessagesController(socket))
})

server.listen(port, () => {
    console.log('Sockets listening on port: ' + port)
})

server.on('upgrade', (req: any, socket: any, head: any) => {
    console.log('beautiful upgrade')
    if (req!.url!.indexOf('/socket.io') != -1 ) {
        console.log('socket upgrades')
        //io.engine.handleUpgrade(req, socket, head)
    } else {
        console.log('destroyed')
        socket.destroy()
    }
})
