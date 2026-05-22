# 预设 API <Badge type="tip" text="REST API" />

预设 API 用于管理 AI 人格预设。

::: info 🎭 预设系统
预设定义了 AI 的人格、行为和能力范围，是个性化 AI 的核心配置。
:::

## 概述 {#overview}

| 项目 | 值 |
|:-----|:---|
| **Base Path** | `/api/presets` |
| **认证** | 需要登录 |

## 接口列表

### 获取预设列表

```http
GET /api/presets
```

**查询参数**

| 参数 | 类型 | 说明 |
|:-----|:-----|:-----|
| `type` | string | 过滤类型：`system`, `user`, `all` |
| `search` | string | 搜索关键词 |

**响应示例**

```json
{
  "success": true,
  "data": {
    "presets": [
      {
        "id": "default",
        "name": "默认助手",
        "description": "通用 AI 助手",
        "type": "system",
        "isDefault": true,
        "tools": {
          "enabled": true,
          "allowedTools": []
        }
      },
      {
        "id": "custom-cat",
        "name": "猫娘",
        "description": "可爱的猫娘人格",
        "type": "user",
        "isDefault": false
      }
    ]
  }
}
```

### 获取预设详情

```http
GET /api/presets/:id
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "id": "custom-cat",
    "name": "猫娘",
    "description": "可爱的猫娘人格",
    "type": "user",
    "systemPrompt": "你是一只可爱的猫娘...",
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

### 创建预设

```http
POST /api/presets
```

**请求体**

```json
{
  "id": "my-preset",
  "name": "我的预设",
  "description": "自定义预设",
  "systemPrompt": "你是一个友好的助手...",
  "temperature": 0.7,
  "maxTokens": 2048,
  "tools": {
    "enabled": true,
    "allowedTools": []
  }
}
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "id": "my-preset",
    "message": "预设创建成功"
  }
}
```

### 更新预设

```http
PUT /api/presets/:id
```

**请求体**

```json
{
  "name": "更新后的名称",
  "systemPrompt": "新的 System Prompt...",
  "temperature": 0.8
}
```

### 删除预设

```http
DELETE /api/presets/:id
```

::: warning 注意
系统预设无法删除，只能删除用户创建的预设。
:::

### 复制预设

```http
POST /api/presets/:id/copy
```

**请求体**

```json
{
  "newId": "copied-preset",
  "newName": "复制的预设"
}
```

### 设为默认

```http
POST /api/presets/:id/set-default
```

### 导出预设

```http
GET /api/presets/:id/export
```

**响应**

返回预设的 YAML 文件下载。

### 导入预设

```http
POST /api/presets/import
```

**请求体**

`multipart/form-data` 格式，包含预设文件。

| 字段 | 类型 | 说明 |
|:-----|:-----|:-----|
| `file` | file | 预设 YAML 文件 |
| `overwrite` | boolean | 是否覆盖同名预设 |

## 预设结构

### 完整字段

```typescript
interface Preset {
  id: string                    // 唯一标识符
  name: string                  // 显示名称
  description?: string          // 描述
  type: 'system' | 'user'       // 类型
  isDefault?: boolean           // 是否为默认预设
  
  // AI 配置
  systemPrompt: string          // System Prompt
  temperature?: number          // 温度 0-2
  maxTokens?: number            // 最大 Token
  topP?: number                 // Top P
  frequencyPenalty?: number     // 频率惩罚
  presencePenalty?: number      // 存在惩罚
  
  // 工具配置
  tools?: {
    enabled: boolean            // 启用工具
    allowedTools?: string[]     // 允许的工具
    excludedTools?: string[]    // 排除的工具
    allowDangerous?: boolean    // 允许危险工具
  }
  
  // 语音配置
  voice?: {
    enabled: boolean
    voiceId: string
    speed?: number
  }
  
  // 记忆配置
  memory?: {
    enabled: boolean
    maxMemories?: number
  }
  
  // 元数据
  createdAt?: string
  updatedAt?: string
}
```

### YAML 格式

```yaml
id: my-preset
name: 我的预设
description: 自定义 AI 人格

systemPrompt: |
  你是一个专业的技术助手。
  请使用简洁准确的语言回答问题。

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

## 验证规则

| 字段 | 规则 |
|:-----|:-----|
| `id` | 必填，3-50 字符，仅字母数字和连字符 |
| `name` | 必填，1-100 字符 |
| `systemPrompt` | 最大 10000 字符 |
| `temperature` | 0-2 之间的数字 |
| `maxTokens` | 1-128000 的整数 |

## 错误码

| 错误码 | 说明 |
|:-------|:-----|
| `PRESET_NOT_FOUND` | 预设不存在 |
| `PRESET_EXISTS` | 预设 ID 已存在 |
| `SYSTEM_PRESET` | 系统预设不可修改/删除 |
| `INVALID_PRESET` | 预设格式错误 |

## 代码示例

### JavaScript

```javascript
// 获取预设列表
const presets = await fetch('/api/presets').then(r => r.json())

// 创建预设
await fetch('/api/presets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'my-assistant',
    name: '我的助手',
    systemPrompt: '你是一个友好的助手...',
    temperature: 0.7
  })
})

// 更新预设
await fetch('/api/presets/my-assistant', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    temperature: 0.8
  })
})
```

## 下一步

- [群组接口](./groups) - 群组管理 API
- [预设指南](/guide/presets) - 预设使用指南
