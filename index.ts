import { Socket } from 'socket.io'
import { defineHandlers } from './lib/utils/socketUtils'
import { socketMessagesController } from './src/controller/socketMessagesController'
import './src/process/metaverseProcess'
import cors from 'cors'
import { getMetaverse } from './lib/metaverseService'
import { getLimitsController } from './src/controller/limitsController'
import { clientConnect } from './lib/socketService'
import { socketReceiverMessages } from './types/socket'
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