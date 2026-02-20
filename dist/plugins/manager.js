"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlugins = getPlugins;
const solidityAstPlugin_1 = require("./solidityAstPlugin");
function getPlugins() {
    return [solidityAstPlugin_1.solidityAstPlugin];
}
