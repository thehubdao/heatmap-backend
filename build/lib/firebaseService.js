"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStats = void 0;
const dotenv_1 = require("dotenv");
const admin = __importStar(require("firebase-admin"));
(0, dotenv_1.config)();
var serviceAccount = {
    "type": "service_account",
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": `${(_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/gm, "\n")}`,
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL
};
const firebaseInstance = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const firestore = firebaseInstance.firestore();
const statsCollection = firestore.collection('stats');
const createGlobalStats = (metaverse) => __awaiter(void 0, void 0, void 0, function* () {
    const statsDoc = statsCollection.doc(metaverse);
    const globalStats = {
        current_month_calls: 0,
        average: 0,
        median: 0,
        history: {}
    };
    statsDoc.set(globalStats);
    return statsDoc;
});
const updateStats = (metaverse) => __awaiter(void 0, void 0, void 0, function* () {
    const currentDate = new Date(Date.now());
    const currentMonth = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    const statsDoc = yield getStats(metaverse);
    yield statsDoc.update({ [`history.${currentMonth}.month_calls`]: admin.firestore.FieldValue.increment(1) });
    const statsData = (yield statsDoc.get()).data();
    const monthData = Object.values(statsData.history);
    const monthsCalls = monthData.map((month) => month.month_calls);
    const statsGlobalData = calculateStats(monthsCalls);
    statsGlobalData.current_month_calls = statsData.history[currentMonth].month_calls;
    yield statsDoc.update(statsGlobalData);
});
exports.updateStats = updateStats;
const getStats = (metaverse) => __awaiter(void 0, void 0, void 0, function* () {
    const statsDoc = statsCollection.doc(metaverse);
    const statsData = yield statsDoc.get();
    const stats = statsData.data();
    if (!stats)
        yield createGlobalStats(metaverse);
    return statsDoc;
});
const calculateStats = (values) => {
    values.sort(function (a, b) { return a - b; });
    let avg = 0;
    for (let value of values)
        avg += value / values.length;
    let mid = Math.floor(values.length / 2.0);
    return {
        average: avg,
        median: (values.length % 2 == 0) ? (values[mid] + values[mid - 1]) / 2.0 : values[mid]
    };
};
