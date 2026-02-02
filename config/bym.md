# 伪人配置

伪人模式让 AI 更自然地参与群聊，模拟真实用户行为。

## 基础配置

```yaml
bym:
  # 启用伪人模式
  enable: false
  
  # 启用工具调用
  enableTools: false
  
  # 触发概率 (0-1)
  probability: 0.02
  
  # 温度参数
  temperature: 0.9
  
  # 最大 Token
  maxTokens: 100
  
  # 撤回消息
  recall: false
  
  # 使用的模型
  model: ""
  
  # System Prompt
  systemPrompt: ""
  
  # 继承人格设置
  inheritPersonality: true
  
  # 使用的预设ID
  presetId: ""
```

## 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enable` | boolean | `false` | 启用伪人模式 |
| `enableTools` | boolean | `false` | 允许使用工具 |
| `probability` | number | `0.02` | 触发概率 (2%) |
| `temperature` | number | `0.9` | 温度参数 |
| `maxTokens` | number | `100` | 最大输出 Token |
| `recall` | boolean | `false` | 随机撤回消息 |
| `inheritPersonality` | boolean | `true` | 继承人格设置 |

## 预设映射

为不同群组配置不同的伪人预设：

```yaml
bym:
  presetMap:
    "群号1": "preset-id-1"
    "群号2": "preset-id-2"
```

## 排他功能

伪人模式下排除的功能：

```yaml
bym:
  exclusiveFeatures:
    - groupSummary    # 群总结
    - userPortrait    # 用户画像
```

## 主动聊天

更高级的主动参与群聊配置：

```yaml
proactiveChat:
  enabled: false
  pollInterval: 5           # 轮询间隔（秒）
  minMessagesBeforeTrigger: 10  # 触发前最小消息数
  maxConcurrentTriggers: 3  # 最大并发触发数
  baseProbability: 0.05     # 基础概率
  maxProbability: 0.5       # 最大概率
  
  # 安静时段
  quietHoursStart: 0        # 开始时间
  quietHoursEnd: 6          # 结束时间
  allowQuietHoursOverride: false
  
  # 时间段系数
  timePeriodMultipliers:
    late_night: 0.1         # 深夜
    early_morning: 0.3      # 清晨
    morning: 1              # 上午
    afternoon: 1.2          # 下午
    evening: 1.5            # 傍晚
    night: 0.8              # 夜间
  
  # 星期系数
  useWeekdayMultiplier: true
  weekdayMultipliers:
    "0": 1.3    # 周日
    "1": 0.8    # 周一
    "2": 0.9
    "3": 1
    "4": 1
    "5": 1.2    # 周五
    "6": 1.4    # 周六
  
  # 活跃度判断
  highFreqMessagesPerMinute: 2
  activeMessagesIn30Min: 15
  lowMessagesIn30Min: 3
  deadMinutesWithoutMessage: 120
  inactiveMinutesLimit: 180
  
  # 活跃度系数
  activityMultipliers:
    dead: 0
    low: 0.3
    normal: 1
    active: 1.5
    high_freq: 0.1    # 过于活跃时降低
  
  # 模型配置
  model: ""
  systemPrompt: "你是群里的一员，正在查看群聊记录..."
  maxTokens: 150
  temperature: 0.9
  
  # 群组配置
  enabledGroups: []
  blacklistGroups: []
  
  # 限制
  cooldownMinutes: 30       # 冷却时间
  maxDailyMessages: 20      # 每日最大消息数
  maxHourlyMessages: 5      # 每小时最大消息数
  
  # 上下文
  useGroupContext: true
  contextMessageCount: 20
```

## 对话追踪

追踪群聊对话流：

```yaml
conversationTracking:
  enabled: false
  timeout: 2          # 超时（分钟）
  throttle: 3         # 节流（秒）
  batchDelay: 3       # 批处理延迟（秒）
  model: ""
```

## 完整示例

```yaml
bym:
  enable: true
  enableTools: false
  probability: 0.03
  temperature: 0.9
  maxTokens: 100
  recall: false
  model: ""
  systemPrompt: ""
  inheritPersonality: true
  presetId: ""
  presetMap: {}
  exclusiveFeatures:
    - groupSummary
    - userPortrait

proactiveChat:
  enabled: true
  pollInterval: 5
  minMessagesBeforeTrigger: 10
  baseProbability: 0.05
  maxProbability: 0.5
  quietHoursStart: 0
  quietHoursEnd: 6
  
  timePeriodMultipliers:
    late_night: 0.1
    early_morning: 0.3
    morning: 1
    afternoon: 1.2
    evening: 1.5
    night: 0.8
  
  useWeekdayMultiplier: true
  
  activityMultipliers:
    dead: 0
    low: 0.3
    normal: 1
    active: 1.5
    high_freq: 0.1
  
  enabledGroups: []
  blacklistGroups: []
  cooldownMinutes: 30
  maxDailyMessages: 20
  maxHourlyMessages: 5
  useGroupContext: true
  contextMessageCount: 20
```

## 使用建议

1. **低概率起步** - 建议从 1-3% 概率开始
2. **限制输出** - maxTokens 建议 100-150，保持简短
3. **设置冷却** - 避免过于频繁发言
4. **时段控制** - 深夜降低触发概率
5. **群组白名单** - 只在特定群组启用

## 管理命令

```bash
# 开启群伪人
#ai群伪人开启

# 关闭群伪人
#ai群伪人关闭

# 设置概率
#ai群伪人概率 5    # 5%
```

## 下一步

- [功能配置](./features) - 其他功能配置
- [触发配置](./triggers) - 触发方式配置
