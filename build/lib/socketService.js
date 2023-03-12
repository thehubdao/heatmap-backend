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
    yield renderLands(socket, metaverseLands, landIndex, metaverse);
});
exports.renderStart = renderStart;
const formatLand = (land, metaverse) => {
    const { eth_predicted_price, floor_adjusted_predicted_price, tokenId, current_price_eth } = land;
    const { x, y } = land.coords ? land.coords : land.center;
    let formattedLand = `${x};${y};${eth_predicted_price};${floor_adjusted_predicted_price}`;
    formattedLand += current_price_eth ? `;${current_price_eth}` : `;`;
    formattedLand += `;${tokenId}`;
    if (metaverse == 'somnium-space') {
        const { geometry } = land;
        formattedLand += `;`;
        geometry.forEach(({ x, y }, i) => {
            formattedLand += `${x}:${y}`;
            if (i < geometry.length - 1)
                formattedLand += `/`;
        });
    }
    if (metaverse != 'decentraland')
        return formattedLand;
    const { type, top, left, topLeft } = land.tile;
    formattedLand += type ? `;${type}` : ';';
    formattedLand += top ? `;${top}` : ';';
    formattedLand += left ? `;${left}` : ';';
    formattedLand += topLeft ? `;${topLeft}` : ';';
    return formattedLand;
};
const renderLands = (socket, lands, landCurrentIndex, metaverse) => __awaiter(void 0, void 0, void 0, function* () {
    for (let landIndex = landCurrentIndex; landIndex < lands.length; landIndex++) {
        const land = lands[landIndex];
        const formattedLand = formatLand(land, metaverse);
        socket.send(`${socket_1.socketSenderMessages.newLandData}|${formattedLand},${landIndex}`);
    }
    socket.send(socket_1.socketSenderMessages.renderFinish);
});
const pingPong = (socket) => {
    /*     const pingInterval = 5000,
            pongInterval = 10000
        socket.pingInterval = setInterval(() => {
            socket.emit(socketSenderMessages.ping)
        }, pingInterval)
        const setPongInterval = (socket: any) => {
            clearInterval(socket.pongInterval)
            socket.pongInterval = setInterval(() => {
                console.log('Disconnect')
                socket.disconnect(true)
                clearInterval(socket.pingInterval)
                clearInterval(socket.pongInterval)
            }, pongInterval)
        }
        socket.on(socketReceiverMessages.pong, () => {
            setPongInterval(socket)
        })
        setPongInterval(socket) */
};
exports.pingPong = pingPong;
const clientConnect = (socket) => {
    (0, exports.pingPong)(socket);
    console.log('CONNECTION', new Date().toISOString());
};
exports.clientConnect = clientConnect;
const clientDisconnect = (disconnectReason, socket) => {
    console.log(disconnectReason);
};
exports.clientDisconnect = clientDisconnect;
