# 记忆配置

长期记忆系统让 AI 记住用户偏好和历史信息，跨对话保持记忆。

## 基础配置

```yaml
memory:
  # 启用长期记忆
  enabled: false
  
  # 存储方式: database | file
  storage: database
  
  # 自动提取记忆
  autoExtract: true
  
  # 轮询间隔（分钟）
  pollInterval: 5
  
  # 最大记忆条数
  maxMemories: 50
  
  # 记忆提取模型
  model: ""
```

## 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | `false` | 启用记忆 |
| `storage` | string | `database` | 存储方式 |
| `autoExtract` | boolean | `true` | 自动提取记忆 |
| `pollInterval` | number | `5` | 轮询间隔（分钟） |
| `maxMemories` | number | `50` | 最大记忆数 |

## 群聊上下文记忆

自动收集和分析群聊信息：

```yaml
memory:
  groupContext:
    enabled: true
    collectInterval: 10       # 收集间隔（分钟）
    maxMessagesPerCollect: 50 # 每次收集最大消息数
    analyzeThreshold: 20      # 分析阈值
    extractUserInfo: true     # 提取用户信息
    extractTopics: true       # 提取话题
    extractRelations: true    # 提取关系
```

### 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `collectInterval` | number | 消息收集间隔（分钟） |
| `maxMessagesPerCollect` | number | 每次收集的最大消息数 |
| `analyzeThreshold` | number | 触发分析的消息数阈值 |
| `extractUserInfo` | boolean | 提取用户信息（昵称、偏好等） |
| `extractTopics` | boolean | 提取讨论话题 |
| `extractRelations` | boolean | 提取用户关系 |

## 摘要推送

定时推送群聊摘要：

```yaml
memory:
  summaryPush:
    enabled: false
    checkInterval: 58         # 检查间隔（分钟）
    defaultInterval: 1        # 默认推送间隔
    defaultPushHour: 22       # 默认推送时间（小时）
    maxMessages: 300          # 最大消息数
    useLLM: true              # 使用 LLM 生成摘要
    groups: {}                # 群配置
    intervalType: hour        # hour | day
```

## 摘要模型

```yaml
memory:
  summaryModel: ""  # 生成摘要使用的模型，空则使用默认
```

## 完整示例

```yaml
memory:
  enabled: true
  storage: database
  autoExtract: true
  pollInterval: 5
  maxMemories: 50
  model: ""
  
  groupContext:
    enabled: true
    collectInterval: 10
    maxMessagesPerCollect: 50
    analyzeThreshold: 20
    extractUserInfo: true
    extractTopics: true
    extractRelations: true
  
  summaryModel: ""
  
  summaryPush:
    enabled: false
    checkInterval: 58
    defaultInterval: 1
    defaultPushHour: 22
    maxMessages: 300
    useLLM: true
    groups: {}
    intervalType: hour
```

## 管理命令

```bash
# 清除个人记忆
#ai清除记忆

# 查看记忆
#ai查看记忆
```

## 下一步

- [MCP 配置](./mcp) - MCP 服务器配置
- [代理配置](./proxy) - 网络代理设置
