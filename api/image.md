# 绘图接口

绘图路由位于 `src/services/routes/imageRoutes.js`，挂载于 `/api/imagegen`（JWT 认证）。
另有公开图片访问路由 `publicImageRouter` 挂载于 `/api/images`（无需认证）。
配置键为 `features.imageGen`，响应封装为 `ChaiteResponse`。

## 绘图配置

```http
GET /api/imagegen/config
PUT /api/imagegen/config
```

GET 返回 `features.imageGen` 配置对象。PUT 为浅合并写入同键，响应 `{ success: true }`。

## 预设

```http
GET /api/imagegen/presets              # 全部预设（builtin/custom/remote 合并，带 source 字段）
GET /api/imagegen/presets/builtin      # 仅内置预设数组
GET /api/imagegen/presets/custom       # 仅自定义预设数组
```

`GET /presets` 响应 `data` 结构：

```json
{
  "presets": [ { "uid": "preset_xxx", "source": "builtin", "keywords": ["手办"], "prompt": "...", "needImage": true } ],
  "remotePresets": {},
  "sources": [],
  "stats": { "builtin": 10, "custom": 2, "remote": 0 }
}
```

## 自定义预设（按数组下标）

```http
POST   /api/imagegen/custom-presets
PUT    /api/imagegen/custom-presets/:index
DELETE /api/imagegen/custom-presets/:index
```

POST 请求体 `{ keywords, prompt, needImage = true, splitGrid? }`；`keywords` 与
`prompt` 必填（缺失返回 `400`）。支持 `splitGrid: { cols, rows }`。`index` 越界返回 `404`。

## 内置预设（按 uid）

```http
PUT    /api/imagegen/builtin-presets/:uid
DELETE /api/imagegen/builtin-presets/:uid
```

按 `uid` 查找，不存在返回 `404`。

## 远程预设（缓存文件覆盖）

```http
PUT    /api/imagegen/remote-presets/:source/:uid
DELETE /api/imagegen/remote-presets/:source/:uid
```

`source` 为预设来源名称（URL 编码），操作对象为本地缓存文件
（`data/image/presets/<urlToFilename(url)>.json`），覆盖后不会写回配置。

## 生成图片

```http
POST /api/imagegen/generate
```

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 缺失返回 `400`（`prompt is required`） |
| `options` | object | 否 | 生成选项；`options.imageUrls` / `options.image_urls` 为参考图列表 |

有参考图时以 `img2img` 生成，否则 `text2img`。生成失败返回 `502`。

## 远程预设刷新

```http
POST /api/imagegen/presets/reload       # 只重读本地缓存与配置
POST /api/imagegen/presets/update       # 重新拉取远程源（请求体可选 { sourceName } 指定单源）
```

## 预设来源管理

```http
GET    /api/imagegen/sources
POST   /api/imagegen/sources
PUT    /api/imagegen/sources/:index
DELETE /api/imagegen/sources/:index
```

POST 请求体 `{ name, url, enabled = true }`（缺失返回 `400`；URL 重复返回 `400`
`来源已存在`），添加后立即尝试拉取并写缓存。`index` 越界返回 `404`（`来源不存在`）。