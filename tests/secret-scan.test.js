import test from 'node:test';
import assert from 'node:assert/strict';
import { scanText } from '../scripts/scan-secrets.mjs';

test('secret scan detects high-confidence token formats without printing values', () => {
  const githubToken = ['gh', 'p_', 'a'.repeat(36)].join('');
  const findings = scanText(`const value = '${githubToken}';`, 'example.js');
  assert.deepEqual(findings, [{ file: 'example.js', line: 1, rule: 'github-token' }]);
});

test('secret scan detects generic committed assignments', () => {
  const keyName = 'api' + 'Key';
  const assignment = `const ${keyName} = ${JSON.stringify('real-looking-value-123')};`;
  const findings = scanText(assignment, 'config.js');
  assert.deepEqual(findings, [{ file: 'config.js', line: 1, rule: 'generic-secret-assignment' }]);
});

test('secret scan ignores documented placeholders', () => {
  assert.deepEqual(scanText('password = "ci-placeholder-not-a-real-secret"', '.env.example'), []);
  assert.deepEqual(scanText('secret = "generate-a-long-random-secret"', '.env.example'), []);
});
