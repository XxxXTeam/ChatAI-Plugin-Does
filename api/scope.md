# 作用域接口

用户和群组级别的独立配置管理，支持预设、触发方式、模型等粒度控制。

## 用户作用域

### 获取所有用户配置

```http
GET /api/scope/users
```

### 获取用户配置

```http
GET /api/scope/user/:userId
```

**响应**

```json
{
  "success": true,
  "data": {
    "userId": "123456",
    "presetId": "creative",
    "model": "gpt-4o",
    "temperature": 0.9
  }
}
```

### 更新用户配置

```http
PUT /api/scope/user/:userId
```

### 删除用户配置

```http
DELETE /api/scope/user/:userId
```

## 群组作用域

### 获取所有群组配置

```http
GET /api/scope/groups
```

### 获取群组配置

```http
GET /api/scope/group/:groupId
```

### 更新群组配置

```http
PUT /api/scope/group/:groupId
```

### 删除群组配置

```http
DELETE /api/scope/group/:groupId
```

## 批量操作

### 批量更新

```http
POST /api/scope/batch
```

**请求体**

```json
{
  "type": "group",
  "ids": ["123456", "789012"],
  "settings": {
    "presetId": "default"
  }
}
```
