import { multiselect, select, isCancel, cancel } from "@clack/prompts";
import { LOGO } from "./logo";
import type { ToolName } from "./tools";
import { isTool } from "./tools";

const WELCOME_TEXT: string[] = [
  "pessoa · 写作技能框架",
  "费尔南多·佩索阿的 70 余个分身，",
  "在此化作你的写作技能。",
  "",
  "本框架包含三个技能：",
  "  • pessoa-orthonym   圆桌讨论写作：异名分身帮你把想法聊透，再落笔成篇",
  "  • pessoa-myself     从本地文档提炼你自己的写作声音（style/myself.md）",
  "  • pessoa-heteronyms 从范文/链接提炼某作家的异名风格（style/heteronyms/）",
  "",
  "请选择目标 Agentic Coding Tool 与安装范围：",
  "",
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

const TOOL_OPTS: { value: ToolName; label: string }[] = [
  { value: "opencode", label: "OpenCode" },
  { value: "claude", label: "Claude Code" },
  { value: "cursor", label: "Cursor" },
];

export async function chooseTools(provided?: string): Promise<ToolName[]> {
  const raw = provided && provided.trim() !== "" ? provided.trim() : "";
  if (raw !== "") {
    const seen = new Set<ToolName>();
    const result: ToolName[] = [];
    for (const tok of raw.replace(/,/g, " ").split(/\s+/)) {
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

  if (!process.stdin.isTTY) {
    process.stderr.write("非交互终端：请使用 --tool 与 --scope 参数，例如 pessoa init --tool claude --scope user\n");
    process.exit(1);
  }

  const picks = await multiselect({
    message: "选择要安装的目标工具（↑/↓ 移动，空格多选，回车确认）",
    options: TOOL_OPTS,
    required: true,
  });
  if (isCancel(picks)) {
    cancel("已取消安装。");
    process.exit(0);
  }
  return (picks as ToolName[]) ?? [];
}

export async function chooseScope(provided?: string): Promise<"user" | "project"> {
  const raw = provided && provided.trim() !== "" ? provided.trim() : "";
  if (raw !== "") {
    return raw === "p" || raw === "project" ? "project" : "user";
  }

  if (!process.stdin.isTTY) {
    process.stderr.write("非交互终端：请使用 --tool 与 --scope 参数，例如 pessoa init --tool claude --scope user\n");
    process.exit(1);
  }

  const pick = await select({
    message: "选择安装范围",
    options: [
      { value: "user", label: "用户级（全局 ~/.xxx，默认）" },
      { value: "project", label: "项目级（当前目录 .xxx/，可随仓库共享）" },
    ],
    initialValue: "user",
  });
  if (isCancel(pick)) {
    cancel("已取消安装。");
    process.exit(0);
  }
  return (pick as "user" | "project") ?? "user";
}

export function usage(): void {
  process.stdout.write(
    `pessoa — 写作技能框架 CLI

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
