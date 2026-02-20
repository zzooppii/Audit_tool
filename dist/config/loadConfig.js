"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const defaults_1 = require("./defaults");
const VALID_FORMATS = ['markdown', 'json', 'console'];
const VALID_SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'];
function validateConfig(config) {
    if (!Array.isArray(config.paths)) {
        throw new Error('Config error: "paths" must be an array.');
    }
    if (config.report?.format && !VALID_FORMATS.includes(config.report.format)) {
        throw new Error(`Config error: invalid report format "${config.report.format}".`);
    }
    if (config.rules) {
        for (const [ruleId, rule] of Object.entries(config.rules)) {
            if (rule?.severity &&
                !VALID_SEVERITIES.includes(rule.severity)) {
                throw new Error(`Config error: invalid severity "${rule.severity}" for rule "${ruleId}".`);
            }
        }
    }
}
function loadConfig(configPath) {
    const resolvedPath = path_1.default.resolve(configPath);
    let userConfig = {};
    if (fs_1.default.existsSync(resolvedPath)) {
        const file = fs_1.default.readFileSync(resolvedPath, 'utf8');
        userConfig = js_yaml_1.default.load(file) || {};
    }
    else {
        console.warn(`⚠️  Config file not found: ${resolvedPath}. Using defaults.`);
    }
    const merged = {
        ...defaults_1.defaultConfig,
        ...userConfig,
        report: {
            ...defaults_1.defaultConfig.report,
            ...userConfig.report,
        },
        rules: {
            ...defaults_1.defaultConfig.rules,
            ...userConfig.rules,
        },
    };
    validateConfig(merged);
    return merged;
}
