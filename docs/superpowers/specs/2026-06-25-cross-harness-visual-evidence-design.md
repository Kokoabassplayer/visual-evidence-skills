# Cross-Harness Visual Evidence Design

Date: 2026-06-25
Status: Approved design direction
Repository: visual-evidence-skills

## Goal

Make Visual Evidence useful for people using different AI harnesses for the first time. A user should be able to run one install command, restart or reload their harness if needed, and ask the agent to capture and mark visual proof with consistent quality.

The product should remain portable across AI tools by using the Agent Skills format as the core package, then add native adapters for harnesses that support plugins or special installation paths.

## Non-Goals

- Do not make one proprietary plugin format the source of truth.
- Do not require users to manually copy skill folders for the normal install path.
- Do not require GitHub workflow knowledge to use the universal annotation skill.
- Do not automate issue closing, PR merging, label changes, approvals, or resolving keywords.
- Do not depend on one OS, shell, browser, or AI harness.

## Target Users

- A first-time Claude Code, Codex, OpenClaw, Gemini CLI, or other AI harness user.
- A business reviewer who needs screenshot evidence that points to the exact visible issue.
- A technical reviewer who needs a repeatable evidence workflow for GitHub issues and PRs.
- A dual-OS user who moves between Windows and macOS, plus Linux users.

## Requirements

### One-Command Install

Primary install command:

```bash
npx @visual-evidence/install@latest
```

Fallback launchers:

```bash
curl -fsSL https://visual-evidence.dev/install.sh | sh
```

```powershell
irm https://visual-evidence.dev/install.ps1 | iex
```

The installer must:

1. Detect the OS and shell.
2. Detect installed harnesses.
3. Install the best supported package for each detected harness.
4. Install the portable Agent Skills package when no native adapter is available.
5. Run a lightweight smoke test.
6. Print the exact first prompt to try.

### Cross-OS Support

Support:

- Windows 10/11
- macOS Apple Silicon and Intel
- Linux x64 and arm64
- WSL where practical

The implementation must use platform-aware path handling. Core logic should live in Node.js scripts. Shell and PowerShell files should be thin launchers only.

Expected locations:

```text
Windows:  %USERPROFILE%\.codex, %USERPROFILE%\.claude, %USERPROFILE%\.agents
macOS:    ~/.codex, ~/.claude, ~/.agents
Linux:    ~/.codex, ~/.claude, ~/.agents
OpenClaw: ~/.openclaw/skills or workspace skills
Gemini:   ~/.gemini plus project .gemini where needed
```

### Harness Compatibility

Use the Agent Skills core everywhere:

```text
skills/
  visual-evidence-annotations/
    SKILL.md
    scripts/
    references/
    assets/
  github-visual-evidence-comments/
    SKILL.md
    scripts/
    references/
    assets/
```

Add adapters around the core:

```text
adapters/
  claude-code/
  codex/
  openclaw/
  gemini-cli/
  generic/
```

Adapter responsibilities:

- Claude Code: install as a plugin with namespaced skills where possible.
- Codex: install as Codex-compatible skills or plugin, depending on current local support.
- OpenClaw: install standard skills into the expected OpenClaw skill root and add OpenClaw metadata only where useful.
- Gemini CLI: install generic skills plus a Gemini context or tool wrapper if native Agent Skills support is unavailable.
- Generic: install plain Agent Skills folders and print manual loading instructions.

## Product Architecture

Recommended repository structure:

```text
visual-evidence-skills/
  skills/
    visual-evidence-annotations/
    github-visual-evidence-comments/
  packages/
    cli/
    installer/
  adapters/
    claude-code/
    codex/
    openclaw/
    gemini-cli/
    generic/
  installers/
    install.mjs
    install.ps1
    install.sh
  docs/
    install/
    examples/
    superpowers/specs/
```

The current top-level skill folders can remain during migration, but the long-term canonical location should be `skills/`.

## CLI Design

Provide a cross-platform CLI named `visual-evidence`.

Core commands:

```bash
visual-evidence annotate image.png --box "120,80,400,160" --label "Check here"
visual-evidence annotate image.png --circle "240,160,70" --label "Wrong value"
visual-evidence capture-url https://example.com --text "Current Ratio" --label "Formula"
visual-evidence github-comment --issue 123 --image evidence.png --source https://example.com
```

The skills should instruct agents to use the CLI when available. If the CLI is unavailable, the skills should still guide agents through available browser, screenshot, or image tools.

## Visual Evidence Behavior

The output standard remains:

- Capture the exact source the reviewer cares about.
- Preserve enough surrounding context.
- Add one or more high-contrast callouts.
- Keep marked content readable.
- Verify the final image opens.
- Return or post a concise explanation of what the marked evidence proves.

The universal skill must not include GitHub workflow steps. GitHub comment packaging belongs only in `github-visual-evidence-comments`.

## GitHub Comment Behavior

The GitHub companion should:

- Confirm the exact issue or PR target.
- Use reachable image URLs, never local file paths.
- Include source URL, validation summary, and a short "what to look at" sentence.
- Avoid closing keywords unless the user explicitly asks.
- Avoid secrets, tokens, private customer data, or unrelated personal information.

## Installer Design

The installer should be idempotent. Running it twice should update or confirm the installation, not create duplicates.

Detection order:

1. Parse explicit flags, such as `--target claude-code`.
2. Detect harness binaries on `PATH`.
3. Detect known config folders.
4. If multiple harnesses are found, install all detected harnesses by default.
5. If none are found, install generic Agent Skills and print manual instructions.

Useful flags:

```bash
npx @visual-evidence/install@latest --target all
npx @visual-evidence/install@latest --target claude-code
npx @visual-evidence/install@latest --target codex
npx @visual-evidence/install@latest --target openclaw
npx @visual-evidence/install@latest --target gemini-cli
npx @visual-evidence/install@latest --dry-run
npx @visual-evidence/install@latest --yes
```

Expected success output:

```text
Visual Evidence installed.

Detected:
- Claude Code: installed plugin visual-evidence
- Codex: installed skills visual-evidence-annotations, github-visual-evidence-comments

Try:
Use visual-evidence to capture this page and circle the wrong number.
```

## Error Handling

The installer must fail with actionable messages:

- Missing Node.js: show the PowerShell or shell fallback if available.
- Permission denied: show the exact directory that could not be written.
- Harness not found: install generic skills and explain how to load them.
- Browser tooling missing: install skills anyway and say capture automation may require Playwright or harness browser tools.
- Existing conflicting skill: back up or ask before overwrite unless `--yes` is used.

## Security

The package must treat screenshots and comments as potentially sensitive.

Rules:

- Never upload screenshots automatically unless the user asks or the GitHub companion workflow requires a reachable image.
- Warn before posting public GitHub comments when screenshots may include private data.
- Avoid embedding local paths in public comments.
- Do not ask users to pipe untrusted scripts without offering an auditable `npx` or GitHub release path.
- Keep installer changes limited to documented skill/plugin locations.

## Testing

Minimum acceptance tests:

- Windows: installer runs, skills copy correctly, sample image annotation works.
- macOS: installer runs, skills copy correctly, sample image annotation works.
- Linux: installer runs, skills copy correctly, sample image annotation works.
- Claude Code: plugin or skills are visible after reload.
- Codex: skills are visible after restart or reload.
- OpenClaw: skill root install path is valid.
- Gemini CLI: adapter files are installed and generic usage instructions work.
- Generic: plain `SKILL.md` package validates against Agent Skills rules.

CLI tests:

- Annotate a sample image with box, circle, arrow, and label.
- Refuse invalid coordinates with a clear error.
- Preserve readable output dimensions.
- Generate GitHub markdown without local file paths.

## Rollout Plan

1. Restructure the repo around `skills/`, `packages/`, `adapters/`, and `installers/`.
2. Keep existing public skill folders or add compatibility links during transition.
3. Add the cross-platform annotation CLI.
4. Add the `npx` installer.
5. Add Claude Code, Codex, OpenClaw, Gemini CLI, and generic adapters.
6. Add OS and harness smoke tests.
7. Update README and GitHub Pages with one-command install.
8. Tag a first release once Windows, macOS, and Linux smoke tests pass.

## Open Questions For Implementation

- Whether the repo should be renamed from `visual-evidence-skills` to `visual-evidence`.
- Whether npm package scope should be personal, such as `@kokoabassplayer/visual-evidence`, or project-branded, such as `@visual-evidence/install`.
- Whether the installer should install all detected harnesses by default or ask when more than one is found.
- Whether screenshot capture should use Playwright bundled by the CLI or rely first on harness-native browser tools.

## References

- Agent Skills specification: https://agentskills.io/specification
- Claude Code plugins: https://code.claude.com/docs/en/plugins
- Claude Code skills: https://code.claude.com/docs/en/skills
- Gemini CLI configuration: https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/configuration.md
- OpenClaw skills: https://docs.openclaw.ai/tools/skills
