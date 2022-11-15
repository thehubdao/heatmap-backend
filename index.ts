import express from 'express'
import http from 'http'
import { Socket, Server } from 'socket.io'
import { defineHandlers } from './lib/utils/socketUtils'
import { socketMessagesController } from './src/controller/socketMessagesController'
import './src/process/metaverseProcess'
//import httpProxy from 'http-proxy'

const app = express()

const server = http.createServer(app)

const io = new Server(server, {
    path: '/heatmap-backend',
    transports: ['websocket', 'polling'],
})

const port: number = (process.env.PORT as unknown as number) || 3005

io.on('connection', (socket: Socket) => {
    console.log('Connection')
    defineHandlers(socket, socketMessagesController(socket))
})

server.listen(port, () => {
    console.log('Sockets listening on port: ' + port)
})

server.on('upgrade', (request, socket, head) => {
    console.log(request, socket, head)
})
