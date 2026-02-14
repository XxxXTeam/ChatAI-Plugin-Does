# 游戏接口

Galgame 角色预设和游戏配置管理。

## 获取角色预设列表

```http
GET /api/game/presets
```

**响应**

```json
{
  "success": true,
  "data": [
    {
      "id": "default",
      "name": "默认角色",
      "description": "通用 Galgame 角色",
      "systemPrompt": "..."
    }
  ]
}
```

## 获取单个预设

```http
GET /api/game/presets/:id
```

## 创建角色预设

```http
POST /api/game/presets
```

**请求体**

```json
{
  "name": "校园少女",
  "description": "清纯可爱的校园角色",
  "systemPrompt": "你是一个校园故事中的角色..."
}
```

## 更新角色预设

```http
PUT /api/game/presets/:id
```

## 删除角色预设

```http
DELETE /api/game/presets/:id
```

## 获取游戏配置

```http
GET /api/game/config
```

**响应**

```json
{
  "success": true,
  "data": {
    "probability": 0.1,
    "enableTools": true,
    "temperature": 1,
    "maxTokens": 8096
  }
}
```

## 更新游戏配置

```http
PUT /api/game/config
```
