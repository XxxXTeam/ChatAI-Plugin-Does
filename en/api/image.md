# Image API

Drawing preset management, remote preset caching, and image generation configuration.

## Get All Presets

```http
GET /api/image/presets
```

**Response**

```json
{
  "success": true,
  "data": {
    "builtin": [
      {
        "uid": "preset_xxx",
        "keywords": ["figure", "figurization"],
        "needImage": true,
        "prompt": "Please convert this image into a figurine style..."
      }
    ],
    "custom": [],
    "remote": {}
  }
}
```

## Refresh Remote Presets

```http
POST /api/image/presets/refresh
```

Re-fetches presets from the configured remote preset source and caches them.

## Add a Custom Preset

```http
POST /api/image/presets/custom
```

**Request Body**

```json
{
  "keywords": ["pixel-art", "pixelated"],
  "needImage": true,
  "prompt": "Convert this image into a pixel-art style..."
}
```

## Delete a Custom Preset

```http
DELETE /api/image/presets/custom/:uid
```

## Get Image Config

```http
GET /api/image/config
```

**Response**

```json
{
  "success": true,
  "data": {
    "enabled": true,
    "model": "gemini-3-flash-image",
    "videoModel": "gemini-3-pro-preview-video",
    "timeout": 60000,
    "maxImages": 30,
    "sendMode": "direct"
  }
}
```

## Update Image Config

```http
PUT /api/image/config
```

## Get Image API List

```http
GET /api/image/apis
```

## Add / Update / Delete Image APIs

```http
POST /api/image/apis
PUT /api/image/apis/:index
DELETE /api/image/apis/:index
```