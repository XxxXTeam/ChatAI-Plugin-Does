# MCP 工具

本文档介绍 MCP (Model Context Protocol) 工具系统的使用和配置。

## 什么是 MCP

**MCP** 是 Anthropic 提出的标准化协议，用于定义 AI 模型与外部工具的交互方式。

ChatAI 插件实现了完整的 MCP 支持：
- 内置工具（基础功能）
- 自定义 JS 工具（用户脚本）
- 外部 MCP 服务器（npm 包、远程服务）

## 工具来源

| 来源 | 说明 | 位置 |
|------|------|------|
| 内置工具 | 核心功能工具 | `src/mcp/tools/` |
| 自定义工具 | 用户 JS 脚本 | `data/tools/` |
| 外部 MCP | npm 包/远程服务 | 配置文件 |

## 启用工具调用

### 配置

```yaml
tools:
  enabled: true
  parallelExecution: true  # 并行执行
```

### 预设配置

```yaml
# 在预设中配置工具
tools:
  enabled: true
  allowedTools:
    - get_time
    - search_web
```

## 内置工具

### 查看可用工具

```
#工具列表
```

### 工具类别

| 类别 | 说明 | 示例工具 |
|------|------|----------|
| basic | 基础工具 | get_time, calculate |
| user | 用户相关 | get_user_info |
| group | 群组相关 | get_group_info |
| message | 消息操作 | send_message |
| media | 媒体处理 | generate_image |
| web | 网络请求 | fetch_url |

### 启用/禁用类别

```yaml
builtinTools:
  enabledCategories:
    - basic
    - user
    - web
  disabledCategories:
    - message  # 禁用消息操作
```

## 外部 MCP 服务器

### 配置文件

创建 `data/mcp-servers.json`：

```json
{
  "servers": {
    "filesystem": {
      "type": "npm",
      "package": "@anthropic/mcp-server-filesystem",
      "args": ["/home/user/docs"]
    },
    "memory": {
      "type": "npm",
      "package": "@modelcontextprotocol/server-memory"
    }
  }
}
```

### 连接类型

#### npm 包

```json
{
  "type": "npm",
  "package": "@anthropic/mcp-server-filesystem",
  "args": ["/path/to/directory"]
}
```

#### 本地进程 (stdio)

```json
{
  "type": "stdio",
  "command": "python",
  "args": ["mcp_server.py"]
}
```

#### 远程服务 (SSE)

```json
{
  "type": "sse",
  "url": "https://mcp.example.com/sse",
  "headers": {
    "Authorization": "Bearer xxx"
  }
}
```

#### HTTP API

```json
{
  "type": "http",
  "url": "https://api.example.com/mcp"
}
```

### 热门 MCP 服务器

| 包名 | 功能 |
|------|------|
| `@anthropic/mcp-server-filesystem` | 文件系统访问 |
| `@modelcontextprotocol/server-memory` | 知识图谱记忆 |
| `@anthropic/mcp-server-brave-search` | Brave 搜索 |
| `@anthropic/mcp-server-github` | GitHub 操作 |
| `@anthropic/mcp-server-fetch` | HTTP 请求 |

## 自定义 JS 工具

### 创建工具

在 `data/tools/` 目录创建 JS 文件：

```javascript
// data/tools/my-tool.js
export default {
  name: 'my_tool',
  description: '我的自定义工具',
  
  parameters: {
    type: 'object',
    properties: {
      input: {
        type: 'string',
        description: '输入参数'
      }
    },
    required: ['input']
  },
  
  async execute({ input }, context) {
    // context 包含 event, user, group 等信息
    return {
      result: `处理结果: ${input}`
    }
  }
}
```

### 热重载

自定义工具支持热重载，修改后自动生效。

## 工具权限

### 危险工具

某些工具被标记为危险工具：

```yaml
tools:
  # 是否允许危险工具
  allowDangerous: false
  
  # 危险工具列表
  dangerousTools:
    - execute_command
    - delete_file
```

### 用户权限

```yaml
tools:
  # 需要管理员权限的工具
  adminOnlyTools:
    - send_group_message
    - kick_member
```

## 工具调用流程

```
用户消息 → AI 分析 → 选择工具 → 执行工具 → 返回结果 → AI 整合回复
```

### 示例对话

```
用户: 现在几点了？

AI: [调用 get_time 工具]
    现在是 2024年12月15日 星期日 14:30:25

用户: 帮我搜索一下 Node.js

AI: [调用 search_web 工具，参数: {query: "Node.js"}]
    根据搜索结果，Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时...
```

## 监控与调试

### 查看工具调用日志

```
#工具日志
```

### API 获取日志

```bash
curl http://localhost:3000/api/tools/logs
```


## 最佳实践

1. **最小权限原则** - 只启用需要的工具
2. **禁用危险工具** - 生产环境禁用 `allowDangerous`
3. **使用白名单** - 预设中指定 `allowedTools`
4. **监控工具调用** - 定期检查工具调用日志
5. **测试工具** - 部署前充分测试自定义工具

## 下一步

- [工具开发](/tools/) - 开发自定义工具
- [架构概述](/architecture/) - 了解系统架构
