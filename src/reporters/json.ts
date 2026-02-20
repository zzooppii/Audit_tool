<<<<<<< SEARCH
import fs from 'fs';
import { Finding } from '../types';
import { ensureDir } from '../utils/ensureDir';
import { summarizeFindings } from './summary';

export function reportJson(findings: Finding[], outputPath?: string) {
  const summary = summarizeFindings(findings);
  const output = JSON.stringify(
    { timestamp: new Date().toISOString(), summary, findings },
    null,
    2
  );
  if (outputPath) {
    ensureDir(outputPath);
    fs.writeFileSync(outputPath, output);
    console.log(`\n✅ JSON report saved to ${outputPath}`);
  } else {
    console.log(output);
  }
}
=======
import fs from 'fs';
import { Finding } from '../types';
import { ensureDir } from '../utils/ensureDir';
import { summarizeFindings } from './summary';

export function reportJson(findings: Finding[], outputPath?: string) {
  const summary = summarizeFindings(findings);
  const output = JSON.stringify(
    { timestamp: new Date().toISOString(), summary, findings },
    null,
    2
  );
  if (outputPath) {
    ensureDir(outputPath);
    fs.writeFileSync(outputPath, output);
    console.log(`\n✅ JSON report saved to ${outputPath}`);
  } else {
    console.log(output);
  }
}
>>>>>>> REPLACE