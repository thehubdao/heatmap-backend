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
exports.renderMetaverse = void 0;
const metaverseService_1 = require("./metaverseService");
const renderMetaverse = (socket, metaverse) => __awaiter(void 0, void 0, void 0, function* () {
    const metaverseKeys = Object.values((0, metaverseService_1.getMetaverse)(metaverse));
    const lands = yield metaverseService_1.cache.mget(metaverseKeys);
    console.log(metaverseKeys.length, Object.values(lands).length);
    for (const land of Object.values(lands)) {
        socket.emit('render', land);
    }
});
exports.renderMetaverse = renderMetaverse;
