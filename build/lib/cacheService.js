"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKey = exports.setBulkKeys = exports.setKey = void 0;
const NodeCache = require('node-cache');
const cache = new NodeCache();
const setKey = (key, value) => {
    cache.set(key, value);
};
exports.setKey = setKey;
const setBulkKeys = (keys) => {
    cache.mset(keys);
};
exports.setBulkKeys = setBulkKeys;
const getKey = (key) => cache.get(key);
exports.getKey = getKey;
