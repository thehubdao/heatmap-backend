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
Object.defineProperty(exports, "__esModule", { value: true });
const socketUtils_1 = require("./lib/utils/socketUtils");
const limitsController_1 = require("./src/controller/limitsController");
const socketService_1 = require("./lib/socketService");
const socket_1 = require("./types/socket");
const child_process_1 = require("child_process");
const cacheService_1 = require("./lib/cacheService");
const process_1 = require("./types/process");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const ws_1 = require("ws");
(0, dotenv_1.config)();
const PORT = process.env.PORT;
const wss = new ws_1.WebSocketServer({ port: Number(PORT) });
wss.on(socket_1.socketReceiverMessages.socketConnect, function connection(ws) {
    (0, socketService_1.clientConnect)(ws);
    ws.on('error', console.error);
    ws.on('message', (receivedData) => {
        const parsedData = receivedData.toString();
        const [message, messageData] = parsedData.split('|');
        (0, socketUtils_1.onMessage)(ws, message, messageData);
    });
});
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
