"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.solidityAstPlugin = void 0;
const fs_1 = __importDefault(require("fs"));
const solidityAst_1 = require("../analyzers/solidityAst");
const REGEX_FALLBACK_RULES = [
    {
        id: 'solidity-unchecked-external-call',
        title: 'Possible unchecked external call (call.value)',
        description: 'call.value style external calls are risky without proper handling.',
        recommendation: 'Check return values and handle failures properly.',
        severity: 'high',
        regex: /\.call\.value\s*\(|\.call\s*{\s*value\s*:/g,
    },
];
function isRuleEnabled(rule, config) {
    const override = config?.rules?.[rule.id];
    if (override?.enabled === false) {
        return { enabled: false, severity: rule.severity };
    }
    if (override?.severity) {
        return { enabled: true, severity: override.severity };
    }
    return { enabled: true, severity: rule.severity };
}
function getSnippet(content, line, window = 2) {
    const lines = content.split('\n');
    const start = Math.max(0, line - 1 - window);
    const end = Math.min(lines.length - 1, line - 1 + window);
    const snippetLines = lines
        .slice(start, end + 1)
        .map((text, idx) => `${start + idx + 1}: ${text}`);
    return snippetLines.join('\n');
}
function applyRegexRules(content, file, config) {
    const findings = [];
    for (const rule of REGEX_FALLBACK_RULES) {
        const { enabled, severity } = isRuleEnabled(rule, config);
        if (!enabled)
            continue;
        const matches = content.matchAll(rule.regex);
        for (const match of matches) {
            const index = match.index ?? 0;
            const line = content.slice(0, index).split('\n').length;
            findings.push({
                id: rule.id,
                title: rule.title,
                severity,
                location: { file, line },
                description: rule.description,
                recommendation: rule.recommendation,
                snippet: getSnippet(content, line),
            });
        }
    }
    return findings;
}
function readFileSafe(filePath) {
    try {
        return fs_1.default.readFileSync(filePath, 'utf8');
    }
    catch {
        return null;
    }
}
exports.solidityAstPlugin = {
    id: 'solidity-ast',
    languages: ['.sol'],
    detect: (files, config) => {
        const findings = [];
        for (const file of files) {
            if (!file.endsWith('.sol'))
                continue;
            const astResult = (0, solidityAst_1.analyzeSolidityFile)(file, config);
            findings.push(...astResult.findings);
            if (astResult.parseFailed) {
                const content = readFileSafe(file);
                if (content) {
                    findings.push(...applyRegexRules(content, file, config));
                }
            }
        }
        return findings;
    },
};
