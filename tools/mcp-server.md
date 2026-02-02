# MCP 服务器

通过 MCP 协议接入外部工具服务器。

## 配置文件

创建 `data/mcp-servers.json`：

```json
{
  "servers": {
    "server-name": {
      "type": "npm",
      "package": "@anthropic/mcp-server-filesystem",
      "args": ["/path/to/directory"]
    }
  }
}
```

## 服务器类型

### npm 包

自动安装并运行 npm 包形式的 MCP 服务器：

```json
{
  "filesystem": {
    "type": "npm",
    "package": "@anthropic/mcp-server-filesystem",
    "args": ["/home/user/documents"]
  }
}
```

常用 npm 包：

| 包名 | 功能 |
|------|------|
| `@anthropic/mcp-server-filesystem` | 文件系统访问 |
| `@modelcontextprotocol/server-memory` | 知识图谱记忆 |
| `@anthropic/mcp-server-brave-search` | Brave 搜索 |
| `@anthropic/mcp-server-github` | GitHub 操作 |
| `@anthropic/mcp-server-fetch` | HTTP 请求 |

### stdio 本地进程

运行本地脚本或程序：

```json
{
  "python-server": {
    "type": "stdio",
    "command": "python",
    "args": ["path/to/server.py"],
    "env": {
      "DEBUG": "1"
    }
  }
}
```

### SSE 远程服务

连接支持 SSE 的远程 MCP 服务：

```json
{
  "remote-sse": {
    "type": "sse",
    "url": "https://mcp.example.com/sse",
    "headers": {
      "Authorization": "Bearer your-token"
    }
  }
}
```

### HTTP API

连接 HTTP 形式的 MCP 服务：

```json
{
  "remote-http": {
    "type": "http",
    "url": "https://api.example.com/mcp",
    "headers": {
      "X-API-Key": "your-key"
    }
  }
}
```

## 开发自己的 MCP 服务器

### Python 示例

```python
# server.py
import json
import sys

def handle_request(request):
    method = request.get('method')
    
    if method == 'initialize':
        return {
            'protocolVersion': '2024-11-05',
            'capabilities': {
                'tools': {}
            },
            'serverInfo': {
                'name': 'my-server',
                'version': '1.0.0'
            }
        }
    
    if method == 'tools/list':
        return {
            'tools': [
                {
                    'name': 'my_tool',
                    'description': 'My custom tool',
                    'inputSchema': {
                        'type': 'object',
                        'properties': {
                            'input': {'type': 'string'}
                        }
                    }
                }
            ]
        }
    
    if method == 'tools/call':
        name = request['params']['name']
        args = request['params']['arguments']
        
        if name == 'my_tool':
            result = f"Processed: {args.get('input')}"
            return {
                'content': [
                    {'type': 'text', 'text': result}
                ]
            }

def main():
    for line in sys.stdin:
        request = json.loads(line)
        response = {
            'jsonrpc': '2.0',
            'id': request.get('id'),
            'result': handle_request(request)
        }
        print(json.dumps(response), flush=True)

if __name__ == '__main__':
    main()
```

### Node.js 示例

```javascript
// server.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

const server = new Server({
  name: 'my-server',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
})

// 注册工具
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'my_tool',
      description: 'My custom tool',
      inputSchema: {
        type: 'object',
        properties: {
          input: { type: 'string' }
        }
      }
    }
  ]
}))

// 处理工具调用
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params
  
  if (name === 'my_tool') {
    return {
      content: [
        { type: 'text', text: `Processed: ${args.input}` }
      ]
    }
  }
})

// 启动服务器
const transport = new StdioServerTransport()
await server.connect(transport)
```

## 管理服务器

### 命令行

```bash
# 查看服务器状态
#mcp状态

# 重连服务器
#mcp重连 server-name

# 重连所有
#mcp重连全部
```

### API

```bash
# 获取服务器列表
curl http://localhost:3000/api/mcp/servers

# 连接服务器
curl -X POST http://localhost:3000/api/mcp/servers/name/connect

# 断开服务器
curl -X POST http://localhost:3000/api/mcp/servers/name/disconnect
```

## 环境变量

使用环境变量保护敏感信息：

```json
{
  "github": {
    "type": "npm",
    "package": "@anthropic/mcp-server-github",
    "env": {
      "GITHUB_TOKEN": "${GITHUB_TOKEN}"
    }
  }
}
```

## 故障排除

### 服务器连接失败

1. 检查 npm 包是否已安装
2. 验证命令路径是否正确
3. 查看控制台错误日志

### 工具不可用

1. 确认服务器已连接
2. 检查工具是否在服务器的 tools/list 中
3. 验证工具权限配置

## 下一步

- [安全与权限](./security) - 工具安全控制
- [工具开发概述](./index) - 返回概述
