# 伪人 / 主动聊天 / 游戏 / 会话追踪配置

本文对照 config 默认配置（`config/config.js` 的 `getDefaultConfig()`，对应提交 `5351e7d7`）编写，覆盖顶层 `bym`、`game`、`proactiveChat`、`conversationTracking` 四个段。

## 伪人模式 bym

伪人模式让 AI 更自然地参与群聊，模拟真实用户行为。

```yaml
bym:
  enable: false            # 启用伪人模式
  enableTools: false       # 是否允许伪人模式使用工具
  probability: 0.02        # 触发概率 (0-1)
  temperature: 0.9         # 温度参数
  maxTokens: 150           # 最大输出 Token
  recall: false            # 撤回消息
  model: ''                # 使用的模型
  systemPrompt: '你是一个真实的人类用户，正在和朋友们聊天。请用简短、自然、口语化的方式回复，就像真人一样。不要说你是AI。'
  inheritPersonality: true # 继承人格配置：启用后会使用用户/群组的独立人格设置
  presetMap: {}            # 关键词预设映射：{ "关键词": "预设ID" }
  exclusiveFeatures:       # 仅伪人模式可用的功能
    - groupSummary
    - userPortrait
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enable` | boolean | `false` | 启用伪人模式 |
| `enableTools` | boolean | `false` | 是否允许伪人模式使用工具 |
| `probability` | number | `0.02` | 触发概率 (2%) |
| `temperature` | number | `0.9` | 温度参数 |
| `maxTokens` | number | `150` | 最大输出 Token |
| `recall` | boolean | `false` | 撤回消息 |
| `model` | string | `''` | 使用的模型 |
| `systemPrompt` | string | 见上方示例 | 伪人模式的 System Prompt（默认值非空，旧文档写 `""` 是错的） |
| `inheritPersonality` | boolean | `true` | 继承人格配置：启用后使用用户/群组的独立人格设置 |
| `presetMap` | object | `{}` | 关键词预设映射，格式 `{ "关键词": "预设ID" }` |
| `exclusiveFeatures` | array | `['groupSummary', 'userPortrait']` | 仅伪人模式可用的功能 |

::: danger 历史页面更正
本页旧版曾出现 `bym.presetId`（默认配置无此键；`config.yaml` 实例中出现过 `bym.presetId: ""`，属于运行期/外部写入的键，不作默认字段收录）与「预设映射按群号」的说法——`presetMap` 的键是**关键词**而非群号。`bym.probability` 旧版解释「随机撤回消息」也是错的，`recall` 才是撤回相关开关。
:::

## 游戏模式 game

Galgame 等互动游戏使用的配置（`apps/Galgame.js` 与 `src/services/galgame/GalgameService.js` 消费 `game.probability` / `game.temperature` / `game.maxTokens` / `game.enableTools`）：

```yaml
game:
  probability: 0.3     # 非@触发时的响应概率（30%）
  enableTools: true    # 是否允许游戏模式使用工具
  temperature: 0.8
  maxTokens: 1000
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `probability` | number | `0.3` | 非 @ 触发时的响应概率（30%） |
| `enableTools` | boolean | `true` | 是否允许游戏模式使用工具 |
| `temperature` | number | `0.8` | 温度参数 |
| `maxTokens` | number | `1000` | 最大输出 Token |

## 主动聊天 proactiveChat

```yaml
proactiveChat:
  enabled: false                       # 全局开关
  pollInterval: 5                      # 轮询间隔（分钟）
  minMessagesBeforeTrigger: 10         # 触发前最少需要的群消息数
  maxConcurrentTriggers: 3             # 单次轮询最大触发群数
  baseProbability: 0.05                # 基础触发概率 (5%)
  maxProbability: 0.5                  # 最大触发概率上限 (50%)
  quietHoursStart: 0                   # 静默开始时间（0-23，支持跨天如23表示23:00开始）
  quietHoursEnd: 6                     # 静默结束时间（0-23）
  allowQuietHoursOverride: false       # 是否允许在静默时段触发
  timePeriodMultipliers:               # 时段概率乘数
    late_night: 0.1                    # 深夜 (0:00-5:00) 大幅降低
    early_morning: 0.3                 # 清晨 (5:00-7:00) 降低
    morning: 1.0                       # 上午 (7:00-12:00) 正常
    afternoon: 1.2                     # 下午 (12:00-18:00) 略高
    evening: 1.5                       # 傍晚 (18:00-21:00) 最活跃
    night: 0.8                         # 晚上 (21:00-24:00) 略低
  useWeekdayMultiplier: true           # 是否启用星期乘数
  weekdayMultipliers:                  # 星期乘数
    "0": 1.3                           # 周日
    "1": 0.8                           # 周一
    "2": 0.9                           # 周二
    "3": 1.0                           # 周三
    "4": 1.0                           # 周四
    "5": 1.2                           # 周五
    "6": 1.4                           # 周六
  highFreqMessagesPerMinute: 2         # 判定为高频对话的消息速率（条/分钟）
  activeMessagesIn30Min: 15            # 30分钟内达到此消息数判定为活跃
  lowMessagesIn30Min: 3                # 30分钟内低于此消息数判定为低活跃
  deadMinutesWithoutMessage: 120       # 超过此分钟数无消息判定为死群
  inactiveMinutesLimit: 180            # 最近活跃距离现在超过该分钟则不主动触发
  activityMultipliers:                 # 活跃度级别乘数
    dead: 0                            # 死群不触发
    low: 0.3                           # 低活跃降低概率
    normal: 1.0                        # 正常
    active: 1.5                        # 活跃提高概率
    high_freq: 0.1                     # 高频对话中大幅降低（避免打扰）
  model: ''                            # 使用的模型（留空使用默认）
  systemPrompt: '你是群里的一员，正在查看群聊记录。根据最近的聊天内容，自然地参与讨论或发起新话题。保持简短、口语化、有趣。'
  maxTokens: 150
  temperature: 0.9
  enabledGroups: []                    # 启用的群列表，空表示所有群
  blacklistGroups: []                  # 黑名单群
  cooldownMinutes: 30                  # 同一群触发后的冷却时间（分钟）
  maxDailyMessages: 20                 # 每日每群最大主动消息数
  maxHourlyMessages: 5                 # 每小时每群最大主动消息数
  useGroupContext: true                # 使用群聊上下文
  contextMessageCount: 20              # 携带的上下文消息数
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | `false` | 全局开关 |
| `pollInterval` | number | `5` | 轮询间隔（分钟） |
| `minMessagesBeforeTrigger` | number | `10` | 触发前最少需要的群消息数 |
| `maxConcurrentTriggers` | number | `3` | 单次轮询最大触发群数 |
| `baseProbability` | number | `0.05` | 基础触发概率（5%） |
| `maxProbability` | number | `0.5` | 最大触发概率上限（50%） |
| `quietHoursStart` | number | `0` | 静默开始时间（0-23，支持跨天） |
| `quietHoursEnd` | number | `6` | 静默结束时间（0-23） |
| `allowQuietHoursOverride` | boolean | `false` | 是否允许在静默时段触发 |
| `timePeriodMultipliers.*` | number | 见示例 | 时段概率乘数（late_night / early_morning / morning / afternoon / evening / night） |
| `useWeekdayMultiplier` | boolean | `true` | 是否启用星期乘数 |
| `weekdayMultipliers.*` | number | 见示例 | 星期乘数，键为 `"0"`-`"6"` |
| `highFreqMessagesPerMinute` | number | `2` | 判定为高频对话的消息速率（条/分钟） |
| `activeMessagesIn30Min` | number | `15` | 30 分钟内达到此消息数判定为活跃 |
| `lowMessagesIn30Min` | number | `3` | 30 分钟内低于此消息数判定为低活跃 |
| `deadMinutesWithoutMessage` | number | `120` | 超过此分钟数无消息判定为死群 |
| `inactiveMinutesLimit` | number | `180` | 最近活跃距离现在超过该分钟则不主动触发 |
| `activityMultipliers.*` | number | 见示例 | 活跃度级别乘数（dead / low / normal / active / high_freq） |
| `model` | string | `''` | 使用的模型（留空使用默认） |
| `systemPrompt` | string | 见上方示例 | 主动聊天 System Prompt |
| `maxTokens` | number | `150` | 最大输出 Token |
| `temperature` | number | `0.9` | 温度参数 |
| `enabledGroups` | array | `[]` | 启用的群列表，空表示所有群 |
| `blacklistGroups` | array | `[]` | 黑名单群 |
| `cooldownMinutes` | number | `30` | 同一群触发后的冷却时间（分钟） |
| `maxDailyMessages` | number | `20` | 每日每群最大主动消息数 |
| `maxHourlyMessages` | number | `5` | 每小时每群最大主动消息数 |
| `useGroupContext` | boolean | `true` | 使用群聊上下文 |
| `contextMessageCount` | number | `20` | 携带的上下文消息数 |

::: danger 历史页面更正
旧版把 `pollInterval` 注为「（秒）」，实际为**分钟**。`config.yaml` 实例中出现的 `nightProbabilityMultiplier` 等 `night*` / `lowActive*` 键不是默认配置内容，删除。
:::

## 会话追踪 conversationTracking

智能识别用户是否在继续与机器人对话：

```yaml
conversationTracking:
  enabled: false   # 是否启用会话追踪
  timeout: 2       # 追踪超时时间（分钟）
  throttle: 3      # AI判断节流间隔（秒）
  batchDelay: 3    # 批量判断延迟（秒）
  model: ''        # 判断用模型（留空使用调度模型或默认模型）
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | `false` | 是否启用会话追踪 |
| `timeout` | number | `2` | 追踪超时时间（分钟） |
| `throttle` | number | `3` | AI 判断节流间隔（秒） |
| `batchDelay` | number | `3` | 批量判断延迟（秒） |
| `model` | string | `''` | 判断用模型（留空使用调度模型或默认模型） |

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
```

::: warning 历史命令更正
旧版书写的 `#ai群伪人概率 5` 未在 `apps/Management.js` 的命令注册中找到；已核实的群级命令为 `#ai群伪人开启/关闭`、`#ai群绘图开启/关闭`、`#ai群设置`（见 `apps/Management.js` 第 29-51 行附近）。
:::

## 下一步

- [功能配置](./features) - 其他功能配置
- [触发配置](./triggers) - 触发方式配置
