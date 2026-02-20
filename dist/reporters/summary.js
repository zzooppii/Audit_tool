"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeFindings = summarizeFindings;
const SEVERITY_ORDER = [
    'critical',
    'high',
    'medium',
    'low',
    'info',
];
function summarizeFindings(findings) {
    const bySeverity = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
    };
    for (const finding of findings) {
        bySeverity[finding.severity] += 1;
    }
    return {
        total: findings.length,
        bySeverity,
        order: SEVERITY_ORDER,
    };
}
