"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetaverse = exports.getLand = exports.setLands = exports.setLand = void 0;
const metaverses = {
    "somnium-space": {},
    decentraland: {},
    sandbox: {}
};
const setLand = (land, metaverse) => {
    metaverses[metaverse][land.tokenId] = land;
};
exports.setLand = setLand;
const setLands = (lands, metaverse) => {
    for (const land of lands) {
        (0, exports.setLand)(land, metaverse);
    }
};
exports.setLands = setLands;
const getLand = (tokenId, metaverse) => {
    return metaverses[metaverse][tokenId];
};
exports.getLand = getLand;
const getMetaverse = (metaverse) => {
    return metaverses[metaverse];
};
exports.getMetaverse = getMetaverse;
