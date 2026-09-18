# Troubleshooting <Badge type="warning" text="FAQ" />

This document helps you solve common issues when using ChatAI Plugin.

::: tip Quick Search
Use `Ctrl+F` to search for error keywords, or browse by category.
:::

## Installation Issues {#installation}

### better-sqlite3 Build Failed {#sqlite3-build-fail}

::: danger Error Message
`Could not locate the bindings file` or `node-gyp rebuild failed`
:::

**Solution Steps:**

**Step 1** - Run the pnpm lifecycle script (recommended)

Run in the **Yunzai root directory**:
```bash
pnpm approve-builds
```

After running the lifecycle script, delete the dependencies and lockfile and reinstall:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Step 2** - If still failing, install build tools

::: code-group
```bash [Windows]
# Install Visual Studio Build Tools
# Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/
# Select "Desktop development with C++" during installation
```

```bash [Linux (Debian/Ubuntu)]
sudo apt update
sudo apt install build-essential python3
```

```bash [Linux (CentOS/RHEL)]
sudo yum groupinstall "Development Tools"
sudo yum install python3
```

```bash [macOS]
xcode-select --install
```
:::

**Step 3** - Enter the dependency directory and build manually
```bash
# Locate the better-sqlite3 directory (the path may differ depending on the package manager)
cd node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3
# or
cd node_modules/better-sqlite3

# Run the build script
npm run build-release
# Or build directly with node-gyp
npx node-gyp rebuild
```

::: details Other Possible Solutions
```bash
# Set Python path
npm config set python /usr/bin/python3

# Global install node-gyp
npm install -g node-gyp

# Clear cache and retry
pnpm store prune
```
:::

### Node.js Version Incompatible {#node-version}

::: danger Error Message
Startup errors like `SyntaxError` or abnormal behavior
:::

**Solution:**

```bash
# Check version (requires 18.0+)
node -v

# Switch version using nvm
nvm install 18
nvm use 18

# Or use fnm
fnm install 18
fnm use 18
```

### Dependency Installation Failed {#deps-install-fail}

::: danger Error Message
`pnpm install` errors like `ENOENT`, `EPERM`, etc.
:::

**Solution:**

```bash
# Clear cache
pnpm store prune

# Delete lockfile and reinstall
rm pnpm-lock.yaml
pnpm install
```

::: warning Windows Users Note
If encountering permission issues, try running command line as Administrator
:::

## Startup Issues {#startup}

### Plugin Won't Load {#plugin-load-fail}

::: danger Error Message
No `[ChatAI]` logs in console, or `Cannot find module` error
:::

**Checklist:**

| Check Item | Description | Fix |
|:-----------|:------------|:----|
| Entry file | `index.js` must exist | Re-clone plugin |
| Dependencies | Dependencies must be complete | Run `pnpm install` |
| Console logs | Check detailed error messages | Fix based on error |

### Web Panel Inaccessible {#web-panel-fail}

::: danger Error Message
Browser can't open admin panel link, shows connection timeout or refused
:::

**Troubleshooting Steps:**

**1. Check Port Usage**

::: code-group
```bash [Linux/macOS]
netstat -tlnp | grep 3000
lsof -i :3000
```

```powershell [Windows]
netstat -ano | findstr :3000
```
:::

**2. Check Firewall**

::: code-group
```bash [Linux (ufw)]
sudo ufw allow 3000
```

```bash [Linux (firewalld)]
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --reload
```

```powershell [Windows]
# Add inbound rule in Windows Firewall
```
:::

**3. Modify Listen Address**

```yaml
# config.yaml
web:
  host: "0.0.0.0"  # Allow external access (default 127.0.0.1 is local only)
  port: 3000       # Change port if occupied
```

### Database Initialization Failed {#db-init-fail}

::: danger Error Message
`SQLITE_CANTOPEN` or `database is locked`
:::

**Solution Steps:**

```bash
# 1. Run the lifecycle script and reinstall dependencies
pnpm approve-builds
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 2. Check directory permissions (Linux/macOS)
chmod 755 plugins/chatgpt-plugin/data

# 3. Delete database files and rebuild (will lose data!)
rm plugins/chatgpt-plugin/data/*.db
```

::: warning Data Backup
Backup `data/` directory before deleting database to avoid data loss
:::

## Usage Issues {#usage}

### AI Not Responding {#no-reply}

::: danger Symptom
Bot has no response after sending messages
:::

**Troubleshooting Flowchart:**

```mermaid
flowchart TD
    A[AI Not Responding] --> B{Correct Trigger?}
    B -->|No| C[Check Trigger Config]
    B -->|Yes| D{Channel Enabled?}
    D -->|No| E[Enable Channel]
    D -->|Yes| F{API Connection OK?}
    F -->|No| G[Check API Key]
    F -->|Yes| H{Error Logs?}
    H -->|Yes| I[Fix Based on Logs]
    H -->|No| J[Check Plugin Conflicts]
```

**Checklist:**

| Check Item | Action | Description |
|:-----------|:-------|:------------|
| **Trigger Method** | Confirm correct trigger method | @trigger, prefix trigger (e.g., `#chat`) |
| **Channel Config** | Check channel status in Web panel | Click "Test Connection" to verify |
| **Debug Mode** | Send `#ai调试开启` | View detailed error info |
| **Plugin Conflicts** | Check if other plugins intercept | Adjust plugin priority |

### API Authentication Failed (401/403) {#api-auth-fail}

::: danger Error Code
`401 Unauthorized` or `403 Forbidden`
:::

| Possible Cause | Solution |
|:---------------|:---------|
| Wrong API Key | Check if Key is copied completely, no extra spaces |
| Key Expired | Check Key status in provider dashboard |
| Insufficient Balance | Recharge account balance |
| Insufficient Permission | Check Key's API access permissions |
| IP Restriction | Some providers restrict IPs, check if proxy needed |

### API Rate Limited (429) {#api-rate-limit}

::: danger Error Code
`429 Too Many Requests` or `Rate limit exceeded`
:::

**Solutions:**

| Solution | Description | Recommended |
|:---------|:------------|:-----------:|
| Multi-Channel Load Balancing | Configure multiple channels to distribute requests | ⭐⭐⭐ |
| Increase Request Interval | Set `requestInterval` in config | ⭐⭐ |
| Upgrade API Plan | Increase API quota limit | ⭐⭐⭐ |
| Use Backup Channel | Configure failover channel | ⭐⭐⭐ |

### Duplicate Messages {#duplicate-msg}

::: warning Symptom
Same message receives multiple replies
:::

| Check Item | Description |
|:-----------|:------------|
| Duplicate Adapters | Ensure not running multiple Bot adapters simultaneously |
| Message Echo | Check echo config in `config.yaml` |
| Plugin Dedup | Plugin has built-in dedup mechanism |

### Tool Call Failed {#tool-call-fail}

::: danger Symptom
AI tries to call tool but returns error or no response
:::

**Troubleshooting Steps:**

1. **Confirm Tool is Enabled**
   - Web Panel → Tool Management → Check tool status

2. **Check Permission Config**
   - Some tools require master or group admin permission

3. **View Tool Logs**
   ```txt
   #工具日志
   ```

4. **Enable Debug Mode**
   ```txt
   #ai调试开启
   ```

::: details Common Tool Errors
| Error | Cause | Solution |
|:------|:------|:---------|
| `Tool not found` | Tool not enabled or doesn't exist | Enable tool in Web panel |
| `Permission denied` | Insufficient permission | Check user permission config |
| `Timeout` | Tool execution timeout | Check network or tool logic |
:::

### `function_response.name` 400 Error {#function-response-name}

::: danger Error message
Gemini tool calls return 400 with `function_response.name: Name cannot be empty` or similar.
:::

**Cause:**

When an upstream tool result part lacks the `name` field, the old implementation forwarded an empty name (or silently dropped the part), and OpenAI-compatible endpoints rejected the request at validation time.

**Solution:**

- The plugin now resolves names via `resolveToolResultName` with multiple fallbacks and no longer drops unnamed result parts; upgrade to the latest version. OpenAI-side `tool_call_id` passthrough is normalized the same way (see next section).
- If it still happens after upgrading, inspect the relay channel's `functionResponse` structure and file a [GitHub Issue](https://github.com/XxxXTeam/chatai-plugin/issues) with full logs.

### tool_call_id 400/500 Errors {#tool-call-id}

::: danger Error message
OpenAI-compatible endpoints return 400/500 complaining that `tool_calls.id` must be a string, `tool_call_id` has an invalid type, or messages contain duplicate/numeric IDs.
:::

**Cause:**

Old data or upstream relays forwarded array indices as numeric tool-call IDs and the plugin passed them through unchanged; the request failed endpoint validation. Gemini-side calls without native IDs also lacked stable identifiers.

**Solution:**

- The adapter layer now normalizes all IDs: `normalizeAnyToolCallId` stringifies numeric IDs and falls back to `crypto.randomUUID()` for empty values; Gemini functionCall IDs (streaming included) use `generateDeterministicToolCallId`. The 6 result-fallback paths in `AbstractClient` and `ToolApprovalService` share the same normalization.
- After upgrading, numeric IDs in old history are cleaned by `validateAndCleanMessages`; if errors persist, keep full logs and file an issue.

### Thinking Text Pollutes Memories {#memory-thinking-pollution}

::: danger Symptom
Memory entries contain model reasoning such as "我们只需要输出……" or "注意要求……".
:::

**Cause:**

Memory summarization used to be the only unstructured pipeline: reasoning lines were stored verbatim as memories.

**Solution:**

- Upgrade to the latest version: the summary prompt now enforces `[category] content` structured lines, and the parser uses anchored regex plus reasoning-phrase filters.
- For already-polluted data: re-run "整理记忆" in the Web panel, or call `POST /api/memories/user/:userId/cleanup`.
- The polling summary path (memory polling when `memory.enabled` is on) has the same reasoning-line filters.

## Frontend Build Issues {#frontend-build}

### Lint Rule Errors Block the Build {#frontend-lint-block}

::: danger Error message
`bun run build` (or `next build`) fails at the lint step with `react-hooks/set-state-in-effect`, `react-hooks/immutability` or `react-hooks/refs` rule errors.
:::

**Cause:**

eslint-config-next 16.0.8 ships eslint-plugin-react-hooks 7.x rules; legacy "synchronous initialization calls inside effects" patterns trip set-state-in-effect and fail the build-time lint.

**Resolution:**

- Reproduce with `bun run lint` and confirm the exact files and rule names.
- Refactor behavior-equivalently (do not add eslint-disable or downgrade rules):
  1. Remove redundant initial-value assignments (e.g. `setLoading(false)` effect calls that match the initial state);
  2. Buffer variables and consolidate state writes using `try/finally`;
  3. Move synchronous initialization into a `setTimeout(..., 0)` callback;
  4. Wrap async initialization as `void (async () => { ... })()`.
- Verify: `bun run lint` (0 errors) → `bun run typecheck` → `bun run build` / `bun run export`.
- Note: the 7.x compiler does not treat `Promise.resolve()` microtask boundaries as exempt; only `finally`-consolidated writes, `setTimeout` callbacks and void async IIFEs reliably pass.

## Performance Issues {#performance}

### Slow Response {#slow-response}

::: warning Symptom
High AI response latency, long wait times
:::

| Optimization | Description | Effect |
|:-------------|:------------|:------:|
| Reduce Context | Lower `context.maxMessages` value | ⭐⭐⭐ |
| Use Lighter Model | e.g., `gpt-4o-mini`, `deepseek-chat` | ⭐⭐⭐ |
| Enable Streaming | Set `stream: true` | ⭐⭐ |
| Optimize Network | Configure proxy or use domestic channels | ⭐⭐⭐ |

### High Memory Usage {#high-memory}

::: warning Symptom
Node.js process memory keeps growing
:::

| Optimization | Configuration |
|:-------------|:--------------|
| Reduce context messages | `context.maxMessages: 10` |
| Regularly clear history | Use `#结束对话` command |
| Limit memory count | `memory.maxMemories: 500` |
| Disable unused features | Disable unused tool categories |

## Proxy Issues {#proxy}

### Proxy Connection Failed {#proxy-fail}

::: danger Symptom
API request timeout or connection refused
:::

**Checklist:**

| Check Item | Command/Action |
|:-----------|:---------------|
| Proxy service running | Check if proxy software is started |
| Port correct | Confirm port number (common: 7890, 1080) |
| Proxy type | http/socks5 must match |

**Test Proxy Connectivity:**

```bash
# Test HTTP proxy
curl -x http://127.0.0.1:7890 https://api.openai.com/v1/models

# Test SOCKS5 proxy
curl -x socks5://127.0.0.1:1080 https://api.openai.com/v1/models
```

### Some Requests Bypass Proxy {#proxy-bypass}

```yaml
# config.yaml
proxy:
  enabled: true
  type: http        # http or socks5
  host: 127.0.0.1
  port: 7890
  noProxy: []       # Ensure target domains not excluded
```

## MCP Issues {#mcp}

### MCP Server Connection Failed {#mcp-connect-fail}

::: danger Symptom
MCP tools unavailable, status shows offline
:::

**Troubleshooting Steps:**

1. **Check MCP Status**
   ```txt
   #mcp状态
   ```

2. **Check npm Package Installation**
   ```bash
   # Confirm MCP server package is installed
   npm list -g @anthropic/mcp-server-xxx
   ```

3. **Check Configuration File**
   ```json
   // data/mcp-servers.json
   {
     "servers": {
       "my-server": {
         "command": "npx",
         "args": ["-y", "@xxx/mcp-server"]
       }
     }
   }
   ```

### Tool Unavailable {#tool-unavailable}

| Check Item | Description |
|:-----------|:------------|
| Server Connection | Confirm MCP server status is online |
| Tool List | Check if tool is in `tools/list` response |
| Permission Config | Check preset tool whitelist/blacklist |

## Logging {#logging}

### Enable Debug Mode {#debug-mode}

```txt
#ai调试开启
```

::: tip Debug Mode Features
- Shows detailed API request/response logs
- Shows tool call details
- Shows error stack traces
:::

### View Logs {#view-logs}

::: code-group
```bash [Yunzai Logs]
# Real-time log viewing
tail -f logs/latest.log

# Search error logs
grep -i "error\|fail" logs/latest.log
```

```txt [Tool Logs]
#工具日志
```

```txt [MCP Status]
#mcp状态
```
:::

### Submit Issue {#submit-issue}

::: info When Submitting Issues, Please Include
1. **Error Screenshot** - Complete error stack trace
2. **Related Config** - Config with API Key hidden
3. **Reproduction Steps** - Detailed operation steps
4. **Environment Info** - Node.js version, OS, Yunzai version
:::

## Common Error Codes {#error-codes}

| Code | Description | Solution |
|:----:|:------------|:---------|
| `401` | Authentication Failed | Check if API Key is correct |
| `403` | Permission Denied | Check Key permission scope |
| `429` | Too Many Requests | Lower frequency or switch channels |
| `500` | Server Error | Retry later |
| `502` | Gateway Error | Check proxy or retry later |
| `503` | Service Unavailable | Wait for service recovery |
| `ECONNREFUSED` | Connection Refused | Check network and proxy config |
| `ETIMEDOUT` | Connection Timeout | Check network or increase timeout |

## Standard Troubleshooting Flow {#troubleshoot-flow}

```mermaid
flowchart TD
    A["Anomaly Detected"] --> B["Collect Information<br/>- Log Snippets<br/>- Config Screenshots<br/>- Reproduction Steps"]
    B --> C["Initial Diagnosis<br/>- Port/Network<br/>- Config Validity<br/>- Permissions & Quota"]
    C --> D{"Self-healable?"}
    D --> |Yes| E["Apply Fixes<br/>- Rebuild better-sqlite3<br/>- Fix Config/Permissions<br/>- Clean Cache/Data"]
    D --> |No| F["Deep Diagnosis<br/>- Enable Debug<br/>- Check Proxy/Auth<br/>- Analyze Stats & Telemetry"]
    E --> G["Verify Recovery"]
    F --> G
    G --> H["Record & Review<br/>- Update FAQ<br/>- Preventive Maintenance Tips"]
```

## Preventive Maintenance {#preventive-maintenance}

### Periodic Maintenance Tips {#maintenance-tips}

| Item | Frequency | Description |
|:-----|:----------|:------------|
| **Back up data** | Weekly | Back up the `data/` directory (config.yaml, databases, presets) |
| **Check logs** | Daily | Watch for errors and warnings |
| **Clean cache** | Monthly | Clean expired sessions and cached data |
| **Update plugin** | On demand | Watch for version updates and upgrade promptly |

### Metrics to Monitor {#monitoring}

::: tip Recommended Metrics
- **Real-time RPM**: requests per 1/5 minutes
- **API success rate**: ratio of successful calls
- **Token usage**: token consumption trend
- **Tool call error rate**: ratio of abnormal tool executions
- **Database size**: storage growth trend
:::

### Post-update Maintenance {#post-update}

```bash
# Run after updating the plugin
cd plugins/chatgpt-plugin
git pull
pnpm install
pnpm approve-builds  # If native modules are involved
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Get Help {#get-help}

::: tip 🆘 Get Support
:::

| Channel | Link | Use Case |
|:--------|:-----|:---------|
| **GitHub Issues** | [Submit Issue](https://github.com/XxxXTeam/chatai-plugin/issues) | Bug reports, feature requests |
| **Documentation** | [View Docs](/) | Configuration and usage questions |
