"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketReceiverMessages = exports.socketSenderMessages = void 0;
var socketSenderMessages;
(function (socketSenderMessages) {
    socketSenderMessages["newBulkData"] = "new-land-bulk-data";
    socketSenderMessages["newLandData"] = "new-land-data";
    socketSenderMessages["renderFinish"] = "render-finish";
    socketSenderMessages["ping"] = "ping";
    socketSenderMessages["giveLand"] = "give-land";
})(socketSenderMessages = exports.socketSenderMessages || (exports.socketSenderMessages = {}));
var socketReceiverMessages;
(function (socketReceiverMessages) {
    socketReceiverMessages["socketConnect"] = "connection";
    socketReceiverMessages["socketDisconnect"] = "disconnect";
    socketReceiverMessages["renderStart"] = "render-start";
    socketReceiverMessages["renderBulk"] = "render-bulk-start";
    socketReceiverMessages["pong"] = "pong";
    socketReceiverMessages["getLand"] = "get-land";
    socketReceiverMessages["renderContinue"] = "render-continue";
    socketReceiverMessages["renderStop"] = "render-stop";
})(socketReceiverMessages = exports.socketReceiverMessages || (exports.socketReceiverMessages = {}));
