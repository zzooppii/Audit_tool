import fs from 'fs';
import path from 'path';
import { AuditConfig, Finding } from '../types';
import { getPlugins } from '../plugins/manager';

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

  const plugins = getPlugins();
  const pluginExtensions = new Set(
    plugins.flatMap((plugin) => plugin.languages)
  );

  for (const plugin of plugins) {
    const pluginFiles = files.filter((file) =>
      plugin.languages.includes(path.extname(file))
    );
    if (pluginFiles.length > 0) {
      findings.push(...plugin.detect(pluginFiles, config));
    }
  }

  for (const file of files) {
    const ext = path.extname(file);

    if (pluginExtensions.has(ext)) continue;

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
        snippet: getSnippet(content, line),
      });
    }
  }

  return results;
}

function getSnippet(
  content: string,
  line: number,
  window = 2
): string | undefined {
  const lines = content.split('\n');
  const start = Math.max(0, line - 1 - window);
  const end = Math.min(lines.length - 1, line - 1 + window);
  return lines
    .slice(start, end + 1)
    .map((text, idx) => `${start + idx + 1}: ${text}`)
    .join('\n');
}

function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}