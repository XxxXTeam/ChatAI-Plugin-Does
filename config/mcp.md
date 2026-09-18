# MCP 配置

MCP (Model Context Protocol) 是标准化的工具调用协议，本文对照 config 默认配置（`config/config.js` 的 `getDefaultConfig()`，对应提交 `5351e7d7`）的 `mcp` 段与 `builtinTools` 段编写。

## mcp 基础配置

```yaml
mcp:
  enabled: true   # 启用 MCP
  timeouts:       # MCP 超时配置（毫秒），单个服务器配置中的 timeouts 字段可覆盖全局值
    connect: 30000      # 连接超时
    request: 1800000    # 请求超时：30 分钟（image_create 等长耗时工具）
    sseConnect: 15000   # SSE 连接超时
    sseEndpoint: 2000   # SSE endpoint 等待超时
    startup: 5000       # 进程启动超时
    ping: 5000          # ping 超时
    heartbeat: 30000    # 心跳间隔
    terminate: 3000     # 进程强制终止超时
```

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `mcp.enabled` | boolean | `true` | 启用 MCP |
| `mcp.timeouts.connect` | number | `30000` | 连接超时（毫秒） |
| `mcp.timeouts.request` | number | `1800000` | 请求超时（毫秒，默认 30 分钟） |
| `mcp.timeouts.sseConnect` | number | `15000` | SSE 连接超时（毫秒） |
| `mcp.timeouts.sseEndpoint` | number | `2000` | SSE endpoint 等待超时（毫秒） |
| `mcp.timeouts.startup` | number | `5000` | 进程启动超时（毫秒） |
| `mcp.timeouts.ping` | number | `5000` | ping 超时（毫秒） |
| `mcp.timeouts.heartbeat` | number | `30000` | 心跳间隔（毫秒） |
| `mcp.timeouts.terminate` | number | `3000` | 进程强制终止超时（毫秒） |

::: danger 历史页面更正
本页旧版书写的 `mcp.parallelExecution` / `mcp.timeout` / `mcp.security` / `mcp.permissions` / `mcp.logging` / `mcp.cache` 在默认配置中均不存在，已删除。并行工具执行的真实配置是 `tools.parallelExecution`（见 [功能配置](./features)）。外部 MCP 服务器列表不是 `config.yaml` 内容，而是 `data/mcp-servers.json` 文件（`src/mcp/McpManager.js` 中 `MCP_SERVERS_FILE` 常量指向该路径）。
:::

## 外部 MCP 服务器

配置文件：`data/mcp-servers.json`（`McpManager` 加载源）。该文件结构由管理器读写，页面示例以实际文件为准，此处不再贴出虚构的 `servers` 键结构。接入方式建议通过管理面板的「MCP 服务」页操作。

## MCP 服务端暴露模式

除了作为 MCP **客户端**接入外部服务器，本插件还可作为 MCP **服务端**，将内置工具以标准 MCP 协议通过 HTTP 暴露给外部 MCP 客户端（如 Claude Desktop、Cline 等），由 `src/services/routes/mcpServerRoutes.js` 实现。默认配置：

```yaml
mcp:
  server:
    enabled: false   # 是否启用 MCP Server 暴露（默认关闭）
    apiKey: ''       # Bearer Token 鉴权密钥，留空则无法访问
```

### 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mcp.server.enabled` | boolean | `false` | 是否对外暴露内置工具，需显式设为 `true` 才可访问 |
| `mcp.server.apiKey` | string | `''` | Bearer Token 鉴权密钥，用于校验客户端请求 |

::: tip API Key 自动生成
在管理面板中开启 MCP Server，或调用后端接口生成密钥时，系统会自动生成形如 `mcp-<48位十六进制>` 的密钥并同时启用服务端。
:::

### 访问端点 {#server-endpoints}

服务端路由挂载于插件 Web 服务的 `<mountPath>/mcp`（默认 `mountPath` 为 `/chatai`，即端点为 `/chatai/mcp`），支持两种传输模式：

| 传输模式 | 方法与路径 | 说明 |
|----------|-----------|------|
| Streamable HTTP（推荐）| `POST /`（即 `/chatai/mcp`）| 单端点直接收发 JSON-RPC，`initialize` 响应返回 `Mcp-Session-Id` |
| SSE | `GET /sse` + `POST /message?sessionId=xxx` | `GET /sse` 建立事件流并下发 message endpoint，客户端经 `POST /message` 发送请求 |

此外 `GET /`（即 `/chatai/mcp`）返回服务端状态信息（工具数量、活跃会话数、支持的传输列表等）。所有端点均需通过鉴权中间件。

### 鉴权方式

所有请求必须在 HTTP 头中携带 Bearer Token：

```
Authorization: Bearer mcp-xxxxxxxxxxxxxxxxxxxxxxxx
```

鉴权中间件的校验顺序（源码 `mcpAuthMiddleware`）：

1. 若 `mcp.server.enabled` 不为 `true` → 返回 `403`（`MCP Server 未启用`）。
2. 若未配置 `apiKey` → 返回 `500`（`未配置 API Key`）。
3. 若 Token 缺失或与 `apiKey` 不匹配 → 返回 `401`（`鉴权失败`）。

### 使用场景与安全注意事项

- **使用场景**：将插件的 QQ 操作、群管理、搜索、文件等内置工具复用给外部 Agent/IDE，实现跨客户端的统一工具能力。
- **安全建议**：
  - `apiKey` 等同于访问凭证，请妥善保管，避免提交到公开仓库或日志。
  - 内置工具中包含群管理、文件读写等高权限操作，对外暴露前请评估调用方可信度。
  - 非必要时保持 `mcp.server.enabled: false`，仅在需要对外集成时临时开启。
  - 建议仅在内网或经反向代理加鉴权的环境下暴露该端点。

## 内置工具配置 builtinTools

`builtinTools` 是独立的顶层段（不在 `mcp` 下），默认配置：

```yaml
builtinTools:
  enabled: true            # 启用内置工具
  allowedTools: []         # 允许的工具列表，空数组表示允许所有
  disabledTools: []        # 禁用的工具列表
  dangerousTools:          # 危险工具需要确认
    - kick_member
    - mute_member
    - recall_message
    - mute_all
    - set_group_admin
    - set_group_card
    - set_group_title
    - set_group_name
    - send_group_notice
    - delete_group_notice
    - write_file
    - delete_file
    - move_file
    - copy_file
    - create_directory
    - execute_command
  dangerousToolsExcluded: []   # 用户显式豁免的工具
  allowDangerous: false        # 是否允许危险操作
  approvalMode: 'auto'         # 审批模式
  approvalTimeoutMs: 60000
  approvalLowRiskTools: []
  approvalMediumRiskTools: []
  approvalHighRiskTools: []
  approvalBypassTools: []
  approvalAllowSessionBypass: true
  approvalSessionBypassMaxRisk: 'medium'
```

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | boolean | `true` | 启用内置工具 |
| `allowedTools` | array | `[]` | 允许的工具列表，空数组表示允许所有 |
| `disabledTools` | array | `[]` | 禁用的工具列表 |
| `dangerousTools` | array | 见上方 16 项 | 危险工具需要确认 |
| `dangerousToolsExcluded` | array | `[]` | 用户显式豁免：最终生效名单 = （内置默认 ∪ `dangerousTools`）− `dangerousToolsExcluded` |
| `allowDangerous` | boolean | `false` | 是否允许危险操作 |
| `approvalMode` | string | `'auto'` | 审批模式；`ToolApprovalService` 合法值为 `'ask'` / `'auto'` / `'confirm_all'` / `'yolo'`，非法值归一为 `'auto'` |
| `approvalTimeoutMs` | number | `60000` | 审批超时（毫秒） |
| `approvalLowRiskTools` | array | `[]` | 低风险审批工具列表 |
| `approvalMediumRiskTools` | array | `[]` | 中风险审批工具列表 |
| `approvalHighRiskTools` | array | `[]` | 高风险审批工具列表 |
| `approvalBypassTools` | array | `[]` | 绕过审批的工具列表 |
| `approvalAllowSessionBypass` | boolean | `true` | 允许会话级豁免（`!== false` 判断） |
| `approvalSessionBypassMaxRisk` | string | `'medium'` | 会话豁免允许的最高风险级（`'low'` / `'medium'` / `'high'`，非法值归一为 `'medium'`） |

::: warning 关于 enabledCategories
`config.yaml` 实例中出现过 `builtinTools.enabledCategories` 列表，该项**不在默认配置中**。工具类别启用逻辑现由 `data/skills.yaml` 的 `skills.sources.builtin.categories` / `getEnabledCategories()` 承载（`src/services/skills/SkillsConfig.js`、`SkillsLoader.js`），类别管理请在面板的「内置工具」页操作。
:::

## 完整示例

```yaml
mcp:
  enabled: true
  timeouts:
    connect: 30000
    request: 1800000
    sseConnect: 15000
    sseEndpoint: 2000
    startup: 5000
    ping: 5000
    heartbeat: 30000
    terminate: 3000
  server:
    enabled: false
    apiKey: ""

builtinTools:
  enabled: true
  allowedTools: []
  disabledTools: []
  dangerousToolsExcluded: []
  allowDangerous: false
  approvalMode: auto
  approvalTimeoutMs: 60000
```

## 下一步

- [代理配置](./proxy) - 网络代理设置
- [工具组配置](./tool-groups) - 工具组与调度
- [功能配置](./features) - tools 并行执行等工具调用配置