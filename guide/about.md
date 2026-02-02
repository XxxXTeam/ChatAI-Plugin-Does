# 关于插件

本文档介绍 ChatAI Plugin 的版本、仓库信息以及核心机制。

## 仓库说明

ChatAI Plugin 有两个仓库，面向不同用户群体：

### 公开版本（推荐）

| 项目 | 信息 |
|------|------|
| **仓库** | [XxxXTeam/chatai-plugin](https://github.com/XxxXTeam/chatai-plugin) |
| **状态** | 🟢 公开 |
| **更新频率** | 稳定版本发布 |
| **适用人群** | 普通用户、生产环境 |

```bash
# 安装公开版本
git clone https://github.com/XxxXTeam/chatai-plugin.git ./plugins/chatgpt-plugin
```

### 每夜构建版（内测）

| 项目 | 信息 |
|------|------|
| **仓库** | [XxxXTeam/chatgpt-plugin](https://github.com/XxxXTeam/chatgpt-plugin) |
| **状态** | 🔒 私密 |
| **更新频率** | 每日构建，包含最新功能 |
| **适用人群** | 开发者、测试人员 |

::: warning 注意
每夜构建版可能包含未经充分测试的功能，不建议在生产环境使用。
:::

#### 申请内测

1. 访问 [https://plugin.openel.top/auth](https://plugin.openel.top/auth)
2. 使用 GitHub 账号登录
3. 提交申请加入内测队列
4. 等待审核通过后即可访问私密仓库

## 插件初始化

### 初始化流程

```
插件加载
    │
    ▼
1. 加载配置文件
    │ config/config.yaml
    ▼
2. 初始化数据库
    │ data/chatai.db (SQLite)
    ▼
3. 初始化 MCP 系统
    │ 内置工具 + 自定义工具 + 外部服务器
    ▼
4. 启动 Web 服务
    │ 管理面板 + API
    ▼
5. 注册消息监听
    │
    ▼
就绪
```

### 首次启动

首次启动时，插件会自动：

1. **创建配置文件** - 在 `config/` 目录生成默认配置
2. **初始化数据库** - 创建 SQLite 数据库和表结构
3. **创建数据目录** - `data/presets/`、`data/tools/` 等

### 常见初始化问题

#### better-sqlite3 构建失败

```bash
# 在 Yunzai 根目录执行
pnpm rebuild better-sqlite3
```

如果仍失败，检查编译工具是否安装：

::: code-group
```bash [Windows]
npm install -g windows-build-tools
```

```bash [Linux]
sudo apt install build-essential python3
```

```bash [macOS]
xcode-select --install
```
:::

#### 端口被占用

修改 `config/config.yaml` 中的端口：

```yaml
web:
  port: 3001  # 改为其他端口
```

## 渠道配置详解

渠道是连接 AI 模型的核心配置。

### 渠道参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `name` | ✅ | 渠道名称（唯一标识） |
| `type` | ✅ | 渠道类型：`openai`、`claude`、`gemini` |
| `baseUrl` | ✅ | API 基础地址 |
| `apiKey` | ✅ | API 密钥 |
| `model` | ✅ | 默认模型名称 |
| `enabled` | ❌ | 是否启用（默认 true） |
| `weight` | ❌ | 负载均衡权重（默认 1） |
| `maxRetries` | ❌ | 最大重试次数（默认 3） |
| `timeout` | ❌ | 请求超时（毫秒，默认 60000） |
| `proxy` | ❌ | 代理配置 |

### 渠道类型

#### OpenAI 及兼容 API

```yaml
channels:
  - name: openai
    type: openai
    baseUrl: https://api.openai.com/v1
    apiKey: sk-xxx
    model: gpt-4o
    
  - name: deepseek
    type: openai  # DeepSeek 兼容 OpenAI API
    baseUrl: https://api.deepseek.com/v1
    apiKey: sk-xxx
    model: deepseek-chat
    
  - name: moonshot
    type: openai
    baseUrl: https://api.moonshot.cn/v1
    apiKey: sk-xxx
    model: moonshot-v1-8k
```

#### Claude

```yaml
channels:
  - name: claude
    type: claude
    apiKey: sk-ant-xxx
    model: claude-3-5-sonnet-20241022
```

#### Gemini

```yaml
channels:
  - name: gemini
    type: gemini
    apiKey: xxx
    model: gemini-2.0-flash
```

### 多渠道负载均衡

配置多个渠道实现负载均衡：

```yaml
channels:
  - name: openai-1
    type: openai
    baseUrl: https://api.openai.com/v1
    apiKey: sk-xxx-1
    model: gpt-4o
    weight: 2  # 权重 2，被选中概率更高
    
  - name: openai-2
    type: openai
    baseUrl: https://api.openai.com/v1
    apiKey: sk-xxx-2
    model: gpt-4o
    weight: 1
```

## 错误重试机制

插件内置完善的错误处理和重试机制。

### 重试策略

```
请求失败
    │
    ▼
检查错误类型
    │
    ├─ 429 限流 ──────► 指数退避重试
    │                   等待 2^n 秒后重试
    │
    ├─ 500/502/503 ──► 立即重试
    │   服务器错误       最多重试 maxRetries 次
    │
    ├─ 401/403 ───────► 不重试，直接报错
    │   认证失败         提示检查 API Key
    │
    └─ 网络错误 ───────► 切换渠道重试
                        尝试其他可用渠道
```

### 配置重试参数

```yaml
channels:
  - name: openai
    type: openai
    baseUrl: https://api.openai.com/v1
    apiKey: sk-xxx
    model: gpt-4o
    maxRetries: 3        # 最大重试次数
    retryDelay: 1000     # 初始重试延迟（毫秒）
    timeout: 60000       # 请求超时
```

### 渠道故障转移

当主渠道失败时，自动切换到备用渠道：

```yaml
channels:
  - name: primary
    type: openai
    baseUrl: https://api.openai.com/v1
    apiKey: sk-xxx
    model: gpt-4o
    priority: 1  # 优先使用
    
  - name: backup
    type: openai
    baseUrl: https://api.deepseek.com/v1
    apiKey: sk-xxx
    model: deepseek-chat
    priority: 2  # 备用
```

### 错误日志

开启调试模式查看详细错误信息：

```
#ai调试开启
```

或查看日志文件：

```bash
tail -f logs/latest.log | grep -i chatai
```

## 版本更新

### 更新公开版本

```bash
cd plugins/chatgpt-plugin
git pull origin main
pnpm install
```

### 更新每夜构建版

```bash
cd plugins/chatgpt-plugin
git pull origin dev
pnpm install
```

### 查看当前版本

```
#ai版本
```

## 获取帮助

- **公开版 Issues**: [XxxXTeam/chatai-plugin/issues](https://github.com/XxxXTeam/chatai-plugin/issues)
- **内测申请**: [https://plugin.openel.top/auth](https://plugin.openel.top/auth)
- **文档站点**: 本站
