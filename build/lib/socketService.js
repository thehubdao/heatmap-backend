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
exports.clientDisconnect = exports.clientConnect = exports.pingPong = exports.rendernewLandBulkData = exports.renderContinue = exports.renderStart = void 0;
const socket_1 = require("../types/socket");
const cacheService_1 = require("./cacheService");
const firebaseService_1 = require("./firebaseService");
const metaverseService_1 = require("./utils/metaverseService");
const renderStart = (socket, metaverse) => __awaiter(void 0, void 0, void 0, function* () {
    const metaverseKeys = (0, metaverseService_1.getMetaverseKeys)(metaverse);
    console.log('render-start', metaverse);
    (0, firebaseService_1.updateStats)(metaverse);
    yield renderLands(socket, metaverseKeys);
});
exports.renderStart = renderStart;
const renderContinue = (socket, metaverse, keyIndex) => __awaiter(void 0, void 0, void 0, function* () {
    const metaverseKeys = (0, metaverseService_1.getMetaverseKeys)(metaverse);
    console.log('render-continue', metaverse);
    const metaverseLeftKeys = metaverseKeys.slice(keyIndex, metaverseKeys.length);
    yield renderLands(socket, metaverseLeftKeys);
});
exports.renderContinue = renderContinue;
const renderLands = (socket, landKeys) => __awaiter(void 0, void 0, void 0, function* () {
    for (const keyIndex in landKeys) {
        const land = yield (0, cacheService_1.getKey)(landKeys[keyIndex]);
        socket.emit(socket_1.socketSenderMessages.newLandData, land, keyIndex);
    }
    socket.emit(socket_1.socketSenderMessages.renderFinish);
});
/* export const giveLand = async (
    socket: Socket,
    metaverse: Metaverse,
    index: number
) => {
    const land = await getKey(getLandKey(metaverse, index))
    let prevIndex: number | null = index - 1
    let nextIndex: number | null = index + 1
    if (prevIndex < 0) prevIndex = null
    if (nextIndex >= metaverseKeyTotalAmount(metaverse)) nextIndex = null

    socket.emit(socketSenderMessages.giveLand, land, prevIndex, nextIndex)
} */
const rendernewLandBulkData = (socket, metaverse) => __awaiter(void 0, void 0, void 0, function* () {
    const keyLimit = 100;
    const landKeys = (0, metaverseService_1.getMetaverseKeys)(metaverse);
    let startLandKeysIndex = 0;
    while (true) {
        const limitedLandKeys = landKeys.slice(startLandKeysIndex, startLandKeysIndex + keyLimit);
        const lands = yield (0, cacheService_1.getBulkKeys)(limitedLandKeys);
        socket.emit(socket_1.socketSenderMessages.newBulkData, lands);
        if (startLandKeysIndex >= landKeys.length)
            return socket.emit(socket_1.socketSenderMessages.renderFinish);
        startLandKeysIndex += keyLimit;
    }
});
exports.rendernewLandBulkData = rendernewLandBulkData;
const pingPong = (socket) => {
    const pingInterval = 5000, pongInterval = 10000;
    socket.pingInterval = setInterval(() => {
        socket.emit(socket_1.socketSenderMessages.ping);
    }, pingInterval);
    const setPongInterval = (socket) => {
        clearInterval(socket.pongInterval);
        socket.pongInterval = setInterval(() => {
            console.log('Disconnect');
            socket.disconnect(true);
            clearInterval(socket.pingInterval);
            clearInterval(socket.pongInterval);
        }, pongInterval);
    };
    socket.on(socket_1.socketReceiverMessages.pong, () => {
        setPongInterval(socket);
    });
    setPongInterval(socket);
};
exports.pingPong = pingPong;
const clientConnect = (socket) => {
    (0, exports.pingPong)(socket);
    console.log('CONNECTION', new Date().toISOString());
    console.log('ip: ' + socket.request.connection.remoteAddress);
    console.log('user-agent: ' + socket.request.headers['user-agent']);
    console.log(socket.id);
};
exports.clientConnect = clientConnect;
const clientDisconnect = (disconnectReason, socket) => {
    console.log(disconnectReason);
    console.log('ip: ' + socket.request.connection.remoteAddress);
    console.log('user-agent: ' + socket.request.headers['user-agent']);
};
exports.clientDisconnect = clientDisconnect;
