# 代理接口

代理路由位于 `src/services/routes/proxyRoutes.js`，挂载于 `/api/proxy`（JWT 认证）。
响应封装为 `ChaiteResponse`。该路由调用 `ProxyService`（`src/services/proxy/ProxyService.js`）
读写配置键 `proxy`；无此配置时 `getConfig()` 返回 `null`。

## 获取代理配置

```http
GET /api/proxy
```

**响应**：`data` 为 `proxyService.getConfig()` 的返回值。

```json
{
  "code": 0,
  "data": {
    "enabled": false,
    "profiles": [],
    "scopes": {
      "browser": { "enabled": false, "profileId": null },
      "api": { "enabled": false, "profileId": null },
      "channel": { "enabled": false, "profileId": null }
    }
  },
  "message": "ok"
}
```

## 更新代理全局开关

```http
PUT /api/proxy
```

**请求体**

| 参数 | 类型 | 说明 |
|------|------|------|
| `enabled` | boolean | 是否启用代理（仅接受此字段） |

**响应**：`{ success: true }`。

## 设置作用域代理

```http
PUT /api/proxy/scopes/:scope
```

**路径参数**：`scope` 可选值为 `browser`、`api`、`channel`。

**请求体**

```json
{
  "profileId": "profile_xxx",
  "enabled": true
}
```

## 获取代理配置列表

```http
GET /api/proxy/profiles
```

## 获取单个代理配置

```http
GET /api/proxy/profile/:id
```

按 ID 查找；不存在时返回 `404`（`Profile not found`）。

## 管理代理配置

```http
POST   /api/proxy/profiles          # 创建（201）
PUT    /api/proxy/profiles/:id      # 更新（404: Profile not found）
DELETE /api/proxy/profiles/:id      # 删除（404: Profile not found）
```

请求体由 `addProfile` / `updateProfile` 校验（含 `type`、`host`、`port` 等字段）。

## 测试代理连通性

```http
POST /api/proxy/test
```

**请求体**（两种方式二选一）

| 参数 | 类型 | 说明 |
|------|------|------|
| `profileId` | string | 使用已保存的配置（不存在返回 `404`） |
| `type` / `host` / `port` / `username` / `password` | - | 或直接给临时配置（`host`+`port` 必填，缺失返回 `400`） |
| `testUrl` | string | 探测地址，默认 `https://www.google.com` |