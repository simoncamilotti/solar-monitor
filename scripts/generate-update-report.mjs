#!/usr/bin/env node

/**
 * Generates a markdown report for the dependency update PR.
 *
 * Inputs:
 *   - ncu-available.json   All upgradable packages (before applying)
 *   - ncu-remaining.json   Still upgradable packages (after --target minor)
 *   - git diff package.json (executed internally)
 *   - Env vars: BUILD_OUTCOME, E2E_AFTER_OUTCOME, VISUAL_OUTCOME
 *   - Playwright test output dir for *-diff.png files
 *
 * Output: pr-body.md
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const NCU_AVAILABLE = process.env.NCU_AVAILABLE_FILE || 'ncu-available.json';
const NCU_REMAINING = process.env.NCU_REMAINING_FILE || 'ncu-remaining.json';
const PW_OUTPUT_DIR = process.env.PW_OUTPUT_DIR || 'dist/.playwright/apps/web-e2e/test-output';
const REPORT_OUTPUT = process.env.REPORT_OUTPUT || 'pr-body.md';

const BUILD_OUTCOME = process.env.BUILD_OUTCOME || 'skipped';
const E2E_AFTER_OUTCOME = process.env.E2E_AFTER_OUTCOME || 'skipped';
const VISUAL_OUTCOME = process.env.VISUAL_OUTCOME || 'skipped';

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return {};
  }
}

function statusIcon(outcome) {
  if (outcome === 'success') return ':white_check_mark:';
  if (outcome === 'failure') return ':x:';
  return ':construction:';
}

function statusLabel(outcome) {
  if (outcome === 'success') return 'Success';
  if (outcome === 'failure') return 'Failed';
  return 'Skipped';
}

function getUpdateType(from, to) {
  const [fMaj, fMin] = from.split('.').map(Number);
  const [tMaj, tMin] = to.split('.').map(Number);
  if (tMaj > fMaj) return 'major';
  if (tMin > fMin) return 'minor';
  return 'patch';
}

function parsePackageJsonDiff() {
  const changes = new Map();
  try {
    const diff = execSync('git diff package.json', { encoding: 'utf-8' });
    for (const line of diff.split('\n')) {
      const removeMatch = line.match(/^-\s+"([^"]+)":\s+"[\^~]?([^"]+)"/);
      if (removeMatch) {
        const [, pkg, version] = removeMatch;
        if (!changes.has(pkg)) changes.set(pkg, {});
        changes.get(pkg).from = version;
      }
      const addMatch = line.match(/^\+\s+"([^"]+)":\s+"[\^~]?([^"]+)"/);
      if (addMatch) {
        const [, pkg, version] = addMatch;
        if (!changes.has(pkg)) changes.set(pkg, {});
        changes.get(pkg).to = version;
      }
    }
  } catch {
    // git diff may fail if not in a git repo (shouldn't happen in CI)
  }
  // Keep only entries that have both from and to (actual version changes)
  for (const [pkg, { from, to }] of changes) {
    if (!from || !to || from === to) changes.delete(pkg);
  }
  return changes;
}

function findVisualDiffs() {
  if (!existsSync(PW_OUTPUT_DIR)) return [];
  const diffs = [];
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('-diff.png')) diffs.push(entry.name);
    }
  }
  walk(PW_OUTPUT_DIR);
  return diffs;
}

// --- Main ---

const available = readJson(NCU_AVAILABLE);
const remaining = readJson(NCU_REMAINING);
const appliedDiff = parsePackageJsonDiff();
const visualDiffs = findVisualDiffs();

// Compute applied updates from the git diff
const applied = [];
for (const [pkg, { from, to }] of appliedDiff) {
  applied.push({ pkg, from, to, type: getUpdateType(from, to) });
}
applied.sort((a, b) => a.pkg.localeCompare(b.pkg));

// Compute skipped updates (major) from ncu-remaining
const skipped = [];
for (const [pkg, newVersion] of Object.entries(remaining)) {
  // Get current version from ncu-available or approximate from remaining
  const currentFromAvailable = available[pkg];
  skipped.push({
    pkg,
    current: '(current)',
    available: newVersion,
    type: 'major',
  });
}
skipped.sort((a, b) => a.pkg.localeCompare(b.pkg));

// Visual regression per-page status
const screenshotNames = [
  'dashboard-dark',
  'dashboard-light',
  'history-dark',
  'history-light',
  'settings-dark',
  'settings-light',
];
const visualStatus = screenshotNames.map(name => ({
  name: name
    .replace('-', ' — ')
    .replace(/^\w/, c => c.toUpperCase())
    .replace('dark', 'Dark')
    .replace('light', 'Light'),
  changed: visualDiffs.some(d => d.includes(name)),
}));

// Check if Playwright itself was updated (special warning)
const playwrightUpdated = applied.some(u => u.pkg === '@playwright/test');

// Build markdown
const lines = [];
const date = new Date().toISOString().split('T')[0];

lines.push(`## :package: Dependency Updates — ${date}`);
lines.push('');

// Summary table
const visualSummaryLabel =
  VISUAL_OUTCOME === 'failure'
    ? `${visualDiffs.length} page(s) changed`
    : VISUAL_OUTCOME === 'success'
      ? 'No changes'
      : 'Skipped';

lines.push('### Summary');
lines.push('');
lines.push('| Metric | Result |');
lines.push('|--------|--------|');
lines.push(`| Updates applied | **${applied.length}** |`);
lines.push(`| Updates skipped (major) | **${skipped.length}** |`);
lines.push(`| Build | ${statusIcon(BUILD_OUTCOME)} ${statusLabel(BUILD_OUTCOME)} |`);
lines.push(`| E2E tests (after) | ${statusIcon(E2E_AFTER_OUTCOME)} ${statusLabel(E2E_AFTER_OUTCOME)} |`);
lines.push(`| Visual regression | ${statusIcon(VISUAL_OUTCOME)} ${visualSummaryLabel} |`);
lines.push('');

// Applied updates
if (applied.length > 0) {
  lines.push('### :arrow_up: Applied Updates (patch & minor)');
  lines.push('');
  lines.push('| Package | From | To | Type |');
  lines.push('|---------|------|----|------|');
  for (const { pkg, from, to, type } of applied) {
    lines.push(`| \`${pkg}\` | ${from} | ${to} | ${type} |`);
  }
  lines.push('');
} else {
  lines.push('### :arrow_up: Applied Updates');
  lines.push('');
  lines.push('No patch or minor updates were available.');
  lines.push('');
}

// Skipped updates
if (skipped.length > 0) {
  lines.push('### :warning: Skipped Updates (major / breaking)');
  lines.push('');
  lines.push('> These require manual review and testing. For `@nx/*` packages, use `nx migrate`.');
  lines.push('');
  lines.push('| Package | Available | Type |');
  lines.push('|---------|-----------|------|');
  for (const { pkg, available, type } of skipped) {
    lines.push(`| \`${pkg}\` | ${available} | ${type} |`);
  }
  lines.push('');
} else {
  lines.push('### :white_check_mark: No Major Updates Pending');
  lines.push('');
  lines.push('All dependencies are up to date within their current major versions.');
  lines.push('');
}

// Visual regression
lines.push('### :camera: Visual Regression');
lines.push('');
if (VISUAL_OUTCOME === 'skipped') {
  lines.push(':construction: Visual regression tests were skipped (build may have failed).');
} else if (VISUAL_OUTCOME === 'success') {
  lines.push(':white_check_mark: No visual differences detected across all pages and themes.');
} else {
  lines.push(':warning: Visual differences detected:');
  lines.push('');
  lines.push('| Page | Status |');
  lines.push('|------|--------|');
  for (const { name, changed } of visualStatus) {
    const icon = changed ? ':warning: Changed' : ':white_check_mark: No change';
    lines.push(`| ${name} | ${icon} |`);
  }
  lines.push('');
  lines.push('> Diff images are available in the **visual-regression-diffs** workflow artifact.');
}
if (playwrightUpdated) {
  lines.push('');
  lines.push(
    '> :information_source: `@playwright/test` was updated. Visual diffs may be caused by browser rendering changes, not actual style regressions.',
  );
}
lines.push('');

// E2E results
lines.push('### :test_tube: E2E Test Results');
lines.push('');
if (E2E_AFTER_OUTCOME === 'success') {
  lines.push(':white_check_mark: All functional E2E tests passed after updates.');
} else if (E2E_AFTER_OUTCOME === 'failure') {
  lines.push(':x: Some E2E tests failed after updates. Review the workflow logs for details.');
} else {
  lines.push(':construction: E2E tests were skipped (build may have failed).');
}
lines.push('');

// Footer
lines.push('---');
lines.push('');
lines.push('_Generated automatically by the dependency update workflow._');

const markdown = lines.join('\n');
writeFileSync(REPORT_OUTPUT, markdown);
console.log(`Report written to ${REPORT_OUTPUT} (${applied.length} applied, ${skipped.length} skipped)`);
