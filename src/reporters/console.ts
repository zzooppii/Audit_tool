<<<<<<< SEARCH
import { Finding } from '../types';
import { summarizeFindings } from './summary';

export function reportConsole(findings: Finding[]) {
  const summary = summarizeFindings(findings);

  console.log(`\n🎯 Found ${summary.total} issue(s)`);
  console.log(
    `   Critical: ${summary.bySeverity.critical} | High: ${summary.bySeverity.high} | Medium: ${summary.bySeverity.medium} | Low: ${summary.bySeverity.low} | Info: ${summary.bySeverity.info}\n`
  );

  findings.forEach((f, i) => {
    console.log(`${i + 1}. [${f.severity.toUpperCase()}] ${f.title}`);
    console.log(`   ${f.location.file}:${f.location.line}`);
    console.log(`   ${f.description}`);
    if (f.snippet) {
      console.log(`   🧩 ${f.snippet}`);
    }
    console.log(`   💡 ${f.recommendation}\n`);
  });
}
=======
import { Finding } from '../types';
import { summarizeFindings } from './summary';

export function reportConsole(findings: Finding[]) {
  const summary = summarizeFindings(findings);

  console.log(`\n🎯 Found ${summary.total} issue(s)`);
  console.log(
    `   Critical: ${summary.bySeverity.critical} | High: ${summary.bySeverity.high} | Medium: ${summary.bySeverity.medium} | Low: ${summary.bySeverity.low} | Info: ${summary.bySeverity.info}\n`
  );

  findings.forEach((f, i) => {
    console.log(`${i + 1}. [${f.severity.toUpperCase()}] ${f.title}`);
    console.log(`   ${f.location.file}:${f.location.line}`);
    console.log(`   ${f.description}`);
    if (f.snippet) {
      console.log(`   🧩 ${f.snippet}`);
    }
    console.log(`   💡 ${f.recommendation}\n`);
  });
}
>>>>>>> REPLACE