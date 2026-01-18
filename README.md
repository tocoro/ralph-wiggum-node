# Ralph Wiggum Node.js

Windows-compatible Node.js implementation of the [Ralph Wiggum technique](https://github.com/anthropics/claude-code-plugins/tree/main/ralph-wiggum) for Claude Code.

## Why This Fork?

The original Ralph Wiggum plugin uses Bash scripts (`.sh` files) which don't run natively on Windows. This version replaces all shell scripts with Node.js, making it work on Windows, macOS, and Linux.

## Installation

### Option 1: Install from local directory

```bash
claude plugins add /path/to/ralph-wiggum-node
```

### Option 2: Copy to plugins directory

Copy this folder to your Claude Code plugins directory.

## Usage

### Start a Ralph Loop

```
/ralph-wiggum-node:ralph-loop "Build a REST API" --completion-promise "DONE" --max-iterations 20
```

### Cancel a Loop

```
/ralph-wiggum-node:cancel-ralph
```

### Get Help

```
/ralph-wiggum-node:help
```

## How It Works

1. **Setup Script** (`scripts/setup-ralph-loop.mjs`): Creates the loop state file
2. **Stop Hook** (`hooks/stop-hook.mjs`): Intercepts session exits and feeds the prompt back
3. **State File** (`.claude/ralph-loop.local.md`): Tracks iteration count and completion promise

## Known Issues

### Windows: `${CLAUDE_PLUGIN_ROOT}` Path Expansion Bug

On Windows, there is a known bug where `${CLAUDE_PLUGIN_ROOT}` may not expand correctly, causing path errors like:

```
Error: Cannot find module 'C:\path\to\projectUsershomedir.claudeplugins...'
```

**Workaround**: Replace `${CLAUDE_PLUGIN_ROOT}` with absolute paths in:
- `commands/ralph-loop.md`
- `hooks/hooks.json`

Example:
```
# Before
node "${CLAUDE_PLUGIN_ROOT}/scripts/setup-ralph-loop.mjs"

# After (replace with your actual path)
node "C:/Users/YOUR_USERNAME/.claude/plugins/marketplaces/ralph-wiggum-node-marketplace/scripts/setup-ralph-loop.mjs"
```

After editing, restart Claude Code (`/exit` then relaunch).

## Requirements

- Node.js (comes with Claude Code)
- Claude Code CLI

## Credits

Based on the original [Ralph Wiggum plugin](https://github.com/anthropics/claude-code-plugins/tree/main/ralph-wiggum) by Daisy Hollman (Anthropic).

## License

Same as the original Ralph Wiggum plugin.
