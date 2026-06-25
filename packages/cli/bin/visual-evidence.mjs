#!/usr/bin/env node
import { runCli } from '../src/visual-evidence.mjs';

runCli().catch((error) => {
  console.error(`visual-evidence: ${error.message}`);
  process.exitCode = 1;
});