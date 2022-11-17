"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socketUtils_1 = require("./lib/utils/socketUtils");
const socketMessagesController_1 = require("./src/controller/socketMessagesController");
require("./src/process/metaverseProcess");
const cors_1 = __importDefault(require("cors"));
const metaverseService_1 = require("./lib/metaverseService");
const app = require('express')();
app.use((0, cors_1.default)());
const server = require('http').createServer(app);
const Server = require('socket.io').Server;
const port = process.env.PORT || 8080;
const io = new Server(server, {
    path: '/heatmap-backend',
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Connection');
    (0, socketUtils_1.defineHandlers)(socket, (0, socketMessagesController_1.socketMessagesController)(socket));
}));
server.listen(port, () => {
    console.log('Sockets listening on port: ' + port);
});
app.get('/metaverse', (req, res) => {
    //console.log("Metaverse",req,getMetaverse(req.metaverse))
    return res.send((0, metaverseService_1.getMetaverse)(req.query.metaverse));
});
