# 功能配置

本文对照 config 默认配置（`config/config.js` 的 `getDefaultConfig()`，对应提交 `5351e7d7`）编写，覆盖顶层 `tools`、`toolGroups` 与 `features` 段。

## 工具调用配置 tools

```yaml
tools:
  showCallLogs: true              # 显示工具调用日志
  useForwardMsg: true             # 工具日志使用合并转发
  parallelExecution: true         # 启用并行工具执行
  sendIntermediateReply: true     # 工具调用前发送模型的中间回复
  useToolGroups: false            # 启用工具组模式
```

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `tools.showCallLogs` | boolean | `true` | 显示工具调用日志 |
| `tools.useForwardMsg` | boolean | `true` | 工具日志使用合并转发 |
| `tools.parallelExecution` | boolean | `true` | 启用并行工具执行 |
| `tools.sendIntermediateReply` | boolean | `true` | 工具调用前发送模型的中间回复 |
| `tools.useToolGroups` | boolean | `false` | 启用工具组模式 |

::: danger 历史页面更正
本页（及 MCP 页）旧版把 `tools` 下的字段并入 `mcp` 段（如 `mcp.parallelExecution` / `mcp.timeout`）。并行执行的真实配置是顶层 `tools.parallelExecution`，MCP 超时配置位于 `mcp.timeouts`（见 [MCP 配置](./mcp)）。`config.yaml` 实例中出现的 `tools.dispatchFirst` / `tools.useWorkflowDispatch` / `tools.builtin` 是运行期/实例写入的键，不在默认配置中。
:::

## 内置工具审批 builtinTools

`builtinTools` 段（危险工具、审批模式等）已在 [MCP 配置](./mcp#内置工具配置-builtintools) 中完整收录。

## 工具组 toolGroups

默认配置内置 6 个工具组（`index` 0-5）。运行时工具组的加载来源与优先级见 [工具组配置](./tool-groups)，`toolGroups` 段是面板修改工具组时由 `saveGroups()`（`config.set('toolGroups', ...)`）写入的持久化产物：

```yaml
toolGroups:
  - index: 0
    name: system
    description: 系统工具：获取时间、日期、系统信息等
    tools: [get_time, get_date, get_system_info]
  - index: 1
    name: qq
    description: QQ操作：发消息、获取群信息、管理成员等
    tools: [send_message, get_group_info, get_member_info, kick_member, mute_member]
  - index: 2
    name: web
    description: 网络工具：搜索、获取网页内容、访问URL等
    tools: [web_search, fetch_url, read_webpage]
  - index: 3
    name: file
    description: 文件操作：读写文件、列目录等
    tools: [read_file, write_file, list_directory]
  - index: 4
    name: memory
    description: 记忆管理：保存和检索用户记忆
    tools: [save_memory, get_memory, search_memory]
  - index: 5
    name: image
    description: 图像处理：生成、编辑、分析图片
    tools: [generate_image, edit_image, analyze_image]
```

## 群聊摘要 groupSummary

自动生成群聊摘要：

```yaml
features:
  groupSummary:
    enabled: true       # 群聊总结功能
    maxMessages: 100    # 总结最近N条消息
    autoTrigger: false  # 自动触发（伪人模式下）
    maxChars: 6000      # 总结最大字符数
    push:               # 全局定时推送配置（群组未单独配置时使用）
      enabled: false          # 全局启用定时推送
      intervalType: day       # 推送间隔类型: 'hour' | 'day'
      intervalValue: 1        # 推送间隔值
      pushHour: 20            # 每日推送时间（小时，0-23）
      messageCount: 100       # 总结消息数量
      model: ''               # 总结使用的模型（留空使用默认）
      modernStyle: true       # 定时推送是否使用现代风格渲染
```

`GroupSummaryPushService` 读取的全局默认值即为上述 `push` 字段（`intervalType` / `intervalValue` / `pushHour` / `messageCount` / `model`），另有 `features.groupSummary.model` 作为模型回退来源之一。

### 使用命令

```
#ai群聊总结
#ai今日群聊
```

（命令注册见 `apps/Commands.js`：`^#(群聊总结|总结群聊|群消息总结|画像总结)(2)?$` 与 `^#(今日群聊|群聊总结2|现代总结)$`，如 `#ai今日群聊` 需前缀为 `#ai`。历史文档中的 `#ai群总结` 写法不在命令名单中。）

## 用户画像 userPortrait

```yaml
features:
  userPortrait:
    enabled: true      # 个人画像分析
    minMessages: 100   # 期望拉取的消息数量；实际超过20条有效发言即可分析
```

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | boolean | `true` | 个人画像分析开关 |
| `minMessages` | number | `100` | 期望拉取的消息数量；实际超过 20 条有效发言即可分析 |

### 使用命令

```
#ai用户画像
```

## 戳一戳 poke

```yaml
features:
  poke:
    enabled: false       # 启用戳一戳响应（默认关闭，需在面板开启）
    pokeBack: false      # 是否回戳
    message: '别戳了~'   # AI失败时的默认回复
```

## 表情回应 reaction

```yaml
features:
  reaction:
    enabled: false       # 启用表情回应处理（默认关闭，需在面板开启）
    prompt: ''           # 添加回应的提示词模板（留空使用默认）
    removePrompt: ''     # 取消回应的提示词模板（留空使用默认）
```

## 撤回消息 recall

```yaml
features:
  recall:
    enabled: false   # 启用撤回响应（默认关闭）
    aiResponse: true # 使用AI响应撤回
    prompt: ''       # 自定义提示词（留空使用默认）
```

## 欢迎消息 welcome

```yaml
features:
  welcome:
    enabled: false   # 启用入群欢迎（默认关闭）
    message: ''      # 默认欢迎语（空则使用AI生成）
    prompt: ''       # 自定义提示词（留空使用默认）
```

## 退群消息 goodbye

```yaml
features:
  goodbye:
    enabled: false    # 启用退群通知（默认关闭）
    aiResponse: false # 使用AI响应退群
    prompt: ''        # 自定义提示词（留空使用默认）
```

## 禁言响应 ban

```yaml
features:
  ban:
    enabled: false   # 启用禁言响应（默认关闭）
    aiResponse: true # 使用AI响应禁言
    prompt: ''       # 自定义提示词（留空使用默认）
```

## 管理员变动 admin

```yaml
features:
  admin:
    enabled: false   # 启用管理员变更响应（默认关闭）
    prompt: ''       # 自定义提示词（留空使用默认）
```

## 运气王 luckyKing

```yaml
features:
  luckyKing:
    enabled: false       # 启用运气王响应（默认关闭）
    congratulate: false  # 祝贺他人成为运气王
    prompt: ''           # 自定义提示词（留空使用默认）
```

## 群荣誉 honor

```yaml
features:
  honor:
    enabled: false   # 启用荣誉响应（龙王、群聊之火等）（默认关闭）
    prompt: ''       # 自定义提示词（留空使用默认）
```

## 精华消息 essence

```yaml
features:
  essence:
    enabled: false   # 启用精华消息响应（默认关闭）
    prompt: ''       # 自定义提示词（留空使用默认）
```

## AI 绘图 imageGen

```yaml
features:
  imageGen:
    enabled: true                        # 启用绘图功能
    customPrefix: ''                     # 自定义绘图触发前缀，留空使用默认命令
    model: gemini-3-pro-image            # 默认绘图模型（文生图和图生图共用）
    text2imgModel: ''                    # 文生图独立模型（留空使用默认绘图模型）
    img2imgModel: ''                     # 图生图独立模型（留空使用默认绘图模型）
    videoModel: veo-2.0-generate-001     # 视频生成模型
    timeout: 600000                      # 超时时间（毫秒）
    maxImages: 3                         # 最大图片数
    sendMode: direct                     # 绘图结果发送模式: 'direct' | 'link_qrcode' | 'hybrid'
    defaultImage: ''                     # 默认占位图，支持本地路径或 URL
    imageBaseUrl: ''                     # 图片访问基础URL（留空自动从 web.publicUrl 或本地地址获取）
    apis:                                # API列表
      - baseUrl: https://business.928100.xyz/v1/chat/completions
        apiKey: X-Free
    presetSources:                       # 预设来源配置
      - name: 云端预设
        url: https://ht.pippi.top/data.json
        enabled: true
    customPresets: []                    # 自定义预设（面板可编辑）
```

`sendMode` 三种模式说明：`direct` 直接发送图片（默认）、`link_qrcode` 发送默认占位图 + 图片链接 + 二维码、`hybrid` 发送图片 + 图片链接 + 二维码。

::: tip 实例键说明
`config.yaml` 实例中出现过 `apis[].models`、`builtinPresets`（含 `keywords` / `needImage` / `prompt` / `uid` / `splitGrid`）等扩展键，均在默认配置之外，由绘图服务或面板写入，本页不作默认字段收录。
:::

## 语音回复 voiceReply

```yaml
features:
  voiceReply:
    enabled: false       # 启用语音回复（旧配置，兼容）
    ttsProvider: system  # TTS提供者
    triggerOnTool: false # 工具调用后语音回复
    triggerAlways: false # 总是语音回复
    maxTextLength: 500   # 最大文本长度
```

::: danger 历史页面更正
本页旧版把 `features` 各事件段（poke / reaction / welcome 等）的 `enabled` 默认值写为 `true` 或与实例值一致，实际默认配置中这些段全部为 `false`（默认关闭，需在面板开启）；`groupSummary.maxMessages` 旧版写 `10000`（实例值），默认配置为 `100`；`userPortrait.minMessages` 旧版写 `1300`（实例值），默认配置为 `100`；`groupSummary` 段旧版出现 `model: ""` 顶层键，默认配置中该键为 `push.model`（另有 `features.groupSummary.model` 实例键，不在默认配置）。`emojiThief` / `autoCleanOnError` / `galgame` 段仅存在于 `config.yaml` 实例中，不在默认配置内，故不收录字段表。
:::

## 下一步

- [伪人配置](./bym) - 伪人模式配置
- [代理配置](./proxy) - 网络代理设置
- [MCP 配置](./mcp) - builtinTools 危险工具与审批