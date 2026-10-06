# kelab.aman

Claude Code tooling for this repo. When you open the repo in Claude Code and trust the folder, `.claude/settings.json` adds the plugin marketplaces below and turns on the listed plugins. Some tools need a local install or an API key, so you set those up yourself. The steps are further down.

## Enabled automatically (`.claude/settings.json`)

| Plugin | Source | What it does |
| --- | --- | --- |
| `claude-code-setup@claude-plugins-official` | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | Looks at the codebase and suggests hooks, skills, MCP servers and subagents |
| `superpowers@superpowers-dev` | [obra/superpowers](https://github.com/obra/superpowers) | Core skills library: TDD, debugging, brainstorming/planning workflows |
| `caveman@caveman` | [juliusbrussee/caveman](https://github.com/juliusbrussee/caveman) | Terse "caveman" output style that cuts tokens. Starts every session; say `stop caveman` to turn it off |
| `document-skills@anthropic-agent-skills` | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills) | xlsx / docx / pptx / pdf skills |
| `example-skills@anthropic-agent-skills` | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills) | skill-creator, mcp-builder, frontend-design, webapp-testing and more |
| `task-observer@one-skill-to-rule-them-all` | [rebelytics/one-skill-to-rule-them-all](https://github.com/rebelytics/one-skill-to-rule-them-all) | Meta-skill that watches how your other skills perform and suggests improvements |
| `mobile-mcp@mobile-mcp` | [mobile-next/mobile-mcp](https://github.com/mobile-next/mobile-mcp) | MCP server for Android/iOS automation (simulators, emulators, real devices). Needs Node.js, plus Xcode or the Android SDK |

To turn off a plugin just for yourself, set it to `false` under `enabledPlugins` in `.claude/settings.local.json`. That file is not committed.

### Task Observer activation

Installing the plugin doesn't activate Task Observer reliably. Add the activation instruction from its [`references/environments.md`](https://github.com/rebelytics/one-skill-to-rule-them-all) to a `CLAUDE.md` file. If `skill-observations/observation-log/` hasn't appeared after a few sessions, the skill never activated.

## Registered but off by default

| Plugin | Why it's off | Turn it on |
| --- | --- | --- |
| `headroom@headroom-marketplace` ([headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom)) | Its hooks run `headroom init hook ensure` at session start and before every Bash call, so anyone without the `headroom` CLI would hit errors | `uv tool install --python 3.13 "headroom-ai[all]"`, then add `"headroom@headroom-marketplace": true` to your `.claude/settings.local.json`, or run `headroom wrap claude` |

## Set up yourself

### claude-code-security-review (GitHub Action)

[anthropics/claude-code-security-review](https://github.com/anthropics/claude-code-security-review) runs from `.github/workflows/security-review.yml` on every pull request and leaves review comments on it.

- Add a repository secret named `CLAUDE_API_KEY`. The key must be enabled for both the Claude API and Claude Code. Until the secret exists, the job skips itself instead of failing.
- The action is not hardened against prompt injection. Turn on "Require approval for all external contributors" in the repo's Actions settings.
- To run the same review locally, use `/security-review` in Claude Code.

### graphify

[Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) builds a knowledge graph out of a folder of code, docs, PDFs and images. It installs as a user-level skill and needs Python 3.10+:

```bash
pip install graphifyy && graphify install   # or: pipx install graphifyy && graphify install
```

Then run `/graphify .` in Claude Code. The output goes to `graphify-out/`, which is in `.gitignore`.

### OmniRoute

[diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) is a local AI gateway. It exposes one OpenAI/Anthropic-compatible endpoint and falls back across subscription, API-key, cheap and free providers. It runs as a local server, not as a Claude Code plugin:

```bash
npm i -g omniroute        # server starts on http://localhost:20128
```

Point your tools at `http://localhost:20128/v1`. To run Claude Code through it, follow OmniRoute's own Claude Code guide. Don't commit a base-URL override to this repo's settings, because it would send everyone's traffic to a server they may not run.

## Reference

- [liquidslr/system-design-notes](https://github.com/liquidslr/system-design-notes): system design study notes. It's for reading, there's nothing to install.
