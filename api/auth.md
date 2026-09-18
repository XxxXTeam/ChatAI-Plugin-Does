# 认证接口

认证端点位于 `src/services/webServer.js` 的 `setupRoutes()` 中，与内部路由属于同一
`this.router`。JWT 由 `jsonwebtoken` 以 HS256 签发，签发参数固定为
`issuer: 'chatai-panel'`、`audience: 'chatai-client'`，有效期 30 天。
Cookie 名为 `auth_token`，`httpOnly: true`、`sameSite: 'lax'`，`secure` 取决于
`req.secure`、`x-forwarded-proto` 或 `NODE_ENV === 'production'`，`path` 为挂载路径。

## 支持的认证方式

| 方式 | 说明 | 说明补充 |
|------|------|---------|
| Cookie Token | `auth_token` Cookie | 30 天，浏览器会话保持 |
| Bearer JWT | `Authorization: Bearer {token}` | 30 天 |
| URL Token | `?token={token}` 查询参数 | `authMiddleware` 亦接受 |
| 客户端指纹 | `x-client-fingerprint` 请求头 | 登录后绑定，未绑定无需校验 |
| 内部令牌 | `x-chatai-internal-token` | 仅 `DELETE /api/system/release_port` 放行 |

认证中间件 `authMiddleware`：从 `Authorization` 头（Bearer）、`auth_token` Cookie、
`token` 查询参数三处取 token，校验 JWT 签名后检查客户端指纹；失败时 `401`。
注意：JWT 载荷不含 `userId` / `isAdmin` 字段，仅
`{ authenticated: true, loginTime, jti }` + `iss`/`aud`。这与旧文档不同。

## 获取一次性登录 Token

```http
GET /api/auth/token/generate
```

无需认证，但受限流保护（60 秒内最多 3 次）。

生成 5 分钟有效的临时登录 Token，输出到 Yunzai 控制台日志。

**响应**

```json
{
  "code": 0,
  "data": {
    "success": true,
    "message": "Token 已输出到 Yunzai 控制台",
    "expiresIn": "5分钟"
  },
  "message": "ok"
}
```

## 临时 Token 登录

```http
GET /login/token?token={token}
```

校验成功后签发 30 天 JWT 并写入 `auth_token` Cookie，`302` 重定向到
`{mountPath}/`；`token` 缺失时重定向 `{mountPath}/login/`；无效时重定向
`{mountPath}/login/?error=invalid_token`。

## Token 登录（POST）

```http
POST /api/auth/login
```

**请求体**

| 参数 | 类型 | 说明 |
|------|------|------|
| `token` / `password` | string | 临时登录 Token（二选一） |
| `fingerprint` | string | 客户端指纹；亦可放在 `x-client-fingerprint` 头 |

Token 无效返回 `401`（`Token 无效或已过期`）。

**响应**

```json
{
  "code": 0,
  "data": { "token": "<jwt>", "expiresIn": 2592000 },
  "message": "ok"
}
```

同时写入 `auth_token` Cookie。

## 验证临时 Token

```http
GET  /api/auth/verify-token?token={token}
POST /api/auth/verify-token
```

POST 体为 `{ "token": "..." }`；支持 `x-client-fingerprint` 头绑定。

- 成功：`data` 为 `{ token: '<jwt>', expiresIn: 2592000 }`（签发 30 天 JWT）
- 无 token：`400`，`Token is required`
- 无效/过期：`401`，`Invalid or expired token`

## 认证状态

```http
GET /api/auth/status
GET /api/state
```

两个端点行为一致：认证通过则返回 `data` 为 `{ authenticated: true }`。

## 永久 Token 管理

```http
POST   /api/auth/token/permanent
DELETE /api/auth/token/permanent
GET    /api/auth/token/status
```

- `POST` 生成/复用永久 Token（存于 `web.permanentAuthToken`），请求体
  `{ "forceNew": true }` 强制换新；响应 `data` 为 `{ token, isNew }`。
- `DELETE` 撤销：置空 `web.permanentAuthToken`，响应 `{ success: true, message: 'Token已撤销' }`。
- `GET` 返回 `{ hasPermanentToken: boolean }`。

## 群管理登录（独立认证体系）

群管理面板的登录与上述 JWT 无关，见[群组接口](./groups)：

```http
POST /api/group-admin/login
GET  /api/group-admin/verify
```

## 错误响应

| 场景 | HTTP | message |
|------|------|---------|
| 无 token | `401` | `No token provided` |
| JWT 过期 | `401` | `Token expired` |
| JWT 无效 | `401` | `Invalid token` |
| 指纹不匹配 | `401` | `Invalid client fingerprint` |
| 其他校验失败 | `401` | `Authentication failed` |