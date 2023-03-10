"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMessage = void 0;
const socketMessagesController_1 = require("../../src/controller/socketMessagesController");
const onMessage = (socket, message, messageRawData) => {
    const messageHandler = (0, socketMessagesController_1.socketMessagesController)(socket)[message];
    if (!messageHandler)
        return;
    const messageData = messageRawData.split(';');
    try {
        messageHandler(messageData);
    }
    catch (err) {
        console.log(err);
    }
};
exports.onMessage = onMessage;
