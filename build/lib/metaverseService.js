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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = exports.metaverseKeyTotalAmount = exports.getLandKey = exports.getMetaverse = exports.updateMetaverses = exports.getListings = exports.getMetaverses = exports.requestMetaverseLands = void 0;
const axios_1 = __importDefault(require("axios"));
const NodeCache = require('node-cache');
const _cache = new NodeCache();
const metaverse_1 = require("../types/metaverse");
const metaverseUtils_1 = require("./utils/metaverseUtils");
let chunkSize = 0;
let metaverses = {
    decentraland: undefined,
    'somnium-space': undefined,
    sandbox: undefined,
    'axie-infinity': undefined,
};
const requestMetaverseMap = (i, metaverse) => __awaiter(void 0, void 0, void 0, function* () {
    let response;
    try {
        response = yield axios_1.default.get(`${(0, metaverseUtils_1.metaverseUrl)(metaverse)}/${metaverse === 'axie-infinity' ? 'requestMap' : 'map'}?from=${i}&size=${metaverseUtils_1.heatmapMvLandsPerRequest[metaverse].lands}&reduced=true`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });
        response = response.data;
        if (Object.keys(response).length < 1)
            return;
        Object.keys(response).forEach((key) => {
            response[key].tokenId = key;
        });
        console.log('Response', Object.keys(response).length, new Date(), i, metaverseUtils_1.heatmapMvLandsPerRequest[metaverse].lands);
    }
    catch (_a) {
        response = {};
    }
    _cache.mset(Object.keys(response).map((key) => {
        return { key: metaverse + key, val: response[key] };
    }));
    if (metaverses[metaverse])
        metaverses[metaverse] = metaverses[metaverse].concat(Object.keys(response).map((key) => metaverse + key));
    else
        metaverses[metaverse] = Object.keys(response).map((key) => metaverse + key);
    console.log(/* metaverses[metaverse], */ _cache.getStats());
    return {};
});
function iterateAllAsync(fn, i = 0) {
    return __asyncGenerator(this, arguments, function* iterateAllAsync_1() {
        while (true) {
            let res = yield __await(fn(i));
            if (!res)
                return yield __await(void 0);
            yield yield __await(res);
            i += chunkSize;
        }
    });
}
const arrayFromAsync = (asyncIterable) => { var _a, asyncIterable_1, asyncIterable_1_1; return __awaiter(void 0, void 0, void 0, function* () {
    var _b, e_1, _c, _d;
    let results = {};
    try {
        for (_a = true, asyncIterable_1 = __asyncValues(asyncIterable); asyncIterable_1_1 = yield asyncIterable_1.next(), _b = asyncIterable_1_1.done, !_b;) {
            _d = asyncIterable_1_1.value;
            _a = false;
            try {
                let res = _d;
                for (const [index, value] of Object.entries(res)) {
                    results[index] = value;
                }
            }
            finally {
                _a = true;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_a && !_b && (_c = asyncIterable_1.return)) yield _c.call(asyncIterable_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return results;
}); };
const requestMetaverseLands = (metaverse) => {
    chunkSize = metaverseUtils_1.heatmapMvLandsPerRequest[metaverse].lands;
    metaverses[metaverse] = undefined;
    return arrayFromAsync(iterateAllAsync((i) => requestMetaverseMap(i, metaverse), 0));
};
exports.requestMetaverseLands = requestMetaverseLands;
const getMetaverses = () => metaverses;
exports.getMetaverses = getMetaverses;
const getListings = (metaverse) => __awaiter(void 0, void 0, void 0, function* () {
    let listings = [];
    for (let i = 0;; i += metaverseUtils_1.heatmapMvLandsPerRequest[metaverse].lands) {
        let listingsChunk = yield (yield (0, axios_1.default)({
            method: 'get',
            url: process.env.OPENSEA_SERVICE_URL +
                `/opensea/collections/${metaverse}/listings?from=${i}&size=${metaverseUtils_1.heatmapMvLandsPerRequest[metaverse].lands}`,
            headers: {
                'Content-Type': 'application/json',
            },
        })).data.result;
        if (listingsChunk.length == 0)
            return listings;
        listings = listings.concat(listingsChunk);
    }
});
exports.getListings = getListings;
const updateMetaverses = () => __awaiter(void 0, void 0, void 0, function* () {
    for (let metaverse of Object.keys(metaverse_1.metaverseObject)) {
        try {
            yield (0, exports.requestMetaverseLands)(metaverse);
            let listings = yield (0, exports.getListings)(metaverse);
            for (let value of listings) {
                let key = metaverse + value.tokenId;
                let land = _cache.get(key);
                let pred_price = land === null || land === void 0 ? void 0 : land.eth_predicted_price;
                if (value.currentPrice) {
                    land.current_price_eth = value.currentPrice
                        ? value.currentPrice.eth_price
                        : undefined;
                    land.percent = value.currentPrice
                        ? 100 * (value.currentPrice.eth_price / pred_price - 1)
                        : undefined;
                }
                land.best_offered_price_eth = value.bestOfferedPrice
                    ? value.bestOfferedPrice.eth_price
                    : undefined;
                _cache.set(key, land);
            }
        }
        catch (err) {
            console.log(err);
        }
    }
});
exports.updateMetaverses = updateMetaverses;
const getMetaverse = (metaverse) => {
    return metaverses[metaverse];
};
exports.getMetaverse = getMetaverse;
const getLandKey = (metaverse, keyIndex) => {
    return metaverses[metaverse][keyIndex];
};
exports.getLandKey = getLandKey;
const metaverseKeyTotalAmount = (metaverse) => metaverses[metaverse].length;
exports.metaverseKeyTotalAmount = metaverseKeyTotalAmount;
exports.cache = _cache;
