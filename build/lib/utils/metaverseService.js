"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetaverseKeys = exports.setBulkMetaverseKeys = void 0;
const metaverses = {
    decentraland: {},
    'somnium-space': {},
    sandbox: {},
    /*     'axie-infinity': {}, */
};
const setBulkMetaverseKeys = (metaverse, keys) => {
    keys.forEach((key) => {
        metaverses[metaverse][key] = key;
    });
};
exports.setBulkMetaverseKeys = setBulkMetaverseKeys;
const getMetaverseKeys = (metaverse) => {
    return Object.keys(metaverses[metaverse]);
};
exports.getMetaverseKeys = getMetaverseKeys;
