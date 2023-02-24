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
exports.clientDisconnect = exports.clientConnect = exports.pingPong = exports.renderStart = void 0;
const socket_1 = require("../types/socket");
const cacheService_1 = require("./cacheService");
const firebaseService_1 = require("./firebaseService");
const renderStart = (socket, metaverse, landIndex = 0) => __awaiter(void 0, void 0, void 0, function* () {
    const metaverseLands = Object.values((0, cacheService_1.getMetaverse)(metaverse));
    console.log('render-start', metaverse, landIndex, metaverseLands.length - landIndex);
    (0, firebaseService_1.updateStats)(metaverse);
    yield renderLands(socket, metaverseLands, landIndex);
});
exports.renderStart = renderStart;
const renderLands = (socket, lands, landCurrentIndex) => __awaiter(void 0, void 0, void 0, function* () {
    for (let landIndex = landCurrentIndex; landIndex < lands.length; landIndex++) {
        socket.emit(socket_1.socketSenderMessages.newLandData, lands[landIndex], landIndex);
    }
    socket.emit(socket_1.socketSenderMessages.renderFinish);
});
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
