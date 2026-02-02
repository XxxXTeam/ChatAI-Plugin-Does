# 安全与权限 <Badge type="warning" text="重要" />

工具系统的安全控制机制，提供多层次的安全保障。

## 安全层级 {#security-layers}

```mermaid
flowchart TB
    subgraph L1["1️⃣ 全局配置过滤"]
        A1[启用/禁用工具类别]
        A2[禁用具体工具]
    end
    
    subgraph L2["2️⃣ 预设级过滤"]
        B1[白名单模式]
        B2[黑名单模式]
    end
    
    subgraph L3["3️⃣ 危险工具控制"]
        C1[危险工具标记]
        C2[特殊授权检查]
    end
    
    subgraph L4["4️⃣ 用户权限检查"]
        D1[管理员专属工具]
        D2[主人权限工具]
    end
    
    L1 --> L2 --> L3 --> L4
```

::: tip 层级说明
工具调用请求需要依次通过所有安全层级的检查，任一层级拒绝则调用失败。
:::

## 全局配置

### 启用/禁用类别

```yaml
builtinTools:
  enabledCategories:
    - basic
    - user
    - web
  # 未列出的类别将被禁用
```

### 禁用特定工具

```yaml
builtinTools:
  disabledTools:
    - execute_command
    - delete_file
```

## 预设级过滤

### 白名单模式

```yaml
# 预设文件
tools:
  mode: whitelist
  allowedTools:
    - get_time
    - get_weather
    - search_web
```

### 黑名单模式

```yaml
tools:
  mode: blacklist
  excludedTools:
    - send_message
    - kick_member
```

## 危险工具 {#dangerous-tools}

### 危险工具分类

```mermaid
flowchart TD
    Dangerous[🔴 危险工具] --> Kick[kick_member<br/>踢出成员]
    Dangerous --> Mute[mute_member<br/>禁言成员]
    Dangerous --> Recall[recall_message<br/>撤回消息]
    Dangerous --> Admin[set_group_admin<br/>设置管理员]
    Dangerous --> Ban[set_group_whole_ban<br/>全群禁言]
    Dangerous --> Shell[execute_command<br/>系统命令]
    
    Shell --> Master[仅主人权限]
    Admin --> Role[需要管理员权限]
    Kick --> Self[禁止对自己操作]
```

### 标记危险工具

```javascript
// 工具定义中
{
  name: 'execute_command',
  description: '执行系统命令',
  dangerous: true,  // 标记为危险
  
  async execute(args) {
    // ...
  }
}
```

### 危险工具配置

```yaml
builtinTools:
  # 是否允许危险工具
  allowDangerous: false
  
  # 危险工具列表
  dangerousTools:
    - kick_member
    - recall_message
    - set_group_whole_ban
    - execute_command
```

### 临时授权

某些场景需要临时允许危险工具：

```javascript
const agent = await createSkillsAgent({
  event: e,
  allowDangerous: true  // 临时授权
})
```

## 管理员工具

### 标记管理员专属

```javascript
{
  name: 'kick_member',
  description: '踢出群成员',
  adminOnly: true,  // 需要管理员权限
  
  async execute(args, context) {
    if (!context.isAdmin) {
      throw new Error('需要管理员权限')
    }
    // ...
  }
}
```

### 配置管理员工具

```yaml
mcp:
  security:
    adminOnlyTools:
      - kick_member
      - ban_member
      - set_group_admin
```

## 参数验证

工具执行前自动验证参数：

```javascript
{
  parameters: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        pattern: '^[0-9]+$'  // 只允许数字
      },
      count: {
        type: 'integer',
        minimum: 1,
        maximum: 100
      }
    },
    required: ['userId']
  }
}
```

## 速率限制

### 工具级限制

```javascript
{
  name: 'expensive_tool',
  rateLimit: {
    maxCalls: 10,
    windowMs: 60000  // 每分钟最多 10 次
  }
}
```

### 用户级限制

```yaml
mcp:
  rateLimit:
    perUser:
      maxCalls: 100
      windowMs: 3600000  # 每小时 100 次
```

## 日志审计

### 记录工具调用

```yaml
mcp:
  logging:
    enabled: true
    level: info
    retention: 30  # 保留 30 天
```

### 日志内容

```json
{
  "id": "uuid",
  "toolName": "send_message",
  "args": {"target": "123", "content": "..."},
  "result": "success",
  "userId": "456",
  "timestamp": "2024-12-15T06:30:00.000Z",
  "duration": 150
}
```

### 查看日志

```bash
# 命令
#工具日志

# API
GET /api/tools/logs?limit=100&toolName=send_message
```

## 安全执行流程 {#execution-flow}

```mermaid
sequenceDiagram
    participant User as 用户
    participant Filter as 工具过滤服务
    participant Perm as 权限服务
    participant MCP as MCP服务器
    participant Tools as 工具执行
    participant Log as 日志服务
    
    User->>Filter: 请求执行工具
    Filter->>Perm: 检查权限
    Perm-->>Filter: 权限验证结果
    Filter->>Filter: 危险工具检查
    Filter->>MCP: 验证参数
    MCP->>Tools: 执行工具
    Tools->>Log: 记录执行日志
    Tools-->>User: 返回结果
```

## 最佳实践 {#best-practices}

::: tip 安全建议
遵循以下最佳实践确保工具系统安全运行。
:::

| 实践 | 说明 |
|:-----|:-----|
| **最小权限原则** | 只启用必需的工具，禁用不需要的功能 |
| **使用白名单模式** | 预设中使用白名单，明确列出允许的工具 |
| **禁用危险工具** | 生产环境务必设置 `allowDangerous: false` |
| **定期审计日志** | 定期检查工具调用日志，发现异常行为 |
| **严格参数校验** | 定义参数 Schema，防止注入攻击 |

## 安全检查清单 {#checklist}

::: warning 部署前检查
确保完成以下安全检查项：
:::

- [ ] 已禁用不需要的工具类别
- [ ] 危险工具已禁用或受控
- [ ] 管理员工具已正确配置
- [ ] 预设使用白名单模式
- [ ] 日志审计已启用
- [ ] 速率限制已配置

## 下一步 {#next}

- [工具开发概述](./index) - 返回概述
- [MCP 配置](/config/mcp) - MCP 配置详情
