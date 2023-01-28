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
exports.downloadStart = void 0;
const cacheService_1 = require("../../lib/cacheService");
const process_1 = require("../../types/process");
require("./downloadMetaverseProcess");
const { fork } = require('child_process');
const child = fork('./downloadMetaverseProcess.js');
const processMessages = {
    [process_1.ProcessMessages.newMetaverseChunk](chunk) {
        (0, cacheService_1.setBulkKeys)(chunk);
    },
    [process_1.ProcessMessages.getLand](key) {
        const land = (0, cacheService_1.getKey)(key);
        sendChildMessage(process_1.ProcessMessages.sendLand, land);
    },
    [process_1.ProcessMessages.setLand]({ key, land }) {
        (0, cacheService_1.setKey)(key, land);
    },
};
const sendChildMessage = (message, data) => {
    const { send } = child;
    send({ message, data });
};
const downloadStart = () => {
    sendChildMessage(process_1.ProcessMessages.downloadStart);
};
exports.downloadStart = downloadStart;
process.on('message', ({ message, data }) => __awaiter(void 0, void 0, void 0, function* () {
    const messageHandler = processMessages[message];
    if (!messageHandler)
        return;
    yield messageHandler(data);
}));
/* export const downloadStart = () => {} */ 
