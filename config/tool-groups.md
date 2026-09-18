# 工具组配置

工具组（Tool Groups）将内置工具按用途分组，供**工具调度器**按需选取，避免一次性把全部工具塞给模型。由 `src/services/tools/ToolGroupManager.js` 管理。本文对照 config 默认配置（`config/config.js` 的 `getDefaultConfig()`，对应提交 `5351e7d7`）与 `data/skills.yaml` 编写。

## 加载来源与优先级

`ToolGroupManager.init()` 按以下顺序加载工具组：

1. **`data/skills.yaml` 的 `skills.groups`**（优先）：存在且有启用组时使用，来源标记 `skills-config`。
2. **内置工具类别 `toolCategories`**（回退）：当 skills.yaml 无可用分组时启用，来源标记 `builtin`。
3. **外部 MCP 服务器工具组**（追加）：已连接的外部 MCP 服务器工具自动成组，索引从内置组之后继续编号，来源标记 `mcp`。

::: warning 关于 config.yaml 的 toolGroups 段
`config/config.yaml` 中可能存在 `toolGroups` 段，它是通过管理接口新增/修改/删除工具组时由 `saveGroups()`（`config.set('toolGroups', ...)`）**写入的持久化产物**。
`ToolGroupManager.init()` **不会**把该段作为加载来源——运行时工具组以 `skills.yaml` 为准。因此如需长期调整分组，应编辑 `data/skills.yaml`。
:::

## skills.yaml 工具组定义

工具组定义位于 `data/skills.yaml` 的 `skills.groups` 数组，每个组的字段如下：

```yaml
skills:
  groups:
    - index: 0                  # 工具组索引（调度时引用）
      name: 'basic'             # 组标识名
      description: '基础工具：获取时间、日期、农历、节日、系统环境信息等'
      tools:                    # 该组包含的工具名列表
        - get_current_time
        - get_lunar_date
        # ...
      enabled: true             # 是否启用该组
    - index: 6
      name: 'admin'
      description: '群管理：禁言、踢人、设置群名片/头衔、发送公告等（需要管理员权限）'
      tools: ['mute_member', 'kick_member', '...']
      enabled: true
      requiredPermission: 'admin'  # 使用该组所需权限
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `index` | number | 是 | 工具组索引，调度器通过索引选取工具组 |
| `name` | string | 是 | 组标识名 |
| `description` | string | 是 | 组描述，冒号（`：`）前的部分会作为 `displayName` 展示 |
| `tools` | string[] | 是 | 该组包含的工具名列表 |
| `enabled` | boolean | 否 | 是否启用，默认 `true`；仅 `false` 时禁用 |
| `requiredPermission` | string | 否 | 使用该组所需权限（如 `admin`、`master`），无则任意用户可用 |

> 说明：`displayName` 由 `description.split('：')[0]` 派生（无冒号时回退为 `name`）；权限校验依赖调用上下文，仅当请求带权限信息时才对 `requiredPermission` 组生效。

## 内置工具组一览

以下为 `data/skills.yaml` 默认定义的工具组（共 28 组，索引 0–27）：

| 索引 | name | 说明 | 特殊标记 |
|------|------|------|----------|
| 0 | `basic` | 基础工具：时间、日期、农历、节日、系统环境等 | |
| 1 | `user` | 用户信息：QQ 资料、好友列表、发送者信息、点赞等 | |
| 2 | `bot` | Bot 信息：机器人自身信息、状态、好友列表等 | |
| 3 | `group` | 群组信息：群资料、成员列表、管理员、群公告等 | |
| 4 | `group-stats` | 群统计：星级、龙王、发言榜、幸运字符、群荣誉等 | |
| 5 | `message` | 消息操作：发消息、@用户、聊天记录、撤回、转发解析等 | |
| 6 | `admin` | 群管理：禁言、踢人、群名片/头衔、群公告等 | `requiredPermission: admin` |
| 7 | `media` | 媒体处理：发图片/视频/表情、二维码、图片解析等 | |
| 8 | `voice` | 语音：AI 语音对话、TTS、语音识别、发送语音等 | |
| 9 | `search` | 搜索：Bing/DuckDuckGo、网页获取、维基、翻译、天气、热搜等 | |
| 10 | `web` | 网页访问：访问 URL 获取内容 | |
| 11 | `memory` | 记忆管理：保存、检索、删除用户记忆 | |
| 12 | `context` | 上下文管理：当前/群聊上下文、清空对话、引用消息等 | |
| 13 | `file` | 文件操作：群文件上传下载、本地读写、目录管理、URL 下载等 | |
| 14 | `utils` | 实用工具：计算、随机、编码、时间戳、正则、文本处理等 | |
| 15 | `extra` | 扩展工具：天气、一言、骰子、倒计时、短链、IP 查询、插画等 | |
| 16 | `schedule` | 定时任务：创建自然语言定时任务、查看和取消 | |
| 17 | `shell` | 系统命令：执行 Shell、系统/进程信息、环境变量等 | `enabled: false`、`requiredPermission: master` |
| 18 | `bltools-music` | 音乐搜索：QQ 音乐搜索并发送音乐卡片 | |
| 19 | `bltools-emoji` | 表情包工具：表情包搜索、消息表情回应 | |
| 20 | `bltools-image` | 图片工具：Bing 图片、壁纸搜索、AI 图片编辑 | |
| 21 | `bltools-bilibili` | B 站工具：视频搜索、视频 AI 总结 | |
| 22 | `bltools-video` | 视频分析：使用智谱 AI 分析视频内容 | |
| 23 | `bltools-github` | GitHub 工具：获取仓库详细信息 | |
| 24 | `bltools-mindmap` | AI 思维导图：根据描述生成思维导图图片 | |
| 25 | `reminder` | 定时提醒：相对/绝对时间、每天/每周重复 | |
| 26 | `imageGen` | AI 绘图：文生图、图生图、文生/图生视频、预设关键词生图 | |
| 27 | `qzone` | QQ 空间说说：发布/删除说说、点赞、签名、戳一戳、收藏等 | |

::: tip 危险工具组默认关闭
`shell`（索引 17）默认 `enabled: false` 且需 `master` 权限，包含 `execute_command` 等高危工具。启用前请确保仅主人可触发。
:::

## 工具组与调度

工具调度器（`buildDispatchPrompt`）会将启用的工具组以 `[索引] 显示名: 描述` 的形式列出，交给调度模型选取。模型返回选中的工具组索引后，`getToolsByGroupIndexes()` 汇总这些组的工具（并应用权限过滤与 `skills.yaml` 的安全检查）供本轮对话使用。

外部 MCP 服务器组会以 `mcp_<服务器名>` 命名、`MCP: <服务器名>` 作为显示名，自动参与调度。

## 下一步

- [MCP 配置](./mcp) - 内置工具类别与外部 MCP 服务器
- [Skills Agent 架构](/architecture/skills-agent) - 技能系统与工具加载
