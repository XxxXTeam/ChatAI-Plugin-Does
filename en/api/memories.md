# Memory API

Structured user memory management with categories, search, statistics, and batch operations. Routes are mounted at `/api/memory` (`src/services/routes/memoryRoutes.js`).

## Get User List

```http
GET /api/memory/users
```

**Response**

```json
{
  "success": true,
  "data": [
    { "userId": "123456", "memoryCount": 15 }
  ]
}
```

## Get Memory Statistics

```http
GET /api/memory/stats
```

**Response**

```json
{
  "success": true,
  "data": {
    "totalMemories": 120,
    "totalUsers": 8,
    "categories": {
      "profile": "Basic Information",
      "preference": "Preferences and Habits",
      "event": "Important Events",
      "relation": "Relationships",
      "topic": "Topic Interests",
      "custom": "Custom"
    }
  }
}
```

## Get Category Definitions

```http
GET /api/memory/categories
```

## Get a User's Memories

```http
GET /api/memory/user/:userId
```

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| format | string | `tree` (tree structure, default) or `list` |
| groupId | string | Restrict to a group |
| category | string | Filter by category |
| limit | number | Number of entries to return |

## Search Memories

```http
POST /api/memory/search
```

**Request Body**

| Parameter | Type | Description |
|-----------|------|-------------|
| query | string | Search keyword (required) |
| userId | string | Restrict to a user |
| groupId | string | Restrict to a group |
| category | string | Restrict to a category |
| limit | number | Number of entries (default 20) |

## Add a Memory

```http
POST /api/memory/user/:userId
```

**Request Body**

```json
{
  "content": "The user is a software engineer",
  "category": "profile"
}
```

## Update a Memory

```http
PUT /api/memory/:id
```

## Delete a Memory

```http
DELETE /api/memory/:id
```

The `hard` query parameter accepts `'true'` / `'1'` (query parameters are always strings; the bug where the old `=== 'true'` check was always false has been fixed).

## Clear a User's Memories

```http
DELETE /api/memory/user/:userId
```

The `hard` query parameter has the same semantics as above.

## Summarize Memories

```http
POST /api/memory/user/:userId/summarize
```

Runs an AI summary to merge the user's memories and reduce redundant entries. Summary results use structured lines in the form `[category] content` (category whitelist: `profile` / `preference` / `event` / `relation` / `topic` / `custom`); reasoning text output by the model is not stored.

**Request Body**

```json
{
  "useLLM": true,
  "cleanup": true
}
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `useLLM` | boolean | `true` | Whether to use an LLM for the summary |
| `cleanup` | boolean | `true` | Whether to run low-quality memory cleanup after summarizing (skipped when `cleanup === false` / `'false'`) |
| `groupId` | string | - | Restrict to a group |
| `model` | string | - | Specify the summary model |

## Clean Up Low-Quality Memories

```http
POST /api/memory/user/:userId/cleanup
```

Cleans up the user's low-quality memories (low confidence / expired / too old / too short) without an LLM call.