"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportJson = reportJson;
const fs_1 = __importDefault(require("fs"));
const ensureDir_1 = require("../utils/ensureDir");
const summary_1 = require("./summary");
function reportJson(findings, outputPath) {
    const summary = (0, summary_1.summarizeFindings)(findings);
    const output = JSON.stringify({ timestamp: new Date().toISOString(), summary, findings }, null, 2);
    if (outputPath) {
        (0, ensureDir_1.ensureDir)(outputPath);
        fs_1.default.writeFileSync(outputPath, output);
        console.log(`\n✅ JSON report saved to ${outputPath}`);
    }
    else {
        console.log(output);
    }
}
