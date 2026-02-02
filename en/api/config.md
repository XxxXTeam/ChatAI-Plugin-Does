# Configuration API <Badge type="tip" text="Config" />

API endpoints for configuration management.

## Get Configuration {#get}

### GET /api/config

Get current configuration.

**Response:**
```json
{
  "success": true,
  "data": {
    "commandPrefix": "#",
    "debug": false,
    "trigger": {
      "private": "always",
      "group": "at"
    },
    "context": {
      "maxMessages": 20
    }
  }
}
```

## Update Configuration {#update}

### PUT /api/config

Update configuration values.

**Request:**
```json
{
  "debug": true,
  "trigger": {
    "group": "prefix",
    "prefix": "#ai"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": ["debug", "trigger.group", "trigger.prefix"]
  }
}
```

## Get Config Section {#section}

### GET /api/config/:section

Get specific config section.

**Sections:** `trigger`, `context`, `memory`, `channels`, `tools`

**Response:**
```json
{
  "success": true,
  "data": {
    "private": "always",
    "group": "at",
    "prefix": "#chat"
  }
}
```

## Update Config Section {#update-section}

### PUT /api/config/:section

Update specific section.

**Request:**
```json
{
  "maxMessages": 30,
  "cleaningStrategy": "sliding"
}
```

## Reload Configuration {#reload}

### POST /api/config/reload

Reload configuration from files.

**Response:**
```json
{
  "success": true,
  "message": "Configuration reloaded"
}
```

## Export Configuration {#export}

### GET /api/config/export

Export full configuration as YAML.

**Response:**
```yaml
commandPrefix: "#"
debug: false
trigger:
  private: always
  group: at
...
```

## Import Configuration {#import}

### POST /api/config/import

Import configuration from YAML.

**Request:**
```
Content-Type: text/yaml

commandPrefix: "#"
debug: false
...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imported": true,
    "changes": 15
  }
}
```

## Validate Configuration {#validate}

### POST /api/config/validate

Validate configuration without applying.

**Request:**
```json
{
  "channels": [
    {
      "name": "test",
      "baseUrl": "invalid-url"
    }
  ]
}
```

**Response:**
```json
{
  "success": false,
  "errors": [
    {
      "path": "channels[0].baseUrl",
      "message": "Invalid URL format"
    }
  ]
}
```

## Error Codes {#errors}

| Code | Description |
|:-----|:------------|
| `INVALID_CONFIG` | Config validation failed |
| `SECTION_NOT_FOUND` | Section doesn't exist |
| `PARSE_ERROR` | Failed to parse YAML |

## Next Steps {#next}

- [Authentication API](./auth) - Login endpoints
- [Tools API](./tools) - Tool management
