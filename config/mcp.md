# MCP 配置

MCP (Model Context Protocol) 是标准化的工具调用协议，本文档说明 MCP 相关配置。

## 基础配置

```yaml
mcp:
  # 启用 MCP
  enabled: true
  
  # 并行执行工具
  parallelExecution: true
  
  # 工具超时（毫秒）
  timeout: 30000
```

## 内置工具配置

```yaml
builtinTools:
  # 启用的类别
  enabledCategories:
    - basic
    - user
    - group
    - message
    - media
    - web
    
  # 禁用的工具
  disabledTools: []
```

### 工具类别

| 类别 | 说明 | 示例工具 |
|------|------|----------|
| `basic` | 基础工具 | get_time, calculate |
| `user` | 用户相关 | get_user_info |
| `group` | 群组相关 | get_group_info |
| `message` | 消息操作 | send_message |
| `media` | 媒体处理 | generate_image |
| `web` | 网络请求 | fetch_url |

## 外部 MCP 服务器

配置文件：`data/mcp-servers.json`

```json
{
  "servers": {
    "filesystem": {
      "type": "npm",
      "package": "@anthropic/mcp-server-filesystem",
      "args": ["/home/user/docs"]
    }
  }
}
```

### 服务器类型

#### npm

```json
{
  "type": "npm",
  "package": "@anthropic/mcp-server-filesystem",
  "args": ["/path"]
}
```

#### stdio

```json
{
  "type": "stdio",
  "command": "python",
  "args": ["server.py"],
  "env": {
    "DEBUG": "1"
  }
}
```

#### sse

```json
{
  "type": "sse",
  "url": "https://mcp.example.com/sse",
  "headers": {
    "Authorization": "Bearer xxx"
  }
}
```

#### http

```json
{
  "type": "http",
  "url": "https://api.example.com/mcp"
}
```

## 安全配置

```yaml
mcp:
  security:
    # 允许危险工具
    allowDangerous: false
    
    # 危险工具列表
    dangerousTools:
      - execute_command
      - delete_file
      - write_file
    
    # 需要管理员权限的工具
    adminOnlyTools:
      - kick_member
      - ban_member
```

## 权限配置

```yaml
mcp:
  permissions:
    # 默认权限
    default: allow
    
    # 工具权限映射
    tools:
      send_message:
        require: admin
      delete_message:
        require: admin
```

## 日志配置

```yaml
mcp:
  logging:
    # 记录工具调用
    enabled: true
    
    # 日志级别
    level: info
    
    # 保留天数
    retention: 7
```

## 缓存配置

```yaml
mcp:
  cache:
    # 启用缓存
    enabled: true
    
    # 缓存 TTL（秒）
    ttl: 300
    
    # 可缓存的工具
    tools:
      - get_weather
      - search_web
```

## 完整示例

```yaml
mcp:
  enabled: true
  parallelExecution: true
  timeout: 30000
  
  security:
    allowDangerous: false
    dangerousTools:
      - execute_command
      - delete_file
    adminOnlyTools:
      - kick_member
      
  logging:
    enabled: true
    level: info
    retention: 7
    
  cache:
    enabled: true
    ttl: 300

builtinTools:
  enabledCategories:
    - basic
    - user
    - web
  disabledTools: []
```

## 管理命令

```bash
# 查看工具列表
#工具列表

# 重载工具
#重载工具

# 查看工具日志
#工具日志
```

## 下一步

- [代理配置](./proxy) - 网络代理设置
- [工具开发](/tools/) - 开发自定义工具
