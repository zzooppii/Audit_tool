import fs from 'fs';
import { parse } from 'solidity-parser-antlr';
import { AuditConfig, Finding } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const visit = (ast: any, visitor: any) => {
  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (node.type && visitor[node.type]) {
      visitor[node.type](node);
    }
    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'range') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(walk);
      } else if (typeof child === 'object') {
        walk(child);
      }
    }
  };
  walk(ast);
};

type AstRule = {
  id: string;
  title: string;
  description: string;
  recommendation: string;
  severity: Finding['severity'];
  check: (node: any) => boolean;
};

const AST_RULES: AstRule[] = [
  {
    id: 'solidity-tx-origin',
    title: 'Use of tx.origin for authorization',
    description: 'tx.origin can be spoofed via phishing contracts.',
    recommendation: 'Use msg.sender for access control.',
    severity: 'critical',
    check: (node) =>
      node.type === 'MemberAccess' &&
      node.expression?.name === 'tx' &&
      node.memberName === 'origin',
  },
  {
    id: 'solidity-delegatecall',
    title: 'Use of delegatecall detected',
    description: 'delegatecall can execute external code in the current context.',
    recommendation: 'Avoid delegatecall or strictly control target address.',
    severity: 'high',
    check: (node) =>
      node.type === 'MemberAccess' && node.memberName === 'delegatecall',
  },
  {
    id: 'solidity-selfdestruct',
    title: 'Use of selfdestruct detected',
    description: 'selfdestruct can permanently remove contract code.',
    recommendation: 'Avoid selfdestruct or restrict usage.',
    severity: 'high',
    check: (node) =>
      node.type === 'FunctionCall' &&
      (node.expression?.name === 'selfdestruct' ||
        node.expression?.name === 'suicide'),
  },
  {
    id: 'solidity-low-level-call',
    title: 'Low-level call detected',
    description: 'Low-level call can be unsafe if return value is not checked.',
    recommendation: 'Check return values and avoid low-level calls.',
    severity: 'medium',
    check: (node) =>
      node.type === 'MemberAccess' &&
      (node.memberName === 'call' || node.memberName === 'callcode'),
  },
  {
    id: 'solidity-send-transfer',
    title: 'Use of send()/transfer() detected',
    description: 'send/transfer can fail due to gas limitations.',
    recommendation: 'Prefer call with proper checks.',
    severity: 'low',
    check: (node) =>
      node.type === 'MemberAccess' &&
      (node.memberName === 'send' || node.memberName === 'transfer'),
  },
  {
    id: 'solidity-block-timestamp',
    title: 'Use of block.timestamp detected',
    description: 'block.timestamp can be manipulated by miners.',
    recommendation: 'Avoid using block.timestamp for critical logic.',
    severity: 'medium',
    check: (node) =>
      (node.type === 'MemberAccess' &&
        node.expression?.name === 'block' &&
        node.memberName === 'timestamp') ||
      (node.type === 'Identifier' && node.name === 'now'),
  },
  {
    id: 'solidity-blockhash-randomness',
    title: 'Use of blockhash for randomness detected',
    description: 'blockhash is predictable and unsafe for randomness.',
    recommendation: 'Use secure randomness (e.g., VRF).',
    severity: 'medium',
    check: (node) =>
      node.type === 'FunctionCall' && node.expression?.name === 'blockhash',
  },
  {
    id: 'solidity-assembly',
    title: 'Use of inline assembly detected',
    description: 'Assembly is error-prone and can introduce security risks.',
    recommendation: 'Avoid inline assembly unless necessary and audited.',
    severity: 'medium',
    check: (node) => node.type === 'InlineAssemblyStatement',
  },
];

const FUNCTION_RULES = {
  reentrancy: {
    id: 'solidity-reentrancy',
    title: 'Potential reentrancy (external call before state change)',
    description: 'External call occurs before a state update.',
    recommendation: 'Apply checks-effects-interactions pattern.',
    severity: 'high' as const,
  },
  uncheckedReturn: {
    id: 'solidity-unchecked-return',
    title: 'Unchecked low-level call return value',
    description: 'Low-level calls return a success flag which should be checked.',
    recommendation: 'Check return values for low-level calls.',
    severity: 'medium' as const,
  },
  accessControl: {
    id: 'solidity-access-control',
    title: 'Missing access control on state-changing function',
    description: 'Public function changes state without owner restriction.',
    recommendation: 'Add access control (e.g., onlyOwner).',
    severity: 'high' as const,
  },
};

function resolveRule(
  rule: AstRule,
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

function resolveFunctionRule(
  rule: { id: string; severity: Finding['severity'] },
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

function collectStateVariables(ast: any): Set<string> {
  const vars = new Set<string>();
  visit(ast, {
    StateVariableDeclaration: (node: any) => {
      for (const v of node.variables || []) {
        if (v?.name) vars.add(v.name);
      }
    },
  });
  return vars;
}

function isExternalCallNode(node: any): boolean {
  return (
    node?.type === 'FunctionCall' &&
    node.expression?.type === 'MemberAccess' &&
    ['call', 'callcode', 'delegatecall', 'staticcall', 'send', 'transfer'].includes(
      node.expression.memberName
    )
  );
}

function isStateVarIdentifier(node: any, stateVars: Set<string>): boolean {
  if (!node) return false;
  if (node.type === 'Identifier' && stateVars.has(node.name)) return true;
  if (node.type === 'IndexAccess' && node.base?.type === 'Identifier') {
    return stateVars.has(node.base.name);
  }
  if (node.type === 'MemberAccess' && node.expression?.type === 'Identifier') {
    return stateVars.has(node.expression.name);
  }
  return false;
}

function statementHasExternalCall(statement: any): boolean {
  if (!statement) return false;
  let found = false;
  visit(statement, {
    FunctionCall: (node: any) => {
      if (isExternalCallNode(node)) {
        found = true;
      }
    },
  });
  return found;
}

function statementHasStateWrite(statement: any, stateVars: Set<string>): boolean {
  if (!statement) return false;
  let found = false;
  visit(statement, {
    Assignment: (node: any) => {
      if (isStateVarIdentifier(node.left, stateVars)) {
        found = true;
      }
    },
    UnaryOperation: (node: any) => {
      if (isStateVarIdentifier(node.subExpression, stateVars)) {
        found = true;
      }
    },
  });
  return found;
}

function functionWritesState(
  functionNode: any,
  stateVars: Set<string>
): boolean {
  if (!functionNode?.body) return false;
  return statementHasStateWrite(functionNode.body, stateVars);
}

function functionHasAllowedModifier(
  functionNode: any,
  config?: AuditConfig
): boolean {
  const allowed = new Set(
    config?.accessControl?.modifiers?.length
      ? config.accessControl.modifiers
      : ['onlyOwner', 'onlyAdmin', 'onlyRole', 'authorized']
  );
  const modifiers = functionNode?.modifiers || [];
  return modifiers.some((m: any) => {
    const name = m?.modifierName?.name || m?.name;
    return name && allowed.has(name);
  });
}

function analyzeFunctionRules(
  ast: any,
  filePath: string,
  config?: AuditConfig,
  content?: string
): Finding[] {
  const findings: Finding[] = [];
  const stateVars = collectStateVariables(ast);

  const functions = new Map<string, any>();
  visit(ast, {
    FunctionDefinition: (node: any) => {
      if (node?.name) functions.set(node.name, node);
    },
  });

  const summaries = new Map<
    string,
    { hasExternalCall: boolean; hasStateWrite: boolean }
  >();

  for (const [name, node] of functions) {
    summaries.set(name, {
      hasExternalCall: statementHasExternalCall(node.body),
      hasStateWrite: statementHasStateWrite(node.body, stateVars),
    });
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const [name, node] of functions) {
      const calls = collectInternalCalls(node.body, functions);
      const hasExternalViaCall = calls.some((callee) => {
        const summary = summaries.get(callee);
        return summary?.hasExternalCall;
      });

      const current = summaries.get(name);
      if (current && hasExternalViaCall && !current.hasExternalCall) {
        current.hasExternalCall = true;
        summaries.set(name, current);
        changed = true;
      }
    }
  }

  visit(ast, {
    FunctionDefinition: (node: any) => {
      if (!node.body) return;

      const visibility = node.visibility;
      const isPublic = visibility === 'public' || visibility === 'external';
      const isConstructor = node.isConstructor === true;

      if (isPublic && !isConstructor && functionWritesState(node, stateVars)) {
        if (!functionHasAllowedModifier(node, config)) {
          const rule = FUNCTION_RULES.accessControl;
          const { enabled, severity } = resolveFunctionRule(rule, config);
          if (enabled) {
            const line = node.loc?.start?.line ?? 1;
            findings.push({
              id: rule.id,
              title: rule.title,
              severity,
              location: { file: filePath, line },
              description: rule.description,
              recommendation: rule.recommendation,
              snippet: getSnippet(content, line),
            });
          }
        }
      }

      let seenExternalCall = false;
      const statements = node.body?.statements || [];

      for (const statement of statements) {
        const hasExternalCall =
          statementHasExternalCall(statement) ||
          statementCallsExternalFunction(statement, functions, summaries);

        if (hasExternalCall) {
          seenExternalCall = true;

          if (
            statement.type === 'ExpressionStatement' &&
            isExternalCallNode(statement.expression)
          ) {
            const rule = FUNCTION_RULES.uncheckedReturn;
            const { enabled, severity } = resolveFunctionRule(rule, config);
            if (enabled) {
              const line = statement.loc?.start?.line ?? 1;
              findings.push({
                id: rule.id,
                title: rule.title,
                severity,
                location: { file: filePath, line },
                description: rule.description,
                recommendation: rule.recommendation,
                snippet: getSnippet(content, line),
              });
            }
          }
        }

        if (seenExternalCall && statementHasStateWrite(statement, stateVars)) {
          const rule = FUNCTION_RULES.reentrancy;
          const { enabled, severity } = resolveFunctionRule(rule, config);
          if (enabled) {
            const line = statement.loc?.start?.line ?? 1;
            findings.push({
              id: rule.id,
              title: rule.title,
              severity,
              location: { file: filePath, line },
              description: rule.description,
              recommendation: rule.recommendation,
              snippet: getSnippet(content, line),
            });
          }
          break;
        }
      }
    },
  });

  return findings;
}

function collectInternalCalls(body: any, functions: Map<string, any>): string[] {
  const calls: string[] = [];
  if (!body) return calls;

  visit(body, {
    FunctionCall: (node: any) => {
      if (node?.expression?.type === 'Identifier') {
        const name = node.expression.name;
        if (functions.has(name)) {
          calls.push(name);
        }
      }
    },
  });

  return calls;
}

function statementCallsExternalFunction(
  statement: any,
  functions: Map<string, any>,
  summaries: Map<string, { hasExternalCall: boolean; hasStateWrite: boolean }>
): boolean {
  let found = false;
  visit(statement, {
    FunctionCall: (node: any) => {
      if (node?.expression?.type === 'Identifier') {
        const name = node.expression.name;
        const summary = summaries.get(name);
        if (summary?.hasExternalCall) {
          found = true;
        }
      }
    },
  });
  return found;
}

function getSnippet(
  content: string | undefined,
  line: number,
  window = 2
): string | undefined {
  if (!content) return undefined;
  const lines = content.split('\n');
  const start = Math.max(0, line - 1 - window);
  const end = Math.min(lines.length - 1, line - 1 + window);
  return lines
    .slice(start, end + 1)
    .map((text, idx) => `${start + idx + 1}: ${text}`)
    .join('\n');
}

export function analyzeSolidityFile(
  filePath: string,
  config?: AuditConfig
): { findings: Finding[]; parseFailed: boolean } {
  const findings: Finding[] = [];

  const content = readFileSafe(filePath);
  if (!content) return { findings, parseFailed: true };

  let ast: any;
  try {
    ast = parse(content, { loc: true, range: true });
  } catch {
    return { findings, parseFailed: true };
  }

  visit(ast, (node: any) => {
    for (const rule of AST_RULES) {
      const { enabled, severity } = resolveRule(rule, config);
      if (!enabled) continue;

      if (rule.check(node)) {
        const line = node.loc?.start?.line ?? 1;
        findings.push({
          id: rule.id,
          title: rule.title,
          severity,
          location: { file: filePath, line },
          description: rule.description,
          recommendation: rule.recommendation,
          snippet: getSnippet(content, line),
        });
      }
    }
  });

  findings.push(...analyzeFunctionRules(ast, filePath, config, content));

  return { findings, parseFailed: false };
}

function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}