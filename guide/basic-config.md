# 基础配置

本文档介绍 ChatAI 插件的基础配置选项。

## 配置方式

插件支持两种配置方式：

1. **Web 管理面板**（推荐）- 可视化配置，实时生效
2. **配置文件** - 直接编辑 YAML 文件

## Web 管理面板

### 获取登录链接

```
#ai管理面板
```

### 面板功能

| 模块 | 说明 |
|------|------|
| 仪表盘 | 查看运行状态和统计信息 |
| 渠道配置 | 管理 API 渠道和密钥 |
| 预设管理 | 创建和编辑 AI 人格预设 |
| 工具管理 | 配置工具权限和参数 |
| 群组设置 | 群级别的独立配置 |

## 配置文件

配置文件位于：`plugins/chatgpt-plugin/config/config.yaml`

### 基础配置

```yaml
# 命令前缀
commandPrefix: "#"

# 调试模式
debug: false

# 欢迎提示
welcomeMessage: true
```

### 触发配置

```yaml
trigger:
  # 私聊触发方式: at | prefix | both | none
  private: prefix
  
  # 群聊触发方式: at | prefix | both | none
  group: at
  
  # 触发前缀
  prefix: "#chat"
  
  # 关键词触发
  keywords: []
  
  # 随机触发概率 (0-100)
  randomRate: 0
```

### 渠道配置

```yaml
channels:
  - name: default
    baseUrl: https://api.openai.com/v1
    apiKey: sk-xxx
    model: gpt-4o
    enabled: true
```

### 上下文配置

```yaml
context:
  # 最大消息数
  maxMessages: 20
  
  # 清理策略: sliding | summarize | none
  cleaningStrategy: sliding
  
  # 是否记录到数据库
  persistent: true
```

### 记忆配置

```yaml
memory:
  # 启用长期记忆
  enabled: true
  
  # 记忆数据库路径
  dbPath: data/memory
  
  # 最大记忆条数
  maxMemories: 1000
```

## 渠道类型

### OpenAI 兼容渠道

```yaml
channels:
  - name: openai
    baseUrl: https://api.openai.com/v1
    apiKey: sk-xxx
    model: gpt-4o
```

### Claude

```yaml
channels:
  - name: claude
    type: claude
    apiKey: sk-ant-xxx
    model: claude-3-5-sonnet-20241022
```

### Gemini

```yaml
channels:
  - name: gemini
    type: gemini
    apiKey: xxx
    model: gemini-2.0-flash
```

### DeepSeek

```yaml
channels:
  - name: deepseek
    baseUrl: https://api.deepseek.com/v1
    apiKey: sk-xxx
    model: deepseek-chat
```

## 多渠道配置

配置多个渠道实现负载均衡：

```yaml
channels:
  - name: primary
    baseUrl: https://api.openai.com/v1
    apiKey: sk-xxx
    model: gpt-4o
    weight: 2  # 权重
    
  - name: backup
    baseUrl: https://api.deepseek.com/v1
    apiKey: sk-xxx
    model: deepseek-chat
    weight: 1
```

## 配置优先级

1. 群组配置 > 全局配置
2. 用户配置 > 群组配置
3. Web 面板修改 > 配置文件

## 配置热重载

修改配置文件后，发送以下命令重载：

```
#ai重载配置
```

## 下一步

- [首次使用](./first-use) - 开始对话
- [多渠道配置](./channels) - 高级渠道配置
- [预设与人格](./presets) - 自定义 AI 人格
