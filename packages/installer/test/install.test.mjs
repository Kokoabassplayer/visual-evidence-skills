import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installVisualEvidence, planInstall } from '../src/install.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

async function exists(file) {
  try {
    await access(file, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

describe('visual-evidence installer', () => {
  it('installs generic Agent Skills into an explicit destination', async () => {
    const dest = await mkdtemp(path.join(tmpdir(), 've-install-'));

    const result = await installVisualEvidence({
      repoRoot,
      targets: ['generic'],
      dest,
      yes: true,
    });

    assert.deepEqual(result.targets, ['generic']);
    const annotationSkill = path.join(dest, 'skills', 'visual-evidence-annotations', 'SKILL.md');
    const githubSkill = path.join(dest, 'skills', 'github-visual-evidence-comments', 'SKILL.md');
    assert.equal(await exists(annotationSkill), true);
    assert.equal(await exists(githubSkill), true);

    const content = await readFile(annotationSkill, 'utf8');
    assert.match(content, /Visual Evidence Annotations/);
  });

  it('dry-run reports planned actions without writing files', async () => {
    const dest = path.join(await mkdtemp(path.join(tmpdir(), 've-dry-')), 'install-root');

    const result = await installVisualEvidence({
      repoRoot,
      targets: ['generic'],
      dest,
      dryRun: true,
      yes: true,
    });

    assert.equal(result.dryRun, true);
    assert.equal(result.actions.some((action) => action.type === 'copy-skill'), true);
    assert.equal(await exists(dest), false);
  });

  it('plans all explicit harness targets with stable destination roots', () => {
    const home = path.join('C:', 'Users', 'Example');
    const plan = planInstall({
      targets: ['claude-code', 'codex', 'openclaw', 'gemini-cli', 'generic'],
      home,
      platform: 'win32',
    });

    assert.equal(plan.length, 5);
    assert.equal(plan.find((item) => item.target === 'claude-code').root.endsWith(path.join('.claude', 'skills', 'visual-evidence')), true);
    assert.equal(plan.find((item) => item.target === 'codex').root.endsWith(path.join('.codex', 'skills')), true);
    assert.equal(plan.find((item) => item.target === 'openclaw').root.endsWith(path.join('.openclaw', 'skills')), true);
    assert.equal(plan.find((item) => item.target === 'gemini-cli').root.endsWith(path.join('.gemini', 'visual-evidence')), true);
    assert.equal(plan.find((item) => item.target === 'generic').root.endsWith(path.join('.agents', 'skills')), true);
  });
});