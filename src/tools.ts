// 三工具在 user / project 范围下的目录片段（bash 3.2 友好，无关联数组）
export type ToolName = "opencode" | "claude" | "cursor";

export function skillsRel(tool: ToolName): string {
  switch (tool) {
    case "opencode":
      return ".opencode/skills";
    case "claude":
      return ".claude/skills";
    case "cursor":
      return ".cursor/skills";
  }
}

export function commandsRel(tool: ToolName): string {
  switch (tool) {
    case "opencode":
      return ".opencode/command"; // OpenCode 用单数 command
    case "claude":
      return ".claude/commands";
    case "cursor":
      return ".cursor/commands";
  }
}

export function agentsRel(tool: ToolName): string {
  switch (tool) {
    case "opencode":
      return ".opencode/agents";
    case "claude":
      return ".claude/agents";
    case "cursor":
      return ".cursor/agents";
  }
}

export const VALID_TOOLS: ToolName[] = ["opencode", "claude", "cursor"];

export function isTool(x: string): x is ToolName {
  return (VALID_TOOLS as string[]).includes(x);
}
