# 人格隔离配置

人格隔离用于在不同**作用域**（全局、用户、群、群内用户）下应用各自独立的人设（system prompt）、预设与模型配置，配置位于 `config/config.yaml` 的 `personality` 段。

## 配置示例

```yaml
personality:
  # 群聊场景下的作用域优先级（从高到低）
  priority:
    - group
    - group_user
    - user
    - default
  # 是否使用独立人格
  useIndependent: true
  # 上下文隔离
  isolateContext:
    enabled: true
    clearOnSwitch: true
```

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

- **群聊**：读取 `personality.priority`；未配置时回退到内置默认顺序 `['group_user', 'group', 'user', 'default']`。
- **私聊**：**固定**使用 `['private', 'user', 'default']`，不受 `personality.priority` 影响。

::: warning 注意默认顺序与示例的差异
内置回退顺序为 `group_user > group > user > default`（更具体的作用域优先）。
`config.yaml` 中的示例将 `group` 放在 `group_user` 之前，表示**整群统一人设**优先于**群内单用户人设**。请按实际需求调整顺序。
:::

### 独立人设机制

当某作用域设置了自定义人设时，`getIndependentPrompt()` 会直接使用该人设，**不再拼接默认人设**（`isIndependent: true`）；空字符串也视为"用户明确设置为空"的独立人设。仅当所有作用域均未设置人设时，才回退到默认 prompt。

## 其他配置项

::: warning 关于 useIndependent 与 isolateContext
`useIndependent`、`isolateContext.enabled`、`isolateContext.clearOnSwitch` 这三个字段可通过后端接口
`GET/PATCH /config/personality` 读写并持久化到 `config.yaml`，但在当前 `src/` 后端与 `frontend/src/` 前端源码中**未检索到直接消费这些字段的业务逻辑**。

它们与预设级别的 `isolateContext` / `clearOnSwitch`（`PresetManager` 中的预设属性，默认 `false`，见下）并非同一处配置。如需确认其实际行为，请以运行时表现为准。
:::

| 字段 | 类型 | 示例值 | 说明 |
|------|------|--------|------|
| `useIndependent` | boolean | `true` | 人格独立开关（当前源码未见直接消费点）|
| `isolateContext.enabled` | boolean | `true` | 上下文隔离开关（当前源码未见直接消费点）|
| `isolateContext.clearOnSwitch` | boolean | `true` | 切换时清空上下文（当前源码未见直接消费点）|

> 预设级别的上下文隔离由预设自身的 `isolateContext`（是否使用独立上下文）与 `clearOnSwitch`（切换预设时是否清除上下文）控制，默认均为 `false`，详见 [预设与人格](/guide/presets)。

## 管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/config/personality` | 获取当前人格配置 |
| `PATCH` | `/config/personality` | 局部更新人格配置 |

## 下一步

- [上下文配置](./context) - 对话记忆与压缩
- [基础配置](./basic) - llm / thinking 等全局配置
