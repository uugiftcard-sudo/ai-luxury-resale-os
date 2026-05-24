#!/usr/bin/env node
/**
 * run-cycle.js — shim that calls run-cycle.ts via tsx
 *
 * Called by:  npm run agent:run  (root package.json)
 * Also called by:  .github/workflows/auto-work.yml
 */
const { spawn } = require("child_process");
const path = require("path");

const tsxPath = path.join(__dirname, "../node_modules/.bin/tsx");
const tsPath = path.join(__dirname, "run-cycle.ts");

const child = spawn(tsxPath, [tsPath, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, FORCE_COLOR: "1" },
});

child.on("exit", (code) => process.exit(code ?? 0));
