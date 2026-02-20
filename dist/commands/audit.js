"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAudit = runAudit;
const path_1 = __importDefault(require("path"));
const fileScanner_1 = require("../scanner/fileScanner");
const classify_1 = require("../scanner/classify");
const analyzers_1 = require("../analyzers");
const reporters_1 = require("../reporters");
const VALID_FORMATS = ['console', 'json', 'markdown'];
const VALID_SEVERITIES = ['info', 'low', 'medium', 'high', 'critical'];
async function runAudit(targetPath, options) {
    const { config, format, output, 'fail-on': failOn } = options;
    const resolvedTarget = path_1.default.resolve(targetPath);
    const scanRoots = (config.paths?.length ? config.paths : ['.']).map((p) => path_1.default.resolve(resolvedTarget, p));
    const reportFormat = format?.toLowerCase() || config.report?.format || 'console';
    if (!VALID_FORMATS.includes(reportFormat)) {
        throw new Error(`Invalid format: ${reportFormat}`);
    }
    if (failOn && !VALID_SEVERITIES.includes(failOn.toLowerCase())) {
        throw new Error(`Invalid fail-on severity: ${failOn}`);
    }
    const files = (0, fileScanner_1.scanFiles)(scanRoots, config.exclude);
    const classified = (0, classify_1.classifyFiles)(files);
    const findings = (0, analyzers_1.generateFindings)(files, config);
    await (0, reporters_1.reportFindings)(findings, {
        format: reportFormat,
        outputPath: output || config.report?.output,
    });
    if (failOn) {
        const threshold = VALID_SEVERITIES.indexOf(failOn.toLowerCase());
        const hasFailingFinding = findings.some((f) => VALID_SEVERITIES.indexOf(f.severity) >= threshold);
        if (hasFailingFinding) {
            console.error(`\n❌ Audit failed: findings with severity >= ${failOn}`);
            process.exit(1);
        }
    }
}
