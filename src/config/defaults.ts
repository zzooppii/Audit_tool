import { AuditConfig } from '../types';

export const defaultConfig: AuditConfig = {
  paths: ['.'],
  tests: [],
  exclude: ['node_modules/**'],
  networks: [],
  rules: {},
  report: {
    format: 'console',
  },
  accessControl: {
    modifiers: ['onlyOwner', 'onlyAdmin', 'onlyRole', 'authorized'],
  },
};