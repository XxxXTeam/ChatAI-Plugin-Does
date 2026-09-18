# 日志接口

日志路由位于 `src/services/routes/logsRoutes.js`，同时挂载于 `/api/logs` 与
`/api/placeholders`（均经 JWT 认证）：

```js
this.router.use('/api/logs', auth, logsRoutes)
this.router.use('/api/placeholders', auth, placeholdersRouter)
```

响应封装为 `ChaiteResponse`（`{ code: 0, data, message: 'ok' }`）。数据源为
`logService`（`src/services/stats/LogService.js`），占位符来自
`requestTemplateService`（`src/services/proxy/RequestTemplateService.js`）。

## 获取日志文件列表

```http
GET /api/logs
```

**响应**：`data` 为 `logService.getLogFiles()` 的文件数组。

## 获取最近错误日志

```http
GET /api/logs/recent
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| lines | number | 返回行数（默认 100） |

**响应**：`data` 为 `logService.getRecentErrors(lines)` 结果。

## 获取可用占位符

```http
GET /api/logs/placeholders
GET /api/placeholders
```

返回请求模板中可用的占位符列表及说明
（`requestTemplateService.getAvailablePlaceholders()`）。两条路径同实现。

## 预览占位符替换

```http
POST /api/logs/placeholders/preview
POST /api/placeholders/preview
```

**请求体**

```json
{
  "template": "Hello {{username}}, your id is {{userId}}",
  "context": {}
}
```

`context` 缺省按 `{}` 处理。**响应（data）**

```json
{ "result": "替换后的模板" }
```