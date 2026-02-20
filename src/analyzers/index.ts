import fs from 'fs';
import path from 'path';
import { AuditConfig, Finding } from '../types';
import { analyzeSolidityFile } from './solidityAst';

type RuleDefinition = {
  id: string;
  title: string;
  description: string;
  recommendation: string;
  severity: Finding['severity'];
  regex: RegExp;
  fileExtensions: string[];
};

const REGEX_RULES: RuleDefinition[] = [
  // Solidity fallback (used only if AST parsing fails)
  {
    id: 'solidity-unchecked-external-call',
    title: 'Possible unchecked external call (call.value)',
    description:
      'call.value style external calls are risky without proper handling.',
    recommendation: 'Check return values and handle failures properly.',
    severity: 'high',
    regex: /\.call\.value\s*\(|\.call\s*{\s*value\s*:/g,
    fileExtensions: ['.sol'],
  },

  // JavaScript / TypeScript
  {
    id: 'js-eval',
    title: 'Use of eval() detected',
    description: 'eval() can execute arbitrary code and is unsafe.',
    recommendation: 'Avoid eval(); use safer parsing alternatives.',
    severity: 'high',
    regex: /\beval\s*\(/g,
    fileExtensions: ['.js', '.ts'],
  },
  {
    id: 'js-child-process',
    title: 'Use of child_process.exec detected',
    description: 'exec() can lead to command injection if input is untrusted.',
    recommendation: 'Use execFile with validated arguments.',
    severity: 'high',
    regex: /\bchild_process\.exec\b|\bexec\s*\(/g,
    fileExtensions: ['.js', '.ts'],
  },
  {
    id: 'js-innerhtml',
    title: 'Direct innerHTML assignment detected',
    description: 'Direct innerHTML can introduce XSS if input is untrusted.',
    recommendation: 'Sanitize content or use textContent.',
    severity: 'medium',
    regex: /\.innerHTML\s*=/g,
    fileExtensions: ['.js', '.ts'],
  },
  {
    id: 'js-math-random',
    title: 'Use of Math.random() for security-sensitive logic',
    description: 'Math.random() is not cryptographically secure.',
    recommendation: 'Use crypto.randomBytes or Web Crypto API.',
    severity: 'low',
    regex: /\bMath\.random\s*\(/g,
    fileExtensions: ['.js', '.ts'],
  },

  // Python
  {
    id: 'python-exec',
    title: 'Use of exec/eval detected',
    description: 'exec/eval can execute arbitrary code and is unsafe.',
    recommendation: 'Avoid exec/eval; use safe parsing alternatives.',
    severity: 'medium',
    regex: /\bexec\s*\(|\beval\s*\(/g,
    fileExtensions: ['.py'],
  },
  {
    id: 'python-subprocess-shell',
    title: 'subprocess with shell=True detected',
    description: 'shell=True can allow command injection.',
    recommendation: 'Avoid shell=True or sanitize inputs thoroughly.',
    severity: 'high',
    regex: /\bsubprocess\.\w+\(.*shell\s*=\s*True/gi,
    fileExtensions: ['.py'],
  },
  {
    id: 'python-pickle',
    title: 'pickle usage detected',
    description: 'Untrusted pickle data can lead to code execution.',
    recommendation: 'Avoid pickle for untrusted data.',
    severity: 'high',
    regex: /\bpickle\.loads?\b/g,
    fileExtensions: ['.py'],
  },
];

function getLineNumber(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

function isRuleEnabled(
  rule: RuleDefinition,
  config?: AuditConfig
): { enabled: boolean; severity: Finding['severity'] } {
  const override = config?.rules?.[rule.id];
  if (override?.enabled === false) {
    return { enabled: false, severity: rule.severity };
  }

  if (override?.severity) {
    return { enabled: true, severity: override.severity as Finding['severity'] };
  }

  return { enabled: true, severity: rule.severity };
}

export function generateFindings(
  files: string[],
  config?: AuditConfig
): Finding[] {
  if (files.length === 0) return [];

  const findings: Finding[] = [];

  for (const file of files) {
    const ext = path.extname(file);

    // Solidity: AST-based analysis first
    if (ext === '.sol') {
      const astResult = analyzeSolidityFile(file, config);
      findings.push(...astResult.findings);

      // Fallback to regex rules if AST parsing failed
      if (astResult.parseFailed) {
        const content = readFileSafe(file);
        if (content) {
          findings.push(
            ...applyRegexRules(content, file, ext, config, REGEX_RULES)
          );
        }
      }

      continue;
    }

    const content = readFileSafe(file);
    if (!content) continue;

    findings.push(...applyRegexRules(content, file, ext, config, REGEX_RULES));
  }

  return findings;
}

function applyRegexRules(
  content: string,
  file: string,
  ext: string,
  config: AuditConfig | undefined,
  rules: RuleDefinition[]
): Finding[] {
  const results: Finding[] = [];

  for (const rule of rules) {
    if (!rule.fileExtensions.includes(ext)) continue;

    const { enabled, severity } = isRuleEnabled(rule, config);
    if (!enabled) continue;

    const matches = content.matchAll(rule.regex);
    for (const match of matches) {
      const index = match.index ?? 0;
      const line = getLineNumber(content, index);

      results.push({
        id: rule.id,
        title: rule.title,
        severity,
        location: { file, line },
        description: rule.description,
        recommendation: rule.recommendation,
      });
    }
  }

  return results;
}

function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}  {
    id: 'python-pickle',
    title: 'pickle usage detected',
    description: 'Untrusted pickle data can lead to code execution.',
    recommendation: 'Avoid pickle for untrusted data.',
    severity: 'high',
    regex: /\bpickle\.loads?\b/g,
    fileExtensions: ['.py'],
  },
];

function getLineNumber(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

function isRuleEnabled(
  rule: RuleDefinition,
  config?: AuditConfig
): { enabled: boolean; severity: Finding['severity'] } {
  const override = config?.rules?.[rule.id];
  if (override?.enabled === false) {
    return { enabled: false, severity: rule.severity };
  }

  if (override?.severity) {
    return { enabled: true, severity: override.severity as Finding['severity'] };
  }

  return { enabled: true, severity: rule.severity };
}

export function generateFindings(
  files: string[],
  config?: AuditConfig
): Finding[] {
  if (files.length === 0) return [];

  const findings: Finding[] = [];

  for (const file of files) {
    const ext = path.extname(file);
    const content = readFileSafe(file);
    if (!content) continue;

    for (const rule of RULES) {
      if (!rule.fileExtensions.includes(ext)) continue;

      const { enabled, severity } = isRuleEnabled(rule, config);
      if (!enabled) continue;

      const matches = content.matchAll(rule.regex);
      for (const match of matches) {
        const index = match.index ?? 0;
        const line = getLineNumber(content, index);

        findings.push({
          id: rule.id,
          title: rule.title,
          severity,
          location: { file, line },
          description: rule.description,
          recommendation: rule.recommendation,
        });
      }
    }
  }

  return findings;
}

function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}