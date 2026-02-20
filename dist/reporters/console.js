"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportConsole = reportConsole;
const summary_1 = require("./summary");
function reportConsole(findings) {
    const summary = (0, summary_1.summarizeFindings)(findings);
    console.log(`\n🎯 Found ${summary.total} issue(s)`);
    console.log(`   Critical: ${summary.bySeverity.critical} | High: ${summary.bySeverity.high} | Medium: ${summary.bySeverity.medium} | Low: ${summary.bySeverity.low} | Info: ${summary.bySeverity.info}\n`);
    findings.forEach((f, i) => {
        console.log(`${i + 1}. [${f.severity.toUpperCase()}] ${f.title}`);
        console.log(`   ${f.location.file}:${f.location.line}`);
        console.log(`   ${f.description}`);
        if (f.snippet) {
            console.log('   🧩 Snippet:');
            f.snippet.split('\n').forEach((line) => {
                console.log(`     ${line}`);
            });
        }
        console.log(`   💡 ${f.recommendation}\n`);
    });
}
