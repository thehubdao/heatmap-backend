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
const metaverseService_1 = require("./utils/metaverseService");
const renderStart = (socket, metaverse) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('render-start', metaverse);
    const metaverseKeys = (0, metaverseService_1.getMetaverseKeys)(metaverse);
    yield renderLands(socket, metaverse, metaverseKeys);
});
exports.renderStart = renderStart;
const renderContinue = (socket, metaverse, keyIndex) => __awaiter(void 0, void 0, void 0, function* () {
    const metaverseKeys = (0, metaverseService_1.getMetaverseKeys)(metaverse);
    const metaverseLeftKeys = metaverseKeys.slice(keyIndex, metaverseKeys.length);
    yield renderLands(socket, metaverse, metaverseLeftKeys);
});
exports.renderContinue = renderContinue;
const renderLands = (socket, metaverse, landKeys) => __awaiter(void 0, void 0, void 0, function* () {
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
const rendernewLandBulkData = (socket, metaverse, landKeys) => __awaiter(void 0, void 0, void 0, function* () {
    const landKeysLimit = 10;
    const startLandKeysIndex = 0;
    const limitedLandKeys = landKeys.slice(startLandKeysIndex, landKeysLimit);
    const formattedLandKeys = limitedLandKeys.map((landKey) => metaverse + landKey);
    const lands = yield (0, cacheService_1.getBulkKeys)(formattedLandKeys);
    socket.emit(socket_1.socketSenderMessages.newBulkData, lands);
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
