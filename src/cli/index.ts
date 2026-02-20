#!/usr/bin/env node
import { program } from 'commander';
import { loadConfig } from '../config/loadConfig';
import { runAudit } from '../commands/audit';

program
  .name('audit')
  .description('CLI to audit local codebase')
  .version('0.1.0')
  .argument('<path>', 'target path to audit')
  .option('-c, --config <path>', 'config file path', '.audit.yml')
  .option('-f, --format <format>', 'output format (console|json|markdown)')
  .option('-o, --output <path>', 'output file path')
  .option('--fail-on <level>', 'fail on severity level')
  .action(async (path: string) => {
    const config = await loadConfig(program.opts().config);
    await runAudit(path, { ...program.opts(), config });
  });

program.parse();