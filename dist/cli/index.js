#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const loadConfig_1 = require("../config/loadConfig");
const audit_1 = require("../commands/audit");
commander_1.program
    .name('audit')
    .description('CLI to audit local codebase')
    .version('0.1.0')
    .argument('<path>', 'target path to audit')
    .option('-c, --config <path>', 'config file path', '.audit.yml')
    .option('-f, --format <format>', 'output format (console|json|markdown)')
    .option('-o, --output <path>', 'output file path')
    .option('--fail-on <level>', 'fail on severity level')
    .action(async (path) => {
    const config = await (0, loadConfig_1.loadConfig)(commander_1.program.opts().config);
    await (0, audit_1.runAudit)(path, { ...commander_1.program.opts(), config });
});
commander_1.program.parse();
