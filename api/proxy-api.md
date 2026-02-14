# 代理接口

网络代理配置的 API 管理。

## 获取代理配置

```http
GET /api/proxy
```

**响应**

```json
{
  "success": true,
  "data": {
    "enabled": false,
    "profiles": [],
    "scopes": {
      "browser": { "enabled": false, "profileId": null },
      "api": { "enabled": false, "profileId": null },
      "channel": { "enabled": false, "profileId": null }
    }
  }
}
```

## 更新代理全局开关

```http
PUT /api/proxy
```

**请求体**

```json
{
  "enabled": true
}
```

## 设置作用域代理

```http
PUT /api/proxy/scopes/:scope
```

**路径参数**：`scope` 可选值为 `browser`、`api`、`channel`

**请求体**

```json
{
  "profileId": "profile_1",
  "enabled": true
}
```

## 管理代理配置文件

```http
POST /api/proxy/profiles
PUT /api/proxy/profiles/:id
DELETE /api/proxy/profiles/:id
```

**请求体（创建/更新）**

```json
{
  "name": "我的代理",
  "type": "http",
  "host": "127.0.0.1",
  "port": 7890
}
```

## 测试代理连通性

```http
POST /api/proxy/test
```

**请求体**

```json
{
  "profileId": "profile_1"
}
```
