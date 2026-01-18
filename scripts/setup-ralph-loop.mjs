#!/usr/bin/env node

/**
 * Ralph Loop Setup Script (Node.js version)
 * Creates state file for in-session Ralph loop
 * Windows-compatible replacement for setup-ralph-loop.sh
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('-h') || args.includes('--help')) {
  console.log(`
Ralph Loop - Interactive self-referential development loop

USAGE:
  /ralph-loop [PROMPT...] [OPTIONS]

ARGUMENTS:
  PROMPT...    Initial prompt to start the loop (can be multiple words without quotes)

OPTIONS:
  --max-iterations <n>           Maximum iterations before auto-stop (default: unlimited)
  --completion-promise '<text>'  Promise phrase (USE QUOTES for multi-word)
  -h, --help                     Show this help message

DESCRIPTION:
  Starts a Ralph Wiggum loop in your CURRENT session. The stop hook prevents
  exit and feeds your output back as input until completion or iteration limit.

  To signal completion, you must output: <promise>YOUR_PHRASE</promise>

  Use this for:
  - Interactive iteration where you want to see progress
  - Tasks requiring self-correction and refinement
  - Learning how Ralph works

EXAMPLES:
  /ralph-loop Build a todo API --completion-promise 'DONE' --max-iterations 20
  /ralph-loop --max-iterations 10 Fix the auth bug
  /ralph-loop Refactor cache layer  (runs forever)
  /ralph-loop --completion-promise 'TASK COMPLETE' Create a REST API

STOPPING:
  Only by reaching --max-iterations or detecting --completion-promise
  No manual stop - Ralph runs infinitely by default!

MONITORING:
  # View current iteration (PowerShell):
  Get-Content .claude/ralph-loop.local.md | Select-String "^iteration:"

  # View full state:
  Get-Content .claude/ralph-loop.local.md -Head 10
`);
  process.exit(0);
}

// Parse arguments
let maxIterations = 0;
let completionPromise = 'null';
const promptParts = [];

let i = 0;
while (i < args.length) {
  const arg = args[i];

  if (arg === '--max-iterations') {
    i++;
    if (i >= args.length || !args[i]) {
      console.error('❌ Error: --max-iterations requires a number argument');
      console.error('');
      console.error('   Valid examples:');
      console.error('     --max-iterations 10');
      console.error('     --max-iterations 50');
      console.error('     --max-iterations 0  (unlimited)');
      process.exit(1);
    }
    const val = args[i];
    if (!/^\d+$/.test(val)) {
      console.error(`❌ Error: --max-iterations must be a positive integer or 0, got: ${val}`);
      console.error('');
      console.error('   Valid examples:');
      console.error('     --max-iterations 10');
      console.error('     --max-iterations 50');
      console.error('     --max-iterations 0  (unlimited)');
      process.exit(1);
    }
    maxIterations = parseInt(val, 10);
  } else if (arg === '--completion-promise') {
    i++;
    if (i >= args.length || !args[i]) {
      console.error('❌ Error: --completion-promise requires a text argument');
      console.error('');
      console.error('   Valid examples:');
      console.error('     --completion-promise "DONE"');
      console.error('     --completion-promise "TASK COMPLETE"');
      console.error('');
      console.error('   Note: Multi-word promises must be quoted!');
      process.exit(1);
    }
    completionPromise = args[i];
  } else {
    promptParts.push(arg);
  }
  i++;
}

const prompt = promptParts.join(' ');

if (!prompt) {
  console.error('❌ Error: No prompt provided');
  console.error('');
  console.error('   Ralph needs a task description to work on.');
  console.error('');
  console.error('   Examples:');
  console.error('     /ralph-loop Build a REST API for todos');
  console.error('     /ralph-loop Fix the auth bug --max-iterations 20');
  console.error('     /ralph-loop --completion-promise "DONE" Refactor code');
  console.error('');
  console.error('   For all options: /ralph-loop --help');
  process.exit(1);
}

// Create .claude directory if it doesn't exist
const claudeDir = '.claude';
if (!existsSync(claudeDir)) {
  mkdirSync(claudeDir, { recursive: true });
}

// Format completion promise for YAML
const completionPromiseYaml = completionPromise !== 'null'
  ? `"${completionPromise}"`
  : 'null';

// Create state file content
const now = new Date().toISOString();
const stateContent = `---
active: true
iteration: 1
max_iterations: ${maxIterations}
completion_promise: ${completionPromiseYaml}
started_at: "${now}"
---

${prompt}
`;

// Write state file
const stateFile = join(claudeDir, 'ralph-loop.local.md');
writeFileSync(stateFile, stateContent, 'utf8');

// Output setup message
console.log(`🔄 Ralph loop activated in this session!

Iteration: 1
Max iterations: ${maxIterations > 0 ? maxIterations : 'unlimited'}
Completion promise: ${completionPromise !== 'null' ? `${completionPromise} (ONLY output when TRUE - do not lie!)` : 'none (runs forever)'}

The stop hook is now active. When you try to exit, the SAME PROMPT will be
fed back to you. You'll see your previous work in files, creating a
self-referential loop where you iteratively improve on the same task.

To monitor: Get-Content .claude/ralph-loop.local.md -Head 10

⚠️  WARNING: This loop cannot be stopped manually! It will run infinitely
    unless you set --max-iterations or --completion-promise.

🔄`);

// Output the prompt
console.log('');
console.log(prompt);

// Display completion promise requirements if set
if (completionPromise !== 'null') {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('CRITICAL - Ralph Loop Completion Promise');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('To complete this loop, output this EXACT text:');
  console.log(`  <promise>${completionPromise}</promise>`);
  console.log('');
  console.log('STRICT REQUIREMENTS (DO NOT VIOLATE):');
  console.log('  ✓ Use <promise> XML tags EXACTLY as shown above');
  console.log('  ✓ The statement MUST be completely and unequivocally TRUE');
  console.log('  ✓ Do NOT output false statements to exit the loop');
  console.log('  ✓ Do NOT lie even if you think you should exit');
  console.log('');
  console.log('IMPORTANT - Do not circumvent the loop:');
  console.log('  Even if you believe you\'re stuck, the task is impossible,');
  console.log('  or you\'ve been running too long - you MUST NOT output a');
  console.log('  false promise statement. The loop is designed to continue');
  console.log('  until the promise is GENUINELY TRUE. Trust the process.');
  console.log('');
  console.log('  If the loop should stop, the promise statement will become');
  console.log('  true naturally. Do not force it by lying.');
  console.log('═══════════════════════════════════════════════════════════');
}
