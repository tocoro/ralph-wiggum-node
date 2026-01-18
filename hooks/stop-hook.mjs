#!/usr/bin/env node

/**
 * Ralph Wiggum Stop Hook (Node.js version)
 * Prevents session exit when a ralph-loop is active
 * Feeds Claude's output back as input to continue the loop
 * Windows-compatible replacement for stop-hook.sh
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

// Read hook input from stdin
let hookInput = '';
const chunks = [];

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  chunks.push(chunk);
});

process.stdin.on('end', () => {
  hookInput = chunks.join('');
  main();
});

function main() {
  const stateFile = '.claude/ralph-loop.local.md';

  // Check if ralph-loop is active
  if (!existsSync(stateFile)) {
    // No active loop - allow exit
    process.exit(0);
  }

  try {
    const stateContent = readFileSync(stateFile, 'utf8');

    // Parse markdown frontmatter (YAML between ---)
    const frontmatterMatch = stateContent.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      console.error('⚠️  Ralph loop: State file corrupted');
      console.error(`   File: ${stateFile}`);
      console.error('   Problem: No valid frontmatter found');
      console.error('');
      console.error('   Ralph loop is stopping. Run /ralph-loop again to start fresh.');
      unlinkSync(stateFile);
      process.exit(0);
    }

    const frontmatter = frontmatterMatch[1];

    // Parse frontmatter values
    const iterationMatch = frontmatter.match(/^iteration:\s*(\d+)/m);
    const maxIterationsMatch = frontmatter.match(/^max_iterations:\s*(\d+)/m);
    const completionPromiseMatch = frontmatter.match(/^completion_promise:\s*"?([^"\n]*)"?/m);

    if (!iterationMatch) {
      console.error('⚠️  Ralph loop: State file corrupted');
      console.error(`   File: ${stateFile}`);
      console.error("   Problem: 'iteration' field not found or invalid");
      console.error('');
      console.error('   Ralph loop is stopping. Run /ralph-loop again to start fresh.');
      unlinkSync(stateFile);
      process.exit(0);
    }

    if (!maxIterationsMatch) {
      console.error('⚠️  Ralph loop: State file corrupted');
      console.error(`   File: ${stateFile}`);
      console.error("   Problem: 'max_iterations' field not found or invalid");
      console.error('');
      console.error('   Ralph loop is stopping. Run /ralph-loop again to start fresh.');
      unlinkSync(stateFile);
      process.exit(0);
    }

    const iteration = parseInt(iterationMatch[1], 10);
    const maxIterations = parseInt(maxIterationsMatch[1], 10);
    let completionPromise = completionPromiseMatch ? completionPromiseMatch[1] : 'null';

    // Check if max iterations reached
    if (maxIterations > 0 && iteration >= maxIterations) {
      console.log(`🛑 Ralph loop: Max iterations (${maxIterations}) reached.`);
      unlinkSync(stateFile);
      process.exit(0);
    }

    // Get transcript path from hook input
    let transcriptPath;
    try {
      const hookData = JSON.parse(hookInput);
      transcriptPath = hookData.transcript_path;
    } catch (e) {
      console.error('⚠️  Ralph loop: Failed to parse hook input');
      console.error(`   Error: ${e.message}`);
      console.error('   Ralph loop is stopping.');
      unlinkSync(stateFile);
      process.exit(0);
    }

    if (!transcriptPath || !existsSync(transcriptPath)) {
      console.error('⚠️  Ralph loop: Transcript file not found');
      console.error(`   Expected: ${transcriptPath}`);
      console.error('   This is unusual and may indicate a Claude Code internal issue.');
      console.error('   Ralph loop is stopping.');
      unlinkSync(stateFile);
      process.exit(0);
    }

    // Read transcript (JSONL format)
    const transcriptContent = readFileSync(transcriptPath, 'utf8');
    const lines = transcriptContent.split('\n').filter(line => line.trim());

    // Find last assistant message
    let lastAssistantMessage = null;
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const entry = JSON.parse(lines[i]);
        if (entry.role === 'assistant') {
          lastAssistantMessage = entry;
          break;
        }
      } catch (e) {
        // Skip invalid JSON lines
      }
    }

    if (!lastAssistantMessage) {
      console.error('⚠️  Ralph loop: No assistant messages found in transcript');
      console.error(`   Transcript: ${transcriptPath}`);
      console.error('   This is unusual and may indicate a transcript format issue');
      console.error('   Ralph loop is stopping.');
      unlinkSync(stateFile);
      process.exit(0);
    }

    // Extract text content from assistant message
    let lastOutput = '';
    if (lastAssistantMessage.message && lastAssistantMessage.message.content) {
      const textBlocks = lastAssistantMessage.message.content
        .filter(block => block.type === 'text')
        .map(block => block.text);
      lastOutput = textBlocks.join('\n');
    }

    if (!lastOutput) {
      console.error('⚠️  Ralph loop: Assistant message contained no text content');
      console.error('   Ralph loop is stopping.');
      unlinkSync(stateFile);
      process.exit(0);
    }

    // Check for completion promise
    if (completionPromise !== 'null' && completionPromise) {
      // Extract text from <promise> tags
      const promiseMatch = lastOutput.match(/<promise>([\s\S]*?)<\/promise>/);
      if (promiseMatch) {
        const promiseText = promiseMatch[1].trim().replace(/\s+/g, ' ');
        if (promiseText === completionPromise) {
          console.log(`✅ Ralph loop: Detected <promise>${completionPromise}</promise>`);
          unlinkSync(stateFile);
          process.exit(0);
        }
      }
    }

    // Not complete - continue loop with SAME PROMPT
    const nextIteration = iteration + 1;

    // Extract prompt (everything after the closing ---)
    const promptMatch = stateContent.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    const promptText = promptMatch ? promptMatch[1].trim() : '';

    if (!promptText) {
      console.error('⚠️  Ralph loop: State file corrupted or incomplete');
      console.error(`   File: ${stateFile}`);
      console.error('   Problem: No prompt text found');
      console.error('');
      console.error('   This usually means:');
      console.error('     • State file was manually edited');
      console.error('     • File was corrupted during writing');
      console.error('');
      console.error('   Ralph loop is stopping. Run /ralph-loop again to start fresh.');
      unlinkSync(stateFile);
      process.exit(0);
    }

    // Update iteration in state file
    const updatedContent = stateContent.replace(
      /^iteration:\s*\d+/m,
      `iteration: ${nextIteration}`
    );
    writeFileSync(stateFile, updatedContent, 'utf8');

    // Build system message
    let systemMsg;
    if (completionPromise !== 'null' && completionPromise) {
      systemMsg = `🔄 Ralph iteration ${nextIteration} | To stop: output <promise>${completionPromise}</promise> (ONLY when statement is TRUE - do not lie to exit!)`;
    } else {
      systemMsg = `🔄 Ralph iteration ${nextIteration} | No completion promise set - loop runs infinitely`;
    }

    // Output JSON to block the stop and feed prompt back
    const output = {
      decision: 'block',
      reason: promptText,
      systemMessage: systemMsg
    };

    console.log(JSON.stringify(output));
    process.exit(0);

  } catch (e) {
    console.error('⚠️  Ralph loop: Unexpected error');
    console.error(`   Error: ${e.message}`);
    console.error('   Ralph loop is stopping.');
    try {
      unlinkSync(stateFile);
    } catch (unlinkError) {
      // Ignore unlink errors
    }
    process.exit(0);
  }
}
