---
title: 测试面板 API
description: 渠道模型批量测试与快速测试接口，基于 SSE 实时推送测试进度与结果
---

# 测试面板 API <Badge type="tip" text="REST / SSE" />

测试面板接口用于对渠道下的模型进行连通性与可用性测试，支持批量并发测试和单模型快速测试，测试过程通过 **SSE（Server-Sent Events）** 实时推送进度与结果。

::: info 🧪 用途
在 WebUI 的测试面板中批量验证一个渠道下所有模型是否可用、响应耗时如何，测试结果会同步记入统计服务（`StatsService`）。
:::

所有接口挂载在 `/api/test-panel` 前缀下，并经过鉴权中间件（`auth`）保护。实现位于 `src/services/routes/testPanelRoutes.js`，路由注册见 `src/services/webServer.js`：

```js
this.router.use('/api/test-panel', auth, testPanelRoutes)
```

## 响应格式约定 {#response-format}

非 SSE 接口统一返回 `ApiResponse` 结构：

```json
{ "code": 0, "data": {}, "message": "ok" }
```

- 成功：`code` 为 `0`，数据在 `data` 中，`message` 为 `"ok"`。
- 失败：`code` 为 `-1`（默认），`message` 为错误说明。

SSE 接口不返回上述 JSON 包装，而是持续以 `event/data` 帧推送，详见 [SSE 事件流](#sse-events)。

---

## 批量测试（SSE） {#batch-test}

```http
POST /api/test-panel/batch-test
```

对指定渠道的多个模型并发执行测试，通过 SSE 实时推送每个模型的测试状态与结果。

**请求参数（JSON Body）**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `channelId` | `string` | 是 | — | 目标渠道 ID |
| `models` | `string[]` | 否 | 渠道自身 `models` | 待测试的模型列表，为空时使用渠道配置的全部模型 |
| `concurrency` | `number` | 否 | `3` | 并发测试数 |
| `clearPrevious` | `boolean` | 否 | `true` | 是否在开始前推送 `clear` 事件清空上次结果 |

**前置校验（非 SSE 的错误响应）**

| 条件 | HTTP 状态 | 响应 |
| --- | --- | --- |
| 渠道不存在 | `404` | `ApiResponse.fail(null, '渠道不存在')` |
| 无可测试模型 | `400` | `ApiResponse.fail(null, '没有可测试的模型')` |

校验通过后，响应切换为 SSE 流。每个模型的测试逻辑：

- 使用渠道配置构建 `OpenAIClient`（含自定义路径、请求头模板、请求体模板、图像配置等）。
- 若渠道配置了多密钥 `apiKeys`，通过 `channelManager.getChannelKey` 选取密钥（不记录用量）。
- 以固定内容 `你好` 发起对话（`maxToken: 50`，`temperature: 0.7`）。
- 测试结果无论成功失败都调用 `statsService.recordApiCall` 记入统计，`source` 为 `batch-test`。

::: tip 返回的 testId
`start` 事件中会返回本次测试的 `testId`，用于后续调用 [停止批量测试](#batch-test-stop) 中止任务。
:::

---

## 停止批量测试 {#batch-test-stop}

```http
POST /api/test-panel/batch-test-stop
```

中止正在运行的批量测试任务。

**请求参数（JSON Body）**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `testId` | `string` | 否 | 要停止的测试任务 ID。不传则停止所有活跃任务 |

**响应示例**

传入存在的 `testId`：

```json
{ "code": 0, "data": { "stopped": true, "testId": "test_1720000000000_abc123def" }, "message": "ok" }
```

传入的 `testId` 不存在或任务已完成：

```json
{ "code": 0, "data": { "stopped": false, "message": "测试任务不存在或已完成" }, "message": "ok" }
```

不传 `testId`，停止所有活跃任务：

```json
{ "code": 0, "data": { "stopped": true, "count": 2 }, "message": "ok" }
```

::: warning 软停止
停止操作只是将任务标记为 `aborted`，正在进行中的单个模型请求会跑完，但不会再启动新的模型测试，SSE 流随后以 `complete` 事件（`aborted: true`）结束。
:::

---

## 获取活跃测试列表 {#active-tests}

```http
GET /api/test-panel/active-tests
```

返回当前所有正在进行的批量测试任务。

**响应示例**

```json
{
  "code": 0,
  "data": [
    {
      "id": "test_1720000000000_abc123def",
      "completed": 5,
      "total": 12,
      "aborted": false
    }
  ],
  "message": "ok"
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 测试任务 ID |
| `completed` | `number` | 已完成模型数 |
| `total` | `number` | 待测试模型总数 |
| `aborted` | `boolean` | 是否已被标记中止 |

---

## 快速测试单模型（SSE） {#quick-test}

```http
POST /api/test-panel/quick-test
```

对单个模型执行一次测试。采用 SSE 是为防止长耗时请求被前端或代理超时切断。

**请求参数（JSON Body）**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `channelId` | `string` | 是 | — | 目标渠道 ID |
| `model` | `string` | 否 | 渠道 `models[0]` | 待测试模型，缺省时使用渠道首个模型 |
| `message` | `string` | 否 | `说一声你好` | 测试用的对话内容 |

**前置校验**

| 条件 | HTTP 状态 | 响应 |
| --- | --- | --- |
| 渠道不存在 | `404` | `ApiResponse.fail(null, '渠道不存在')` |

校验通过后切换为 SSE 流，依次推送 `start` → `result`（成功）或 `start` → `error`（失败），对话参数为 `maxToken: 100`，`temperature: 0.7`。

::: info 与批量测试的区别
快速测试不写入统计服务，仅用于即时验证单个模型；批量测试会调用 `statsService.recordApiCall` 记录每次调用。
:::

---

## 获取渠道可测试模型 {#channel-models}

```http
GET /api/test-panel/channel-models/:id
```

获取指定渠道的可测试模型列表及状态。

**路径参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 渠道 ID |

**响应示例**

```json
{
  "code": 0,
  "data": {
    "channelId": "ch_xxx",
    "channelName": "OpenAI 官方",
    "models": ["gpt-4o", "gpt-4o-mini"],
    "status": "active",
    "testedAt": 1720000000000
  },
  "message": "ok"
}
```

渠道不存在时返回 `404` 与 `ApiResponse.fail(null, '渠道不存在')`。

---

## SSE 事件流 {#sse-events}

批量测试与快速测试均使用 SSE。响应头如下：

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no
```

每一帧格式为：

```text
event: <事件名>
data: <JSON 字符串>

```

### 批量测试事件 {#batch-test-events}

按测试生命周期，事件顺序大致为：`clear`（可选）→ `start` → 循环推送 `testing` / `result` / `progress` → `complete`。

| 事件 | 触发时机 | data 字段 |
| --- | --- | --- |
| `clear` | `clearPrevious` 为 `true` 时，开始前推送 | `message` |
| `start` | 测试开始 | `testId`、`total`、`channelId`、`channelName`、`concurrency` |
| `testing` | 某模型开始测试 | `model`、`index`、`running`（当前并发数） |
| `result` | 单模型测试完成（成功或失败） | 见下方 [result 数据结构](#result-data) |
| `progress` | 每完成一个模型 | `completed`、`total`、`running`、`successCount`、`failCount` |
| `complete` | 全部完成或被中止 | `testId`、`total`、`success`、`failed`、`aborted`、`results`（按 `index` 排序的完整结果数组） |

#### result 数据结构 {#result-data}

成功：

```json
{
  "model": "gpt-4o",
  "index": 0,
  "success": true,
  "elapsed": 1234,
  "response": "你好！很高兴见到你……",
  "keyInfo": { "name": "key1", "index": 0 }
}
```

失败：

```json
{
  "model": "gpt-4o",
  "index": 1,
  "success": false,
  "elapsed": 512,
  "error": "401 Unauthorized"
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `model` | `string` | 模型名 |
| `index` | `number` | 模型在测试列表中的下标 |
| `success` | `boolean` | 是否成功 |
| `elapsed` | `number` | 耗时（毫秒） |
| `response` | `string` | 成功时的回复文本（批量测试截断至 100 字符） |
| `error` | `string` | 失败时的错误信息 |
| `keyInfo` | `object \| null` | 使用的密钥信息（多密钥渠道），含 `name`、`index` |

### 快速测试事件 {#quick-test-events}

| 事件 | 触发时机 | data 字段 |
| --- | --- | --- |
| `start` | 测试开始 | `model`、`channel`、`message` |
| `result` | 测试成功 | `success: true`、`model`、`elapsed`、`response`（完整回复文本）、`keyInfo` |
| `error` | 测试失败 | `success: false`、`model`、`elapsed`、`error` |

::: tip 客户端解析
使用 `EventSource` 或手动解析 SSE 时，注意按 `event:` 行区分事件类型，`data:` 行为 JSON 字符串。批量测试的最终完整结果在 `complete` 事件的 `results` 字段中一并给出。
:::
