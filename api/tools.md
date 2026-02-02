# 工具接口

## 获取所有工具

```http
GET /api/tools
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| category | string | 按类别过滤 |
| source | string | 按来源过滤 (builtin/custom/mcp) |

**响应**

```json
{
  "success": true,
  "data": [
    {
      "name": "get_time",
      "description": "获取当前时间",
      "category": "basic",
      "source": "builtin",
      "parameters": {
        "type": "object",
        "properties": {
          "timezone": {
            "type": "string",
            "description": "时区"
          }
        }
      }
    }
  ]
}
```

## 按来源分组

```http
GET /api/tools/by-source
```

**响应**

```json
{
  "success": true,
  "data": {
    "builtin": [...],
    "custom": [...],
    "mcp": [...]
  }
}
```

## 获取工具详情

```http
GET /api/tools/:name
```

**响应**

```json
{
  "success": true,
  "data": {
    "name": "get_time",
    "description": "获取当前时间",
    "category": "basic",
    "source": "builtin",
    "parameters": {...},
    "dangerous": false,
    "adminOnly": false
  }
}
```

## 执行工具

```http
POST /api/tools/:name/execute
```

**请求体**

```json
{
  "args": {
    "timezone": "Asia/Shanghai"
  }
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "result": "2024-12-15 14:30:25"
  }
}
```

## 获取内置工具配置

```http
GET /api/tools/builtin/config
```

**响应**

```json
{
  "success": true,
  "data": {
    "enabledCategories": ["basic", "user", "web"],
    "disabledTools": []
  }
}
```

## 更新内置工具配置

```http
PUT /api/tools/builtin/config
```

**请求体**

```json
{
  "enabledCategories": ["basic", "user"],
  "disabledTools": ["execute_command"]
}
```

## 获取自定义工具列表

```http
GET /api/tools/custom
```

**响应**

```json
{
  "success": true,
  "data": [
    {
      "name": "my_tool",
      "file": "my-tool.js",
      "enabled": true
    }
  ]
}
```

## 上传自定义工具

```http
POST /api/tools/custom
Content-Type: multipart/form-data
```

**表单字段**

| 字段 | 类型 | 说明 |
|------|------|------|
| file | File | JS 工具文件 |

## 删除自定义工具

```http
DELETE /api/tools/custom/:name
```

## 重载工具

```http
POST /api/tools/reload
```

**响应**

```json
{
  "success": true,
  "data": {
    "builtin": 25,
    "custom": 3,
    "mcp": 10
  }
}
```

## 获取工具日志

```http
GET /api/tools/logs
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| limit | number | 返回条数 (默认 100) |
| toolName | string | 按工具名过滤 |
| userId | string | 按用户过滤 |

**响应**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "toolName": "get_time",
      "args": {},
      "result": "...",
      "userId": "123",
      "duration": 15,
      "timestamp": "2024-12-15T06:30:25.000Z"
    }
  ]
}
```

## 获取危险工具配置

```http
GET /api/tools/dangerous
```

**响应**

```json
{
  "success": true,
  "data": {
    "allowDangerous": false,
    "dangerousTools": ["execute_command", "delete_file"],
    "adminOnlyTools": ["kick_member"]
  }
}
```

## 更新危险工具配置

```http
PUT /api/tools/dangerous
```

**请求体**

```json
{
  "allowDangerous": false,
  "dangerousTools": ["execute_command"]
}
```
