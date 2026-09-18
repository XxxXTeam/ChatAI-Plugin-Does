# 记忆配置

长期记忆系统让 AI 记住用户偏好和历史信息，跨对话保持记忆。本文对照 config 默认配置（`config/config.js` 的 `getDefaultConfig()`，对应提交 `5351e7d7`）。

## 基础配置

```yaml
memory:
  enabled: false           # 是否启用长期记忆（默认关闭）
  storage: database        # 使用数据库存储
  autoExtract: true        # 自动从对话提取记忆
  pollInterval: 5          # 轮询间隔（分钟）
  maxMemories: 50          # 每用户最大记忆数
  model: ''                # 记忆提取使用的模型（留空使用默认模型）
  groupContext:            # 群聊上下文采集
    enabled: true             # 启用群聊上下文采集
    collectInterval: 10       # 采集间隔（分钟）
    maxMessagesPerCollect: 50 # 每次采集最大消息数
    analyzeThreshold: 20      # 触发分析的最小消息数
    extractUserInfo: true     # 提取用户信息作为记忆
    extractTopics: true       # 提取讨论话题
    extractRelations: true    # 提取用户关系
```

## 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | `false` | 启用长期记忆 |
| `storage` | string | `'database'` | 存储方式，使用数据库存储 |
| `autoExtract` | boolean | `true` | 自动从对话提取记忆 |
| `pollInterval` | number | `5` | 轮询间隔（分钟） |
| `maxMemories` | number | `50` | 每用户最大记忆数 |
| `model` | string | `''` | 记忆提取使用的模型（留空使用默认模型） |

### 可选键 minPollInterval

`minPollInterval` 不在默认配置中。`src/services/storage/MemoryManager.js` 轮询时动态读取 `config.get('memory.minPollInterval') || 30`（分钟），即不配置时同一批对话两次轮询的最小间隔为 30 分钟。

## 群聊上下文记忆 groupContext

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | `true` | 启用群聊上下文采集 |
| `collectInterval` | number | `10` | 采集间隔（分钟） |
| `maxMessagesPerCollect` | number | `50` | 每次采集最大消息数 |
| `analyzeThreshold` | number | `20` | 触发分析的最小消息数 |
| `extractUserInfo` | boolean | `true` | 提取用户信息作为记忆 |
| `extractTopics` | boolean | `true` | 提取讨论话题 |
| `extractRelations` | boolean | `true` | 提取用户关系 |

## 完整示例

```yaml
memory:
  enabled: false
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
```

::: danger 历史页面更正
本页旧版出现过「存储方式: database | file」的枚举注释、`summaryPush` / `summaryModel` 段与 `#ai清除记忆` / `#ai查看记忆` 命令。代码事实：默认配置注释仅注明「使用数据库存储」；`summaryPush` / `summaryModel` 是 `config.yaml` 实例中的键，不在默认配置内，本页不收录；`#ai清除记忆` 命令未在 `apps/Commands.js` 命令注册中找到。上一轮已核实的 `minPollInterval` 说明保持保留。
:::

## 下一步

- [MCP 配置](./mcp) - MCP 服务器配置
- [上下文配置](./context) - 上下文与压缩
- [代理配置](./proxy) - 网络代理设置