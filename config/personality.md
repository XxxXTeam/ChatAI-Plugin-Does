# 人格隔离配置

人格隔离用于在不同**作用域**（全局、用户、群、群内用户）下应用各自独立的人设（system prompt）、预设与模型配置，配置位于 `config/config.yaml` 的 `personality` 段（对照 config 默认配置 `config/config.js` 的 `getDefaultConfig()`）。同一顶层段中的 `presets` 配置一并在本文说明。

## 配置示例

```yaml
personality:
  # 群聊场景下的作用域优先级（越靠前优先级越高）
  # 可选值: group_user(群内用户独立人格), group(群聊人格), user(用户全局人格), default(默认预设)
  priority:
    - group
    - group_user
    - user
    - default
  # 是否启用独立人格（设置后完全替换默认，不拼接）
  useIndependent: true
  # 独立人格上下文设置
  isolateContext:
    enabled: false         # 启用独立上下文（不与其他预设共享对话历史）
    clearOnSwitch: false   # 切换人格时是否清除上下文
```

### 默认值对照

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `personality.priority` | string[] | `['group', 'group_user', 'user', 'default']` | 群聊场景作用域优先级（越靠前越高） |
| `personality.useIndependent` | boolean | `true` | 是否启用独立人格（完全替换默认，不拼接） |
| `personality.isolateContext.enabled` | boolean | `false` | 启用独立上下文（不与其他预设共享对话历史） |
| `personality.isolateContext.clearOnSwitch` | boolean | `false` | 切换人格时是否清除上下文 |

::: warning 注意：本页旧版的"示例值"即为实例文件值，不是默认值
旧版示例将 `isolateContext.enabled` / `isolateContext.clearOnSwitch` 写成 `true`。`true` 是 `config.yaml` 实例中的值；`getDefaultConfig()` 中两者均为 `false`。
:::

## 作用域优先级 priority

`priority` 决定在**群聊**场景下按什么顺序查找生效的人设配置，由 `ScopeManager.getEffectiveSettings()` 消费（源码 `src/services/scope/ScopeManager.js`）。系统按数组顺序从高到低查找，命中第一个存在配置的作用域即停止。

| 作用域 | 含义 | 存储表 |
|--------|------|--------|
| `group_user` | 特定群中特定用户的独立配置 | `group_user_scopes` |
| `group` | 整个群的共享配置 | `group_scopes` |
| `user` | 该用户跨群的全局配置 | `user_scopes` |
| `private` | 私聊场景配置 | `private_scopes` |
| `default` | 系统默认人设 | 全局配置 |

### 场景差异

- **群聊**：读取 `personality.priority`；未配置时回退到内置默认顺序 `['group', 'group_user', 'user', 'default']`（`isPrivate ? ['private','user','default'] : ['group','group_user','user','default']`，见 `ScopeManager.js` 第 883 行）。
- **私聊**：**固定**使用 `['private', 'user', 'default']`，不受 `personality.priority` 影响。

::: warning 注意默认顺序与实例文件的差异
代码内置回退顺序为 `group > group_user > user > default`，与 `getDefaultConfig()` 的默认值完全一致。`config.yaml` 实例文件可能保持相同或自定义顺序，请按实际需求调整。
:::

### 独立人设机制

当某作用域设置了自定义人设时，`getIndependentPrompt()` 会直接使用该人设，**不再拼接默认人设**（`isIndependent: true`）；空字符串也视为"用户明确设置为空"的独立人设。仅当所有作用域均未设置人设时，才回退到默认 prompt。

## presets 预设总开关

```yaml
presets:
  defaultId: 'default'        # 默认预设 ID
  allowUserSwitch: true       # 是否允许用户切换预设
  perUserPreset: false        # 每个用户可以有独立的预设
  perGroupPreset: false       # 每个群可以有独立的预设
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `presets.defaultId` | string | `'default'` | 默认预设 ID（预设不存在时 `PresetManager` 回退读取 `llm.defaultChatPresetId`） |
| `presets.allowUserSwitch` | boolean | `true` | 是否允许用户切换预设 |
| `presets.perUserPreset` | boolean | `false` | 每个用户/群可以有独立的预设（用户维度开关） |
| `presets.perGroupPreset` | boolean | `false` | 每个用户/群可以有独立的预设（群维度开关） |

## 其他配置项

::: warning 关于 useIndependent 与 isolateContext
`useIndependent`、`isolateContext.enabled`、`isolateContext.clearOnSwitch` 这三个字段可通过后端接口
`GET/PATCH /config/personality` 读写并持久化到 `config.yaml`，但在当前 `src/` 后端与 `frontend/` 前端源码中**未检索到直接消费这些字段的业务逻辑**。

它们与预设级别的 `isolateContext` / `clearOnSwitch`（`PresetManager` 中的预设属性，默认 `false`，见下）并非同一处配置。如需确认其实际行为，请以运行时表现为准。
:::

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `useIndependent` | boolean | `true` | 人格独立开关（当前源码未见直接消费点）|
| `isolateContext.enabled` | boolean | `false` | 上下文隔离开关（当前源码未见直接消费点）|
| `isolateContext.clearOnSwitch` | boolean | `false` | 切换时清空上下文（当前源码未见直接消费点）|

> 预设级别的上下文隔离由预设自身的 `isolateContext`（是否使用独立上下文）与 `clearOnSwitch`（切换预设时是否清除上下文）控制，默认均为 `false`，详见 [预设与人格](/guide/presets)。

## 管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/config/personality` | 获取当前人格配置 |
| `PATCH` | `/config/personality` | 局部更新人格配置 |

## 下一步

- [上下文配置](./context) - 对话记忆与压缩
- [基础配置](./basic) - llm / thinking 等全局配置
