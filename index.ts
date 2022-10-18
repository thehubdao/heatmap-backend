import express from 'express'
import http from 'http'
import { Socket, Server } from 'socket.io'
import { defineHandlers } from './lib/utils/socketUtils'
import { socketMessagesController } from './src/controller/socketMessagesController'
import './src/process/metaverseProcess'

const app = express()

const server = http.createServer(app)

const io = new Server(server)

io.on('connection', (socket: Socket) => {
    console.log('Connection')
    defineHandlers(socket, socketMessagesController(socket))
})

server.listen(3005)
