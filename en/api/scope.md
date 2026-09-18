# Scope API

Independent per-user and per-group configuration management, supporting granular control over presets, trigger methods, models, and more.

## User Scopes

### Get All User Configs

```http
GET /api/scope/users
```

### Get User Config

```http
GET /api/scope/user/:userId
```

**Response**

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

### Update User Config

```http
PUT /api/scope/user/:userId
```

### Delete User Config

```http
DELETE /api/scope/user/:userId
```

## Group Scopes

### Get All Group Configs

```http
GET /api/scope/groups
```

### Get Group Config

```http
GET /api/scope/group/:groupId
```

### Update Group Config

```http
PUT /api/scope/group/:groupId
```

### Delete Group Config

```http
DELETE /api/scope/group/:groupId
```

## Batch Operations

### Batch Update

```http
POST /api/scope/batch
```

**Request Body**

```json
{
  "type": "group",
  "ids": ["123456", "789012"],
  "settings": {
    "presetId": "default"
  }
}
```