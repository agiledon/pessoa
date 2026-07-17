#!/usr/bin/env node
import { doInit } from "./install";
import { usage } from "./ui";

function main(): void {
  const args = process.argv.slice(2);
  const cmd = args[0] ?? "help";
  if (cmd === "init") {
    let tool = "";
    let scope = "";
    for (let i = 1; i < args.length; i++) {
      if (args[i] === "--tool") {
        tool = args[i + 1] ?? "";
        i++;
      } else if (args[i] === "--scope") {
        scope = args[i + 1] ?? "";
        i++;
      }
    }
    void doInit(tool, scope);
  } else if (cmd === "help" || cmd === "-h" || cmd === "--help") {
    usage();
  } else {
    process.stderr.write(`未知命令: ${cmd}\n`);
    usage();
    process.exit(1);
  }
}

main();
