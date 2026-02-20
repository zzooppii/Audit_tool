import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { AuditConfig } from '../types';
import { defaultConfig } from './defaults';

const VALID_FORMATS = ['markdown', 'json', 'console'] as const;
const VALID_SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'] as const;

function validateConfig(config: AuditConfig) {
  if (!Array.isArray(config.paths)) {
    throw new Error('Config error: "paths" must be an array.');
  }

  if (config.report?.format && !VALID_FORMATS.includes(config.report.format)) {
    throw new Error(
      `Config error: invalid report format "${config.report.format}".`
    );
  }

  if (config.rules) {
    for (const [ruleId, rule] of Object.entries(config.rules)) {
      if (
        rule?.severity &&
        !VALID_SEVERITIES.includes(rule.severity as any)
      ) {
        throw new Error(
          `Config error: invalid severity "${rule.severity}" for rule "${ruleId}".`
        );
      }
    }
  }
}

export function loadConfig(configPath: string): AuditConfig {
  const resolvedPath = path.resolve(configPath);

  let userConfig: Partial<AuditConfig> = {};

  if (fs.existsSync(resolvedPath)) {
    const file = fs.readFileSync(resolvedPath, 'utf8');
    userConfig = (yaml.load(file) as AuditConfig) || {};
  } else {
    console.warn(`⚠️  Config file not found: ${resolvedPath}. Using defaults.`);
  }

  const merged: AuditConfig = {
    ...defaultConfig,
    ...userConfig,
    report: {
      ...defaultConfig.report,
      ...userConfig.report,
    },
    rules: {
      ...defaultConfig.rules,
      ...userConfig.rules,
    },
  };

  validateConfig(merged);
  return merged;
}