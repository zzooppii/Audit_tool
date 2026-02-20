export interface AuditConfig {
  paths: string[];
  tests?: string[];
  exclude?: string[];
  networks?: string[];
  rules?: Record<string, { enabled: boolean; severity: string }>;
  report?: { format: 'markdown' | 'json' | 'console'; output?: string };
  accessControl?: {
    modifiers?: string[];
  };
}

export interface Finding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  location: { file: string; line: number };
  description: string;
  recommendation: string;
  snippet?: string;
}