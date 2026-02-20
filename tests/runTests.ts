import assert from 'assert';
import path from 'path';
import { generateFindings } from '../src/analyzers';
import { AuditConfig } from '../src/types';

const fixturesRoot = path.resolve(__dirname, 'fixtures', 'solidity');

const baseConfig: AuditConfig = {
  paths: ['.'],
  rules: {},
  report: { format: 'console' },
};

function testReentrancyDetection() {
  const file = path.join(fixturesRoot, 'Reentrancy.sol');
  const findings = generateFindings([file], baseConfig);

  console.log('=== Reentrancy Test ===');

  const reentrancyFinding = findings.find(
    (f: any) => f.id === 'solidity-reentrancy'
  );

  assert(reentrancyFinding, 'Expected reentrancy finding');
  assert(
    reentrancyFinding?.snippet?.includes('transfer'),
    'Expected snippet to include external call'
  );
  assert(
    reentrancyFinding?.snippet?.includes('\n'),
    'Expected snippet to include context lines'
  );
}

function testAccessControlDetection() {
  const file = path.join(fixturesRoot, 'AccessControl.sol');
  const findings = generateFindings([file], baseConfig);

  const accessFindings = findings.filter(
    (f: any) => f.id === 'solidity-access-control'
  );

  assert(
    accessFindings.length >= 1,
    'Expected at least 1 access control finding'
  );
}

function testCustomAccessControlModifiers() {
  const file = path.join(fixturesRoot, 'AccessControl.sol');
  const config: AuditConfig = {
    ...baseConfig,
    accessControl: { modifiers: ['adminOnly'] },
  };

  const findings = generateFindings([file], config);
  const accessFindings = findings.filter(
    (f: any) => f.id === 'solidity-access-control'
  );

  assert(
    accessFindings.length >= 1,
    'Expected at least 1 access control finding with custom modifiers'
  );
}

function run() {
  testReentrancyDetection();
  testAccessControlDetection();
  testCustomAccessControlModifiers();
  console.log('All tests passed');
}

run();
