# 配置概述 <Badge type="tip" text="Config" />

ChatAI 插件提供灵活的配置系统，支持**全局配置**、**群组配置**和**用户配置**三级覆盖。本文对照 config 默认配置（`config/config.js` 的 `getDefaultConfig()`，对应提交 `5351e7d7`）编写。

## 配置层级 {#config-hierarchy}

```mermaid
flowchart LR
    A[全局配置] --> B[群组配置]
    B --> C[用户配置]

    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#e8f5e9
```

::: info 优先级说明
低层级配置会**覆盖**高层级配置。例如：群组配置会覆盖全局配置中的同名项。
:::

## 配置方式 {#config-methods}

### Web 管理面板（推荐）{#web-panel}

::: tip 推荐方式
Web 面板提供可视化配置界面，修改**实时生效**，无需重启。
:::

```txt
#ai管理面板
```

（命令注册见 `apps/Management.js`。）

### 配置文件 {#config-file}

配置文件位于：

```
plugins/chatai-plugin/config/config.yaml
```

::: warning 注意
直接修改配置文件后需要执行 `#ai重载配置` 或重启生效。
:::

文件加载时先执行 `migrateTriggerAccessLists`（旧版触发黑白名单迁移），再与默认配置深合并并保存，因此新增默认键会自动补入文件。

## 配置页面 {#config-pages}

| 模块 | 说明 | 文档 | 重要度 |
|:-----|:-----|:-----|:------:|
| **基础配置** | basic / admin / llm（默认模型、场景模型、备选） | [基础配置](./basic) | ⭐⭐⭐ |
| **渠道配置** | channels 数组字段、Key 策略、备选模型 | [渠道配置](./channels) | ⭐⭐⭐ |
| **渠道高级配置** | channel 端点 / 认证 / 图片 / 超时 / 重试 / 配额 / 覆盖 | [渠道高级配置](./channels-advanced) | ⭐⭐ |
| **模型配置** | 模型参数与选型说明 | [模型配置](./models) | ⭐⭐⭐ |
| **触发配置** | 私聊/群聊触发与黑白名单 | [触发配置](./triggers) | ⭐⭐ |
| **上下文配置** | context / 自动摘要 / 压缩 | [上下文配置](./context) | ⭐⭐ |
| **人格隔离配置** | personality / presets | [人格隔离配置](./personality) | ⭐⭐ |
| **工具组配置** | toolGroups / skills.yaml 分组与调度 | [工具组配置](./tool-groups) | ⭐ |
| **记忆配置** | memory / 群聊上下文采集 | [记忆配置](./memory) | ⭐⭐ |
| **MCP 配置** | mcp 超时与 Server 暴露、builtinTools | [MCP 配置](./mcp) | ⭐⭐ |
| **代理配置** | proxy profiles 与 scopes | [代理配置](./proxy) | ⭐ |
| **前端配置** | Web 面板使用与登录 | [前端配置](./frontend) | ⭐ |
| **功能配置** | features 各事件段、AI 绘图、tools 工具调用 | [功能配置](./features) | ⭐⭐ |
| **伪人 / 主动聊天 / 游戏 / 会话追踪** | bym / proactiveChat / game / conversationTracking | [伪人配置](./bym) | ⭐ |
| **错误通知** | errorNotify 运维告警 | [错误通知](./error-notify) | ⭐ |
| **思考 / 渲染 / 输出优化** | thinking / render / output / streaming / loadBalancing / probe / voice / web / images / redis / update / bilibili | [思考 / 渲染 / 输出优化配置](./shared-advanced) | ⭐⭐ |
| **高级配置** | 层级总览、热重载、安全提示 | [高级配置](./advanced) | ⭐⭐ |

## 顶层配置段索引 {#top-level-index}

`config/config.js` 默认配置的全部顶层键与对应文档：

| 顶层键 | 文档 | 顶层键 | 文档 |
|:-------|:-----|:-------|:-----|
| `basic` | [基础配置](./basic) | `admin` | [基础配置](./basic) |
| `llm` | [基础配置](./basic) | `bym` | [伪人配置](./bym) |
| `game` | [伪人配置](./bym) | `proactiveChat` | [伪人配置](./bym) |
| `conversationTracking` | [伪人配置](./bym) | `tools` | [功能配置](./features) |
| `toolGroups` | [工具组配置](./tool-groups) | `builtinTools` | [MCP 配置](./mcp) |
| `channels` | [渠道配置](./channels) | `mcp` | [MCP 配置](./mcp) |
| `bilibili` | [共享高级配置](./shared-advanced) | `redis` | [共享高级配置](./shared-advanced) |
| `images` | [共享高级配置](./shared-advanced) | `web` | [共享高级配置](./shared-advanced) |
| `update` | [共享高级配置](./shared-advanced) | `proxy` | [代理配置](./proxy) |
| `context` | [上下文配置](./context) | `memory` | [记忆配置](./memory) |
| `presets` | [人格隔离配置](./personality) | `personality` | [人格隔离配置](./personality) |
| `loadBalancing` | [共享高级配置](./shared-advanced) | `thinking` | [共享高级配置](./shared-advanced) |
| `render` | [共享高级配置](./shared-advanced) | `output` | [共享高级配置](./shared-advanced) |
| `features` | [功能配置](./features) | `voice` | [共享高级配置](./shared-advanced) |
| `streaming` | [共享高级配置](./shared-advanced) | `probe` | [共享高级配置](./shared-advanced) |
| `trigger` | [触发配置](./triggers) | `errorNotify`（非默认段） | [错误通知](./error-notify) |

## 核心配置项速查

| 配置项 | 类型 | 默认值 | 说明 |
|:-------|:-----|:-------|:-----|
| `basic.commandPrefix` | string | `'#ai'` | 命令前缀 |
| `basic.debug` | boolean | `false` | 调试模式 |
| `basic.showThinkingMessage` | boolean | `true` | 是否发送「思考中...」提示 |
| `basic.quoteReply` | boolean | `true` | 回复时引用触发消息 |
| `llm.defaultModel` | string | `'qwen/qwen3-next-80b-a3b-instruct'` | 默认模型 |
| `trigger.private.mode` | string | `'prefix'` | 私聊触发模式（`'always'` / `'prefix'` / `'off'`） |
| `trigger.group.at` | boolean | `true` | @ 机器人触发 |
| `context.maxMessages` | number | `20` | 最大上下文消息数 |
| `context.maxTokens` | number | `4000` | 最大上下文 Token 数 |
| `memory.enabled` | boolean | `false` | 启用长期记忆 |

## 环境变量 {#env-vars}

::: tip 说明
插件配置系统未核实到对 `OPENAI_API_KEY` 等外部环境变量名或 `${VAR}` 形式的显式解引用逻辑。安全实践要求敏感信息（渠道 `apiKey` / `apiKeys`、`mcp.server.apiKey`、`probe.secretKey` 等）以本地配置管理，避免提交公开仓库。
:::

## 配置热重载 {#hot-reload}

修改配置后，无需重启即可生效：

```txt
#ai重载配置
```

::: info 热重载范围
大部分配置支持热重载，但以下配置需要重启：
- Web 服务端口（`web.port`）。端口占用时服务端会自动尝试切换（`src/services/webServer.js`）
:::

## 配置备份 {#backup}

::: warning 重要
定期备份配置文件，避免配置丢失。
:::

::: code-group
```bash [Linux/macOS]
cp config/config.yaml config/config.yaml.bak
```

```powershell [Windows]
copy config\config.yaml config\config.yaml.bak
```
:::

## 配置迁移 {#migration}

::: tip 自动迁移
从旧版本升级时，插件会**自动合并**新增配置项，保留已有配置（`mergeConfig` 深合并，对象按键合并，数组与标量覆盖；触发黑白名单另由 `migrateTriggerAccessLists` 迁移到 `trigger.private` / `trigger.group`）。
:::

## 下一步 {#next-steps}

| 文档 | 说明 | 推荐阅读 |
|:-----|:-----|:--------:|
| [基础配置](./basic) | basic / admin / llm 核心设置 | ⭐⭐⭐ |
| [渠道配置](./channels) | 配置 API 渠道 | ⭐⭐⭐ |
| [模型配置](./models) | 模型参数调优 | ⭐⭐ |
| [高级配置](./advanced) | 配置层级总览与安全提示 | ⭐⭐ |