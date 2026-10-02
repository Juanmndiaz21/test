#!/usr/bin/env node

/**
 * Pre-commit / CI Secret Scanner (TruffleHog patterns)
 * Prevents accidental commits of AWS, DB, Stripe, or generic secret keys.
 */

const { execSync } = require('child_process');
const fs = require('fs');

const PATTERNS = [
  { name: 'AWS Access Key ID', regex: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: 'AWS Secret Access Key', regex: /(?:aws_secret_access_key|aws_secret_key)\s*[:=]\s*['"][A-Za-z0-9/+=]{40}['"]/gi },
  { name: 'AWS Session Token', regex: /aws_session_token\s*[:=]\s*['"][A-Za-z0-9/+=]{100,}['"]/gi },
  { name: 'PostgreSQL Database Connection URI with Password', regex: /postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@[^\s/:]+(?::\d+)?\/[^\s'"]+/gi },
  { name: 'Stripe Live Secret Key', regex: /\bsk_live_[0-9a-zA-Z]{24,}\b/g },
  { name: 'GitHub Personal Access Token', regex: /\bgh[pousr]_[A-Za-z0-9_]{36,}\b/g },
  { name: 'Private Key Block', regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g },
];

// Files/extensions to ignore
const IGNORED_PATHS = [
  /\.env\.example$/,
  /\.lock$/,
  /package-lock\.json$/,
  /\.min\.js$/,
  /\.png$/,
  /\.jpe?g$/,
  /\.svg$/,
  /\.woff2?$/,
  /\.exe$/,
  /\.bin$/,
];

function scanContent(filepath, content) {
  const issues = [];
  for (const p of PATTERNS) {
    const matches = content.match(p.regex);
    if (matches) {
      issues.push({ pattern: p.name, count: matches.length });
    }
  }
  return issues;
}

function main() {
  let files = [];
  const args = process.argv.slice(2);
  const isStagedOnly = args.includes('--staged');

  if (isStagedOnly) {
    try {
      const output = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
      files = output.trim().split('\n').filter(Boolean);
    } catch (e) {
      console.error('Error reading git staged files:', e.message);
      process.exit(1);
    }
  } else {
    try {
      const output = execSync('git ls-files', { encoding: 'utf8' });
      files = output.trim().split('\n').filter(Boolean);
    } catch (e) {
      console.error('Error reading tracked git files:', e.message);
      process.exit(1);
    }
  }

  let totalViolations = 0;

  for (const file of files) {
    if (IGNORED_PATHS.some((rx) => rx.test(file))) continue;
    if (!fs.existsSync(file)) continue;

    let content = '';
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue; // Binary file or unreadable
    }

    const violations = scanContent(file, content);
    if (violations.length > 0) {
      console.error(`\x1b[31m[SECURITY ALERT]\x1b[0m Secret exposed in: ${file}`);
      for (const v of violations) {
        console.error(`  - Pattern: ${v.pattern} (${v.count} occurrences)`);
      }
      totalViolations += violations.length;
    }
  }

  if (totalViolations > 0) {
    console.error(`\n\x1b[41m\x1b[37m BLOCKED \x1b[0m Found ${totalViolations} potential secret(s). Please move secrets to .env.local.`);
    process.exit(1);
  } else {
    console.log(`\x1b[32m[OK]\x1b[0m Secrets scan passed. No exposed credentials detected.`);
    process.exit(0);
  }
}

main();
