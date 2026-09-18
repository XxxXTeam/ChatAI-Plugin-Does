---
title: Error Notification
description: Forward API call errors to configured groups, users, or masters instead of replying to the requester
---

# Error Notification <Badge type="tip" text="Config" />

When an API call fails during an AI conversation, the plugin by default replies to the user who triggered the conversation with a formatted error message. With the error notification service enabled, the error is forwarded to the groups, users, or masters you configure, while the requester's side stays silent — so internal errors are not exposed to regular users.

::: info 🔔 Design Goal
The core purpose of error notification is operational alerting: let administrators notice channel anomalies immediately (quota exhausted, invalid key, model retired) without disturbing users in normal conversations.
:::

The implementation lives in `src/services/ErrorNotifier.js` and is called from the conversation `catch` block in `apps/chat.js`.

## How It Works {#mechanism}

When a conversation fails, `apps/chat.js` calls `errorNotifier.notify(error, context)`:

```js
const notified = await errorNotifier.notify(error, {
    e: this.e,
    userId: this.e?.user_id,
    groupId: this.e?.group_id,
    model: config.get('llm.defaultModel')
})
if (!notified) {
    // When no notification was sent, fall back to replying to the requester with a friendly error
    const userFriendlyError = this.formatErrorForUser(error)
    const errorResult = await this.reply(userFriendlyError, true)
    this.handleAutoRecall(errorResult, true)
}
```

The return value of `notify` determines the subsequent behavior:

- Returning `true` means the error has been handled (a notification was sent successfully, or the error type is currently in its cooldown period and was silenced). In this case the requester **will not** receive an error reply.
- Returning `false` means error notification is disabled or nothing was sent; the plugin falls back to `formatErrorForUser` to reply to the requester with a friendly error message.

::: warning Cooldown also silences the requester
When an error type is in its cooldown period, `notify` also returns `true`. This means that during cooldown the requester receives neither a notification nor an error reply — this is intentional, to avoid repeated spam of the same kind of error in a short time.
:::

## Configuration {#config}

Error notification config is read from `config.get('errorNotify')` with the following fields:

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `false` | Whether to enable error notification. Only takes effect when strictly equal to `true` |
| `targets` | `Target[]` | `[]` | Notification target list; see [Target Config](#targets) below |
| `cooldown` | `number` | `60` | Cooldown seconds for the same error type; `<= 0` disables cooldown |
| `includeDetail` | `boolean` | `true` | Whether to include error details in the notification. Details are omitted only when explicitly set to `false` |

### Target Config {#targets}

`targets` is an array where each element describes one notification target:

| Field | Type | Description |
| --- | --- | --- |
| `type` | `string` | Target type: `group` / `user` / `master` |
| `id` | `string \| number` | Target ID. Group number for `group`, QQ number for `user`; the `master` type needs no `id` |

How the three types are handled:

- **`group`**: requires `id`; calls `sendGroupMessage` to send the notification to that group.
- **`user`**: requires `id`; calls `sendPrivateMessage` to send the notification to that QQ private chat.
- **`master`**: no `id` needed; sends a private message to every master one by one. The master list is aggregated by `_getMasterQQList`: it first takes the plugin config `admin.masterQQ`, then merges the Yunzai framework's `Bot.config.masterQQ` / `Bot.config.master`, deduplicating the result.

::: tip About the master target
Use the `master` type to automatically notify all masters without maintaining QQ numbers manually. If both the plugin's `admin.masterQQ` and the Yunzai framework masters are configured, they are merged and deduplicated.
:::

## Error Type Classification {#error-types}

`classifyError` matches keywords in the error message text and classifies the error into fixed categories. **Cooldown operates per error type**, so different error types do not affect each other's cooldown.

| Error Type | Matching Keywords (any match in the message hits) | Typical Scenarios |
| --- | --- | --- |
| `rate_limit` | `429` / `Too Many Requests` / `quota` | Rate limiting or quota throttling |
| `auth` | `401` / `Unauthorized` / `API key` | Invalid key or authentication failure |
| `model_not_found` | `404` / `not found` / `does not exist` | The requested model does not exist or was retired |
| `billing` | `insufficient` / `balance` / `billing` | Insufficient balance or billing issues |
| `timeout` | `timeout` / `ETIMEDOUT` / `ECONNRESET` | Request timeout or connection reset |
| `network` | `ENOTFOUND` / `network` / `fetch` | Network unreachable or DNS resolution failure |
| `content_filter` | message contains `content` AND one of `filter` / `block` / `safety` | Content blocked by safety policy |
| `unknown` | None of the above matched | Other unclassified errors |

::: warning Matching Order
`classifyError` checks the table above from top to bottom and returns on the first match. Therefore, if an error message contains keywords of multiple categories, it falls into the category listed earlier.
:::

## Cooldown Mechanism {#cooldown}

Cooldown prevents repeated notifications of the same error type in a short time:

1. Each error type (`rate_limit`, `auth`, etc.) keeps its own last-notification timestamp in an in-memory `Map`.
2. On error, the type is classified first, then checked against the `cooldown` seconds:
   - If `cooldown <= 0`, pass through directly with no cooldown.
   - If the time since the last notification of the same type is less than `cooldown` seconds, skip sending and return `true` (requester side stays silent).
   - Otherwise update the timestamp and send the notification.
3. When `cooldown` is unset or not a number, it falls back to the default `60` seconds.

::: info In-memory Cooldown
Cooldown timestamps are kept in process memory. They are cleared when the plugin or bot restarts; the first error of the same type after a restart will notify immediately.
:::

## Notification Message Format {#message-format}

The notification text built by `_buildMessage` looks roughly like this (fields appear as needed):

```text
⚠️ API Error Notification
Time: 2026/07/12 15:30:00
Type: rate_limit
User: 10001
Group: 20002
Model: gpt-4o
Details: Rate limit reached for requests...
```

- The time uses a `zh-CN` localized format (24-hour clock).
- The `User` / `Group` / `Model` lines only appear when the corresponding fields are provided in `context`.
- The `Details` line only appears when `includeDetail !== false`; details longer than 200 characters are truncated with a trailing `...`.

## Configuration Example {#example}

Add an `errorNotify` node to the plugin config (YAML):

```yaml
errorNotify:
  # Whether to enable error notification (only true takes effect)
  enabled: true
  # Notification cooldown for the same error type (seconds)
  cooldown: 120
  # Whether to include error details in the notification
  includeDetail: true
  # Notification target list
  targets:
    # Notify all masters (no id needed)
    - type: master
    # Notify a specific admin group
    - type: group
      id: 20002
    # Notify a specific user
    - type: user
      id: 10001
```

::: tip Minimal Configuration
To let only the masters receive alerts, the simplest configuration is:

```yaml
errorNotify:
  enabled: true
  targets:
    - type: master
```
:::

## FAQ {#faq}

**Why does the requester get no error message at all after enabling the feature?**
That is expected. When the error notification is sent successfully (or is in cooldown), `notify` returns `true` and the plugin silences the requester, sending the error only to the configured targets. If you want the requester to also see a message, disable error notification or adjust the business logic.

**I configured `master` but the masters received nothing?**
Check whether the plugin's `admin.masterQQ` is configured, or whether the Yunzai framework's `Bot.config.masterQQ` / `master` has values. When both are empty, the `master` target sends nothing.

**A flood of errors but only one or two notifications arrive?**
That is the cooldown working. The same error type only notifies once within `cooldown` seconds. Lower `cooldown` or set it to `0` to disable cooldown.