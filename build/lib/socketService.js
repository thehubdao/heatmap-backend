"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMetaverseChunk = void 0;
exports.renderMetaverseChunk = (socket, lands) => {
    if (lands) {
        let metaverseValues = Object.values(lands);
        metaverseValues.forEach((land) => {
            socket.emit('render', land);
        });
    }
};
