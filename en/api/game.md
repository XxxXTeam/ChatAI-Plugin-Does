# Game API

Galgame character presets and game configuration management.

## Get Character Preset List

```http
GET /api/game/presets
```

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "default",
      "name": "Default Character",
      "description": "Generic Galgame character",
      "systemPrompt": "..."
    }
  ]
}
```

## Get a Single Preset

```http
GET /api/game/presets/:id
```

## Create a Character Preset

```http
POST /api/game/presets
```

**Request Body**

```json
{
  "name": "Campus Girl",
  "description": "A pure and lovely campus character",
  "systemPrompt": "You are a character in a campus story..."
}
```

## Update a Character Preset

```http
PUT /api/game/presets/:id
```

## Delete a Character Preset

```http
DELETE /api/game/presets/:id
```

## Get Game Config

```http
GET /api/game/config
```

**Response**

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

## Update Game Config

```http
PUT /api/game/config
```