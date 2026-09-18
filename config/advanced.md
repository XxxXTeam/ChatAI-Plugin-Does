# 高级配置 <Badge type="warning" text="进阶" />

本文对照 config 默认配置（`config/config.js` 的 `getDefaultConfig()`，对应提交 `5351e7d7`）编写。只收录有据可查的配置；本页旧版中的虚构配置（`loadBalance` / `rateLimit` / `quotas` / `models.aliases` / `triggers.regex` / `filter` / `cache` / `logging` / `performance` / `server.cors` / `auth.jwt` / `middleware` / `hooks` / `validation` / `sync` 等）在代码中不存在，已全部删除，相关真实配置请按导航页查阅对应文档。

## 配置层级 {#config-hierarchy}

ChatAI 插件使用多层配置系统：

```mermaid
flowchart LR
    A[默认配置] --> B[全局配置]
    B --> C[群组配置]
    C --> D[用户配置]
```

合并规则见 `config/config.js` 的 `mergeConfig`：对象按键深合并，数组与标量直接覆盖。配置文件读取时先做一次 `migrateTriggerAccessLists` 迁移（旧版 trigger 顶层黑白名单迁入 `trigger.private` / `trigger.group`），再与默认配置合并保存——即新增默认键会自动补入配置文件。

顶层配置结构中以下段落已在本目录按页拆分：

| 顶层键 | 文档 | 顶层键 | 文档 |
| --- | --- | --- | --- |
| `basic` / `admin` / `llm` | [基础配置](./basic) | `bym` / `proactiveChat` / `conversationTracking` / `game` | [伪人 / 主动聊天 / 游戏 / 会话追踪配置](./bym) |
| `channels`（含渠道子字段） | [渠道配置](./channels) / [渠道高级配置](./channels-advanced) | `tools` / `builtinTools` / `toolGroups` | [功能配置](./features) |
| `mcp` / `bilibili` / `redis` / `images` / `web` / `update` / `streaming` / `loadBalancing` / `probe` / `thinking` / `render` / `output` / `voice` | [思考 / 渲染 / 输出优化配置](./shared-advanced) | `proxy` | [代理配置](./proxy) |
| `context` | [上下文配置](./context) | `memory` | [记忆配置](./memory) |
| `presets` / `personality` | [人格隔离配置](./personality) | `trigger` | [触发配置](./triggers) |
| `features` | [功能配置](./features) | `errorNotify` | [错误通知](./error-notify) |

## 热重载与生效方式 {#hot-reload}

- 配置文件为 `config/config.yaml`，修改后通过 `#ai重载配置` 或重启生效。
- 管理面板与后端接口（`/api/config` 族）写入后立即保存到配置文件，一次性合并保存（`POST /api/config` 支持深度合并与顶层键/点分路径写入，见 `src/services/routes/configRoutes.js`）。
- `config.js` 内置危险路径防护：`__proto__` / `constructor` / `prototype` 三个键名不允许出现在配置路径中（顶层键与点分路径均校验）。

::: warning 需要重启的配置
- `web.port`：Web 服务端口（端口占用时服务端会自动尝试切换，见 `src/services/webServer.js` 的 `EADDRINUSE` 处理，但主动修改端口仍需重启生效）。
:::

## 敏感配置提示 {#security}

- 密钥类字段（渠道 `apiKey` / `apiKeys`、`mcp.server.apiKey`、`probe.secretKey` 等）不要提交到公开仓库。
- `data/skills.yaml`、`data/mcp-servers.json` 等数据文件与会话数据库（`data/chaite.db`）同样应排除在提交之外。

## 下一步

- [基础配置](./basic) - basic / admin / llm
- [渠道配置](./channels) - 渠道列表与备选模型
- [渠道高级配置](./channels-advanced) - 渠道级深入配置
- [思考 / 渲染 / 输出优化配置](./shared-advanced) - thinking / render / output / 基础设施段