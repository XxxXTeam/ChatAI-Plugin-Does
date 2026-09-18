# 统计与系统 API

统计路由位于 `src/services/routes/statsRoutes.js`，挂载于 `/api/stats`（JWT 认证）；
系统路由位于 `src/services/routes/systemRoutes.js`，挂载于 `/api`（JWT 认证），两套
路由在 `/api/stats/*` 上存在部分重叠（详见下文）。响应封装分别为 `ApiResponse` 与
`ChaiteResponse`，两者结构一致：`{ code: 0, data, message: 'ok' }`。

## 接口前缀说明

| 前缀 | 来源 | 说明 |
|:-----|:-----|:-----|
| `/api/stats` | `webServer.js:736` | `statsRoutes`（`statsRoutes.js`） |
| `/api` | `webServer.js:746` | `systemRoutes`（`systemRoutes.js`，定义 `/health`、`/version`、`/system/*`、`/stats/*`） |

Express 中 `statsRoutes` 与 `systemRoutes` 各自独立匹配：`/api/stats/usage`
同时被两条路由定义——`statsRoutes` 的 `GET /usage` 与 `systemRoutes` 的
`GET /stats/usage` 均在 Router 上注册，实际响应的先后取决于注册顺序（`statsRoutes`
先注册；两实现字段不同：前者返回 `usageStats.getStats(days)` + `today`，后者返回
`{ today, recent, modelRanking, channelRanking }`）。 `/api/stats/overview`、
`/api/stats/pricing*`、`/api/stats/clear`、`/api/stats/api-calls` 等则只存在于
`statsRoutes`。

## 概览统计

```http
GET /api/stats
GET /api/stats/overview
```

两者行为一致（`statsRoutes` 内同一 handler）：返回 `statsService.getOverview()` 并
附带 `pricing`（`modelPricingService.calculateStatsOverviewCost` 结果，计算失败时
该字段为 `null`）。

## API 调用记录

```http
GET /api/stats/api-calls
```

**查询参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `page` | number | `1` | 页码 |
| `limit` | number | `20` | 每页条数 |
| `channelId` | string | - | 按渠道过滤 |
| `success` | string | - | `'true'` / `'false'`，其余视为不过滤 |
| `startTime` / `endTime` | number | - | 毫秒时间戳 |

## 渠道 / 模型统计

```http
GET /api/stats/channels    # 渠道统计（getChannelStats）
GET /api/stats/models      # 模型统计（getModelStats）
```

## 使用统计

```http
GET  /api/stats/usage                      # 最近 N 天使用 + 今日统计
GET  /api/stats/usage/recent               # 最近使用记录
POST /api/stats/usage/clear                # 清除使用统计
GET  /api/stats/usage/channel/:id          # 单渠道使用统计
```

- `GET /usage`：查询参数 `days`（默认 `7`），返回 `{ ...getStats(days), today }`
  （仅 `statsRoutes` 实现）
- `GET /usage/recent`：查询参数 `limit`（默认 `50`）、`source`、`status`
  （`'success'` / `'failed'`）

## 清除 / 重置统计

```http
DELETE /api/stats/clear
POST   /api/stats/reset
```

两者行为一致（`statsService.clear()`），`reset` 为兼容前端保留。

## 价格统计

```http
GET  /api/stats/pricing                       # 获取模型价格信息
GET  /api/stats/pricing/calculate             # 计算费用
POST /api/stats/pricing/refresh               # 强制刷新价格缓存
```

`GET /pricing/calculate` 查询参数：`model`（必填，缺失返回 `400`）、`inputTokens`、
`outputTokens`（均为 token 数）。

## 系统路由（systemRoutes）

### 健康检查（公开，`/api/health` 同实现）

```http
GET /api/health
```

响应**不带** `{code,data,message}` 包装，直接返回：

```json
{
  "status": "healthy",
  "timestamp": 1700000000000,
  "uptime": 86400,
  "memoryUsage": { "heapUsed": 256, "heapTotal": 512, "rss": 700 }
}
```

### 版本信息

```http
GET /api/version
```

返回仓库类型/分支/提交信息：

```json
{
  "code": 0,
  "data": {
    "type": "beta",
    "typeName": "内测版",
    "repoName": "chatgpt-plugin",
    "remoteUrl": "",
    "commitId": "aae68eaf",
    "branch": "frontend",
    "commitTime": "2026-09-18 ... +0800",
    "shortTime": "..."
  },
  "message": "ok"
}
```

### 性能指标

```http
GET /api/metrics
```

返回 `{ timestamp, uptime, process: { pid, cpu, memory }, system: { platform, arch, nodeVersion } }`。

### 系统信息

```http
GET /api/system/info
```

返回 `{ version: '1.0.0', systemInfo: { nodejs, platform, arch, memory }, stats: { totalConversations: 0, activeUsers: 0, apiCalls: 0, presets } }`。

### 实时监控

```http
GET /api/system/monitor
```

返回三组数据：

- `memory`：`heapUsed` / `heapTotal` / `rss` / `external` / `systemTotal` /
  `systemFree` / `heapUsedPercent` / `systemUsedPercent`（单位 MB）
- `api`：`rpm`、`rpm5`、`successRate`、`avgLatency`、`tokensLastMinute`、`tokensPerMinute`
- `system`：`uptime`、`nodeVersion`、`platform`、`cpuCount`、`loadAvg`

### 释放端口（热重载用）

```http
DELETE /api/system/release_port
```

仅本机请求或主人可调用，否则 `403`（`仅允许本机内部调用或主人释放 Web 服务端口`）。
也可通过 `x-chatai-internal-token` 内部令牌调用。共享端口模式下返回
`{ success: false, message: '无需释放或共享端口模式' }`。

### 系统版本

```http
GET /api/system/version
```

返回 `{ version: '1.0.0', commitId, commitTime, branch, nodejs, platform }`。

### 服务器模式

```http
GET /api/system/server-mode
PUT /api/system/server-mode
```

GET 返回 `{ isTRSS, sharePortEnabled, currentMode: 'shared'|'standalone', port, canRestart }`。
PUT 请求体 `{ sharePort: boolean }`（非布尔返回 `400`），写入 `web.sharePort` 并回复
`{ success: true, message: '配置已保存，重启后生效', needRestart: true }`。

### 重启服务

```http
POST /api/system/restart
```

**请求体**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `type` | string | `reload` | `reload` 只重载 WebServer；`full` 重启 Bot（不支持时 `process.exit(0)`） |

响应立即返回 `{ success: true, message: '正在重启...' }`，100ms 后执行。

### 系统路由内的统计（`GET /api/stats/*`，与 statsRoutes 并存）

```http
GET  /api/stats
GET  /api/stats/full                       # 完整统计（getStats）
POST /api/stats/reset                      # 重置统计
GET  /api/stats/usage                      # { today, recent, modelRanking, channelRanking }
GET  /api/stats/usage/recent               # 过滤参数同 UsageStats
POST /api/stats/usage/clear
GET  /api/stats/usage/channel/:id
GET  /api/stats/tool-calls                 # 工具调用汇总
GET  /api/stats/tool-calls/records         # 工具调用记录
GET  /api/stats/tool-calls/record/:id      # 单条记录（404: 记录不存在）
GET  /api/stats/tool-calls/errors          # 工具调用错误（limit 默认 50）
POST /api/stats/tool-calls/clear           # 清除工具调用统计
GET  /api/stats/unified                    # 统一完整统计
```

`GET /stats/tool-calls/records` 查询参数：`limit`（默认 `100`）、`toolName`、`success`、
`userId`、`groupId`、`keyword`、`startTime`、`endTime`。

## 实用查询组合

| 需求 | 端点 |
|:-----|:-----|
| 概览 + 费用估算 | `GET /api/stats/overview` |
| 实时 KPIs（内存/RPM/延迟/token） | `GET /api/system/monitor` |
| 工具调用明细 | `GET /api/stats/tool-calls/records?toolName=...` |
| 单渠道用量 | `GET /api/stats/usage/channel/:id` |