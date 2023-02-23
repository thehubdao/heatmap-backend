"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineHandlers = void 0;
const defineHandlers = (socket, handlers) => {
    const handlerKeys = Object.keys(handlers);
    handlerKeys.forEach((key) => {
        socket.on(key, handlers[key]);
    });
};
exports.defineHandlers = defineHandlers;
