import { AuditConfig, Finding } from '../types';

export interface AuditPlugin {
  id: string;
  languages: string[]; // file extensions (e.g., ['.sol'])
  detect: (files: string[], config?: AuditConfig) => Finding[];
}