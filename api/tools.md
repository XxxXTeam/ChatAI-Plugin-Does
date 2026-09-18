# 工具接口

工具路由位于 `src/services/routes/toolsRoutes.js`，挂载于 `/api/tools`（JWT 认证）。
响应封装为 `ChaiteResponse`（`{ code: 0, data, message: 'ok' }`）。

## 获取所有工具

```http
GET /api/tools/list
```

不做启用过滤，返回全部工具（含禁用状态），每个工具附带 `identity` 字段。

## 获取内置工具

```http
GET /api/tools/builtin
GET /api/tools/builtin/list
```

两者均返回 `builtinMcpServer.listTools()` 的数组。

## 内置工具类别

```http
GET /api/tools/builtin/categories
```

返回内置工具类别数组（含 `key` / `name` / `toolCount` / `enabled`）。

## 内置工具配置

```http
GET /api/tools/builtin/config
PUT /api/tools/builtin/config
```

GET 返回 builtinTools 配置的完整投影，字段包括：

`enabled`、`enabledCategories`、`allowedTools`、`disabledTools`、`allowDangerous`、
`dangerousTools`，以及审批相关字段 `approvalMode`（默认 `'auto'`）、
`approvalTimeoutMs`（默认 `60000`）、`approvalLowRiskTools`、`approvalMediumRiskTools`、
`approvalHighRiskTools`、`approvalBypassTools`、`approvalAllowSessionBypass`
（默认 `true`）、`approvalSessionBypassMaxRisk`（默认 `'medium'`）。

PUT 只合并请求体中出现的上述字段；写入后调用 `mcpManager.refreshBuiltinTools()`，
失败则回滚配置并重试。

## 类别 / 工具切换

```http
POST /api/tools/builtin/category/toggle    # { category: string, enabled: boolean }
POST /api/tools/builtin/tool/toggle        # { toolName: string, enabled: boolean }
```

字段缺失或类型错误返回 `400`。

## 刷新与批量开关

```http
POST /api/tools/builtin/refresh
POST /api/tools/builtin/enable-all
POST /api/tools/builtin/disable-all
POST /api/tools/refresh
POST /api/tools/reload-all
```

## 已废弃（兼容保留）接口

以下接口仍可用，但响应带 `deprecated: true` 与 `replacement` 字段，新调用应使用
替换后的端点：

| 旧端点 | 替换端点 |
|:-------|:---------|
| `GET /api/tools/enabled` | `GET /api/tools/builtin/config` |
| `PUT /api/tools/enabled` | `PUT /api/tools/builtin/config` |
| `POST /api/tools/toggle/:name` | `POST /api/tools/builtin/tool/toggle` |

## 测试工具执行（SSE）

```http
POST /api/tools/test
```

响应为 `text/event-stream` 流，事件依次为 `start` → `result` 或 `error`。

**请求体**

```json
{
  "toolName": "get_current_time",
  "arguments": { "timezone": "Asia/Shanghai" }
}
```

`toolName` 缺失时推 `error` 事件（`toolName is required`）。测试以管理上下文
（`userPermission: 'master'`，`isMaster: true`、`isAdminTest: true`）执行，
支持 `mcp:<serverName>:<toolName>` 形式调用 MCP 工具。

## 工具日志

```http
GET    /api/tools/logs
DELETE /api/tools/logs
```

## 自定义配置型工具

```http
GET    /api/tools/custom          # 已配置工具列表
POST   /api/tools/custom          # 创建（201；JSON 请求体）
PUT    /api/tools/custom/:name    # 更新
DELETE /api/tools/custom/:name    # 删除
```

注意：请求体为**JSON**（非 multipart 文件上传），由
`customToolService.createConfiguredTool(req.body)` 处理。

## 自定义 JS 工具（data/tools 源码管理）

```http
GET    /api/tools/js               # 源码文件列表
GET    /api/tools/js/:name         # 读取源文件 { name, filename, source, size, modifiedAt }
POST   /api/tools/js               # 新建（201；{ name, source }，name 必填）
PUT    /api/tools/js/:name         # 覆盖保存（{ source } 必填），响应附带 message: '工具已保存并热重载'
DELETE /api/tools/js/:name         # 删除源文件
POST   /api/tools/js/reload        # 重载 JS 工具
```

## 危险工具管理

```http
GET  /api/tools/dangerous
PUT  /api/tools/dangerous
POST /api/tools/dangerous/toggle
```

## 事件概率（伪人）配置

```http
GET /api/tools/event-probability
PUT /api/tools/event-probability
```

## 监工（watcher）

```http
GET  /api/tools/watcher/status
POST /api/tools/watcher/toggle
```

## 统计

```http
GET /api/tools/stats
```