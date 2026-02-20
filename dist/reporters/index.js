"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportFindings = reportFindings;
const console_1 = require("./console");
const json_1 = require("./json");
const markdown_1 = require("./markdown");
async function reportFindings(findings, options) {
    const { format, outputPath } = options;
    switch (format) {
        case 'json':
            (0, json_1.reportJson)(findings, outputPath);
            break;
        case 'markdown':
            (0, markdown_1.reportMarkdown)(findings, outputPath);
            break;
        case 'console':
        default:
            (0, console_1.reportConsole)(findings);
            break;
    }
}
