# 预设 API

预设功能由两个路由前缀提供，均位于 `src/services/routes/presetRoutes.js`：

```js
this.router.use('/api/preset', createPresetRoutes(auth))          // 预设 CRUD
this.router.use('/api/presets', createPresetsConfigRoutes(auth))  // 配置、内置预设、分类
```

响应封装为 `ChaiteResponse`（`{ code: 0, data, message: 'ok' }`）。预设数据
由 `presetManager`（`src/services/preset/PresetManager.js`）管理。

## 预设 CRUD（/api/preset）

```http
GET    /api/preset/list                     # 所有预设（presetManager.getAll()）
GET    /api/preset/:id                      # 单个预设（404: Preset not found）
POST   /api/preset/                         # 创建（201）
PUT    /api/preset/:id                      # 更新（404: Preset not found）
DELETE /api/preset/:id                      # 删除（404: Preset not found）
```

PUT 特例：`isDefault === true` 时会先写入 `presets.defaultId` 与
`llm.defaultChatPresetId`，并把其余预设的 `isDefault` 置为 `false`。

### 设为默认

```http
POST /api/preset/:id/default
```

写入 `presets.defaultId` 与 `llm.defaultChatPresetId`，并把该预设标为 `isDefault`、
其余取消。响应 `{ success: true }`。

### 获取渲染后的系统提示词

```http
GET /api/preset/:id/prompt
```

**响应（data）**

```json
{ "prompt": "渲染后的完整系统提示词" }
```

### 从内置预设创建

```http
POST /api/preset/from-builtin/:builtinId
```

请求体为覆盖字段（`id` 可指定新 ID；缺省生成 `custom_<builtinId>_<时间戳>`）。
内置预设不存在返回 `404`。创建结果带 `isBuiltin: false` 与 `createdFrom` 字段，成功返回 `201`。

## 预设配置与元数据（/api/presets）

```http
GET /api/presets/config
PUT /api/presets/config
GET /api/presets/builtin
GET /api/presets/categories
```

- `GET /config` 返回 `presets` 配置（缺省值 `{ defaultId: 'default', allowUserSwitch: true, perUserPreset: false, perGroupPreset: false }`）
- `PUT /config` 接受 `{ defaultId, allowUserSwitch, perUserPreset, perGroupPreset }`，
  `defaultId` 同时写入 `llm.defaultChatPresetId`
- `GET /builtin` 返回全部内置预设（`presetManager.getAllBuiltin()`）
- `GET /categories` 返回预设分类（`presetManager.getCategories()`）

## 注意事项

- **没有** `/api/presets/:id/copy`、`/set-default`、`/export`、`/import` 端点；
  导入/导出与复制功能在本路由中不存在。
- 系统提示词获取路径为 `GET /api/preset/:id/prompt`。
- `PUT /api/preset/:id` 更新请求体会先经 `normalizePresetPayload`：
  `tools.toolApprovalMode` 为 `null` 时会被剔除，避免把非法值写入配置。