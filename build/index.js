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
const cors_1 = __importDefault(require("cors"));
const limitsController_1 = require("./src/controller/limitsController");
const socketService_1 = require("./lib/socketService");
const socket_1 = require("./types/socket");
const child_process_1 = require("child_process");
const cacheService_1 = require("./lib/cacheService");
const process_1 = require("./types/process");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
let pidusage = require('pidusage');
(0, dotenv_1.config)();
const app = require('express')();
const fs = require('fs');
app.use((0, cors_1.default)());
const privateKey = fs.readFileSync('/etc/letsencrypt/live/heatmap.itrmachines.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/heatmap.itrmachines.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/heatmap.itrmachines.com/chain.pem', 'utf8');
const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};
const server = require('https').createServer(credentials, app);
const Server = require('socket.io').Server;
const port = process.env.PORT || 3005;
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
io.on(socket_1.socketReceiverMessages.socketConnect, (socket) => __awaiter(void 0, void 0, void 0, function* () {
    (0, socketService_1.clientConnect)(socket);
    socket.on('connect_error', (err) => {
        console.log(`connect_error due to ${err.message}`);
    });
    (0, socketUtils_1.defineHandlers)(socket, (0, socketMessagesController_1.socketMessagesController)(socket));
}));
server.listen(port, () => {
    console.log('Sockets listening on port: ' + port);
});
app.get('/limits', limitsController_1.getLimitsController);
const child = (0, child_process_1.fork)((0, path_1.join)(__dirname, '/src/process/downloadMetaverseProcess'), ['node --max-old-space-size=8192 build/index.js']);
const processMessages = {
    [process_1.ProcessMessages.newMetaverseChunk]({ chunk, metaverse }) {
        (0, cacheService_1.setLands)(chunk, metaverse);
    },
    [process_1.ProcessMessages.getCacheKey]({ tokenId, metaverse }) {
        const cacheValue = (0, cacheService_1.getLand)(tokenId, metaverse);
        sendChildMessage(process_1.ProcessMessages.sendCacheKey, cacheValue);
    },
    [process_1.ProcessMessages.setCacheKey]({ land, metaverse }) {
        (0, cacheService_1.setLand)(land, metaverse);
    },
    [process_1.ProcessMessages.setMetaverseCalcs](metaverse) {
        (0, limitsController_1.setMetaverseCalcs)(metaverse);
    }
};
const sendChildMessage = (message, data) => {
    child.send({ message, data });
};
const downloadStart = () => {
    sendChildMessage(process_1.ProcessMessages.downloadStart);
};
child.on('message', ({ message, data }) => __awaiter(void 0, void 0, void 0, function* () {
    /* pidusage(child.pid, function (err:any, stats:any) {
        console.log(message,err,stats, new Date().toISOString());
        
        }); */
    const messageHandler = processMessages[message];
    if (!messageHandler)
        return;
    yield messageHandler(data);
}));
child.on('error', (err) => {
    console.log(err, child.exitCode);
    child.disconnect();
});
child.on('exit', (err) => {
    console.log(err, child.exitCode);
    child.disconnect();
});
downloadStart();
setInterval(downloadStart, 600000);
