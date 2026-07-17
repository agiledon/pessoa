# pessoa 写作技能框架

> 以葡萄牙诗人、作家**费尔南多·佩索阿**（Fernando Pessoa）命名。
> 佩索阿在作品中创造了 70 余个「异名」（heteronyms），如阿尔贝托·卡埃罗、里卡多·雷斯——
> 他们各有独立的身份与声音，如同本框架中一个个写作技能的分身。

`pessoa` 是一套**中文技术写作技能框架**，当前聚焦三种写作类型（博客 / 文章 / 论文），
并支持与「佩索阿异名分身」围坐圆桌讨论后再落笔。

| 入口 | 技能 | 作用 |
| --- | --- | --- |
| 讨论写作 | `pessoa-orthonym` | 与「专家分身」圆桌讨论，定稿后由 Soares 落笔 |
| 我的风格 | `pessoa-myself` | 从本地文档提炼**唯一**的「我的风格」到 `style/myself.md` |
| 异名风格 | `pessoa-heteronyms` | 从范文/链接提炼某作家的异名风格到 `style/heteronyms/` |

> 博客 / 文章 / 论文不再是独立技能，而是**写作类型**：在 `pessoa-orthonym` 中由 Soares 落笔时
> 由用户选择（未来可扩展书、短剧等）。写作**只**经圆桌完成。

写作效果由三个因素共同决定：

```
最终文风 = 写作类型 × 文体 × 文字风格 × 素材
```

- **写作类型**（定义在 `framework/types/`）：博客（blog）、文章（article）、论文（paper）
- **文体**（5 种，定义在 `framework/genre/`）：说明型、议论性、描写型、记叙型、新闻型
- **文字风格**（定义在 `framework/style/` 与 `framework/style/heteronyms/`）：客观学术型、主观个人型、
  简洁经济型、华丽修辞型、口语对话型、说明解释型（6 基础）+「我的风格」(`myself.md`) +
  异名风格（`heteronyms/*.md`，可积累多位作家）
- **素材**：主题思想、描述、知识库文章、网页链接（链接会询问是否联网检索）

每次写作完成后，框架会**强制、对用户不可见地**执行去 AI 化（`framework/deai/deai.md`），
让成稿更人性化。注意：**选择文体与文字风格时都会展示对应描述**，帮助用户理解其含义。

---

## 安装

`pessoa` CLI 用 **TypeScript** 实现，运行时仅依赖 `/prompts`（交互式选择），需 Node ≥ 18。

```bash
# 1. 获取仓库
git clone <repo-url> pessoa
cd pessoa

# 2. 安装开发依赖并编译
npm install
npm run build          # tsc → dist/

# 3. （可选）把 CLI 放到 PATH
ln -s "$(pwd)/bin/pessoa" /usr/local/bin/pessoa

# 4. 初始化：选工具 → 自动复制技能 + 生成命令 + 复制 agents
./bin/pessoa init
# 或一步到位：
./bin/pessoa init --tool claude --scope user
```

> 不想编译也可直接运行源码：`npx tsx src/index.ts init`

`pessoa init` 会先显示**欢迎界面**（左侧钢笔 LOGO），然后让你**用 ↑/↓ 移动、空格多选、回车确认**
选择目标工具与安装范围：

| 工具 | 支持 | skills 目录 | commands 目录 | agents 目录 |
| --- | --- | --- | --- | --- |
| OpenCode | skill + command + agent | `~/.config/opencode/skills/pessoa/` | `~/.config/opencode/command/` | `~/.config/opencode/agents/` |
| Claude Code | skill + command + agent | `~/.claude/skills/pessoa/` | `~/.claude/commands/` | `~/.claude/agents/` |
| Cursor | skill + command + agent | `~/.cursor/skills/pessoa/` | `~/.cursor/commands/` | `~/.cursor/agents/` |

- `--scope user`（默认）：装到用户级 `~/.xxx`，全局可用。
- `--scope project`：装到当前目录 `.xxx/`，随仓库提交、团队共享。

安装后，框架整体被复制为 `<工具skills目录>/pessoa/`，包含 `genre/`、`style/`、`deai/`、
`skills/`、`types/`；四个讨论 SubAgent 被复制到 `<工具agents目录>/`。

---

## 使用

在对应工具中输入斜杠命令即可开始：

```
/pessoa-orthonym      与佩索阿异名分身圆桌讨论，定稿后落笔成篇
/pessoa-myself        从本地文档提炼你自己的写作风格（style/myself.md）
/pessoa-heteronyms    从范文/链接提炼某作家的异名写作风格（style/heteronyms/）
```

### 讨论写作（pessoa-orthonym）
`/pessoa-orthonym` 让你先和 Agent 扮演的「佩索阿异名分身」围坐圆桌把想法聊透，再由写作者落笔。
四个分身均以佩索阿的异名为名，由主 agent 充当 conductor 在它们之间转递信息
（SubAgent 扁平、不能互相派活）。整场以**多人圆桌会议**形式呈现：

- **Caeiro（卡埃罗）· 讨论总导演** `pessoa-orthonym-caeiro`：界定话题边界与目标、派发任务、全程把控方向与节奏、判断何时收束。
- **Reis（雷斯）· 研究员** `pessoa-orthonym-reis`：把话题拆成可检索面、提炼关键字与 topic，基于自身知识并用 `WebSearch` / `WebFetch` 联网查证，返回带来源引证的简报。
- **Campos（坎波斯）· 设想者** `pessoa-orthonym-campos`：在 Caeiro 划定的边界内发散角度、类比隐喻、反常识 what-if、开篇钩子。
- **Soares（索阿雷斯）· 写作者** `pessoa-orthonym-soares`：定稿后请你选择 写作类型 + 文体 + 文字风格，直接落笔成篇（含强制去 AI 化），并确认保存路径。

**对话格式**：每个发言以 `人名（角色）:` 前缀（如 `Caeiro（总导演）:`），用户的发言记为
`Pessoa（用户）:`；对话历史持续累积呈现，像五个人真的在开圆桌会议。

---

## 定制

### 1. 写作类型约束 —— `types/<type>.md`
`framework/types/` 下每个写作类型（blog/article/paper）有一份 harness 约束（长度 / 格式 / 必遵规则）。
改这里即可调整对应类型的全局规范。**每次写作都会加载。** 未来新增类型（如 book、short-drama）
只需在此加一份 md 并带 `name`+`description`。

### 2. 我的风格 —— `style/myself.md`
运行 `/pessoa-myself` 指定一篇**本地文档**，Agent 提炼你的行文风格，写入**唯一**的
`style/myself.md`（重复运行会询问是否覆盖，不生成多余文件）。写作时选「我的风格」即严格模仿。
**每次写作都会加载（若存在）。**

### 3. 异名风格 —— `style/heteronyms/<author>.md`
运行 `/pessoa-heteronyms` 指定一篇范文（本地路径或链接），Agent 不仅提炼风格，还会**判断它属于
哪位作家**（如海明威 → `hemingway`），写入 `style/heteronyms/hemingway.md`。可积累多位作家，
每个文件带 `name`+`description`。写作时在「文字风格」选项中会列出全部异名风格及描述。

### 4. 文体 / 风格定义
- 想新增或微调文体：编辑 `framework/genre/*.md`（含 `name` + `description` 字段）。
- 想新增或微调基础风格：编辑 `framework/style/*.md`（含 `name` + `description` 字段）。
- 想新增异名风格：运行 `/pessoa-heteronyms`。
- 修改后重新 `pessoa init` 即可生效。选择文体 / 文字风格时，界面都会展示各自 `description`。

### 5. 讨论分身（SubAgents）
四个讨论角色定义在 `framework/agents/`（跨工具兼容 frontmatter），文件名即异名：
`pessoa-orthonym-caeiro / -reis / -campos / -soares`。可编辑其正文调整各分身的行为；
修改后重新 `pessoa init` 生效。

---

## 目录结构（仓库）

```
pessoa/
├── package.json            # 依赖与 bin
├── tsconfig.json
├── bin/pessoa              # node 启动 shim（执行 dist/index.js）
├── src/                    # TypeScript 源码
│   ├── index.ts            # 入口与参数解析
│   ├── install.ts          # 复制框架 + 生成命令 + 复制 agents
│   ├── tools.ts            # 三工具目录映射
│   ├── ui.ts               # 欢迎界面与交互（↑/↓ 移动、空格多选）
│   └── logo.ts             # 钢笔 ASCII LOGO
├── README.md
└── framework/
    ├── genre/              # 5 种文体（含 name + description）
    ├── style/              # 6 基础风格（含 name + description）+ myself.md（我的风格）
    │   └── heteronyms/     # 异名风格 <author>.md（由 pessoa-heteronyms 生成）
    ├── deai/deai.md        # 强制隐藏的去 AI 化流程
    ├── types/              # 写作类型 harness：blog.md / article.md / paper.md
    ├── agents/             # 4 个佩索阿异名讨论 SubAgent
    │   ├── pessoa-orthonym-caeiro.md   # 卡埃罗：讨论总导演
    │   ├── pessoa-orthonym-reis.md     # 雷斯：研究员（联网查证）
    │   ├── pessoa-orthonym-campos.md   # 坎波斯：设想者
    │   └── pessoa-orthonym-soares.md   # 索阿雷斯：写作者
    └── skills/
        ├── pessoa-myself/      # SKILL.md（提炼我的风格）
        ├── pessoa-heteronyms/  # SKILL.md（提炼异名风格）
        └── pessoa-orthonym/    # SKILL.md（圆桌讨论写作）
```

## 致谢 / 参考
- 费尔南多·佩索阿（Fernando Pessoa）：他那充满迷梦般的写作与「异名」设定，为本框架的分身机制带来了最初的灵感。
- 花叔（alchaincyf）的内容创作 Skills：渐进式披露、三遍审校降 AI 味、风格 DNA。
- 宝玉（JimLiu）的 baoyu-skills：自定义写作风格 Skill（记录口味/做法/忌口）、声音档案。
