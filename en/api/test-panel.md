---
title: Test Panel API
description: Batch channel model testing and quick test endpoints with real-time SSE progress and result streaming
---

# Test Panel API <Badge type="tip" text="REST / SSE" />

The test panel endpoints test the connectivity and availability of models under a channel, supporting concurrent batch tests and single-model quick tests. Test progress and results are pushed in real time over **SSE (Server-Sent Events)**.

::: info 🧪 Purpose
Batch-verify in the WebUI test panel whether all models under a channel are usable and how fast they respond. Test results are recorded into the stats service (`StatsService`).
:::

All endpoints are mounted under the `/api/test-panel` prefix and protected by the `auth` middleware. The implementation lives in `src/services/routes/testPanelRoutes.js`; route registration is in `src/services/webServer.js`:

```js
this.router.use('/api/test-panel', auth, testPanelRoutes)
```

## Response Format Convention {#response-format}

Non-SSE endpoints return the unified `ApiResponse` structure:

```json
{ "code": 0, "data": {}, "message": "ok" }
```

- Success: `code` is `0`, data is in `data`, and `message` is `"ok"`.
- Failure: `code` is `-1` (default), and `message` describes the error.

SSE endpoints do not return the JSON envelope above; instead they continuously push `event/data` frames. See [SSE Event Flow](#sse-events).

---

## Batch Test (SSE) {#batch-test}

```http
POST /api/test-panel/batch-test
```

Runs concurrent tests over multiple models of a channel and pushes each model's test status and result in real time over SSE.

**Request Parameters (JSON Body)**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `channelId` | `string` | Yes | — | Target channel ID |
| `models` | `string[]` | No | The channel's own `models` | Model list to test; when empty, all models configured on the channel are tested |
| `concurrency` | `number` | No | `3` | Number of concurrent tests |
| `clearPrevious` | `boolean` | No | `true` | Whether to push a `clear` event before starting to wipe the previous results |

**Preflight Validation (non-SSE error responses)**

| Condition | HTTP Status | Response |
| --- | --- | --- |
| Channel does not exist | `404` | `ApiResponse.fail(null, 'Channel does not exist')` |
| No testable models | `400` | `ApiResponse.fail(null, 'No testable models')` |

After validation passes, the response switches to an SSE stream. Per-model test logic:

- Builds an `OpenAIClient` from the channel config (including custom path, request header templates, request body templates, image config, etc.).
- If the channel configures multiple keys `apiKeys`, a key is selected via `channelManager.getChannelKey` (usage is not recorded).
- Starts a conversation with the fixed content `你好` (`maxToken: 50`, `temperature: 0.7`).
- Each test result, success or failure, is recorded through `statsService.recordApiCall` with `source` set to `batch-test`.

::: tip Returned testId
The `start` event carries the `testId` of this test run, used to abort the task via [Stop Batch Test](#batch-test-stop).
:::

---

## Stop Batch Test {#batch-test-stop}

```http
POST /api/test-panel/batch-test-stop
```

Aborts running batch test tasks.

**Request Parameters (JSON Body)**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `testId` | `string` | No | ID of the test task to stop. When omitted, all active tasks are stopped |

**Response Examples**

With an existing `testId`:

```json
{ "code": 0, "data": { "stopped": true, "testId": "test_1720000000000_abc123def" }, "message": "ok" }
```

When the provided `testId` does not exist or the task has finished:

```json
{ "code": 0, "data": { "stopped": false, "message": "Test task does not exist or has finished" }, "message": "ok" }
```

Without `testId`, stopping all active tasks:

```json
{ "code": 0, "data": { "stopped": true, "count": 2 }, "message": "ok" }
```

::: warning Soft Stop
Stopping only marks the task as `aborted`. An in-flight single-model request runs to completion, but no new model tests start; the SSE stream then ends with a `complete` event (`aborted: true`).
:::

---

## Get Active Test List {#active-tests}

```http
GET /api/test-panel/active-tests
```

Returns all currently running batch test tasks.

**Response Example**

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

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Test task ID |
| `completed` | `number` | Number of completed models |
| `total` | `number` | Total number of models to test |
| `aborted` | `boolean` | Whether the task has been marked as aborted |

---

## Quick Test a Single Model (SSE) {#quick-test}

```http
POST /api/test-panel/quick-test
```

Runs a single test against one model. SSE is used so that long-running requests are not cut off by frontend or proxy timeouts.

**Request Parameters (JSON Body)**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `channelId` | `string` | Yes | — | Target channel ID |
| `model` | `string` | No | The channel's `models[0]` | Model to test; defaults to the channel's first model |
| `message` | `string` | No | `Say hello` | Test conversation content |

**Preflight Validation**

| Condition | HTTP Status | Response |
| --- | --- | --- |
| Channel does not exist | `404` | `ApiResponse.fail(null, 'Channel does not exist')` |

After validation passes, the response switches to an SSE stream pushing `start` → `result` (success) or `start` → `error` (failure) in order. Conversation parameters are `maxToken: 100`, `temperature: 0.7`.

::: info Difference from batch test
Quick tests are not recorded in the stats service and only verify a single model on the fly; batch tests call `statsService.recordApiCall` for every call.
:::

---

## Get Testable Models of a Channel {#channel-models}

```http
GET /api/test-panel/channel-models/:id
```

Gets the testable model list and status of a channel.

**Path Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | `string` | Channel ID |

**Response Example**

```json
{
  "code": 0,
  "data": {
    "channelId": "ch_xxx",
    "channelName": "OpenAI Official",
    "models": ["gpt-4o", "gpt-4o-mini"],
    "status": "active",
    "testedAt": 1720000000000
  },
  "message": "ok"
}
```

Returns `404` with `ApiResponse.fail(null, 'Channel does not exist')` when the channel does not exist.

---

## SSE Event Flow {#sse-events}

Both batch test and quick test use SSE. Response headers:

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no
```

Each frame has the format:

```text
event: <event name>
data: <JSON string>

```

### Batch Test Events {#batch-test-events}

Following the test lifecycle, events roughly arrive in this order: `clear` (optional) → `start` → repeated `testing` / `result` / `progress` → `complete`.

| Event | Trigger | data fields |
| --- | --- | --- |
| `clear` | Pushed before starting when `clearPrevious` is `true` | `message` |
| `start` | Test starts | `testId`, `total`, `channelId`, `channelName`, `concurrency` |
| `testing` | A model starts testing | `model`, `index`, `running` (current concurrency) |
| `result` | A single model test completes (success or failure) | See [result data structure](#result-data) below |
| `progress` | Each time a model completes | `completed`, `total`, `running`, `successCount`, `failCount` |
| `complete` | All done or aborted | `testId`, `total`, `success`, `failed`, `aborted`, `results` (full result array sorted by `index`) |

#### result Data Structure {#result-data}

Success:

```json
{
  "model": "gpt-4o",
  "index": 0,
  "success": true,
  "elapsed": 1234,
  "response": "Hello! Nice to meet you...",
  "keyInfo": { "name": "key1", "index": 0 }
}
```

Failure:

```json
{
  "model": "gpt-4o",
  "index": 1,
  "success": false,
  "elapsed": 512,
  "error": "401 Unauthorized"
}
```

| Field | Type | Description |
| --- | --- | --- |
| `model` | `string` | Model name |
| `index` | `number` | Index of the model in the test list |
| `success` | `boolean` | Whether the test succeeded |
| `elapsed` | `number` | Elapsed time (milliseconds) |
| `response` | `string` | Reply text on success (truncated to 100 characters in batch tests) |
| `error` | `string` | Error message on failure |
| `keyInfo` | `object \| null` | Info on the key used (multi-key channels), containing `name`, `index` |

### Quick Test Events {#quick-test-events}

| Event | Trigger | data fields |
| --- | --- | --- |
| `start` | Test starts | `model`, `channel`, `message` |
| `result` | Test succeeded | `success: true`, `model`, `elapsed`, `response` (full reply text), `keyInfo` |
| `error` | Test failed | `success: false`, `model`, `elapsed`, `error` |

::: tip Client Parsing
When using `EventSource` or parsing SSE manually, distinguish event types by the `event:` line; the `data:` line is a JSON string. The final full results of a batch test are delivered together in the `results` field of the `complete` event.
:::