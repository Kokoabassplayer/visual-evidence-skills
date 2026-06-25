---
name: github-visual-evidence-comments
description: "Use when the user needs a GitHub issue or pull request comment that includes screenshot-based visual evidence, annotated images, preview or source URLs, validation notes, before/after captures, or a concise business/technical evidence reply."
---

# GitHub Visual Evidence Comments

## Overview

Prepare GitHub issue or pull request comments that help reviewers see proof quickly. Use visual evidence annotations for the screenshot work, then write a comment that embeds reachable images, names the source, and states what the evidence proves.

## Relationship To Visual Evidence

Use `visual-evidence-annotations` for the capture and markup portion when available. This skill starts after or alongside that work: it packages the marked screenshot into a GitHub-ready comment.

## Core Rules

- Post only to the exact GitHub issue or PR the user named or confirmed.
- Use evidence from the same source the reviewer cares about: preview URL, production URL, staging app, document, or supplied screenshot.
- Never embed local filesystem paths in a GitHub comment. Images must be uploaded, committed, or otherwise reachable by the target audience.
- Keep the comment concise: status, source, what to look at, validation, evidence image.
- Separate facts from assumptions. Say what the screenshot proves, not what you hope it proves.
- Do not close issues, add resolving keywords, merge PRs, or change labels unless the user asked for that workflow separately.
- Do not expose secrets, tokens, private customer data, or unrelated personal information in screenshots or comment text.

## Workflow

1. Resolve the GitHub target.
   - Identify whether the destination is an issue, pull request, review thread, or a draft for the user to post.
   - Read the target issue/PR context when needed so the comment addresses the actual request.
   - If the target is ambiguous, ask before posting.

2. Produce or locate evidence.
   - Use `visual-evidence-annotations` to capture and mark the exact area.
   - Verify that the annotated image opens, is readable, and points to the correct evidence.
   - For before/after proof, make the screenshots comparable: same viewport, account, filters, and source when practical.

3. Make images GitHub-reachable.
   - Prefer committed repo evidence files such as `docs/screenshots/<descriptive-name>.png` when the repo workflow accepts evidence artifacts.
   - Otherwise use an approved image upload or asset URL that the intended reviewers can access.
   - Before posting, confirm the comment will not contain `C:\`, `/Users/`, `file://`, or other local-only paths.

4. Draft the comment.
   - Start with the result in one sentence.
   - Include the source URL or file/page used for the capture.
   - List the validation that matters, not every command run.
   - Embed the image close to the sentence it supports.
   - Mention if visible markers are screenshot annotations and are not part of the product UI.

5. Post or hand off.
   - If posting directly, use a body file or structured connector call so markdown newlines render correctly.
   - If the user only asked for a draft, return the exact markdown without posting.
   - After posting, provide the resulting GitHub comment URL when the tool returns one.

## Comment Template

```markdown
Implemented and verified on the requested source.

Source: <preview, production, staging, document, or screenshot source>
Validation: <short validation summary>

What to look at: <one sentence explaining the marked area>

![<short alt text>](<reachable image URL>)

Note: the red/orange markers are screenshot annotations for review evidence only; they are not part of the product UI.
```

For before/after evidence:

```markdown
Verified the requested change on <source>.

Before:
![Before - <short alt text>](<reachable before image URL>)

After:
![After - <short alt text>](<reachable after image URL>)

Change shown: <one sentence comparing the images>
Validation: <short validation summary>
```

For a superseded request:

```markdown
This request is superseded by <new issue/PR/reference>.

Evidence and validation are now tracked there: <link>
No closing keyword is included here so this issue is not auto-closed by mistake.
```

## Bundled CLI Helper

When command execution is available, use the bundled helper to draft reviewer-ready markdown after the evidence image has a reachable URL:

```bash
node scripts/visual-evidence.mjs github-comment --source "<preview-url>" --image "<reachable-image-url>" --validation "Preview smoke test passed." --look "The marked area shows the requested change."
```

The helper refuses local image paths because GitHub comments need images the intended reviewers can open.
## CLI Pattern

Use a body file to avoid broken markdown formatting:

```bash
gh issue comment <issue-number> --body-file comment.md
```

```bash
gh pr comment <pr-number> --body-file comment.md
```

If using a GitHub connector or app, still prepare the same final body and confirm the target before writing.

## Quality Checklist

Before posting, verify:

- Correct issue or PR target
- Correct source URL/file/page
- Evidence image opens and is readable
- Image URL is reachable by reviewers
- Annotation points to the exact item discussed
- Comment has no local file paths
- Comment has no secrets or unrelated sensitive data
- No accidental closing keywords unless requested
- Final comment URL is returned or captured after posting