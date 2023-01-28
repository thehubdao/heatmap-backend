"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetaverseKeys = void 0;
const cacheService_1 = require("../cacheService");
const getMetaverseKeys = (metaverse) => {
    return (0, cacheService_1.getKey)(`${metaverse}-keys`);
};
exports.getMetaverseKeys = getMetaverseKeys;
