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
exports.resetAtMidnight = exports.timeout = void 0;
const timeout = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
exports.timeout = timeout;
const resetAtMidnight = (process) => __awaiter(void 0, void 0, void 0, function* () {
    var now = new Date();
    var night = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    var msToMidnight = night.getTime() - now.getTime();
    yield process();
    (0, exports.timeout)(120000).then(() => __awaiter(void 0, void 0, void 0, function* () {
        (0, exports.resetAtMidnight)(process);
    }));
});
exports.resetAtMidnight = resetAtMidnight;
