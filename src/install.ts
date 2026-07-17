import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { printWelcome, chooseTools, chooseScope } from "./ui";
import { skillsRel, commandsRel, agentsRel, type ToolName } from "./tools";

const FRAMEWORK_DIR = path.resolve(__dirname, "..", "framework");

// 复制到 <tool>/skills/pessoa/ 的框架子目录
const SKILL_BUNDLE_DIRS = ["genre", "style", "deai", "skills", "types"];

// 生成的命令（薄包装，调用同名 skill）
const COMMANDS: { file: string; skill: string; desc: string }[] = [
  { file: "pessoa-myself.md", skill: "pessoa-myself", desc: "使用 pessoa-myself 从本地文档提炼你自己的写作风格" },
  { file: "pessoa-heteronyms.md", skill: "pessoa-heteronyms", desc: "使用 pessoa-heteronyms 从范文/链接提炼某作家的异名写作风格" },
  { file: "pessoa-orthonym.md", skill: "pessoa-orthonym", desc: "使用 pessoa-orthonym 与佩索阿异名分身圆桌讨论并落笔成篇" },
];

function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function writeCommand(cmdFile: string, skill: string, desc: string): void {
  const content =
    `---\n` +
    `description: ${desc}\n` +
    `---\n` +
    `请使用 ${skill} 技能完成任务。$ARGUMENTS\n`;
  fs.writeFileSync(cmdFile, content, "utf8");
}

// 不同工具对 agent frontmatter 中 `tools` 字段的格式要求不同：
//  - Claude Code / Cursor：逗号分隔字符串（如 `tools: WebSearch, Read`）
//  - OpenCode：`tools` 必须是对象（Record<string, boolean>），否则报
//    "Expected object | undefined, got ... tools"
// 因此安装到 OpenCode 时把逗号字符串改写成 YAML 对象形式。
function transformAgent(content: string, tool: ToolName): string {
  if (tool !== "opencode") return content;
  return content.replace(/^tools:\s*(.+)\r?\n/m, (_m, list: string) => {
    const items = list
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length === 0) return "";
    return "tools:\n" + items.map((i) => `  ${i}: true`).join("\n") + "\n";
  });
}

export async function doInit(toolArg?: string, scopeArg?: string): Promise<void> {
  printWelcome();
  const tools = await chooseTools(toolArg);
  const scope = await chooseScope(scopeArg);

  for (const tool of tools) {
    const base = scope === "user" ? os.homedir() : process.cwd();
    const skillsDir = path.join(base, skillsRel(tool as ToolName), "pessoa");
    const cmdsDir = path.join(base, commandsRel(tool as ToolName));
    const agentsDir = path.join(base, agentsRel(tool as ToolName));

    process.stdout.write(`\n==> 安装到 ${tool} (${scope}): ${skillsDir}\n`);
    fs.mkdirSync(skillsDir, { recursive: true });
    fs.mkdirSync(cmdsDir, { recursive: true });
    fs.mkdirSync(agentsDir, { recursive: true });

    // 复制框架内容（skills 包）。先清理上一次安装残留的子项
    // （如重命名/删除过的技能 pessoa-blog / pessoa-discuss 等），
    // 否则旧目录会一直留在目标里，被工具（含 Cursor 兼容读取 ~/.claude）继续加载。
    for (const d of SKILL_BUNDLE_DIRS) {
      const destDir = path.join(skillsDir, d);
      fs.mkdirSync(destDir, { recursive: true });
      const srcEntries = fs.readdirSync(path.join(FRAMEWORK_DIR, d));
      if (fs.existsSync(destDir)) {
        for (const e of fs.readdirSync(destDir)) {
          if (e.startsWith("pessoa-") && !srcEntries.includes(e)) {
            fs.rmSync(path.join(destDir, e), { recursive: true, force: true });
          }
        }
      }
      copyDir(path.join(FRAMEWORK_DIR, d), destDir);
    }

    // 复制 agents（真实 SubAgent 定义），按目标工具转换 frontmatter。
    // 先清理上一次安装残留的旧 persona agent（如重命名前的 pessoa-discuss-*），
    // 否则旧文件会留在目标目录里继续被加载并报错。
    const agentsSrc = path.join(FRAMEWORK_DIR, "agents");
    const currentAgents = fs
      .readdirSync(agentsSrc)
      .filter((f) => f.endsWith(".md"));
    for (const f of fs.readdirSync(agentsDir)) {
      if (f.startsWith("pessoa-") && f.endsWith(".md") && !currentAgents.includes(f)) {
        fs.rmSync(path.join(agentsDir, f), { force: true });
      }
    }
    for (const f of currentAgents) {
      const raw = fs.readFileSync(path.join(agentsSrc, f), "utf8");
      fs.writeFileSync(path.join(agentsDir, f), transformAgent(raw, tool as ToolName), "utf8");
    }

    // 生成命令文件
    for (const c of COMMANDS) {
      writeCommand(path.join(cmdsDir, c.file), c.skill, c.desc);
    }

    process.stdout.write("    技能已安装：\n");
    process.stdout.write(`      - ${skillsDir}/genre, ${skillsDir}/style, ${skillsDir}/deai, ${skillsDir}/skills, ${skillsDir}/types\n`);
    process.stdout.write(`    Agents 已安装：\n      - ${agentsDir}\n`);
    process.stdout.write("    命令已生成：\n");
    process.stdout.write(`      - ${cmdsDir}/pessoa-{myself,heteronyms,orthonym}.md\n`);
  }

  process.stdout.write(
    "\n✅ pessoa 安装完成。在对应工具中输入 /pessoa-orthonym 开始圆桌讨论写作；\n" +
      "   提炼风格：/pessoa-myself（我的风格）、/pessoa-heteronyms（异名风格）；\n" +
      "   扩展约束：编辑 skills 下各类型/风格定义；个人风格唯一文件：style/myself.md\n",
  );
}
