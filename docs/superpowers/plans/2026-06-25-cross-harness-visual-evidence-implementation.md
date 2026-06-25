# Cross-Harness Visual Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first cross-platform Visual Evidence foundation with a portable skills core, deterministic CLI helpers, one-command installer, harness adapters, tests, and updated docs.

**Architecture:** Keep Agent Skills as the portable source of truth and preserve the current top-level skill folders for backward compatibility. Add pure Node.js CLI and installer packages so Windows, macOS, and Linux use the same implementation. Provide harness adapters as install targets that copy the same skills into harness-specific locations.

**Tech Stack:** Node.js 22+, node:test, no runtime dependencies, plain Agent Skills folders, GitHub Pages static HTML/CSS.

---

## File Structure

- Create `package.json`: root package metadata, scripts, and npx installer bin.
- Create `packages/cli/src/visual-evidence.mjs`: core CLI functions for image annotation, capture-url fallback, and GitHub comment generation.
- Create `packages/cli/bin/visual-evidence.mjs`: executable CLI wrapper.
- Create `packages/cli/test/visual-evidence.test.mjs`: TDD coverage for annotate and GitHub markdown behavior.
- Create `packages/installer/src/install.mjs`: install target detection and copy logic.
- Create `packages/installer/bin/install.mjs`: executable installer wrapper.
- Create `packages/installer/test/install.test.mjs`: TDD coverage for generic installs and dry-run behavior.
- Create `skills/visual-evidence-annotations` and `skills/github-visual-evidence-comments`: canonical portable skill copies.
- Modify top-level `visual-evidence-annotations/SKILL.md` and `github-visual-evidence-comments/SKILL.md`: tell agents to use bundled CLI scripts when available.
- Add `scripts/visual-evidence.mjs` inside skill folders: copyable helper entrypoint for installed skills.
- Create `adapters/claude-code`, `adapters/codex`, `adapters/openclaw`, `adapters/gemini-cli`, and `adapters/generic`: adapter manifests and notes.
- Create `installers/install.sh` and `installers/install.ps1`: thin wrappers for Node installer.
- Modify `README.md`, `docs/index.html`, and `docs/styles.css`: document one-command install and cross-harness support.

---

### Task 1: Add CLI Tests First

**Files:**
- Create: `packages/cli/test/visual-evidence.test.mjs`

- [ ] **Step 1: Write failing tests for annotate, invalid coordinates, and GitHub comment output.**
- [ ] **Step 2: Run `node --test packages/cli/test/visual-evidence.test.mjs` and verify it fails because CLI modules do not exist.**
- [ ] **Step 3: Implement CLI core and wrapper.**
- [ ] **Step 4: Run the CLI tests and verify they pass.**

### Task 2: Add Installer Tests First

**Files:**
- Create: `packages/installer/test/install.test.mjs`

- [ ] **Step 1: Write failing tests for generic install into a temp directory and dry-run no-write behavior.**
- [ ] **Step 2: Run `node --test packages/installer/test/install.test.mjs` and verify it fails because installer modules do not exist.**
- [ ] **Step 3: Implement installer core and wrapper.**
- [ ] **Step 4: Run installer tests and verify they pass.**

### Task 3: Add Canonical Skills And Bundled Script

**Files:**
- Create/modify: `skills/**`
- Modify: top-level skill folders

- [ ] **Step 1: Copy current skill folders into `skills/` as canonical copies.**
- [ ] **Step 2: Add `scripts/visual-evidence.mjs` helper entrypoints to annotation skill folders.**
- [ ] **Step 3: Update `SKILL.md` instructions to prefer the bundled script when available.**
- [ ] **Step 4: Run skill validators for top-level and canonical skill folders.**

### Task 4: Add Harness Adapters And Install Wrappers

**Files:**
- Create: `adapters/**`
- Create: `installers/install.sh`
- Create: `installers/install.ps1`

- [ ] **Step 1: Add Claude Code plugin manifest adapter.**
- [ ] **Step 2: Add Codex, OpenClaw, Gemini CLI, and generic adapter notes.**
- [ ] **Step 3: Add shell and PowerShell launchers that call the Node installer.**
- [ ] **Step 4: Run installer dry-run for all supported targets.**

### Task 5: Update Public Documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/index.html`
- Modify: `docs/styles.css`

- [ ] **Step 1: Update README install section around `npx @visual-evidence/install@latest`.**
- [ ] **Step 2: Update GitHub Pages hero/install copy for cross-harness support.**
- [ ] **Step 3: Run lightweight HTML/content checks.**

### Task 6: Final Verification And Commit

**Files:**
- All changed files

- [ ] **Step 1: Run `npm test`.**
- [ ] **Step 2: Run skill validation for every skill folder.**
- [ ] **Step 3: Run installer dry-run for `all`, `generic`, `claude-code`, `codex`, `openclaw`, and `gemini-cli`.**
- [ ] **Step 4: Review `git diff`.**
- [ ] **Step 5: Commit and push the implementation branch.**