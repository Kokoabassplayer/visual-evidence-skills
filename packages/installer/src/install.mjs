import { access, cp, mkdir, writeFile } from 'node:fs/promises';
import { constants, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SKILL_NAMES = ['visual-evidence-annotations', 'github-visual-evidence-comments'];
export const HARNESS_TARGETS = ['claude-code', 'codex', 'openclaw', 'gemini-cli', 'generic'];

export function planInstall(options = {}) {
  const home = options.home || os.homedir();
  const targets = normalizeTargets(options.targets || ['generic']);
  return targets.map((target) => ({ target, root: destinationFor(target, home) }));
}

export async function installVisualEvidence(options = {}) {
  const repoRoot = options.repoRoot || resolveRepoRoot();
  const targets = normalizeTargets(options.targets || detectTargets({ home: options.home }));
  const plan = planInstall({ targets, home: options.home, platform: options.platform });
  const actions = [];

  for (const item of plan) {
    const root = options.dest ? destinationUnder(options.dest, item.target) : item.root;
    actions.push(...actionsForTarget({ target: item.target, root, repoRoot }));
    if (!options.dryRun) {
      await installTarget({ target: item.target, root, repoRoot });
    }
  }

  return { dryRun: Boolean(options.dryRun), targets, actions };
}

export function normalizeTargets(targets) {
  const list = Array.isArray(targets) ? targets : String(targets).split(',');
  const expanded = list.flatMap((target) => String(target).trim() === 'all' ? HARNESS_TARGETS : [String(target).trim()]).filter(Boolean);
  const unique = [...new Set(expanded)];
  for (const target of unique) {
    if (!HARNESS_TARGETS.includes(target)) {
      throw new Error(`Unsupported install target: ${target}`);
    }
  }
  return unique.length ? unique : ['generic'];
}

function destinationFor(target, home) {
  if (target === 'claude-code') return path.join(home, '.claude', 'skills', 'visual-evidence');
  if (target === 'codex') return path.join(home, '.codex', 'skills');
  if (target === 'openclaw') return path.join(home, '.openclaw', 'skills');
  if (target === 'gemini-cli') return path.join(home, '.gemini', 'visual-evidence');
  return path.join(home, '.agents', 'skills');
}

function destinationUnder(dest, target) {
  if (target === 'claude-code') return path.join(dest, 'claude-code', 'visual-evidence');
  if (target === 'gemini-cli') return path.join(dest, 'gemini-cli', 'visual-evidence');
  if (target === 'generic') return path.join(dest, 'skills');
  return path.join(dest, target, 'skills');
}

function actionsForTarget({ target, root }) {
  const skillRoot = skillRootForTarget(target, root);
  const actions = SKILL_NAMES.map((skill) => ({ type: 'copy-skill', target, skill, to: path.join(skillRoot, skill) }));
  if (target === 'claude-code') actions.unshift({ type: 'write-manifest', target, to: path.join(root, '.claude-plugin', 'plugin.json') });
  if (target === 'gemini-cli') actions.push({ type: 'write-context', target, to: path.join(root, 'GEMINI.md') });
  return actions;
}

async function installTarget({ target, root, repoRoot }) {
  const skillRoot = skillRootForTarget(target, root);
  await mkdir(skillRoot, { recursive: true });
  for (const skill of SKILL_NAMES) {
    await copySkill({ repoRoot, skill, destination: path.join(skillRoot, skill) });
  }
  if (target === 'claude-code') {
    await writeClaudeManifest(root);
  }
  if (target === 'gemini-cli') {
    await writeGeminiContext(root);
  }
}

function skillRootForTarget(target, root) {
  if (target === 'claude-code') return path.join(root, 'skills');
  if (target === 'gemini-cli') return path.join(root, 'skills');
  return root;
}

async function copySkill({ repoRoot, skill, destination }) {
  const source = await resolveSkillSource(repoRoot, skill);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true, force: true });
}

async function resolveSkillSource(repoRoot, skill) {
  const candidates = [path.join(repoRoot, 'skills', skill), path.join(repoRoot, skill)];
  for (const candidate of candidates) {
    try {
      await access(path.join(candidate, 'SKILL.md'), constants.F_OK);
      return candidate;
    } catch {
      // try next candidate
    }
  }
  throw new Error(`Cannot find skill source for ${skill}.`);
}

async function writeClaudeManifest(root) {
  const manifest = {
    name: 'visual-evidence',
    description: 'Capture, annotate, and share screenshot-based visual evidence.',
    version: '0.1.0',
    author: { name: 'Kokoabassplayer' },
    homepage: 'https://kokoabassplayer.github.io/visual-evidence-skills/',
    repository: 'https://github.com/Kokoabassplayer/visual-evidence-skills',
    license: 'MIT',
  };
  const dir = path.join(root, '.claude-plugin');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'plugin.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

async function writeGeminiContext(root) {
  const body = `# Visual Evidence Skills\n\nUse the skills in ./skills when the user asks for screenshot-based visual evidence or GitHub comments with annotated evidence. Prefer the bundled Node helper at ./skills/visual-evidence-annotations/scripts/visual-evidence.mjs when command execution is available.\n`;
  await mkdir(root, { recursive: true });
  await writeFile(path.join(root, 'GEMINI.md'), body);
}

export function detectTargets(options = {}) {
  const home = options.home || os.homedir();
  const found = [];
  if (existsSync(path.join(home, '.claude'))) found.push('claude-code');
  if (existsSync(path.join(home, '.codex'))) found.push('codex');
  if (existsSync(path.join(home, '.openclaw'))) found.push('openclaw');
  if (existsSync(path.join(home, '.gemini'))) found.push('gemini-cli');
  return found.length ? found : ['generic'];
}

function resolveRepoRoot() {
  if (process.env.VISUAL_EVIDENCE_REPO_ROOT) return process.env.VISUAL_EVIDENCE_REPO_ROOT;
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
}

export async function runInstaller(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const target = args.target || 'auto';
  const targets = target === 'auto' ? detectTargets() : normalizeTargets(target);
  const result = await installVisualEvidence({
    targets,
    dest: args.dest,
    dryRun: Boolean(args['dry-run']),
    yes: Boolean(args.yes),
  });
  printResult(result);
  return result;
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    args[key] = argv[index + 1] && !argv[index + 1].startsWith('--') ? argv[++index] : true;
  }
  return args;
}

function printResult(result) {
  console.log(result.dryRun ? 'Visual Evidence dry run complete.' : 'Visual Evidence installed.');
  console.log('\nTargets:');
  for (const target of result.targets) console.log(`- ${target}`);
  console.log('\nTry:');
  console.log('Use visual-evidence to capture this page and circle the wrong number.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runInstaller().catch((error) => {
    console.error(`visual-evidence installer: ${error.message}`);
    process.exitCode = 1;
  });
}