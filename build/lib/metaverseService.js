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
exports.cache = exports.getMetaverse = exports.updateMetaverses = exports.getMetaverses = exports.requestMetaverseLands = void 0;
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
    let tokenIds;
    try {
        console.time('Decentraland request');
        response = yield axios_1.default.get(`${(0, metaverseUtils_1.metaverseUrl)(metaverse)}/${metaverse === 'axie-infinity' ? 'requestMap' : 'map'}?from=${i}&size=${metaverseUtils_1.heatmapMvLandsPerRequest[metaverse].lands}&reduced=true`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });
        console.timeEnd('Decentraland request');
        response = response.data;
        tokenIds = Object.keys(response);
        if (tokenIds.length < 1)
            return;
        console.log('Response', Object.keys(response).length, new Date(), i, metaverseUtils_1.heatmapMvLandsPerRequest[metaverse].lands);
    }
    catch (_a) {
        console.log(`${(0, metaverseUtils_1.metaverseUrl)(metaverse)}/${metaverse === 'axie-infinity' ? 'requestMap' : 'map'}?from=${i}&size=${metaverseUtils_1.heatmapMvLandsPerRequest[metaverse].lands}&reduced=true`, 'Empty array');
        response = {};
    }
    let ores, cnt = 0, metaverseAddress = (0, metaverseUtils_1.getMetaverseAddress)(metaverse);
    if (metaverseAddress !== 'None') {
        do {
            try {
                ores = yield (0, axios_1.default)({
                    method: 'post',
                    url: process.env.OPENSEA_SERVICE_URL + '/service/getTokens',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: JSON.stringify({
                        collection: metaverseAddress,
                        tokenIds,
                    }),
                });
                ores = yield ores.data;
                for (let value of ores.results) {
                    let pred_price = response[value.token_id].predicted_price;
                    if (value.current_price) {
                        response[value.token_id].current_price_eth =
                            value.current_price
                                ? value.current_price.eth_price
                                : undefined;
                        response[value.token_id].percent = value.current_price
                            ? 100 *
                                (value.current_price.eth_price / pred_price - 1)
                            : undefined;
                    }
                    response[value.token_id].best_offered_price_eth =
                        value.best_offered_price
                            ? value.best_offered_price.eth_price
                            : undefined;
                }
            }
            catch (error) {
                ores = undefined;
                cnt = cnt + 1;
                console.log('Error trying again...', error);
            }
        } while (ores == undefined && cnt < 10);
    }
    console.time('Cache push');
    _cache.mset(Object.keys(response).map((key) => {
        return { key: metaverse + key, val: response[key] };
    }));
    console.timeEnd('Cache push');
    if (metaverses[metaverse])
        metaverses[metaverse] = metaverses[metaverse].concat(Object.keys(response).map((key) => metaverse + key));
    else
        metaverses[metaverse] = Object.keys(response).map((key) => metaverse + key);
    console.log(_cache.getStats());
    return {};
});
function iterateAllAsync(fn, i) {
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
const arrayFromAsync = (asyncIterable) => { var asyncIterable_1, asyncIterable_1_1; return __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    let results = {};
    try {
        for (asyncIterable_1 = __asyncValues(asyncIterable); asyncIterable_1_1 = yield asyncIterable_1.next(), !asyncIterable_1_1.done;) {
            let res = asyncIterable_1_1.value;
            for (const [index, value] of Object.entries(res)) {
                results[index] = value;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return)) yield _a.call(asyncIterable_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return results;
}); };
const requestMetaverseLands = (metaverse) => {
    chunkSize = metaverseUtils_1.heatmapMvLandsPerRequest[metaverse].lands;
    metaverses[metaverse] = undefined;
    return arrayFromAsync(iterateAllAsync((i) => requestMetaverseMap(i, metaverse), chunkSize));
};
exports.requestMetaverseLands = requestMetaverseLands;
const getMetaverses = () => metaverses;
exports.getMetaverses = getMetaverses;
const updateMetaverses = () => __awaiter(void 0, void 0, void 0, function* () {
    for (let metaverse of Object.keys(metaverse_1.metaverseObject)) {
        yield (0, exports.requestMetaverseLands)(metaverse);
    }
});
exports.updateMetaverses = updateMetaverses;
const getMetaverse = (metaverse) => {
    return metaverses[metaverse];
};
exports.getMetaverse = getMetaverse;
exports.cache = _cache;
