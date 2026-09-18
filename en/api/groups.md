# Group Admin API <Badge type="tip" text="REST API" />

The group admin API provides group-level configuration and management features.

::: warning 🔐 Permission Required
This API requires **group admin permission**; regular users cannot access other groups' configuration.
:::

## Overview {#overview}

| Item | Value |
|:-----|:------|
| **Base Path** | `/api/group-admin` |
| **Authentication** | Login required |
| **Permission** | Group admin permission required |

## Endpoint List

### Get Group List

Returns the list of groups the current user can manage.

```http
GET /api/group-admin/groups
```

**Response Example**

```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "123456789",
        "name": "Test Group",
        "memberCount": 100,
        "enabled": true,
        "preset": "default",
        "hasCustomConfig": true
      }
    ]
  }
}
```

### Get Group Config

Returns the detailed configuration of a group.

```http
GET /api/group-admin/groups/:groupId/config
```

**Path Parameters**

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `groupId` | string | Group ID |

**Response Example**

```json
{
  "success": true,
  "data": {
    "groupId": "123456789",
    "enabled": true,
    "preset": "default",
    "triggers": {
      "prefix": ["#ai"],
      "at": true,
      "random": 0
    },
    "tools": {
      "enabled": true,
      "allowedCategories": ["basic", "user"],
      "disabledTools": []
    },
    "memory": {
      "enabled": true
    },
    "rateLimit": {
      "enabled": false,
      "maxRequests": 10,
      "windowSeconds": 60
    }
  }
}
```

### Update Group Config

Updates the configuration of a group.

```http
PUT /api/group-admin/groups/:groupId/config
```

**Request Body**

```json
{
  "enabled": true,
  "preset": "custom-preset",
  "triggers": {
    "prefix": ["#ai", "assistant"],
    "at": true
  }
}
```

**Response Example**

```json
{
  "success": true,
  "data": {
    "message": "Configuration updated"
  }
}
```

### Reset Group Config

Resets the group configuration to defaults.

```http
DELETE /api/group-admin/groups/:groupId/config
```

**Response Example**

```json
{
  "success": true,
  "data": {
    "message": "Configuration reset"
  }
}
```

### Get Group Member List

```http
GET /api/group-admin/groups/:groupId/members
```

**Query Parameters**

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `page` | number | Page number, default 1 |
| `limit` | number | Page size, default 50 |
| `search` | string | Search keyword |

**Response Example**

```json
{
  "success": true,
  "data": {
    "members": [
      {
        "userId": "111222333",
        "nickname": "User A",
        "role": "member",
        "blocked": false,
        "lastActive": "2024-12-15T10:30:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 50
  }
}
```

### Update Member Settings

```http
PUT /api/group-admin/groups/:groupId/members/:userId
```

**Request Body**

```json
{
  "blocked": true,
  "remark": "Rule-breaking user"
}
```

### Get Group Stats

```http
GET /api/group-admin/groups/:groupId/stats
```

**Query Parameters**

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `period` | string | Statistics period: `day`, `week`, `month` |

**Response Example**

```json
{
  "success": true,
  "data": {
    "totalMessages": 1500,
    "aiResponses": 300,
    "toolCalls": 50,
    "activeUsers": 25,
    "topUsers": [
      { "userId": "111", "nickname": "User A", "count": 50 }
    ],
    "dailyStats": [
      { "date": "2024-12-15", "messages": 100, "responses": 20 }
    ]
  }
}
```

### Get Group Conversation History

```http
GET /api/group-admin/groups/:groupId/conversations
```

**Query Parameters**

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `limit` | number | Number limit |
| `before` | string | Timestamp; returns records before this time |

### Clear Group Conversation History

```http
DELETE /api/group-admin/groups/:groupId/conversations
```

### Get Group Memories

```http
GET /api/group-admin/groups/:groupId/memories
```

**Query Parameters**

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `category` | string | Memory category |
| `limit` | number | Number limit |

### Batch Operations

#### Batch Update Group Config

```http
POST /api/group-admin/groups/batch
```

**Request Body**

```json
{
  "groupIds": ["123456789", "987654321"],
  "action": "update",
  "config": {
    "enabled": true
  }
}
```

#### Batch Enable/Disable

```http
POST /api/group-admin/groups/batch/toggle
```

**Request Body**

```json
{
  "groupIds": ["123456789", "987654321"],
  "enabled": true
}
```

## Group Preset Management

### Get Available Presets for a Group

```http
GET /api/group-admin/groups/:groupId/presets
```

### Set Group Preset

```http
PUT /api/group-admin/groups/:groupId/preset
```

**Request Body**

```json
{
  "presetId": "custom-preset"
}
```

## Group Tool Configuration

### Get Group Tool Settings

```http
GET /api/group-admin/groups/:groupId/tools
```

### Update Group Tool Settings

```http
PUT /api/group-admin/groups/:groupId/tools
```

**Request Body**

```json
{
  "enabled": true,
  "allowedCategories": ["basic", "user", "web"],
  "disabledTools": ["execute_command"],
  "allowDangerous": false
}
```

## Group Trigger Configuration

### Get Trigger Settings

```http
GET /api/group-admin/groups/:groupId/triggers
```

### Update Trigger Settings

```http
PUT /api/group-admin/groups/:groupId/triggers
```

**Request Body**

```json
{
  "prefix": ["#ai", "assistant"],
  "at": true,
  "random": 0.05,
  "keywords": ["help me", "please"]
}
```

## Error Responses

```json
{
  "success": false,
  "error": "Group does not exist or no permission to access",
  "code": "GROUP_NOT_FOUND"
}
```

### Error Codes

| Error Code | Description |
|:-----------|:------------|
| `GROUP_NOT_FOUND` | Group does not exist |
| `NO_PERMISSION` | No admin permission |
| `INVALID_CONFIG` | Invalid configuration format |
| `USER_NOT_FOUND` | User does not exist |

## Code Examples

### JavaScript

```javascript
// Get group config
const response = await fetch('/api/group-admin/groups/123456789/config', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
const { data } = await response.json()

// Update group config
await fetch('/api/group-admin/groups/123456789/config', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    preset: 'new-preset',
    triggers: { at: true }
  })
})
```

## Next Steps

- [Presets API](./presets) - Preset management API
- [Config API](./config) - Global configuration API