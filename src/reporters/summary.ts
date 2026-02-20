import { Finding } from '../types';

const SEVERITY_ORDER: Finding['severity'][] = [
  'critical',
  'high',
  'medium',
  'low',
  'info',
];

export function summarizeFindings(findings: Finding[]) {
  const bySeverity: Record<Finding['severity'], number> = {
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