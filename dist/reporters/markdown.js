"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportMarkdown = reportMarkdown;
const fs_1 = __importDefault(require("fs"));
const ensureDir_1 = require("../utils/ensureDir");
const summary_1 = require("./summary");
function reportMarkdown(findings, outputPath) {
    const summary = (0, summary_1.summarizeFindings)(findings);
    let md = '# Audit Report\n';
    md += `## Summary\n`;
    md += `- Total: ${summary.total}\n`;
    md += `- Critical: ${summary.bySeverity.critical}\n`;
    md += `- High: ${summary.bySeverity.high}\n`;
    md += `- Medium: ${summary.bySeverity.medium}\n`;
    md += `- Low: ${summary.bySeverity.low}\n`;
    md += `- Info: ${summary.bySeverity.info}\n\n`;
    if (findings.length > 0) {
        md += `## Findings\n`;
    }
    findings.forEach((f) => {
        md += `### [${f.severity.toUpperCase()}] ${f.title}\n`;
        md += `- **File**: ${f.location.file}:${f.location.line}\n`;
        md += `- **Description**: ${f.description}\n`;
        if (f.snippet) {
            md += `- **Snippet**:\n\n\`\n${f.snippet}\n\`\n`;
        }
        md += `- **Recommendation**: ${f.recommendation}\n\n`;
    });
    if (outputPath) {
        (0, ensureDir_1.ensureDir)(outputPath);
        fs_1.default.writeFileSync(outputPath, md);
        console.log(`\n✅ Markdown report saved to ${outputPath}`);
    }
    else {
        console.log(md);
    }
}
