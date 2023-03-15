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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const metaverse_1 = require("../../types/metaverse");
const metaverseUtils_1 = require("../../lib/utils/metaverseUtils");
const process_1 = require("../../types/process");
const CalculateMaxPriceOnHistoryDependGivenDays = (landFromAtlas, givenDays) => {
    var _a;
    let maxPrice = 0;
    let now = new Date();
    let deathLine = now.setDate(now.getDate() - givenDays);
    (_a = landFromAtlas.history) === null || _a === void 0 ? void 0 : _a.map((historyPoint) => {
        let historyTime = new Date(historyPoint.timestamp).getTime();
        if (historyTime > deathLine) {
            historyPoint
                ? (maxPrice =
                    historyPoint.eth_price > maxPrice
                        ? historyPoint.eth_price
                        : maxPrice)
                : 0;
        }
    });
    return maxPrice;
};
const requestMetaverseMap = (i, metaverse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const landsChunkLimit = metaverseUtils_1.heatmapMvLandsPerRequest[metaverse].lands;
        const requestLandsUrl = `${(0, metaverseUtils_1.metaverseUrl)(metaverse)}?from=${i}&size=${landsChunkLimit}&reduced=true`;
        let requestLandChunk;
        try {
            requestLandChunk = yield axios_1.default.get(requestLandsUrl, {
                headers: {
                    Accept: 'application/json',
                },
            });
        }
        catch (err) {
            console.log(err);
            console.log('Retrying');
            requestLandChunk = yield axios_1.default.get(requestLandsUrl, {
                headers: {
                    Accept: 'application/json',
                },
            });
        }
        const landChunk = requestLandChunk.data;
        const landChunkKeys = Object.keys(requestLandChunk.data);
        if (landChunkKeys.length < 1) {
            console.log('Metaverse finish');
            return false;
        }
        const landsFormatted = landChunkKeys.map((key) => {
            const land = landChunk[key];
            const max_history_price = CalculateMaxPriceOnHistoryDependGivenDays(land, 30);
            const history_amount = land.history.length;
            land.history_amount = history_amount ? history_amount : '';
            land.max_history_price = max_history_price ? max_history_price : '';
            return land;
        });
        sendParentMessage(process_1.ProcessMessages.newMetaverseChunk, { metaverse, chunk: landsFormatted });
        console.log(
        /*             new Date(), */
        'RESPONSE', `metaverse: ${metaverse};`, `land_amount: ${landChunkKeys.length};`, `metaverse_chunk_limit: ${landsChunkLimit};`, `from: ${i};`, `to: ${i + landsChunkLimit};`);
    }
    catch (error) {
        console.log(error);
    }
    return true;
});
const requestMetaverseLands = (metaverse) => __awaiter(void 0, void 0, void 0, function* () {
    const chunkSize = metaverseUtils_1.heatmapMvLandsPerRequest[metaverse].lands;
    let chunkIndex = 0;
    let areLandsLeft = true;
    while (areLandsLeft) {
        areLandsLeft = yield requestMetaverseMap(chunkIndex, metaverse);
        chunkIndex += chunkSize;
    }
});
const getListings = (metaverse) => __awaiter(void 0, void 0, void 0, function* () {
    const landsChunkLimit = metaverseUtils_1.heatmapMvLandsPerRequest[metaverse].lands;
    const listingUrl = process.env.OPENSEA_SERVICE_URL +
        `/opensea/collections/${metaverse}/listings`;
    let listings = [];
    try {
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
    }
    catch (err) {
        console.log(err);
        return [];
    }
});
const setListings = (metaverse) => __awaiter(void 0, void 0, void 0, function* () {
    const listings = yield getListings(metaverse);
    /* console.log(listings) */
    for (const listing of listings) {
        try {
            let { tokenId } = listing;
            sendParentMessage(process_1.ProcessMessages.getCacheKey, { tokenId, metaverse });
            const getLandPromise = new Promise((resolve) => {
                process.once('message', ({ message, data }) => {
                    if (message == process_1.ProcessMessages.sendCacheKey)
                        resolve(data);
                });
            });
            const land = yield getLandPromise;
            const { currentPrice } = listing;
            if (currentPrice)
                land.current_price_eth = currentPrice.eth_price;
            sendParentMessage(process_1.ProcessMessages.setCacheKey, {
                metaverse,
                land,
            });
        }
        catch (error) {
            console.log(error);
        }
    }
});
const updateMetaverses = () => __awaiter(void 0, void 0, void 0, function* () {
    const metaverses = Object.keys(metaverse_1.metaverseObject);
    for (const metaverse of metaverses) {
        try {
            yield requestMetaverseLands(metaverse);
            yield setListings(metaverse);
            sendParentMessage(process_1.ProcessMessages.setMetaverseCalcs, metaverse);
        }
        catch (err) {
            console.log(err);
        }
    }
});
const processMessages = {
    [process_1.ProcessMessages.downloadStart]() {
        return __awaiter(this, void 0, void 0, function* () {
            yield updateMetaverses();
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
    const moldableProcess = process;
    if (!moldableProcess)
        return;
    moldableProcess.send({ message, data });
};
