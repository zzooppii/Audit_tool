import { AuditPlugin } from './types';
import { solidityAstPlugin } from './solidityAstPlugin';

export function getPlugins(): AuditPlugin[] {
  return [solidityAstPlugin];
}