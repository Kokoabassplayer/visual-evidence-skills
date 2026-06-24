# Visual Evidence Skills

Reusable Codex skills for screenshot-based visual evidence.

This repository contains two installable skills:

- `visual-evidence-annotations` - the universal skill for capturing a screen, webpage, app, document, dashboard, or supplied image and marking the exact area with circles, boxes, arrows, pins, short labels, or callouts.
- `github-visual-evidence-comments` - the GitHub companion workflow for preparing issue or pull request comments that include reachable annotated evidence images, source URLs, and concise validation notes.

The idea is simple: make business and technical review faster by showing the exact evidence instead of relying on long written explanations.

## GitHub Pages

Project site: https://kokoabassplayer.github.io/visual-evidence-skills/

## Install

Copy one or both skill folders into your Codex skills directory.

Common locations:

```text
~/.codex/skills/visual-evidence-annotations
~/.codex/skills/github-visual-evidence-comments
~/.agents/skills/visual-evidence-annotations
~/.agents/skills/github-visual-evidence-comments
```

On Windows, that may be:

```text
%USERPROFILE%\.codex\skills\visual-evidence-annotations
%USERPROFILE%\.codex\skills\github-visual-evidence-comments
```

Restart or reload your agent session so the skill metadata is discovered.

## Use

Universal visual evidence:

```text
Use $visual-evidence-annotations to capture this page and mark the field that is wrong.
```

GitHub evidence comment:

```text
Use $github-visual-evidence-comments to prepare a GitHub issue comment with the annotated screenshot evidence.
```

Before/after evidence:

```text
Use $visual-evidence-annotations to create before and after screenshots with clear callouts, then use $github-visual-evidence-comments to draft the PR comment.
```

## What This Does Not Include

The universal visual skill does not include GitHub, PR, ticket, approval, or commit workflow steps. The GitHub companion skill adds only the evidence-comment workflow. It still does not close issues, merge PRs, change labels, or add resolving keywords unless the user separately asks for that.

## Contents

```text
visual-evidence-annotations/
  SKILL.md
  agents/
    openai.yaml

github-visual-evidence-comments/
  SKILL.md
  agents/
    openai.yaml

docs/
  index.html
  styles.css
  assets/
    evidence-preview.png
```

## License

MIT