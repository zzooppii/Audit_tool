import fs from 'fs';
import { AuditConfig, Finding } from '../types';
import { analyzeSolidityFile } from '../analyzers/solidityAst';
import { AuditPlugin } from './types';

type RuleDefinition = {
  id: string;
  title: string;
  description: string;
  recommendation: string;
  severity: Finding['severity'];
  regex: RegExp;
};

const REGEX_FALLBACK_RULES: RuleDefinition[] = [
  {
    id: 'solidity-reentrancy',
    title: 'Potential reentrancy (external call before state change)',
    description: 'External call occurs before a state update.',
    recommendation: 'Apply checks-effects-interactions pattern.',
    severity: 'high',
    regex: /\.\bcall\s*\(|\.\btransfer\s*\(|\.\bsend\s*\(/g,
  },
  {
    id: 'solidity-access-control',
    title: 'Missing access control on state-changing function',
    description: 'Public function changes state without owner restriction.',
    recommendation: 'Add access control (e.g., onlyOwner).',
    severity: 'high',
    regex: /function\s+\w+\s*\([^)]*\)\s*public\s*(?:pure|view|payable)?\s*\{/g,
  },
  {
    id: 'solidity-unchecked-return',
    title: 'Unchecked low-level call return value',
    description: 'Low-level calls return a success flag which should be checked.',
    recommendation: 'Check return values for low-level calls.',
    severity: 'medium',
    regex: /\.\bcall\s*\(.*\)\s*;/g,
  },
  {
    id: 'solidity-tx-origin',
    title: 'Use of tx.origin for authorization',
    description: 'tx.origin can be spoofed via phishing contracts.',
    recommendation: 'Use msg.sender for access control.',
    severity: 'critical',
    regex: /\btx\.origin\b/g,
  },
  {
    id: 'solidity-selfdestruct',
    title: 'Use of selfdestruct detected',
    description: 'selfdestruct can permanently remove contract code.',
    recommendation: 'Avoid selfdestruct or restrict usage.',
    severity: 'high',
    regex: /\bselfdestruct\s*\(|suicide\s*\(/g,
  },
  {
    id: 'solidity-delegatecall',
    title: 'Use of delegatecall detected',
    description: 'delegatecall can execute external code in the current context.',
    recommendation: 'Avoid delegatecall or strictly control target address.',
    severity: 'high',
    regex: /\bdelegatecall\s*\(/g,
  },
];

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

function getSnippet(
  content: string,
  line: number,
  window = 2
): string | undefined {
  const lines = content.split('\n');
  const start = Math.max(0, line - 1 - window);
  const end = Math.min(lines.length - 1, line - 1 + window);
  const snippetLines = lines
    .slice(start, end + 1)
    .map((text, idx) => `${start + idx + 1}: ${text}`);
  return snippetLines.join('\n');
}

function applyRegexRules(
  content: string,
  file: string,
  config?: AuditConfig
): Finding[] {
  const findings: Finding[] = [];

  for (const rule of REGEX_FALLBACK_RULES) {
    const { enabled, severity } = isRuleEnabled(rule, config);
    if (!enabled) continue;

    const matches = content.matchAll(rule.regex);
    for (const match of matches) {
      const index = match.index ?? 0;
      const line = content.slice(0, index).split('\n').length;

      findings.push({
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

  return findings;
}

function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

export const solidityAstPlugin: AuditPlugin = {
  id: 'solidity-ast',
  languages: ['.sol'],
  detect: (files, config) => {
    const findings: Finding[] = [];

    for (const file of files) {
      if (!file.endsWith('.sol')) continue;

      const astResult = analyzeSolidityFile(file, config);
      findings.push(...astResult.findings);

      if (astResult.parseFailed) {
        const content = readFileSafe(file);
        if (content) {
          findings.push(...applyRegexRules(content, file, config));
        }
      }
    }

    return findings;
  },
};
