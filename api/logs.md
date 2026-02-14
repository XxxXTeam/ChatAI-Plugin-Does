# 日志接口

日志文件查看和模板占位符管理。

## 获取日志文件列表

```http
GET /api/logs
```

**响应**

```json
{
  "success": true,
  "data": [
    {
      "name": "chatai-2025-02-13.log",
      "size": 102400,
      "modified": "2025-02-13T18:00:00.000Z"
    }
  ]
}
```

## 获取最近错误日志

```http
GET /api/logs/recent
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| lines | number | 返回行数（默认 100） |

## 获取可用占位符

```http
GET /api/logs/placeholders
```

返回请求模板中可用的占位符列表及说明。

## 预览占位符替换

```http
POST /api/logs/placeholders/preview
```

**请求体**

```json
{
  "template": "Hello {{username}}, your id is {{userId}}",
  "context": {}
}
```
