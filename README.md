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

## Requirements

- Node.js (comes with Claude Code)
- Claude Code CLI

## Credits

Based on the original [Ralph Wiggum plugin](https://github.com/anthropics/claude-code-plugins/tree/main/ralph-wiggum) by Daisy Hollman (Anthropic).

## License

Same as the original Ralph Wiggum plugin.
