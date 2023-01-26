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
exports.getLimitsController = exports.getMetaverseCalcs = exports.getGeneralData = exports.getPercentage = exports.getLimits = exports.getMax = void 0;
const typedKeys_1 = require("../utilities/typedKeys");
const metaverseService_1 = require("../../lib/metaverseService");
const getMax = (array) => {
    let max = 0;
    array.forEach((number) => {
        number && number > max && (max = number);
    });
    return max;
};
exports.getMax = getMax;
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
const getLimits = (array) => {
    let arr = [];
    for (let value of array)
        if (value)
            arr.push(value);
    arr.sort(function (a, b) {
        return a - b;
    });
    let values = [], minimum = Number.MAX_VALUE, maximum = 0;
    for (let i = 30; i < arr.length - 30; i++) {
        values.push(arr[i]);
        maximum = arr[i] > maximum ? arr[i] : maximum;
        minimum = arr[i] < minimum ? arr[i] : minimum;
    }
    let mid = Math.floor(values.length - 1);
    let median = values.length % 2 == 0
        ? (values[mid] + values[mid - 1]) / 2.0
        : values[mid];
    let distance = Math.min(Math.abs(minimum - median), Math.abs(maximum - median));
    return { minimum: minimum, maximum: median + distance };
};
exports.getLimits = getLimits;
const getPercentage = (partialValue, totalValue, limits) => {
    if (!partialValue || !totalValue || !limits)
        return 0;
    let percentage = Math.ceil(((partialValue - limits.minimum) * 100) /
        (limits.maximum - limits.minimum));
    return percentage > 0 ? (percentage < 100 ? percentage : 100) : 0;
};
exports.getPercentage = getPercentage;
const getGeneralData = (valuationAtlas) => {
    const getLandDependingOnGivenNumberOfDays = (valuation, givenDays) => {
        var _a;
        let counter = 0;
        let now = new Date();
        let deathLine = now.setDate(now.getDate() - givenDays);
        (_a = valuationAtlas[valuation].history) === null || _a === void 0 ? void 0 : _a.map((dataHistory) => {
            let historyTime = new Date(dataHistory.timestamp).getTime();
            if (historyTime > deathLine)
                counter = counter + 1;
        });
        return counter;
    };
    /**
    * Some Lands are listed for way too high prices.
    * To keep the price_difference filter consistent, we will consider
    that have a price difference of less than the number below
    */
    const MAX_DIFF = 400;
    // GENERATE MAX
    const elementOptions = {
        transfers: {
            predictions: (0, typedKeys_1.typedKeys)(valuationAtlas).map((valuation) => { var _a; return (_a = valuationAtlas[valuation].history) === null || _a === void 0 ? void 0 : _a.length; }),
        },
        price_difference: {
            predictions: (0, typedKeys_1.typedKeys)(valuationAtlas).map((valuation) => {
                if (typeof valuationAtlas[valuation].current_price_eth ===
                    'undefined')
                    return;
                const diff = (valuationAtlas[valuation].current_price_eth / valuationAtlas[valuation].eth_predicted_price) - 1;
                return diff;
            }),
        },
        listed_lands: {
            predictions: (0, typedKeys_1.typedKeys)(valuationAtlas).map((valuation) => valuationAtlas[valuation].eth_predicted_price),
        },
        basic: { predictions: [] },
        eth_predicted_price: { predictions: (0, typedKeys_1.typedKeys)(valuationAtlas).map((valuation) => valuationAtlas[valuation]["eth_predicted_price"]) },
        floor_adjusted_predicted_price: {
            predictions: (0, typedKeys_1.typedKeys)(valuationAtlas).map((valuation) => { var _a; return (_a = valuationAtlas[valuation]) === null || _a === void 0 ? void 0 : _a.floor_adjusted_predicted_price; }),
        },
        last_month_sells: {
            predictions: (0, typedKeys_1.typedKeys)(valuationAtlas).map((valuation) => {
                if (getLandDependingOnGivenNumberOfDays(valuation, 30) > 0) {
                    return CalculateMaxPriceOnHistoryDependGivenDays(valuationAtlas[valuation], 30);
                }
                return 0;
            }),
        },
    };
    Object.keys(elementOptions).forEach((key) => {
        let predictions = elementOptions[key].predictions;
        elementOptions[key] = {
            max: (0, exports.getMax)(predictions),
            limits: (0, exports.getLimits)(predictions),
        };
    });
    return elementOptions;
};
exports.getGeneralData = getGeneralData;
const getMetaverseCalcs = (metaverse) => {
    const metaverseKeys = Object.values((0, metaverseService_1.getMetaverse)(metaverse));
    const lands = metaverseService_1.cache.mget(metaverseKeys);
    return (0, exports.getGeneralData)(lands);
};
exports.getMetaverseCalcs = getMetaverseCalcs;
const getLimitsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { metaverse } = req.query;
    return res.send(metaverseService_1.cache.get(`${metaverse}-generalData`));
});
exports.getLimitsController = getLimitsController;
