# 绘图接口

绘图预设管理、远程预设缓存和绘图配置。

## 获取所有预设

```http
GET /api/image/presets
```

**响应**

```json
{
  "success": true,
  "data": {
    "builtin": [
      {
        "uid": "preset_xxx",
        "keywords": ["手办", "手办化"],
        "needImage": true,
        "prompt": "请将图片转换为手办风格..."
      }
    ],
    "custom": [],
    "remote": {}
  }
}
```

## 刷新远程预设

```http
POST /api/image/presets/refresh
```

从配置的远程预设源重新拉取并缓存预设。

## 添加自定义预设

```http
POST /api/image/presets/custom
```

**请求体**

```json
{
  "keywords": ["像素风", "像素化"],
  "needImage": true,
  "prompt": "将图片转换为像素风格..."
}
```

## 删除自定义预设

```http
DELETE /api/image/presets/custom/:uid
```

## 获取绘图配置

```http
GET /api/image/config
```

**响应**

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

## 更新绘图配置

```http
PUT /api/image/config
```

## 获取绘图 API 列表

```http
GET /api/image/apis
```

## 添加/更新/删除绘图 API

```http
POST /api/image/apis
PUT /api/image/apis/:index
DELETE /api/image/apis/:index
```
