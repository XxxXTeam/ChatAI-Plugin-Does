---
title: Presets API
---

# Presets API <Badge type="tip" text="REST API" />

The presets API manages AI persona presets.

::: info 🎭 Preset System
Presets define the AI's persona, behavior, and capability scope — the core configuration for personalized AI.
:::

## Overview {#overview}

| Item | Value |
|:-----|:------|
| **Base Path** | `/api/presets` |
| **Authentication** | Login required |

## Endpoint List

### Get Preset List

```http
GET /api/presets
```

**Query Parameters**

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `type` | string | Filter by type: `system`, `user`, `all` |
| `search` | string | Search keyword |

**Response Example**

```json
{
  "success": true,
  "data": {
    "presets": [
      {
        "id": "default",
        "name": "Default Assistant",
        "description": "General-purpose AI assistant",
        "type": "system",
        "isDefault": true,
        "tools": {
          "enabled": true,
          "allowedTools": []
        }
      },
      {
        "id": "custom-cat",
        "name": "Catgirl",
        "description": "A cute catgirl persona",
        "type": "user",
        "isDefault": false
      }
    ]
  }
}
```

### Get Preset Details

```http
GET /api/presets/:id
```

**Response Example**

```json
{
  "success": true,
  "data": {
    "id": "custom-cat",
    "name": "Catgirl",
    "description": "A cute catgirl persona",
    "type": "user",
    "systemPrompt": "You are a cute catgirl...",
    "temperature": 0.8,
    "maxTokens": 2048,
    "tools": {
      "enabled": true,
      "allowedTools": ["get_current_time", "get_weather"],
      "excludedTools": []
    },
    "voice": {
      "enabled": false,
      "voiceId": ""
    },
    "createdAt": "2024-12-01T00:00:00Z",
    "updatedAt": "2024-12-15T10:00:00Z"
  }
}
```

### Create a Preset

```http
POST /api/presets
```

**Request Body**

```json
{
  "id": "my-preset",
  "name": "My Preset",
  "description": "Custom preset",
  "systemPrompt": "You are a friendly assistant...",
  "temperature": 0.7,
  "maxTokens": 2048,
  "tools": {
    "enabled": true,
    "allowedTools": []
  }
}
```

**Response Example**

```json
{
  "success": true,
  "data": {
    "id": "my-preset",
    "message": "Preset created successfully"
  }
}
```

### Update a Preset

```http
PUT /api/presets/:id
```

**Request Body**

```json
{
  "name": "Updated name",
  "systemPrompt": "New System Prompt...",
  "temperature": 0.8
}
```

### Delete a Preset

```http
DELETE /api/presets/:id
```

::: warning Note
System presets cannot be deleted; only user-created presets can.
:::

### Copy a Preset

```http
POST /api/presets/:id/copy
```

**Request Body**

```json
{
  "newId": "copied-preset",
  "newName": "Copied Preset"
}
```

### Set as Default

```http
POST /api/presets/:id/set-default
```

### Export a Preset

```http
GET /api/presets/:id/export
```

**Response**

Returns a YAML file download of the preset.

### Import a Preset

```http
POST /api/presets/import
```

**Request Body**

`multipart/form-data` format containing the preset file.

| Field | Type | Description |
|:------|:-----|:------------|
| `file` | file | Preset YAML file |
| `overwrite` | boolean | Whether to overwrite an existing preset with the same name |

## Preset Structure

### Full Field Reference

```typescript
interface Preset {
  id: string                    // Unique identifier
  name: string                  // Display name
  description?: string          // Description
  type: 'system' | 'user'       // Type
  isDefault?: boolean           // Whether this is the default preset

  // AI configuration
  systemPrompt: string          // System Prompt
  temperature?: number          // Temperature 0-2
  maxTokens?: number            // Max tokens
  topP?: number                 // Top P
  frequencyPenalty?: number     // Frequency penalty
  presencePenalty?: number      // Presence penalty

  // Tool configuration
  tools?: {
    enabled: boolean            // Enable tools
    allowedTools?: string[]     // Allowed tools
    excludedTools?: string[]    // Excluded tools
    allowDangerous?: boolean    // Allow dangerous tools
  }

  // Voice configuration
  voice?: {
    enabled: boolean
    voiceId: string
    speed?: number
  }

  // Memory configuration
  memory?: {
    enabled: boolean
    maxMemories?: number
  }

  // Metadata
  createdAt?: string
  updatedAt?: string
}
```

### YAML Format

```yaml
id: my-preset
name: My Preset
description: Custom AI persona

systemPrompt: |
  You are a professional technical assistant.
  Please answer questions in a concise and accurate manner.

temperature: 0.7
maxTokens: 2048

tools:
  enabled: true
  allowedTools:
    - get_current_time
    - get_weather
    - web_search

voice:
  enabled: false

memory:
  enabled: true
  maxMemories: 30
```

## Validation Rules

| Field | Rule |
|:------|:-----|
| `id` | Required, 3-50 characters, letters/digits/hyphens only |
| `name` | Required, 1-100 characters |
| `systemPrompt` | Max 10000 characters |
| `temperature` | A number between 0 and 2 |
| `maxTokens` | An integer between 1 and 128000 |

## Error Codes

| Error Code | Description |
|:-----------|:------------|
| `PRESET_NOT_FOUND` | Preset does not exist |
| `PRESET_EXISTS` | Preset ID already exists |
| `SYSTEM_PRESET` | System preset cannot be modified/deleted |
| `INVALID_PRESET` | Invalid preset format |

## Code Examples

### JavaScript

```javascript
// Get preset list
const presets = await fetch('/api/presets').then(r => r.json())

// Create a preset
await fetch('/api/presets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'my-assistant',
    name: 'My Assistant',
    systemPrompt: 'You are a friendly assistant...',
    temperature: 0.7
  })
})

// Update a preset
await fetch('/api/presets/my-assistant', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    temperature: 0.8
  })
})
```

## Next Steps

- [Group Admin API](./groups) - Group management API
- [Presets Guide](/guide/presets) - Guide to using presets