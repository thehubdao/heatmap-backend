"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketMessagesController = void 0;
const metaverseService_1 = require("../../lib/metaverseService");
exports.socketMessagesController = (socket) => {
    return {
        render: (metaverse) => {
            console.log(metaverse);
            metaverseService_1.renderMetaverse(socket, metaverse);
        },
    };
};
