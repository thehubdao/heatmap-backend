"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketMessagesController = void 0;
const metaverseService_1 = require("../../lib/metaverseService");
const socketMessagesController = (socket) => {
    return {
        render: (metaverse, checkpoint) => {
            console.log(metaverse);
            (0, metaverseService_1.renderMetaverse)(socket, metaverse, checkpoint);
        },
    };
};
exports.socketMessagesController = socketMessagesController;
