"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMetaverseChunk = void 0;
const renderMetaverseChunk = (socket, lands, i) => {
    if (lands) {
        let metaverseValues = Object.values(lands);
        metaverseValues.forEach((land) => {
            socket.emit('render', land, i);
        });
    }
};
exports.renderMetaverseChunk = renderMetaverseChunk;
