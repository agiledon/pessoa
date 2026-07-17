# pessoa · 写作异名框架

> 以葡萄牙诗人、作家**费尔南多·佩索阿**（Fernando Pessoa）命名。
> 佩索阿在作品中创造了 70 余个「异名」（heteronyms），如阿尔贝托·卡埃罗、里卡多·雷斯——
> 他们各有独立的身份与声音，如同本框架中一个个写作技能的分身。

`pessoa` 是一套**技术写作技能集合**，当前聚焦中文技术写作，支持三种类型：

| 类型 | 技能 | 特点 |
| --- | --- | --- |
| 博客 | `pessoa-blog` | 格式自由、长短不拘 |
| 文章 | `pessoa-article` | 正式严谨、结构完整、风格多样 |
| 论文 | `pessoa-paper` | 符合 arXiv 预印本标准结构 |
| 讨论 | `pessoa-discuss` | 与「专家分身」多轮讨论，定稿后再写 |

写作效果由三个因素共同决定：

```
最终文风 = 写作类型 × 文体 × 文字风格 × 素材
```

- **文体**（5 种，定义在 `framework/genre/`）：说明型、议论性、描写型、记叙型、新闻型
- **文字风格**（6+1+训练，定义在 `framework/style/`）：客观学术型、主观个人型、简洁经济型、
  华丽修辞型、口语对话型、说明解释型、个人定制，以及 `pessoa-train` 训练得到的风格
- **素材**：主题思想、描述、知识库文章、网页链接（链接会询问是否联网检索）

每次写作完成后，框架会**强制、对用户不可见地**执行去 AI 化（`framework/deai/deai.md`），
让成稿更人性化。

---

## 安装

`pessoa` CLI 用 **TypeScript** 实现，运行时零依赖（仅用 Node 内置模块），需 Node ≥ 18。

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

`pessoa init` 会先显示**欢迎界面**（左侧钢笔 LOGO），然后让你选择目标工具与安装范围：

| 工具 | 支持 | skills 目录 | commands 目录 | agents 目录 |
| --- | --- | --- | --- | --- |
| OpenCode | skill + command + agent | `~/.config/opencode/skills/pessoa/` | `~/.config/opencode/command/` | `~/.config/opencode/agents/` |
| Claude Code | skill + command + agent | `~/.claude/skills/pessoa/` | `~/.claude/commands/` | `~/.claude/agents/` |
| Cursor | skill + command + agent | `~/.cursor/skills/pessoa/` | `~/.cursor/commands/` | `~/.cursor/agents/` |

- `--scope user`（默认）：装到用户级 `~/.xxx`，全局可用。
- `--scope project`：装到当前目录 `.xxx/`，随仓库提交、团队共享。
- 可一次选择多个工具（如 `1 2 3`）。

安装后，框架整体被复制为 `<工具skills目录>/pessoa/`，包含 `genre/`、`style/`、`deai/`、`skills/`；
四个讨论 SubAgent 被复制到 `<工具agents目录>/`。

---

## 使用

在对应工具中输入斜杠命令即可开始：

```
/pessoa-blog       写技术博客
/pessoa-article    写技术文章
/pessoa-paper      写技术论文（arXiv 风）
/pessoa-discuss   与专家分身讨论，定稿后再写
/pessoa-train     从范文提炼写作风格
```

### 直接写作（blog / article / paper）
写作技能会依次引导你：
1. 提供素材（主题 / 文章 / 链接；链接会问是否联网检索）
2. **选择文体**（列出 5 项及说明）
3. **选择文字风格**（列出 6+1 项及说明，外加 `style/writer/` 中的训练风格）
4. 自动加载本类型 harness 约束
5. 产出初稿 → **自动去 AI 化** → 终稿

### 讨论写作（pessoa-discuss）
`/pessoa-discuss` 让你先和 Agent 扮演的「佩索阿异名分身」把想法聊透。四个分身均以佩索阿的异名为名，
由主 agent 充当 conductor 在它们之间转递信息（SubAgent 扁平、不能互相派活）：

- **卡埃罗（Caeiro）· 讨论总导演** `pessoa-discuss-caeiro`：界定话题边界与目标、派发任务、全程把控方向与节奏、判断何时收束。
- **雷斯（Reis）· 研究员** `pessoa-discuss-reis`：把话题拆成可检索面、提炼关键字与 topic，基于自身知识并用 `WebSearch` / `WebFetch` 联网查证，返回带来源引证的简报。
- **坎波斯（Campos）· 设想者** `pessoa-discuss-campos`：在 Caeiro 划定的边界内发散角度、类比隐喻、反常识 what-if、开篇钩子。
- **索阿雷斯（Soares）· 写作者** `pessoa-discuss-soares`：定稿后请你选择 写作类型 + 文体 + 文字风格，调用对应写作技能落笔成稿（含强制去 AI 化），并确认保存路径。

---

## 定制

### 1. 本类型硬约束 —— `pessoa.md`
每个写作技能目录下有 `pessoa.md`（如 `skills/pessoa-blog/pessoa.md`），是该类型的
harness 约束（长度 / 格式 / 必遵规则）。改这里即可调整全局规范。**每次写作都会加载。**

### 2. 个人通用声音 —— `style/custom-myself.md`
填写你自己的写作声音 DNA（语气人称 / 句式 / 高频词 / 忌口词 / 结构 / 示例）。
写作时选「个人定制」即严格模仿。**每次写作都会加载。**

### 3. 训练风格 —— `style/writer/custom-<name>.md`
运行 `/pessoa-train` 指定一篇范文（本地路径或链接），Agent 提炼其行文风格，
推荐风格名（如 `hemingway`），你确认后写入 `style/writer/custom-hemingway.md`。
之后在写作的「文字风格」选项中会出现该风格并附说明。

### 4. 文体 / 风格定义
- 想新增或微调文体：编辑 `framework/genre/*.md`（含 `name` + `description` 字段）。
- 想新增或微调基础风格：编辑 `framework/style/*.md`（含 `name` + `description` 字段）。
修改后重新 `pessoa init` 即可生效。

### 5. 讨论分身（SubAgents）
四个讨论角色定义在 `framework/agents/`（跨工具兼容 frontmatter）。可编辑其正文调整
各分身的行为；修改后重新 `pessoa init` 生效。

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
│   ├── ui.ts               # 欢迎界面与交互
│   └── logo.ts             # 钢笔 ASCII LOGO
├── README.md
└── framework/
    ├── genre/              # 5 种文体（含 description）
    ├── style/              # 6 基础风格 + custom-myself.md（个人定制）
    │   └── writer/         # 训练产出的风格 custom-<name>.md
    ├── deai/deai.md        # 强制隐藏的去 AI 化流程
    ├── agents/             # 4 个佩索阿异名讨论 SubAgent
    │   ├── pessoa-discuss-caeiro.md   # 卡埃罗：讨论总导演
    │   ├── pessoa-discuss-reis.md     # 雷斯：研究员（联网查证）
    │   ├── pessoa-discuss-campos.md   # 坎波斯：设想者
    │   └── pessoa-discuss-soares.md   # 索阿雷斯：写作者
    └── skills/
        ├── pessoa-blog/      # SKILL.md + pessoa.md
        ├── pessoa-article/   # SKILL.md + pessoa.md
        ├── pessoa-paper/     # SKILL.md + pessoa.md
        ├── pessoa-train/     # SKILL.md
        └── pessoa-discuss/   # SKILL.md
```

## 致谢 / 参考
- 费尔南多·佩索阿（Fernando Pessoa）：他那充满迷梦般的写作与「异名」设定，为本框架的分身机制带来了最初的灵感。
- 花叔（alchaincyf）的内容创作 Skills：渐进式披露、三遍审校降 AI 味、风格 DNA。
- 宝玉（JimLiu）的 baoyu-skills：自定义写作风格 Skill（记录口味/做法/忌口）、声音档案。
