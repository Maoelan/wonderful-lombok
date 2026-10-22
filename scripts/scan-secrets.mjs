import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const MAX_FILE_BYTES = 1_000_000;

const RULES = [
  { name: 'private-key', pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/ },
  { name: 'github-token', pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,})\b/ },
  { name: 'aws-access-key', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'google-api-key', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: 'slack-token', pattern: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/ },
  { name: 'stripe-live-key', pattern: /\b(?:sk|rk)_live_[0-9A-Za-z]{16,}\b/ },
  {
    name: 'generic-secret-assignment',
    pattern: /\b(?:password|passwd|secret|token|api[_-]?key)\b\s*[:=]\s*["'`]([^"'`\s]{12,})["'`]/i,
    capture: 1
  }
];

const SAFE_VALUE = /^(?:your[-_]|generate[-_]|ci[-_]placeholder|not[-_]a[-_]real|example|placeholder|change[-_]?me|dummy|test|xxxx)/i;

export function scanText(text, file = '<text>') {
  const findings = [];
  const seen = new Set();
  text.split(/\r?\n/).forEach((line, index) => {
    for (const rule of RULES) {
      const match = rule.pattern.exec(line);
      if (!match) continue;
      if (rule.capture && SAFE_VALUE.test(match[rule.capture])) continue;
      const key = `${file}:${index + 1}:${rule.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      findings.push({ file, line: index + 1, rule: rule.name });
    }
  });
  return findings;
}

export function scanTrackedFiles() {
  const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  return files.flatMap((file) => {
    try {
      const content = readFileSync(file, 'utf8');
      if (content.length > MAX_FILE_BYTES || content.includes('\0')) return [];
      return scanText(content, file);
    } catch {
      return [];
    }
  });
}

function main() {
  const findings = scanTrackedFiles();
  if (findings.length === 0) {
    console.log('No high-confidence secrets found in tracked files.');
    return;
  }
  for (const finding of findings) console.error(`${finding.file}:${finding.line} ${finding.rule}`);
  console.error(`Found ${findings.length} potential secret(s). Values are intentionally not printed.`);
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
