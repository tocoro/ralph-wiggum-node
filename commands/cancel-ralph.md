---
description: "Cancel active Ralph Wiggum loop"
---

# Cancel Ralph

To cancel the Ralph loop:

1. Check if `.claude/ralph-loop.local.md` exists using Bash: `node -e "console.log(require('fs').existsSync('.claude/ralph-loop.local.md') ? 'EXISTS' : 'NOT_FOUND')"`

2. **If NOT_FOUND**: Say "No active Ralph loop found."

3. **If EXISTS**:
   - Read `.claude/ralph-loop.local.md` to get the current iteration number from the `iteration:` field
   - Remove the file using Bash: `node -e "require('fs').unlinkSync('.claude/ralph-loop.local.md')"`
   - Report: "Cancelled Ralph loop (was at iteration N)" where N is the iteration value
