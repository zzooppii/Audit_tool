<<<<<<< SEARCH
import fs from 'fs';
import { Finding } from '../types';
import { ensureDir } from '../utils/ensureDir';
import { summarizeFindings } from './summary';

export function reportMarkdown(findings: Finding[], outputPath?: string) {
  const summary = summarizeFindings(findings);

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
      md += `- **Snippet**: \`${f.snippet}\`\n`;
    }
    md += `- **Recommendation**: ${f.recommendation}\n\n`;
  });

  if (outputPath) {
    ensureDir(outputPath);
    fs.writeFileSync(outputPath, md);
    console.log(`\n✅ Markdown report saved to ${outputPath}`);
  } else {
    console.log(md);
  }
}
=======
import fs from 'fs';
import { Finding } from '../types';
import { ensureDir } from '../utils/ensureDir';
import { summarizeFindings } from './summary';

export function reportMarkdown(findings: Finding[], outputPath?: string) {
  const summary = summarizeFindings(findings);

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
      md += `- **Snippet**: \`${f.snippet}\`\n`;
    }
    md += `- **Recommendation**: ${f.recommendation}\n\n`;
  });

  if (outputPath) {
    ensureDir(outputPath);
    fs.writeFileSync(outputPath, md);
    console.log(`\n✅ Markdown report saved to ${outputPath}`);
  } else {
    console.log(md);
  }
}
>>>>>>> REPLACE