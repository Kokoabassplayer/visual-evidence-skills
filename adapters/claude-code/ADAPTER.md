# Claude Code Adapter

The installer installs the two skills as standalone Claude Code user skills, one level under the user skills directory:

- `~/.claude/skills/visual-evidence-annotations/SKILL.md`
- `~/.claude/skills/github-visual-evidence-comments/SKILL.md`

Claude Code discovers user skills at `~/.claude/skills/<name>/SKILL.md`, so each skill becomes available as soon as it is copied there. After installation, reload skills (or restart the session) if Claude Code is already running.

These are standalone skills, not a plugin: no `.claude-plugin/plugin.json` is written and the skills are not nested under a container directory. A nested `~/.claude/skills/<container>/skills/<name>/SKILL.md` layout is **not** discovered by Claude Code, which is why the installer writes them one level deep.
