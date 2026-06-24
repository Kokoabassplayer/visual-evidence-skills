# Visual Evidence Skills

Reusable Codex skills for screenshot-based visual evidence.

This repository contains two installable skills:

- `visual-evidence-annotations` - the universal skill for capturing a screen, webpage, app, document, dashboard, or supplied image and marking the exact area with circles, boxes, arrows, pins, short labels, or callouts.
- `github-visual-evidence-comments` - the GitHub companion workflow for preparing issue or pull request comments that include reachable annotated evidence images, source URLs, and concise validation notes.

The idea is simple: make business and technical review faster by showing the exact evidence instead of relying on long written explanations.

## GitHub Pages

Project site: https://kokoabassplayer.github.io/visual-evidence-skills/

## Sponsor This Work

If this workflow helps your team review faster, you can support the project through GitHub Sponsors:

https://github.com/sponsors/Kokoabassplayer

Sponsorship is optional support for the open-source project. It helps fund better examples, documentation, automation scripts, and GitHub comment templates. It does not create a support SLA, custom-work guarantee, or paid-service obligation unless we separately agree on that.

## Visual Guide

This is the kind of result the skills are meant to produce: one screenshot, clear context, and precise visual callouts around the evidence.

![Annotated browser screenshot showing red and orange callouts around exact review evidence areas.](docs/assets/evidence-preview.png)

### What The Result Should Look Like

| Visual element | Use it for | Good result |
| --- | --- | --- |
| Circle | Small controls, numbers, icons, or short labels | The target is obvious without covering it. |
| Box | Text blocks, table rows, cards, formulas, or wide UI regions | The reviewer can still read the marked content. |
| Arrow or pin | Showing relationship, movement, or a hard-to-find target | The marker points to the exact evidence, not just the general area. |
| Short label | When the mark alone is ambiguous | The label says what the screenshot proves in one sentence. |

### How To Use The Skills Together

1. Capture and mark the evidence:

```text
Use $visual-evidence-annotations to capture the preview page and mark the formula text that does not match the site typography.
```

2. Turn the marked screenshot into a GitHub-ready comment:

```text
Use $github-visual-evidence-comments to draft a GitHub issue comment using this annotated screenshot, the preview URL, and a short validation note.
```

3. Expected GitHub comment shape:

```markdown
Verified on the preview site.

Source: <preview or production URL>
Validation: <short validation summary>

What to look at: the marked area shows <specific visible evidence>.

![Annotated evidence](<reachable image URL>)

Note: the red/orange markers are screenshot annotations for review evidence only; they are not part of the product UI.
```

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

.github/
  FUNDING.yml

docs/
  index.html
  styles.css
  assets/
    evidence-preview.png
```

## License

MIT