---
title: 错误通知
description: API 调用报错时将错误信息转发到指定群聊、用户或主人，而非直接回复触发者
---

# 错误通知 <Badge type="tip" text="配置" />

当 AI 对话过程中 API 调用发生错误时，插件默认会向触发对话的用户回复一段格式化的错误提示。启用错误通知服务后，错误信息会转发到你配置的群聊、用户或主人处，触发者侧则保持静默，避免把内部报错直接暴露给普通用户。

::: info 🔔 设计目标
错误通知的核心用途是运维告警：让管理者第一时间感知渠道异常（如额度耗尽、密钥失效、模型下线），同时不打扰正常聊天的用户。
:::

实现位于 `src/services/ErrorNotifier.js`，在 `apps/chat.js` 的对话 `catch` 块中被调用。

## 工作机制 {#mechanism}

对话失败时，`apps/chat.js` 会调用 `errorNotifier.notify(error, context)`：

```js
const notified = await errorNotifier.notify(error, {
    e: this.e,
    userId: this.e?.user_id,
    groupId: this.e?.group_id,
    model: config.get('llm.defaultModel')
})
if (!notified) {
    // 未发送通知时，回退到向触发者回复友好错误提示
    const userFriendlyError = this.formatErrorForUser(error)
    const errorResult = await this.reply(userFriendlyError, true)
    this.handleAutoRecall(errorResult, true)
}
```

`notify` 的返回值决定后续行为：

- 返回 `true` 表示错误已被处理（已成功发送通知，或该错误类型正处于冷却期被静默），此时**不会**再向触发者回复错误。
- 返回 `false` 表示错误通知未启用或未发出，此时回退到 `formatErrorForUser` 向触发者回复友好错误提示。

::: warning 冷却期也会静默触发者
当某错误类型处于冷却期，`notify` 同样返回 `true`。这意味着冷却期内触发者既收不到通知也收不到错误回复，属于预期行为——目的是避免同类错误在短时间内反复刷屏。
:::

## 配置项 {#config}

错误通知的配置读取自 `config.get('errorNotify')`，字段如下：

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `false` | 是否启用错误通知。只有严格等于 `true` 时生效 |
| `targets` | `Target[]` | `[]` | 通知目标列表，见下方 [目标配置](#targets) |
| `cooldown` | `number` | `60` | 同一错误类型的通知冷却秒数，`<= 0` 表示不冷却 |
| `includeDetail` | `boolean` | `true` | 是否在通知中包含错误详情。仅当显式设为 `false` 时省略详情 |

### 目标配置 {#targets}

`targets` 是一个数组，每个元素描述一个通知目标：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `type` | `string` | 目标类型：`group`（群聊）/ `user`（用户）/ `master`（主人） |
| `id` | `string \| number` | 目标 ID。`group` 为群号、`user` 为 QQ 号；`master` 类型不需要 `id` |

三种类型的处理方式：

- **`group`**：需要提供 `id`，调用 `sendGroupMessage` 向对应群号发送通知。
- **`user`**：需要提供 `id`，调用 `sendPrivateMessage` 向对应 QQ 私聊发送通知。
- **`master`**：无需 `id`，向所有主人逐个私聊发送。主人列表由 `_getMasterQQList` 汇总得到：先取插件配置 `admin.masterQQ`，再合并 Yunzai 框架 `Bot.config.masterQQ` / `Bot.config.master`，去重后使用。

::: tip 关于 master 目标
使用 `master` 类型即可自动通知所有主人，无需手动维护 QQ 号。若同时配置了插件 `admin.masterQQ` 和 Yunzai 框架主人，两者会合并去重。
:::

## 错误类型分类 {#error-types}

`classifyError` 依据错误消息文本匹配关键字，将错误归入固定类别。**冷却机制以错误类型为粒度**，因此不同类型的错误互不影响冷却。

| 错误类型 | 匹配关键字（消息中包含任一即命中） | 典型场景 |
| --- | --- | --- |
| `rate_limit` | `429` / `Too Many Requests` / `quota` | 触发限流或额度速率限制 |
| `auth` | `401` / `Unauthorized` / `API key` | 密钥无效或认证失败 |
| `model_not_found` | `404` / `not found` / `does not exist` | 请求的模型不存在或已下线 |
| `billing` | `insufficient` / `balance` / `billing` | 余额不足或计费问题 |
| `timeout` | `timeout` / `ETIMEDOUT` / `ECONNRESET` | 请求超时或连接被重置 |
| `network` | `ENOTFOUND` / `network` / `fetch` | 网络不可达或域名解析失败 |
| `content_filter` | 消息同时包含 `content` 且包含 `filter` / `block` / `safety` 之一 | 内容被安全策略拦截 |
| `unknown` | 以上均未命中 | 未分类的其他错误 |

::: warning 匹配顺序
`classifyError` 按上表从上到下依次判断，命中即返回。因此若一条错误消息同时包含多个类别的关键字，会归入靠前的类别。
:::

## 冷却机制 {#cooldown}

冷却用于防止同类错误在短时间内反复通知：

1. 每个错误类型（`rate_limit`、`auth` 等）独立维护上次通知时间戳，存于内存 `Map` 中。
2. 收到错误时先分类，再检查 `cooldown` 秒数：
   - 若 `cooldown <= 0`，直接放行，不做冷却。
   - 若距上次同类通知不足 `cooldown` 秒，跳过发送并返回 `true`（触发者侧静默）。
   - 否则更新时间戳并发送通知。
3. `cooldown` 未配置或非数值时，回退默认值 `60` 秒。

::: info 内存态冷却
冷却时间戳保存在进程内存中，插件或机器人重启后冷却记录会清空，重启后首次同类错误将立即通知。
:::

## 通知消息格式 {#message-format}

`_buildMessage` 构建的通知文本大致如下（字段按需出现）：

```text
⚠️ API 错误通知
时间: 2026/07/12 15:30:00
类型: rate_limit
用户: 10001
群聊: 20002
模型: gpt-4o
详情: Rate limit reached for requests...
```

- 时间使用 `zh-CN` 本地化格式（24 小时制）。
- `用户` / `群聊` / `模型` 三行仅在 `context` 中提供了对应字段时才出现。
- `详情` 行仅在 `includeDetail !== false` 时出现，且错误详情超过 200 字符时会被截断并追加 `...`。

## 配置示例 {#example}

在插件配置中添加 `errorNotify` 节点（YAML 格式）：

```yaml
errorNotify:
  # 是否启用错误通知（仅 true 生效）
  enabled: true
  # 同一错误类型的通知冷却（秒）
  cooldown: 120
  # 是否在通知中包含错误详情
  includeDetail: true
  # 通知目标列表
  targets:
    # 通知所有主人（无需填写 id）
    - type: master
    # 通知指定管理群
    - type: group
      id: 20002
    # 通知指定用户
    - type: user
      id: 10001
```

::: tip 最小配置
只想让主人收到告警时，最简配置如下：

```yaml
errorNotify:
  enabled: true
  targets:
    - type: master
```
:::

## 常见问题 {#faq}

**为什么开启后触发者收不到任何错误提示？**
这是预期行为。当错误通知成功发出（或处于冷却期）时，`notify` 返回 `true`，插件会静默触发者，只把错误发给配置的目标。若希望触发者也能看到提示，需关闭错误通知或调整业务逻辑。

**配置了 `master` 但主人没收到通知？**
检查插件 `admin.masterQQ` 是否配置，或 Yunzai 框架 `Bot.config.masterQQ` / `master` 是否有值。两者都为空时，`master` 目标不会发送给任何人。

**同一时间大量报错却只收到一两条通知？**
这是冷却机制在生效。相同错误类型在 `cooldown` 秒内只通知一次。可调低 `cooldown` 或设为 `0` 关闭冷却。
