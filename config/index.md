# 配置概述 <Badge type="tip" text="Config" />

ChatAI 插件提供灵活的配置系统，支持**全局配置**、**群组配置**和**用户配置**三级覆盖。

## 配置层级 {#config-hierarchy}

```mermaid
flowchart LR
    A[全局配置] --> B[群组配置]
    B --> C[用户配置]
    
    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#e8f5e9
```

::: info 优先级说明
低层级配置会**覆盖**高层级配置。例如：群组配置会覆盖全局配置中的同名项。
:::

## 配置方式 {#config-methods}

### Web 管理面板（推荐）{#web-panel}

::: tip 推荐方式
Web 面板提供可视化配置界面，修改**实时生效**，无需重启。
:::

```txt
#ai管理面板
```

### 配置文件 {#config-file}

配置文件位于：

```
plugins/chatai-plugin/config/config.yaml
```

::: warning 注意
直接修改配置文件后需要执行 `#ai重载配置` 或重启生效。
:::

## 配置模块 {#config-modules}

| 模块 | 说明 | 文档 | 重要度 |
|:-----|:-----|:-----|:------:|
| **基础配置** | 命令前缀、调试模式、管理员 | [基础配置](./basic) | ⭐⭐⭐ |
| **渠道配置** | API 渠道、重试机制、负载均衡 | [渠道配置](./channels) | ⭐⭐⭐ |
| **模型配置** | 模型选择与参数调优 | [模型配置](./models) | ⭐⭐⭐ |
| **触发配置** | 触发方式与条件 | [触发配置](./triggers) | ⭐⭐ |
| **上下文配置** | 对话上下文管理 | [上下文配置](./context) | ⭐⭐ |
| **记忆配置** | 长期记忆系统 | [记忆配置](./memory) | ⭐⭐ |
| **MCP 配置** | MCP 服务器接入 | [MCP 配置](./mcp) | ⭐⭐ |
| **代理配置** | 网络代理设置 | [代理配置](./proxy) | ⭐ |
| **前端配置** | Web 管理面板定制 | [前端配置](./frontend) | ⭐ |
| **功能配置** | 群总结、画像、事件响应 | [功能配置](./features) | ⭐⭐ |
| **伪人配置** | 伪人模式、主动聊天 | [伪人配置](./bym) | ⭐ |
| **高级配置** | 环境变量、负载均衡、安全设置 | [高级配置](./advanced) | ⭐⭐⭐ |

## 配置文件结构 {#config-structure}

::: details 完整配置示例（点击展开）
```yaml
# 基础配置
commandPrefix: "#"
debug: false

# 触发配置
trigger:
  private: prefix
  group: at
  prefix: "#chat"

# 渠道配置
channels:
  - name: default
    baseUrl: https://api.openai.com/v1
    apiKey: sk-xxx
    model: gpt-4o

# 上下文配置
context:
  maxMessages: 20
  cleaningStrategy: sliding

# 记忆配置
memory:
  enabled: true
  maxMemories: 1000

# MCP 配置
mcp:
  enabled: true

# 内置工具配置
builtinTools:
  enabledCategories:
    - basic
    - user
```
:::

**核心配置项速查：**

| 配置项 | 类型 | 默认值 | 说明 |
|:-------|:-----|:-------|:-----|
| `commandPrefix` | string | `"#"` | 命令前缀 |
| `debug` | boolean | `false` | 调试模式 |
| `trigger.group` | string | `"at"` | 群聊触发方式 |
| `context.maxMessages` | number | `20` | 最大上下文消息数 |
| `memory.enabled` | boolean | `true` | 启用长期记忆 |

## 环境变量 {#env-vars}

::: tip 安全提示
敏感信息（如 API Key）建议使用环境变量，避免明文存储在配置文件中。
:::

```yaml{3}
channels:
  - name: openai
    apiKey: ${OPENAI_API_KEY}  # 引用环境变量
```

**支持的环境变量：**

| 变量 | 说明 | 示例 |
|:-----|:-----|:-----|
| `OPENAI_API_KEY` | OpenAI API 密钥 | `sk-xxx...` |
| `ANTHROPIC_API_KEY` | Claude API 密钥 | `sk-ant-xxx...` |
| `GOOGLE_API_KEY` | Gemini API 密钥 | `AIzaSy...` |
| `HTTP_PROXY` | HTTP 代理地址 | `http://127.0.0.1:7890` |

## 配置热重载 {#hot-reload}

修改配置后，无需重启即可生效：

```txt
#ai重载配置
```

::: info 热重载范围
大部分配置支持热重载，但以下配置需要重启：
- Web 服务端口
- 数据库路径
:::

## 配置备份 {#backup}

::: warning 重要
定期备份配置文件，避免配置丢失。
:::

::: code-group
```bash [Linux/macOS]
cp config/config.yaml config/config.yaml.bak
```

```powershell [Windows]
copy config\config.yaml config\config.yaml.bak
```
:::

## 配置迁移 {#migration}

::: tip 自动迁移
从旧版本升级时，插件会**自动合并**新增配置项，保留已有配置。
:::

## 下一步 {#next-steps}

| 文档 | 说明 | 推荐阅读 |
|:-----|:-----|:--------:|
| [基础配置](./basic) | 命令前缀、调试模式等核心设置 | ⭐⭐⭐ |
| [渠道配置](./channels) | 配置 API 渠道和负载均衡 | ⭐⭐⭐ |
| [模型配置](./models) | 模型参数调优 | ⭐⭐ |
