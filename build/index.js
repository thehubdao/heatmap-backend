"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socketUtils_1 = require("./lib/utils/socketUtils");
const socketMessagesController_1 = require("./src/controller/socketMessagesController");
const cors_1 = __importDefault(require("cors"));
const app = require('express')();
app.use((0, cors_1.default)());
const server = require('http').createServer(app);
const Server = require('socket.io').Server;
const port = process.env.PORT || 8080;
const io = new Server(server, {
    path: '/api/socket.io',
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
io.on('connection', (socket) => {
    console.log('Connection');
    (0, socketUtils_1.defineHandlers)(socket, (0, socketMessagesController_1.socketMessagesController)(socket));
});
server.listen(port, () => {
    console.log('Sockets listening on port: ' + port);
});
server.on('upgrade', (req, socket, head) => {
    console.log('beautiful upgrade');
    if (req.url.indexOf('/socket.io') != -1) {
        console.log('socket upgrades');
        //io.engine.handleUpgrade(req, socket, head)
    }
    else {
        console.log('destroyed');
        socket.destroy();
    }
});
