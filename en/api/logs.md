# Logs API

Log file viewing and template placeholder management.

## Get Log File List

```http
GET /api/logs
```

**Response**

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

## Get Recent Error Logs

```http
GET /api/logs/recent
```

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| lines | number | Number of lines to return (default 100) |

## Get Available Placeholders

```http
GET /api/logs/placeholders
```

Returns the list of placeholders available in request templates and their descriptions.

## Preview Placeholder Substitution

```http
POST /api/logs/placeholders/preview
```

**Request Body**

```json
{
  "template": "Hello {{username}}, your id is {{userId}}",
  "context": {}
}
```