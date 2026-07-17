import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { LOGO } from "./logo";
import type { ToolName } from "./tools";
import { isTool } from "./tools";

const WELCOME_TEXT: string[] = [
  "pessoa · 写作异名框架",
  "费尔南多·佩索阿的 70 余个分身，",
  "在此化作你的写作技能。",
  "",
  "请选择目标 Agentic Coding Tool：",
  "  [1] OpenCode",
  "  [2] Claude Code",
  "  [3] Cursor",
  "  （可多选，空格或逗号分隔，如 1 2 3）",
  "",
  "安装范围：",
  "  [u] 用户级（全局 ~/.xxx，默认）",
  "  [p] 项目级（当前目录 .xxx/）",
];

export function printWelcome(): void {
  process.stdout.write("\x1b[2J\x1b[3J\x1b[H"); // clear
  const max = Math.max(LOGO.length, WELCOME_TEXT.length);
  const logoW = 12;
  for (let i = 0; i < max; i++) {
    const l = LOGO[i] ?? "";
    const t = WELCOME_TEXT[i] ?? "";
    process.stdout.write(l.padEnd(logoW) + "   " + t + "\n");
  }
  process.stdout.write("\n");
}

export async function chooseTools(provided?: string): Promise<ToolName[]> {
  let raw = provided && provided.trim() !== "" ? provided : "";
  if (raw === "") {
    const rl = readline.createInterface({ input, output });
    raw = (await rl.question("请输入编号（可多选）: ")).trim();
    rl.close();
  }
  raw = raw.replace(/,/g, " ");
  const seen = new Set<ToolName>();
  const result: ToolName[] = [];
  for (const tok of raw.split(/\s+/)) {
    if (tok === "") continue;
    let t: ToolName | null = null;
    if (tok === "1") t = "opencode";
    else if (tok === "2") t = "claude";
    else if (tok === "3") t = "cursor";
    else if (isTool(tok)) t = tok;
    if (t && !seen.has(t)) {
      seen.add(t);
      result.push(t);
    }
  }
  if (result.length === 0) {
    process.stderr.write("未识别到有效工具，请重新运行 pessoa init。\n");
    process.exit(1);
  }
  return result;
}

export async function chooseScope(provided?: string): Promise<"user" | "project"> {
  let raw = provided && provided.trim() !== "" ? provided : "";
  if (raw === "") {
    const rl = readline.createInterface({ input, output });
    raw = (await rl.question("安装范围 [u/p] (默认 u): ")).trim();
    rl.close();
  }
  return raw === "p" || raw === "project" ? "project" : "user";
}

export function usage(): void {
  process.stdout.write(
    `pessoa — 写作异名框架 CLI

用法：
  pessoa init                          交互式安装（欢迎界面 → 选工具 → 复制技能 + 生成命令 + 复制 agents）
  pessoa init --tool claude --scope user
  pessoa help                          显示本帮助

参数：
  --tool <opencode|claude|cursor>     可一次多个（空格分隔需引号）
  --scope <user|project>              用户级(默认) / 项目级

支持的 Agentic Coding Tool：OpenCode、Claude Code、Cursor
`,
  );
}
