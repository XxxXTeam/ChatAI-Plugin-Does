# 自定义 JS 工具

自定义 JS 工具让用户无需修改源码即可扩展功能。

## 基础用法

### 创建工具文件

在 `data/tools/` 目录创建 `.js` 文件：

```javascript
// data/tools/hello.js
export default {
  name: 'say_hello',
  description: '向用户问好',
  
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: '用户名称'
      }
    },
    required: ['name']
  },
  
  handler: async (args) => {
    return { text: `你好，${args.name}！` }
  }
}
```

### 热重载

工具文件保存后自动生效，无需重启。

也可以手动重载：

```
#重载工具
```

## 完整示例

### 天气查询

```javascript
// data/tools/weather.js
export default {
  name: 'get_weather',
  description: '查询指定城市的天气',
  
  inputSchema: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: '城市名称'
      }
    },
    required: ['city']
  },
  
  handler: async (args) => {
    const { city } = args
    
    try {
      const response = await fetch(
        `https://api.weather.com/v1/weather?city=${encodeURIComponent(city)}`
      )
      const data = await response.json()
      
      return {
        text: `${city}天气：${data.condition}，温度 ${data.temp}°C`,
        ...data
      }
    } catch (error) {
      throw new Error(`查询天气失败: ${error.message}`)
    }
  }
}
```

### 访问上下文

```javascript
// data/tools/user-info.js
import { getBuiltinToolContext } from '../../src/mcp/BuiltinMcpServer.js'

export default {
  name: 'get_current_user',
  description: '获取当前对话用户信息',
  
  inputSchema: {
    type: 'object',
    properties: {}
  },
  
  handler: async (args) => {
    const ctx = getBuiltinToolContext()
    const event = ctx.getEvent()
    
    if (!event) {
      return { error: '无法获取用户信息' }
    }
    
    return {
      userId: event.user_id,
      groupId: event.group_id,
      nickname: event.sender?.nickname,
      isMaster: ctx.isMaster
    }
  }
}
```

### 使用 Bot 实例

```javascript
// data/tools/send-msg.js
import { getBuiltinToolContext } from '../../src/mcp/BuiltinMcpServer.js'

export default {
  name: 'send_to_group',
  description: '发送消息到指定群',
  
  inputSchema: {
    type: 'object',
    properties: {
      group_id: { type: 'string', description: '群号' },
      message: { type: 'string', description: '消息内容' }
    },
    required: ['group_id', 'message']
  },
  
  handler: async (args) => {
    const ctx = getBuiltinToolContext()
    const bot = ctx.getBot()
    
    await bot.pickGroup(args.group_id).sendMsg(args.message)
    return { success: true, text: '消息已发送' }
  }
}
```

## 多工具文件

一个文件可以导出多个工具：

```javascript
// data/tools/utils.js
export default [
  {
    name: 'tool_a',
    description: '工具 A',
    inputSchema: { type: 'object', properties: {} },
    handler: async (args) => { return { result: 'A' } }
  },
  {
    name: 'tool_b',
    description: '工具 B',
    inputSchema: { type: 'object', properties: {} },
    handler: async (args) => { return { result: 'B' } }
  }
]
```

## 错误处理

```javascript
handler: async (args) => {
  try {
    const result = await riskyOperation()
    return { success: true, ...result }
  } catch (error) {
    // 抛出错误，AI 会看到错误信息
    throw new Error(`操作失败: ${error.message}`)
  }
}
```

## 调试

开启调试模式查看工具执行详情：

```
#ai调试开启
```

或在代码中添加日志：

```javascript
handler: async (args) => {
  console.log('[my_tool] 参数:', args)
  
  const result = await doSomething()
  console.log('[my_tool] 结果:', result)
  
  return result
}
```

## 下一步

- [MCP 服务器](./mcp-server) - 接入外部 MCP
- [安全与权限](./security) - 配置工具权限
