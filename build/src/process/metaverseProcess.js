"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const processUtils_1 = require("../../lib/utils/processUtils");
const parentProcess_1 = require("./parentProcess");
(0, processUtils_1.resetAtMidnight)(parentProcess_1.downloadStart);
