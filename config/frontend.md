# 前端配置

Web 管理面板的配置与使用说明。

## 访问面板

### 获取登录链接

在机器人对话中发送：

```
#ai管理面板
```

机器人会返回一个带临时 token 的登录链接。

### 登录方式

1. 点击链接自动登录
2. 登录后会设置 Cookie，后续访问无需重复登录
3. Cookie 有效期默认 24 小时

## Web 服务配置

### 基础配置

```yaml
web:
  enabled: true           # 启用 Web 服务
  port: 3000              # 监听端口
  host: "0.0.0.0"         # 监听地址，0.0.0.0 允许外部访问
```

### 端口配置

```yaml
web:
  port: 3000              # 默认端口
  # port: 8080            # 如 3000 被占用，可改用其他端口
```

:::: tip 端口冲突
如果端口被占用，插件会自动切换到其他可用端口，无需手动处理。

```bash
# 检查端口占用
netstat -tlnp | grep 3000
```
:::

### TRSS 共享端口

如果使用 TRSS-Yunzai，可以共享 Yunzai 的端口：

```yaml
web:
  sharePort: true         # 使用 Yunzai 的端口
  basePath: /chatai       # 路径前缀
```

访问地址变为：`http://your-server:yunzai-port/chatai`

## 安全配置

### 访问控制

```yaml
web:
  security:
    # 允许访问的 IP 白名单（空则允许所有）
    allowedIPs: []
    
    # 启用 HTTPS（需要证书）
    https:
      enabled: false
      cert: /path/to/cert.pem
      key: /path/to/key.pem
```

### Token 配置

```yaml
web:
  auth:
    tokenExpiry: 86400000   # Token 有效期（毫秒），默认 24 小时
    cookieSecure: false     # 生产环境建议设为 true（需 HTTPS）
    cookieHttpOnly: true    # 防止 XSS 攻击
```

### 限流配置

```yaml
web:
  rateLimit:
    windowMs: 60000         # 时间窗口（毫秒）
    maxRequests: 60         # 最大请求数
```

## 面板功能

### 首页仪表盘

仪表盘提供系统状态的快速概览：

![仪表盘](/images/image.png)

- **渠道状态** - 活跃渠道数量和总渠道数
- **MCP 服务器** - 已连接的 MCP 服务器数量
- **AI 模型** - 可用模型数量
- **工具数** - 已注册的工具总数
- **配置中心** - 快速访问各项配置
- **AI 扩展** - 工具配置和 MCP 服务
- **数据记录** - 对话历史和调用记录

### 系统设置

系统设置页面用于配置触发方式和基础参数：

![系统设置](/images/image2.png)

- **私聊触发** - 配置私聊消息的触发方式
- **群聊触发** - 配置群聊消息的触发方式（@机器人、前缀等）
- **触发词** - 自定义触发关键词

### 渠道管理

渠道管理页面展示所有配置的 API 渠道：

![渠道管理](/images/image10.png)

| 功能 | 说明 |
|------|------|
| 添加渠道 | 配置新的 API 渠道 |
| 编辑渠道 | 修改渠道参数 |
| 测试连接 | 验证 API Key 和网络连通性 |
| 启用/禁用 | 临时禁用渠道 |
| 删除渠道 | 移除渠道配置 |

#### 模型测试

点击渠道卡片可以测试该渠道下的模型：

![模型测试](/images/image11.png)

#### 编辑渠道

编辑渠道时可以配置基本信息和高级选项：

![编辑渠道](/images/image12.png)

- **渠道名称** - 唯一标识
- **适配器类型** - OpenAI/Claude/Gemini 等
- **Base URI** - API 端点地址
- **API Key** - 认证密钥
- **模型列表** - 该渠道支持的模型

#### 高级配置

![高级配置](/images/image13.png)

- **启用渠道** - 是否启用该渠道
- **高级设置** - 展开更多配置项
- **流式输出** - 启用流式响应
- **启用缓存** - 缓存相同请求的响应
- **思考控制** - 思维链配置
- **自动拓展** - 自动拓展上下文
- **变量定义** - 可视化/手动编辑变量

#### LLM 参数

![LLM参数](/images/image14.png)

- **超时时间** - API 请求超时（毫秒）
- **处理函数** - 自定义响应处理
- **Temperature** - 生成随机性（0-2）
- **Max Tokens** - 最大输出 Token 数
- **Top P** - 核采样参数
- **自定义请求头** - 额外的 HTTP 头

### 预设管理

预设管理用于配置 AI 的人格和行为：

![预设管理](/images/image8.png)

| 功能 | 说明 |
|------|------|
| 查看预设 | 浏览所有预设 |
| 编辑预设 | 修改 System Prompt |
| 复制预设 | 基于现有预设创建新预设 |
| 导入/导出 | JSON 格式导入导出 |

### 人设管理

人设管理提供更精细的人格配置和优先级控制：

![人设管理](/images/image9.png)

- **优先级配置** - 群聊人格 > 群内用户人格 > 用户全局人格 > 默认预设
- **启用独立人格** - 找到的人格完全替换默认配置
- **人格设定管理** - 为用户、群组配置独立人格

### 群组管理

群组管理允许为不同群聊配置独立的设置：

![群组管理-基础](/images/image5.png)

#### 基础设置

- **群号** - 目标群聊 ID
- **群名称** - 可选的群名称备注
- **使用预设** - 选择该群使用的预设
- **触发模式** - 该群的触发方式
- **自定义前缀** - 群专属触发前缀
- **独立人设** - 群专属的 System Prompt
- **启用 AI 消息** - 是否在该群启用 AI

![群组管理-高级](/images/image6.png)

#### 高级设置

- **消息处理** - 入群欢迎、退群处理
- **入群欢迎** - 新成员欢迎消息
- **复读配置** - 复读概率和触发条件
- **有一有回复** - 随机回复概率
- **独立存储** - 独立的上下文存储
- **最大消息数** - 上下文消息数量限制
- **发送概率** - 随机触发概率
- **冲突时拒绝发送** - 避免消息冲突

![群组管理-仿人](/images/image7.png)

#### 仿人设置

- **仿人模式** - 模拟真人聊天习惯
- **仿人人设** - 选择仿人角色预设
- **触发概率** - 仿人模式触发概率
- **使用模型** - 仿人模式使用的模型
- **温度** - 生成随机性
- **最大 Token** - 输出限制

### 使用统计

统计面板展示使用数据：

![使用统计](/images/image3.png)

- **消息总数** - 处理的消息数量
- **模型调用** - API 调用次数
- **Tokens 消耗** - Token 使用统计
- **工具调用** - 工具调用次数
- **模型使用统计** - 各模型调用排行
- **工具使用统计** - 各工具调用排行

### 调用统计

详细的 API 调用记录：

![调用统计](/images/image4.png)

- **今日调用** - 当日调用次数
- **成功率** - API 调用成功率
- **Token 消耗** - 当日 Token 使用
- **平均耗时** - 响应时间统计
- **模型调用排行** - 模型使用热度
- **渠道调用排行** - 渠道使用分布
- **调用记录** - 详细调用历史（时间、渠道、模型、耗时、输入/输出 Token）

## 前端开发

### 本地开发

```bash
cd plugins/chatgpt-plugin/frontend
pnpm install
pnpm dev
```

### 技术栈

| 技术 | 说明 |
|------|------|
| React 19 | UI 框架 |
| Vite | 构建工具 |
| TailwindCSS | 样式框架 |
| shadcn/ui | 组件库 |
| Lucide | 图标库 |
| React Query | 数据请求 |

### 构建生产版本

```bash
pnpm build
```

构建产物输出到 `resources/web/` 目录。

### 自定义主题

```yaml
web:
  theme:
    primaryColor: "#6366f1"   # 主题色
    darkMode: auto            # auto/light/dark
```

## API 调用

前端通过 REST API 与后端通信：

```javascript
// 获取渠道列表
const response = await fetch('/api/config/channels', {
  credentials: 'include'  // 携带 Cookie
})
const { data } = await response.json()

// 更新配置
await fetch('/api/config', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    path: 'trigger.prefix',
    value: '#ai'
  })
})
```

## 常见问题

### 无法访问面板

1. 检查 Web 服务是否启用：`web.enabled: true`
2. 检查端口是否正确
3. 检查防火墙设置
4. 如果是远程服务器，确保 `host: "0.0.0.0"`

### 登录失败

1. 临时 token 可能已过期，重新获取
2. 检查时钟是否同步
3. 清除浏览器 Cookie 后重试

### 配置不生效

1. 部分配置修改后需要重启插件
2. 检查配置格式是否正确
3. 查看控制台是否有报错

## 下一步

- [API 文档](/api/) - REST API 参考
- [渠道配置](./channels) - 渠道详细配置
