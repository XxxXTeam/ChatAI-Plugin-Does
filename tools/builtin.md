# 内置工具 <Badge type="info" text="20 Categories" />

内置工具是插件核心功能的一部分，位于 `src/mcp/tools/` 目录，由 `BuiltinMcpServer` 管理。

::: tip 工具管理
通过 Web 面板可以按类别启用/禁用工具，支持**热重载**无需重启。
:::

## 目录结构 {#directory}

::: details 完整目录结构（点击展开）
```
src/mcp/tools/
├── index.js         # 工具加载器（动态导入、类别管理）
├── helpers.js       # 工具辅助函数（参数校验、权限检查）
├── basic.js         # 基础工具
├── user.js          # 用户信息
├── group.js         # 群组信息
├── message.js       # 消息操作
├── admin.js         # 群管理
├── groupStats.js    # 群统计
├── file.js          # 文件操作
├── media.js         # 媒体处理
├── web.js           # 网页访问
├── search.js        # 搜索工具
├── utils.js         # 实用工具
├── memory.js        # 记忆管理
├── context.js       # 上下文管理
├── bot.js           # Bot信息
├── voice.js         # 语音/声聊
├── extra.js         # 扩展工具
├── shell.js         # 系统命令（⚠️危险）
├── schedule.js      # 定时任务
├── bltools.js       # 扩展工具集
└── reminder.js      # 定时提醒
```
:::

## 工具类别（20个）{#categories}

::: info 类别说明
每个类别包含多个相关工具，可按类别整体启用/禁用。
:::

| 类别 | 名称 | 说明 | 风险等级 |
|:-----|:-----|:-----|:--------:|
| `basic` | 基础工具 | 时间获取、随机数等基础功能 | 🟢 安全 |
| `user` | 用户信息 | 获取用户信息、好友列表等 | 🟢 安全 |
| `group` | 群组信息 | 获取群信息、成员列表等 | 🟢 安全 |
| `message` | 消息操作 | 发送消息、@用户、获取聊天记录、转发消息解析 | 🟡 中等 |
| `admin` | 群管理 | 禁言、踢人、设置群名片等管理功能 | 🟠 较高 |
| `groupStats` | 群统计 | 群星级、龙王、发言榜、幸运字符、不活跃成员 | 🟢 安全 |
| `file` | 文件操作 | 群文件上传下载、本地文件读写、URL下载 | 🟠 较高 |
| `media` | 媒体处理 | 图片解析、语音处理、二维码生成等 | 🟢 安全 |
| `web` | 网页访问 | 访问网页、获取内容等 | 🟡 中等 |
| `search` | 搜索工具 | 网页搜索、Wiki查询、翻译等 | 🟢 安全 |
| `utils` | 实用工具 | 计算、编码转换、时间处理等 | 🟢 安全 |
| `memory` | 记忆管理 | 用户记忆的增删改查 | 🟢 安全 |
| `context` | 上下文管理 | 对话上下文、群聊上下文等 | 🟢 安全 |
| `bot` | Bot信息 | 获取机器人自身信息、状态、好友列表等 | 🟢 安全 |
| `voice` | 语音/声聊 | AI语音对话、TTS语音合成、语音识别等 | 🟢 安全 |
| `extra` | 扩展工具 | 天气查询、一言、骰子、倒计时、提醒、插画 | 🟢 安全 |
| `shell` | 系统命令 | 执行Shell命令、获取系统信息 | 🔴 **危险** |
| `schedule` | 定时任务 | 创建、管理定时任务，支持周期执行 | 🟡 中等 |
| `bltools` | 扩展工具 | QQ音乐、表情包、B站视频、GitHub、AI图片编辑等 | 🟢 安全 |
| `reminder` | 定时提醒 | 设置定时提醒，支持相对/绝对时间、重复 | 🟢 安全 |

::: danger shell 类别警告
`shell` 类别可执行系统命令，存在安全风险。建议仅在可信环境下启用，并限制为主人权限。
:::

## 创建内置工具 {#create-tool}

::: tip 开发流程
1. 在类别文件中添加工具定义 → 2. 注册新类别（可选）→ 3. 配置启用
:::

### Step 1：在对应类别文件中添加工具 {#step-1}

```javascript{2-5,7-16,18-22}
// src/mcp/tools/basic.js
export const basicTools = [
  {
    // 工具名称（snake_case，全局唯一）
    name: 'my_tool',
    
    // 工具描述（AI 可见，描述清晰有助于正确调用）
    description: '我的工具描述，说明功能和使用场景',
    
    // 参数定义（JSON Schema 格式）
    inputSchema: {
      type: 'object',
      properties: {
        input: {
          type: 'string',
          description: '输入参数说明'
        }
      },
      required: ['input']
    },
    
    // 处理函数（异步）
    handler: async (args) => {
      const { input } = args
      // 实现逻辑
      return { success: true, result: input }
    }
  },
  // ...其他工具
]
```

### Step 2：注册工具模块（新类别时需要）{#step-2}

::: info 仅新类别需要
如果是在已有类别中添加工具，跳过此步骤。
:::

```javascript{3,9-13}
// src/mcp/tools/index.js
const toolModules = {
  basic: { file: './basic.js', export: 'basicTools' },
  myCategory: { file: './myCategory.js', export: 'myCategoryTools' },
  // ...
}

// 类别元信息（用于 Web 面板展示）
const categoryMeta = {
  myCategory: { 
    name: '我的类别',         // 显示名称
    description: '类别描述',   // 类别说明
    icon: 'Tool'              // 图标名称（Lucide 图标）
  }
}
```

### Step 3：配置启用 {#step-3}

```yaml
# config.yaml
builtinTools:
  enabledCategories:
    - basic
    - myCategory  # 添加新类别
```

::: tip 通过 Web 面板管理
也可以在 Web 管理面板 → 工具管理 中启用/禁用工具类别。
:::

## 工具示例 {#examples}

::: tip 完整示例
以下是两个典型的内置工具实现示例，展示常见模式。
:::

### 示例 1：获取时间（无上下文）{#example-time}

```javascript{1,3-4,7-17,20-32}
// src/mcp/tools/basic.js
{
  name: 'get_current_time',
  description: '获取当前时间和日期信息，支持指定时区和格式',
  
  inputSchema: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        description: '时间格式：full(完整)、date(仅日期)、time(仅时间)、timestamp(时间戳)',
        enum: ['full', 'date', 'time', 'timestamp']
      },
      timezone: {
        type: 'string',
        description: '时区，默认 Asia/Shanghai'
      }
    }
  },
  
  handler: async (args) => {
    const now = new Date()
    const tz = args.timezone || 'Asia/Shanghai'
    
    const options = { timeZone: tz }
    const dateStr = now.toLocaleDateString('zh-CN', { ...options, year: 'numeric', month: '2-digit', day: '2-digit' })
    const timeStr = now.toLocaleTimeString('zh-CN', { ...options, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    const weekday = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()]
    
    return {
      text: `当前时间: ${dateStr} ${timeStr} 星期${weekday}`,
      datetime: now.toISOString(),
      timestamp: now.getTime(),
      timezone: tz
    }
  }
}
```

### 示例 2：发送消息（需要上下文）{#example-message}

```javascript{2,5-6,9-14,17-21}
// src/mcp/tools/message.js
import { getBuiltinToolContext } from '../BuiltinMcpServer.js'

{
  name: 'send_private_message',
  description: '发送私聊消息给指定用户',
  
  inputSchema: {
    type: 'object',
    properties: {
      user_id: { type: 'string', description: '目标用户QQ号' },
      message: { type: 'string', description: '消息内容' }
    },
    required: ['user_id', 'message']
  },
  
  handler: async (args) => {
    const ctx = getBuiltinToolContext()
    const bot = ctx.getBot()
    
    await bot.pickUser(args.user_id).sendMsg(args.message)
    return { success: true, text: '消息已发送' }
  }
}
```

## 工具属性 {#tool-properties}

| 属性 | 类型 | 必需 | 说明 |
|:-----|:-----|:----:|:-----|
| `name` | `string` | ✅ | 工具名称，全局唯一，使用 `snake_case` 格式 |
| `description` | `string` | ✅ | 工具描述，AI 可见，描述清晰有助于正确调用 |
| `inputSchema` | `object` | ❌ | JSON Schema 格式的参数定义，无参数时可省略 |
| `handler` | `function` | ✅ | 异步处理函数 `async (args) => result` |

::: info inputSchema 格式
参数定义遵循 [JSON Schema](https://json-schema.org/) 规范，支持以下类型：
- `string` - 字符串
- `number` / `integer` - 数值
- `boolean` - 布尔值
- `array` - 数组
- `object` - 对象
:::

## 下一步 {#next-steps}

| 文档 | 说明 | 适用场景 |
|:-----|:-----|:---------|
| [自定义 JS 工具](./custom-js) | 开发用户工具 | 快速开发、无需修改源码 |
| [安全与权限](./security) | 工具安全配置 | 了解权限控制机制 |
| [MCP 服务器](./mcp-server) | 接入外部 MCP | 复用现有 MCP 服务器 |
