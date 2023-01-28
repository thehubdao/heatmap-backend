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
exports.updateMetaverses = exports.getListings = exports.getMetaverses = exports.requestMetaverseLands = void 0;
const axios_1 = __importDefault(require("axios"));
const limitsController_1 = require("../controller/limitsController");
const metaverse_1 = require("../../types/metaverse");
const metaverseUtils_1 = require("../../lib/utils/metaverseUtils");
const process_1 = require("../../types/process");
let chunkSize = 0;
let metaversesGeneralData = {};
let metaverses = {
    decentraland: [],
    'somnium-space': [],
    sandbox: [],
    'axie-infinity': [],
};
const requestMetaverseMap = (i, metaverse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const landsChunkLimit = metaverseUtils_1.heatmapMvLandsPerRequest[metaverse].lands;
        const requestLandsUrl = `${(0, metaverseUtils_1.metaverseUrl)(metaverse)}?from=${i}&size=${landsChunkLimit}&reduced=true`;
        const requestLandChunk = yield axios_1.default.get(requestLandsUrl, {
            headers: {
                Accept: 'application/json',
            },
        });
        const landChunk = requestLandChunk.data;
        const landChunkKeys = Object.keys(landChunk);
        if (landChunkKeys.length < 1)
            return;
        const landsFormatted = landChunkKeys.map((key) => {
            key += metaverse; //Each key has metaverse name concat
            const keyArray = metaverses[metaverse];
            keyArray.push(key);
            landChunk[key].tokenId = key;
            return { key, val: landChunk[key] };
        });
        sendParentMessage(process_1.ProcessMessages.newMetaverseChunk, landsFormatted);
        console.log('Response', landChunkKeys.length, new Date(), i, landsChunkLimit);
    }
    catch (error) {
        console.log(error);
    }
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
    return arrayFromAsync(iterateAllAsync((i) => requestMetaverseMap(i, metaverse), 0));
};
exports.requestMetaverseLands = requestMetaverseLands;
const getMetaverses = () => metaverses;
exports.getMetaverses = getMetaverses;
const getListings = (metaverse) => __awaiter(void 0, void 0, void 0, function* () {
    const landsChunkLimit = metaverseUtils_1.heatmapMvLandsPerRequest[metaverse].lands;
    const listingUrl = process.env.OPENSEA_SERVICE_URL +
        `/opensea/collections/${metaverse}/listings`;
    let listings = [];
    for (let i = 0;; i += landsChunkLimit) {
        const listingRequestUrl = `${listingUrl}?from=${i}&size=${landsChunkLimit}`;
        const listingsRequest = yield axios_1.default.get(listingRequestUrl, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const listingsChunk = listingsRequest.data.result;
        if (listingsChunk.length == 0)
            return listings;
        listings = listings.concat(listingsChunk);
    }
});
exports.getListings = getListings;
const updateMetaverses = () => __awaiter(void 0, void 0, void 0, function* () {
    const metaverses = Object.keys(metaverse_1.metaverseObject);
    for (const metaverse of metaverses) {
        try {
            yield (0, exports.requestMetaverseLands)(metaverse);
            const listings = yield (0, exports.getListings)(metaverse);
            for (let value of listings) {
                let key = metaverse + value.tokenId;
                sendParentMessage(process_1.ProcessMessages.getLand, key);
                const getLandPromise = new Promise((resolve) => {
                    process.once('message', ({ message, data }) => {
                        if (message == process_1.ProcessMessages.sendLand)
                            resolve(data);
                    });
                });
                const land = yield getLandPromise;
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
                sendParentMessage(process_1.ProcessMessages.setLand, { key, land });
            }
            const metaverseGeneralData = (0, limitsController_1.getMetaverseCalcs)(metaverse);
            console.log(`${metaverse}-generalData`, metaverseGeneralData);
            metaversesGeneralData[`${metaverse}-generalData`] =
                metaverseGeneralData;
        }
        catch (err) {
            console.log(err);
        }
    }
});
exports.updateMetaverses = updateMetaverses;
const processMessages = {
    [process_1.ProcessMessages.downloadStart]() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, exports.updateMetaverses)();
        });
    },
};
process.on('message', ({ message }) => __awaiter(void 0, void 0, void 0, function* () {
    const messageHandler = processMessages[message];
    if (!messageHandler)
        return;
    yield messageHandler();
}));
const sendParentMessage = (message, data) => {
    const { send } = process;
    send({ message, data });
};
