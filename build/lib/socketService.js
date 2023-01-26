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
exports.clientDisconnect = exports.clientConnect = exports.pingPong = exports.rendernewLandBulkData = exports.giveLand = exports.renderContinue = exports.renderStart = void 0;
const metaverseService_1 = require("./metaverseService");
const socket_1 = require("../types/socket");
const renderStart = (socket, metaverse) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('render-start');
    const metaverseKeys = (0, metaverseService_1.getMetaverse)(metaverse);
    yield renderLands(socket, metaverse, metaverseKeys);
});
exports.renderStart = renderStart;
const renderContinue = (socket, metaverse, keyIndex) => __awaiter(void 0, void 0, void 0, function* () {
    const metaverseKeys = (0, metaverseService_1.getMetaverse)(metaverse);
    const metaverseLeftKeys = metaverseKeys.slice(keyIndex, metaverseKeys.length);
    yield renderLands(socket, metaverse, metaverseLeftKeys);
});
exports.renderContinue = renderContinue;
const renderLands = (socket, metaverse, landKeys) => __awaiter(void 0, void 0, void 0, function* () {
    for (const key of landKeys) {
        const land = yield metaverseService_1.cache.get(key);
        socket.emit(socket_1.socketSenderMessages.newLandData, land /* keyIndex */);
    }
    socket.emit(socket_1.socketSenderMessages.renderFinish);
});
const giveLand = (socket, metaverse, index) => __awaiter(void 0, void 0, void 0, function* () {
    const land = yield metaverseService_1.cache.get((0, metaverseService_1.getLandKey)(metaverse, index));
    let prevIndex = index - 1;
    let nextIndex = index + 1;
    if (prevIndex < 0)
        prevIndex = null;
    if (nextIndex >= (0, metaverseService_1.metaverseKeyTotalAmount)(metaverse))
        nextIndex = null;
    socket.emit(socket_1.socketSenderMessages.giveLand, land, prevIndex, nextIndex);
});
exports.giveLand = giveLand;
const rendernewLandBulkData = (socket, metaverse, landKeys) => __awaiter(void 0, void 0, void 0, function* () {
    const landKeysLimit = 10;
    const startLandKeysIndex = 0;
    const limitedLandKeys = landKeys.slice(startLandKeysIndex, landKeysLimit);
    const formattedLandKeys = limitedLandKeys.map((landKey) => metaverse + landKey);
    const lands = yield metaverseService_1.cache.mget(formattedLandKeys);
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
            socket.disconnect(true);
            clearInterval(socket.pingInterval);
            clearInterval(socket.pongInterval);
        }, pongInterval);
    };
    setPongInterval(socket);
    socket.on(socket_1.socketReceiverMessages.pong, () => {
        setPongInterval(socket);
    });
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
