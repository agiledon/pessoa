import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { printWelcome, chooseTools, chooseScope } from "./ui";
import { skillsRel, commandsRel, agentsRel, type ToolName } from "./tools";

const FRAMEWORK_DIR = path.resolve(__dirname, "..", "framework");

// 复制到 <tool>/skills/pessoa/ 的框架子目录
const SKILL_BUNDLE_DIRS = ["genre", "style", "deai", "skills"];

// 生成的命令（薄包装，调用同名 skill）
const COMMANDS: { file: string; skill: string; desc: string }[] = [
  { file: "pessoa-blog.md", skill: "pessoa-blog", desc: "使用 pessoa-blog 技能撰写技术博客" },
  { file: "pessoa-article.md", skill: "pessoa-article", desc: "使用 pessoa-article 技能撰写技术文章" },
  { file: "pessoa-paper.md", skill: "pessoa-paper", desc: "使用 pessoa-paper 技能撰写技术论文（arXiv 风）" },
  { file: "pessoa-train.md", skill: "pessoa-train", desc: "使用 pessoa-train 技能从文章提炼个人写作风格" },
  { file: "pessoa-discuss.md", skill: "pessoa-discuss", desc: "使用 pessoa-discuss 技能与专家分身讨论并写作" },
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

    // 复制框架内容（skills 包）
    for (const d of SKILL_BUNDLE_DIRS) {
      copyDir(path.join(FRAMEWORK_DIR, d), path.join(skillsDir, d));
    }

    // 复制 agents（真实 SubAgent 定义）
    copyDir(path.join(FRAMEWORK_DIR, "agents"), agentsDir);

    // 生成命令文件
    for (const c of COMMANDS) {
      writeCommand(path.join(cmdsDir, c.file), c.skill, c.desc);
    }

    process.stdout.write("    技能已安装：\n");
    process.stdout.write(`      - ${skillsDir}/genre, ${skillsDir}/style, ${skillsDir}/deai, ${skillsDir}/skills\n`);
    process.stdout.write(`     Agents 已安装：\n      - ${agentsDir}\n`);
    process.stdout.write("    命令已生成：\n");
    process.stdout.write(`      - ${cmdsDir}/pessoa-{blog,article,paper,train,discuss}.md\n`);
  }

  process.stdout.write(
    "\n✅ pessoa 安装完成。在对应工具中输入 /pessoa-blog 等即可开始写作。\n" +
      "   讨论：/pessoa-discuss ；训练风格：/pessoa-train ；\n" +
      "   扩展约束：编辑 skills/<type>/pessoa.md ；个人定制：style/custom-myself.md\n",
  );
}
