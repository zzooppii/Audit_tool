import path from 'path';
import { AuditConfig } from '../types';
import { scanFiles } from '../scanner/fileScanner';
import { classifyFiles } from '../scanner/classify';
import { generateFindings } from '../analyzers';
import { reportFindings } from '../reporters';

const VALID_FORMATS = ['console', 'json', 'markdown'];
const VALID_SEVERITIES = ['info', 'low', 'medium', 'high', 'critical'];

export async function runAudit(
  targetPath: string,
  options: {
    config: AuditConfig;
    format?: string;
    output?: string;
    'fail-on'?: string;
  }
) {
  const { config, format, output, 'fail-on': failOn } = options;

  const resolvedTarget = path.resolve(targetPath);
  const scanRoots = (config.paths?.length ? config.paths : ['.']).map((p) =>
    path.resolve(resolvedTarget, p)
  );

  const reportFormat =
    format?.toLowerCase() || config.report?.format || 'console';

  if (!VALID_FORMATS.includes(reportFormat)) {
    throw new Error(`Invalid format: ${reportFormat}`);
  }

  if (failOn && !VALID_SEVERITIES.includes(failOn.toLowerCase())) {
    throw new Error(`Invalid fail-on severity: ${failOn}`);
  }

  const files = scanFiles(scanRoots, config.exclude);
  const classified = classifyFiles(files);

  const findings = generateFindings(files, config);

  await reportFindings(findings, {
    format: reportFormat,
    outputPath: output || config.report?.output,
  });

  if (failOn) {
    const threshold = VALID_SEVERITIES.indexOf(failOn.toLowerCase());
    const hasFailingFinding = findings.some(
      (f) => VALID_SEVERITIES.indexOf(f.severity) >= threshold
    );

    if (hasFailingFinding) {
      console.error(`\n❌ Audit failed: findings with severity >= ${failOn}`);
      process.exit(1);
    }
  }
}