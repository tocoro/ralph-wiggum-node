---
description: "Explain Ralph Wiggum technique and available commands"
---

# Ralph Wiggum Plugin Help (Node.js Version)

The Ralph Wiggum technique creates a self-referential loop where Claude Code repeatedly works on the same prompt, seeing its previous work in files and git history. This Windows-compatible version uses Node.js instead of Bash scripts.

## Available Commands

### `/ralph-wiggum-node:ralph-loop PROMPT [OPTIONS]`

Starts a Ralph loop in your current session.

**Options:**
- `--max-iterations N` - Stop after N iterations (default: unlimited)
- `--completion-promise "TEXT"` - Stop when Claude outputs `<promise>TEXT</promise>`

**Examples:**
```
/ralph-wiggum-node:ralph-loop Build a REST API --completion-promise "DONE" --max-iterations 20
/ralph-wiggum-node:ralph-loop Fix the auth bug --max-iterations 10
/ralph-wiggum-node:ralph-loop Refactor the cache layer
```

### `/ralph-wiggum-node:cancel-ralph`

Cancels an active Ralph loop.

## How It Works

1. When you run `/ralph-loop`, a state file is created at `.claude/ralph-loop.local.md`
2. A stop hook monitors session exits
3. When you try to exit, the hook:
   - Checks if the completion promise was met
   - If not, blocks the exit and feeds the same prompt back
   - Increments the iteration counter
4. You see your previous work in files, allowing iterative improvement

## Completion Promise

When using `--completion-promise`, output this exact format to complete:

```
<promise>YOUR_PROMISE_TEXT</promise>
```

**IMPORTANT:** Only output the promise when it's genuinely TRUE. Do not lie to escape the loop.

## Monitoring

Check current iteration (PowerShell):
```powershell
Get-Content .claude/ralph-loop.local.md | Select-String "^iteration:"
```

View full state:
```powershell
Get-Content .claude/ralph-loop.local.md -Head 10
```

## Differences from Original

This Node.js version:
- Works on Windows without WSL or Git Bash
- Uses `.mjs` files instead of `.sh` scripts
- Same functionality as the original Bash version
