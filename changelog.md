# 更新日志

本文档按主仓库真实 Git 提交历史全量导出整理（1668 次提交，2022-12-06 至 2026-09-18），仅收录**功能实现与缺陷修复**相关提交。

**排除规则**：`chore`（前端构建产物同步）、`Merge` 提交、README/文档类提交、依赖版本自动升级（`Bump`）、`Initial plan`/合成提交、CI 工作流提交、内容空泛或纯琐改的主题（如「细节优化」）等。同日完全相同的主题仅保留一条。主题文字为原始提交信息经折叠换行与转义处理（` | * # _ 等 Markdown 保留字符已替换为全角符号）；跨 fork 仓库带来的语义重复不做杜撰性改写。

> 项目仓库无任何 tag，`package.json` 的 `version` 始终为 `1.0.0`：本文档不再使用虚构版本号，按真实提交日期分年、分月记录。

## 2026-09 开发批注（本轮修复与实现）

> 以下为本轮开发中修复与实现功能的批注（含每个修复的真实根因），对应下方「2026-09 提交记录」中标注的关联提交。

### 修复（缺陷）

| 主题 | 根因与处理 |
| --- | --- |
| 协议 tool_call ID 归一化 | 旧数据与部分上游中转站把数组下标当工具调用 ID 下发（数字型 `tool_call id`），OpenAI 兼容端点校验时 400/500；新增 `generateDeterministicToolCallId`/`normalizeAnyToolCallId`，接入 openai/gemini 转换器、`OpenAIClient`、`AbstractClient` 6 处工具结果及 `ToolApprovalService` |
| Gemini `functionResponse.name` 400 | `tcr.name` 字段缺失时原样透发并静默丢弃无 name 结果 part；改多元兜底 `resolveToolResultName` 绝不负空名，functionCall id 改确定性 ID（含流式） |
| Gemini `image/gif` 500 | Gemini 端点白名单不含 image/gif（webp/png/jpeg/heif 等），历史/上游 gif 直发即 500；`AbstractClient` 新增 `getImageSendPolicy`/`transcodeImageForClient` 转码链（gemini 白名单外图片 sharp 转 **image/webp**、失败回退静态 JPEG、再失败降级文本占位），GeminiClient 流式/非流式预处理传 `'gemini'`，converter 加 `GEMINI_IMAGE_MIME_WHITELIST` 兜底 |
| at 触发失效 | icqq/TRSS 与 QQBot 官方 at 段结构不同、botId 匹配不全；补齐 `e.atBot`+at 段 `qq`/`data.qq`/`data.user_id`、`e.atme`、`data.all`（@全体），botId 兜底链 `e.self_id → e.bot.uin → e.bot.self_id → globalThis.Bot.uin`；修复「纯 @ 无文本」与 `replyBot` 真值表吞消息 |
| 渠道禁用后模型仍可见 | 后端 `groupAdminRoutes.js` 聚合未过滤 `enabled === false`；后端过滤 + 前端 `useConfig`/群编辑器/group-admin/用户页/imagegen 全部聚合点同步过滤 |
| 前端"整理记忆"始终 no-op | 总结门槛过高恒被跳过、`hard === 'true'` 恒 false；门槛降为桶内 >2 且分类累计 ≥5、补 `POST /api/memory/user/:userId/cleanup` 清理端点、修复 hard 参数、保底"逐条相同才不替换" |
| 前端 drop-down 溢出选不到 | `SelectContent`/`Viewport` 高度与 `collisionPadding` 缺失；全局 `min(可用高度, 320px)`+`collisionPadding={8}`、记忆页 260px、ModelSelector/ModelMappingEditor 等全部溢出点处理 |
| chatdebug 输出完整 JSON | 二次包装与字段错误；改 `StandardBotApi.sendForward({nodes})` 直通、`di.channel.channelId → di.channel.id`、`undefinedms` 缺省文案 |
| 错误抛出重组（先重试、不刷屏、默认只入日志） | 适配器内联回执在重试循环内每次失败都回复用户（最多 4 条/次错误）且假报"已结清"；删除该块，错误经 ChatService 重试链（指数退避/换 Key/换渠道）耗尽上抛；未启用 `errorNotify` 时 `chat.js` 只写日志；自动结清保持 ChatService/ChatAgent 真实删除后按 `notifyUser` 提示 |
| `server` 类错误不参与退避重试 | ChatService 分类缺 server 类型；补 server（5xx）进退避/换 Key/换渠道白名单、client（4xx 类）不切换重试 |
| 错误通知语义 | `ErrorNotifier.notify` 返回"是否发送成功"，目标发送失败时错误又回执到触发者；改为"是否已处理"，启用即静默（错误只走通知/日志），未启用才走用户友好文案日志 |

### 实现（功能）

| 主题 | 说明 |
| --- | --- |
| LlmDelegate 旁路统一委托 | 记忆/知识图谱/上下文总结等旁路 LLM 调用统一遵循渠道 `advanced.streaming`、错误分类上报、渠道切换与指数退避重试；接入 MemoryManager/KnowledgeGraphExtractor/llmHelper/ContextManager/ConversationTracker/GalgameService |
| 知识图谱工具集 | `src/mcp/tools/knowledgeGraph.js` 12 个 `kg_*` 工具（get_knowledge/list_entities/search_entities/save_entity/update_entity/delete_entity/entity_history/entity_relations/save_relation/delete_relation/query_subgraph/stats），默认启用；`preserveTargetId` 归一化各协议 user/group 标识（QQBot 适配） |
| 模型主动记忆 | `ChatAgent._addToolPrompt` 注入 `KNOWLEDGE_GRAPH_TOOL_GUIDE`/记忆维护指南，模型发现新记忆可主动调 `kg_save_entity`/`save_user_memory`；对话过程 `_triggerMemoryExtraction` 附最近 10 条历史 |
| 记忆总结结构化 | `SUMMARY_PROMPT` 改为 `[分类] 内容` 硬约束（profile/preference/event/relation/topic/custom），解析器双通道（分类行白名单直接采信 + 自由文本三关过滤），修复思考过程文本整行入库 |
| 自动轮询补全记忆 | 增量游标落 `kv_store`（重启不丢）；结束对话先结算记忆再清历史（Commands/Management 双路径） |
| 工具调用限制重定义 | 仅"连续完全一致（工具名+参数逐一相同）4 次"才 `toolChoice:none` 拦截；参数不同不算重复、不拦截不告警；取消一切轮次/总次数上限 |
| 工具调用中间句 | 纯工具轮次经 `onMessageWithToolCall` 回传轻量提示（`正在调用……`），中间文本不再丢弃 |
| 渲染 Canvas 化 | Puppeteer → `canvasRenderer.js`（`@napi-rs/canvas` + `mathjax-full`），`renderMarkdownToCanvas` 及 7 个渲染方法 Canvas 化，删除 puppeteer/marked 链路与 katex 直接依赖 |
| 渠道流式默认开启 | `ChannelManager.normalizeAdvanced` streaming `enabled: src.streaming?.enabled !== false`，前端 3 处默认值改 true |
| debug 补全与嵌套合并转发 | `sendDebugInfo` 补 9 个子模块统一截断；`StandardMessage.nestedForward` 嵌套合并转发单段分片 |
| 安全加固 | BuiltinMcpServer 文件/网络工具接入 `getSafePath`/`assertSafeUrl`；PresetManager 模板 `${expression}` 改点分路径安全取值；ImageService/urlToBase64 预检 |
| 富媒体探测字节方案 | `probeImageHeader` 用 `Range` 读前 4KB + 魔数检测替代 HEAD 预检；QQ 图床域名统一补齐 |
| 上下文与人设 | 群聊共享上下文 userId 归一化；acquireLock token 化 Deferred 队列；人设优先级统一 `['group','group_user','user','default']`；独立人设隔离上下文 `isolateContext` |
| 记忆系统激活 | `structured_memories` 增加 `last_access_at`/`access_count`；`buildMemoryContext` query 相关性排序；`decayConfidence` 按访问时间衰减 |
| 错误自动结清 | `autoCleanOnError`：ChatService/ChatAgent 重试耗尽后真实删除会话（新旧双 ID）并按 `notifyUser` 提示「历史对话已自动清理」 |

---
## 2022 年

### 2022-12（27 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2022-12-20 | `66cc4641` | fix: update config description |
| 2022-12-20 | `e2baa4df` | fix: 修复了另一个可能导致not sign in得问题 |
| 2022-12-19 | `872a1910` | fix: remove chatgpt lib |
| 2022-12-19 | `e5e26bc4` | fix: 会话连续问题 |
| 2022-12-19 | `89dd029d` | fix: not signed问题 |
| 2022-12-17 | `4df0addf` | fix: use only one browser instance with debbugger url endpoint |
| 2022-12-17 | `d0dcc507` | feat: 暂时不使用chatgpt-api库，拷贝了部分其代码进行修改 |
| 2022-12-16 | `b8bd3dfe` | fix: incorrect redis set |
| 2022-12-16 | `33c87054` | fix: use full browser mode |
| 2022-12-13 | `bc095251` | feat: add auth support by puppeteer. |
| 2022-12-11 | `f88eb792` | fix: add end token |
| 2022-12-11 | `e5f0ada3` | fix: recall; change style |
| 2022-12-11 | `85b0d68e` | fix: wrong command text |
| 2022-12-10 | `94c35fa2` | fix: end text |
| 2022-12-10 | `70044eb6` | feat: add picture mode |
| 2022-12-09 | `6f0e62b5` | fix: error when msg is empty |
| 2022-12-09 | `5989d81f` | fix: missing return when auth failed |
| 2022-12-09 | `d17aa2a7` | fix: add auth failed response |
| 2022-12-09 | `505d5e30` | 捕获OpenAI认证阶段异常 |
| 2022-12-09 | `ddf27144` | Update index＿no#.js |
| 2022-12-08 | `d35b07d3` | fix: destroy conversation response |
| 2022-12-08 | `07203e4d` | fix: list format |
| 2022-12-08 | `da93bddc` | fix: add picture of at mode |
| 2022-12-08 | `41fd60f5` | feat: ai mode |
| 2022-12-08 | `e472525b` | 回复内容增加屏蔽词检索，防止回复敏感内容 |
| 2022-12-07 | `31af39f2` | feat: 尝试支持连续对话 |
| 2022-12-07 | `d4a0cfc8` | fix: 命令正则；更改为回复消息 |

## 2023 年

### 2023-01（6 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2023-01-26 | `78a524bc` | fix: add 120s timeout for answering |
| 2023-01-26 | `02ab29b4` | feat: 问题的队列，修复后来的问题会阻断前面问题的问题 |
| 2023-01-16 | `241cc6c2` | Update index.js |
| 2023-01-10 | `5e287226` | feat: conversation preserve duration |
| 2023-01-10 | `fc715e30` | fix: JSON parse error (maybe) |
| 2023-01-04 | `2aa27495` | fix: 调低优先级缓解抢指令问题 |

### 2023-02（121 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2023-02-28 | `7b58f205` | 独立render功能，图片模式添加引用回复 (#204) |
| 2023-02-26 | `eb25ba1b` | feat: support DALLE2 image edit |
| 2023-02-25 | `a46c6950` | feat: 搞群员头像 |
| 2023-02-25 | `aff43600` | feat: version |
| 2023-02-25 | `ba027dc7` | 修复一些bug，图片识别支持多个图片 (#194) |
| 2023-02-25 | `b5dd5996` | fix: limit number of picture |
| 2023-02-25 | `ef01c37c` | fix: integer problem |
| 2023-02-25 | `4bee340d` | fix: import problem |
| 2023-02-25 | `07cd6115` | feat: add sharp mirror |
| 2023-02-25 | `94c65536` | fix: let sharp be optional |
| 2023-02-25 | `5fceef37` | feat: support dalle image variation |
| 2023-02-25 | `38de2ce7` | fix: error message |
| 2023-02-25 | `3073ca91` | fix: dalle cooldown time |
| 2023-02-25 | `8c9c098e` | feat: support dalle api |
| 2023-02-24 | `47976f23` | fix: blockwords problem |
| 2023-02-24 | `b5887e69` | fix: no quotes in picture mode |
| 2023-02-24 | `1247aef5` | 添加图片识别功能 (#191) |
| 2023-02-23 | `7192a8c6` | 优化图片模式发送功能，增加对话队列超时检测 (#188) |
| 2023-02-23 | `38f726d9` | 更新 config.js |
| 2023-02-22 | `a6810373` | 添加锅巴面板配置支持 (#184) |
| 2023-02-22 | `53ff4b65` | fix: remove mathjax |
| 2023-02-22 | `6f90c501` | fix: bugs caused by duplicate variables |
| 2023-02-22 | `79fc3d94` | fix: ignore qrcode if there is failure to upload to cache server |
| 2023-02-22 | `f235552e` | feat: add prompt block words |
| 2023-02-22 | `0365a3a0` | fix: 取消图片模式的循环Continue |
| 2023-02-22 | `a2c4d516` | fix: fix null conversation problems |
| 2023-02-20 | `ae161ed4` | 使用base64代替escapeHtml就传入数据 (#178) |
| 2023-02-20 | `59d5e904` | 修复bug (#175) |
| 2023-02-20 | `d32d1e10` | Delete node＿modules directory |
| 2023-02-20 | `079336fb` | fix: gitignore |
| 2023-02-20 | `5effeed8` | fix: libraries and readme |
| 2023-02-20 | `16166924` | fix: add git log |
| 2023-02-20 | `d013013b` | fix: add code source |
| 2023-02-20 | `b4c10d5c` | fix: restart error |
| 2023-02-20 | `a50a5b52` | fix: update error |
| 2023-02-20 | `18bae72c` | fix: update command / |
| 2023-02-20 | `5399d57e` | feat: update beta |
| 2023-02-20 | `049e71b7` | 修复一些图片模式页面错误，添加图片页面服务器自定义配置，修改配置文件加载方法 (#172) |
| 2023-02-19 | `6b9afe58` | Update chat.js |
| 2023-02-19 | `1612898a` | fix: use default heiti font |
| 2023-02-19 | `d8b415f5` | fix: add api3 debug text output |
| 2023-02-19 | `e9bd95de` | fix: revert api |
| 2023-02-19 | `6da40e38` | fix: vulnerability problems |
| 2023-02-19 | `b5afe1f4` | Committing changes to index.html |
| 2023-02-19 | `c07503db` | 防止注入攻击 (#170) |
| 2023-02-19 | `624e1f6e` | 添加OpenAI API额度的到期日期，格式化小数点 (#168) |
| 2023-02-19 | `a4f12eaf` | 为图片添加外部页面保存 (#167) |
| 2023-02-18 | `de4a6c8f` | fix: picture mode api3 compatible problem |
| 2023-02-18 | `2804aea5` | fix: no use picture bug |
| 2023-02-18 | `4bf12ccb` | fix: enable confirm by default |
| 2023-02-18 | `da856956` | fix: remove qq group qrcode because of harassing |
| 2023-02-18 | `a0ac404e` | feat: help for delete |
| 2023-02-18 | `c9838825` | fix: delete log bug |
| 2023-02-18 | `05494ad8` | fix: delete in group only at mode |
| 2023-02-18 | `4cdaa70c` | feat: delete conversation beta |
| 2023-02-18 | `d61e1ed7` | fix: 优化文本 |
| 2023-02-18 | `4b54a79f` | feat: join conversation |
| 2023-02-18 | `f24911a0` | fix: change Bing style of picture |
| 2023-02-18 | `9527a9da` | fix: destroy conversation |
| 2023-02-18 | `1e89fe6a` | fix: remove debug code |
| 2023-02-18 | `d8265ba1` | fix: remove useless code |
| 2023-02-18 | `a3b14b1a` | Conversation communication (#165) |
| 2023-02-17 | `a1e72c77` | fix: destroy await/async |
| 2023-02-17 | `4d53f378` | 更改必应和chatgpt的图片模式web模板，临时处理切换模式后会话失效问题 (#163) |
| 2023-02-17 | `37f75a64` | OpenAI Plus剩余额度查询 (#161) |
| 2023-02-16 | `0483f17e` | fix: use the latest new reverse proxy |
| 2023-02-16 | `22d85b5d` | feat: support node-fetch in API mode |
| 2023-02-16 | `db3c7ef5` | Update LowerNode.md |
| 2023-02-16 | `b30c3e37` | unset PROXY default ＆ ReBuild README (#158) |
| 2023-02-16 | `6f60cd0e` | 添加获取必应Token及必应Token轻校验 (#157) |
| 2023-02-16 | `2ca69ed7` | 使用chatgpt-api自带的超时机制，回复文字过多时使用图片发送 (#154) |
| 2023-02-16 | `0f7122f8` | feat: support the complete bing cookie which contains ＿U |
| 2023-02-16 | `53f9edd2` | 一些帮助文本 (#155) |
| 2023-02-15 | `1296eccb` | 修复引用，为必应开启并发 (#151) |
| 2023-02-15 | `5237975f` | fix: ptimeout problem |
| 2023-02-15 | `faf3612c` | fix: ptimout not defined |
| 2023-02-15 | `236ec07f` | fix: add bing timeout |
| 2023-02-15 | `7719b273` | fix: add default timeout |
| 2023-02-15 | `54cdded6` | fix: API mode invalid session token error |
| 2023-02-15 | `ca83acb3` | fix: change default timeout |
| 2023-02-15 | `23b16a7f` | fix: bing timeout error |
| 2023-02-15 | `bd934fd9` | fix: API3 conversation bug |
| 2023-02-15 | `b342e47e` | fix: some help message |
| 2023-02-14 | `040b4e89` | fix: remove proxy |
| 2023-02-14 | `b5e8ad10` | fix: change error msg |
| 2023-02-14 | `133eb0e8` | fix: JSON parse error |
| 2023-02-14 | `4330e61d` | fix: add 429 error |
| 2023-02-14 | `62c8d56e` | Api3 (#149) |
| 2023-02-14 | `ab021d0c` | fix: api -＞ reverseProxyUrl |
| 2023-02-14 | `548642da` | fix: null option |
| 2023-02-14 | `87cc56e2` | feat: add other api base url for API |
| 2023-02-14 | `95d14fa4` | fix: bind token |
| 2023-02-14 | `d69b46f1` | fix: 500 error |
| 2023-02-14 | `d58c5e06` | fix: plus user use the new model, too. |
| 2023-02-14 | `d247ddbf` | fix: change model for browser according to chatgpt |
| 2023-02-14 | `11f35af8` | feat: add support for configurable reverse proxy url |
| 2023-02-14 | `58e1d004` | fix: hint for no bing cookie |
| 2023-02-14 | `ec45eb11` | fix: deconstruction null bug |
| 2023-02-14 | `3ff591d2` | feat: add support for bing(beta and WIP) |
| 2023-02-14 | `1e918a57` | fix: change retry times for API2 from 5 to 1 |
| 2023-02-13 | `972c0834` | fix: add plus support for browser based solution |
| 2023-02-12 | `12290ad8` | fix: add more hint |
| 2023-02-12 | `9aa0a314` | fix: conversationId field error |
| 2023-02-12 | `ab20b051` | fix: add hint for swicth mode |
| 2023-02-12 | `a8ec5f41` | feat: add support for the third party reverse proxy mode |
| 2023-02-12 | `659d88fb` | Update issue templates |
| 2023-02-12 | `36aaa125` | fix: incorrect help text under prefix toggle mode |
| 2023-02-12 | `2657dead` | fix: add loop to ensure login |
| 2023-02-11 | `053a43fc` | fix: wrong args in chrome |
| 2023-02-11 | `6fdcbf12` | feat: support browser-based solution. update readme |
| 2023-02-11 | `e59ed0c0` | fix: switch back to gpt-3 |
| 2023-02-11 | `4a81d68c` | fix: Update latest ChatGPT model |
| 2023-02-10 | `b0738c6d` | fix: 加入重试机制 |
| 2023-02-08 | `233fc741` | feat: 提供了更多的可选配置项，包括确认开关、暗示指令覆盖、触发方式、模型名称和屏蔽词等 |
| 2023-02-03 | `b88d450a` | feat: simple queue management |
| 2023-02-03 | `e6738e55` | fix: redis expire time; picture mode title; queue lock problem |
| 2023-02-02 | `317b89e9` | fix: remove console log |
| 2023-02-02 | `8ff0983a` | fix: delete old codes |
| 2023-02-02 | `8dacaa4a` | fix: switch off debug mode |
| 2023-02-02 | `bdafec9a` | Use chatgpt-api (#106) |
| 2023-02-02 | `f9e432fc` | feat: use the latest api from chatgpt-api (#105) |

### 2023-03（213 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2023-03-31 | `e93614ca` | 修复多Token功能问题 (#303) |
| 2023-03-31 | `5b626678` | feat: 改用SydneyClient更准确地检测token |
| 2023-03-31 | `df4ecc84` | fix: emoji regex fix |
| 2023-03-31 | `b770aa90` | fix: 修复emoji正则 |
| 2023-03-31 | `8fb26158` | 添加多必应token均衡支持 (#299) |
| 2023-03-31 | `7d89849c` | fix: e not defined error |
| 2023-03-30 | `12dc262d` | fix: 修复bing出错会导致对话丢失的问题（大概） |
| 2023-03-30 | `f71f1d7e` | fix: qq号格式问题 |
| 2023-03-30 | `9c3d1bc5` | feat: 尝试把20条后溢出的对话自动塞到扩展后面 |
| 2023-03-30 | `11735ead` | fix: 设定管理增加机器人qq的fallback |
| 2023-03-30 | `1f58ac54` | fix: remove test |
| 2023-03-30 | `f368f4f0` | fix: 优化qq表情适配 |
| 2023-03-30 | `a4d8488a` | feat: API3支持event stream |
| 2023-03-30 | `f21c3bee` | 一些功能补正和增强 (#217) |
| 2023-03-30 | `cc785261` | fix: 聊天记录用户头像和昵称 |
| 2023-03-29 | `407a2e1d` | fix: 查看他人聊天记录的bug |
| 2023-03-29 | `d3fdaaa4` | fix: 空聊天记录的bug |
| 2023-03-29 | `fbfd105e` | feat: 聊天记录 |
| 2023-03-29 | `0755b544` | fix: 尝试修复错误直接对话没了的问题（不知道好使不） |
| 2023-03-29 | `3121b0e4` | fix: 增加配置项enforceMaster |
| 2023-03-29 | `15a582ab` | fix: 修复私聊qq undefiend的问题 |
| 2023-03-29 | `1c1c2562` | fix: 支持了微软稀有的消息拆分cursor |
| 2023-03-29 | `3bdfb15b` | fix: 未知原因的错误 |
| 2023-03-29 | `58c2b242` | fix: 主人辨别beta |
| 2023-03-29 | `20469346` | feat: 浏览设定增加翻页提示 |
| 2023-03-29 | `b1105311` | fix: 修复pickMember问题 |
| 2023-03-29 | `54f68132` | fix: 优化一些稳定性 |
| 2023-03-29 | `1563e49a` | fix: at模式下多接受了一个at信息的问题 |
| 2023-03-29 | `fadf9f6a` | fix: 对昨晚更新后遗症的修修补补；预览在线设定 |
| 2023-03-29 | `1d43de9c` | fix: 删掉关于洗脑的东西，因为不需要了 |
| 2023-03-29 | `192beb27` | fix: sydney和自定义的无限续杯 |
| 2023-03-28 | `4b93b5ed` | fix: 修复一个锅巴的笔误 |
| 2023-03-28 | `6da671e5` | fix: 悉尼同样的抢救方式 |
| 2023-03-28 | `6de86db6` | fix: 后续对话有时不传入内容的问题 |
| 2023-03-28 | `ef6605db` | fix: 补丁 |
| 2023-03-28 | `f4aaf5b0` | fix: 大改bing patch策略beta |
| 2023-03-28 | `b68cb411` | fix: 再次更换bing破解方式 |
| 2023-03-28 | `533dceb8` | fix: 尝试了其他的bing破解方式 |
| 2023-03-28 | `d36b7c83` | docs: 增加吹水群 |
| 2023-03-28 | `02d7aa03` | fix: 锅巴面板增加两个配置项 |
| 2023-03-28 | `cc2c5612` | feat: qq表情和真的群聊at |
| 2023-03-28 | `cae324f2` | fix: 使用更清晰的报错信息 |
| 2023-03-28 | `b4f37b53` | fix: 删除上传的设定；一些设定共享的优化改进 |
| 2023-03-27 | `05f142d3` | fix: 修正聊天的时间戳 |
| 2023-03-26 | `847a623c` | fix: 试图拿到更完整的群聊信息 |
| 2023-03-26 | `1c79ff00` | feat: 改用调接口拿聊天记录，不用自己记录了 |
| 2023-03-26 | `3885527a` | fix: 单独提出监听对话以便赋予较高优先级 |
| 2023-03-26 | `ad62b53a` | fix: 自定义再系统消息中让他看聊天记录 |
| 2023-03-26 | `f1479f0e` | fix: 试图拯救浏览器模式，不行就弃了 |
| 2023-03-26 | `7d571df1` | feat: add robot msg |
| 2023-03-26 | `00afb75b` | 隐藏日志，修改 segment 导入 (#287) |
| 2023-03-26 | `6653188a` | feat: 群聊上下文记录功能beta |
| 2023-03-26 | `d8999c77` | fix: 修改上传设定锁的时间 |
| 2023-03-26 | `90a1f6a0` | fix: 浏览设定页码 |
| 2023-03-26 | `bfc55df6` | fix: 尝试支持设定分享和导入 (#286) |
| 2023-03-25 | `c2d507ea` | fix: 忽略一样的表情包 |
| 2023-03-25 | `028a7c2c` | fix: emoji缓存 |
| 2023-03-25 | `f4a740a6` | feat: emoji合成 |
| 2023-03-25 | `5c3ca4e9` | Create LICENSE (#284) |
| 2023-03-25 | `3c62f2f5` | Delete LICENSE |
| 2023-03-25 | `73689f46` | 增加语音合成失败处理。 (#278) |
| 2023-03-24 | `1432723d` | fix: 修复很容易超token的bug |
| 2023-03-24 | `1a5d4629` | fix: 尝试去掉某些参数 |
| 2023-03-24 | `4626577a` | fix: 优化报错内容 |
| 2023-03-24 | `fb7cd699` | fix: 回退sydney的更新 |
| 2023-03-24 | `66521578` | feat: 支持必应的context |
| 2023-03-24 | `e39391c1` | fix: adjustment for sydney |
| 2023-03-24 | `afd0650d` | fix: add retry for empty response |
| 2023-03-24 | `cc1f5611` | fix: country code judgement problem |
| 2023-03-23 | `c1ca4f2f` | fix: api3对话不存在增加提示 |
| 2023-03-23 | `6b02bedd` | fix: 语音阈值无效的问题 |
| 2023-03-23 | `a21e2d9e` | fix: 修复原版bing结束对话无效的问题 |
| 2023-03-23 | `3c5604b2` | fix: 修改api3出错的信息显示形式 |
| 2023-03-21 | `117293cc` | fix: bing自定义无法结束对话的bug |
| 2023-03-21 | `c560a440` | fix: 修复aplogy打乱顺序丢失对话的问题 |
| 2023-03-21 | `8555d8eb` | feat: 首句aplogy时不加入到聊天记录 |
| 2023-03-20 | `a110fb20` | fix: 语音太长提示不回复 |
| 2023-03-20 | `ad853d45` | fix: 模式混乱的问题 |
| 2023-03-20 | `ef54cad1` | fix: add a todo |
| 2023-03-20 | `f4a94f61` | fix: 不允许其他设置未生效的问题 |
| 2023-03-20 | `c53b86c1` | feat: 各模式分开的指令 |
| 2023-03-20 | `c72df75d` | fix: chatglm 结束对话bug |
| 2023-03-20 | `85c82fa0` | fix: 错别字 |
| 2023-03-20 | `8e1f1ba1` | fix: temerature cannot larger than 1 |
| 2023-03-20 | `cd1a4a3e` | fix: guoba |
| 2023-03-20 | `94d5691e` | feat: add support for chatglm |
| 2023-03-18 | `9929d55b` | fix: 切换设定 |
| 2023-03-18 | `5879e52a` | fix: 文本错误 |
| 2023-03-18 | `1705d129` | feat: add help |
| 2023-03-18 | `1b4bc496` | fix: Custom模式无效的问题；一些管理指令 |
| 2023-03-18 | `d4f8b431` | feat: 分离sydney与自设定模式 |
| 2023-03-18 | `fb6c1ac3` | fix: 自适应洗脑强度，建议回复 |
| 2023-03-18 | `3d466f0f` | feat: 建议回复 |
| 2023-03-18 | `dfd1ce46` | fix: fix bugs |
| 2023-03-18 | `c5976439` | fix: toLowerCase 报错 |
| 2023-03-18 | `ae725b66` | fix: sydney quote when Aplogy met |
| 2023-03-17 | `ca6873de` | fix: sydney type 2时抱歉不反悔 |
| 2023-03-17 | `563d88df` | feat: sydney的强制洗脑功能，以应对今天微软的加强审计 |
| 2023-03-17 | `bdd896a1` | fix: API3 error |
| 2023-03-16 | `01892b6e` | fix: 冲突的openai baseurl v1 |
| 2023-03-16 | `b35a609b` | fix: 适应包的修改避免API模式404 |
| 2023-03-16 | `ae166356` | bug (#255) |
| 2023-03-15 | `b212fcf8` | feat: 语音支持中日结合 |
| 2023-03-15 | `13c4fae6` | feat: API3支持plus用户的GPT-4 |
| 2023-03-14 | `83c789ba` | fix: 修复过长设定发不出来的。后续用图片 |
| 2023-03-14 | `c781df07` | fix: permission |
| 2023-03-14 | `a2e984ee` | fix: gitkeep empty dir |
| 2023-03-14 | `c7a53a49` | feat: 多设定管理与切换功能 |
| 2023-03-14 | `2d899db5` | fix: 修改ReadMe |
| 2023-03-14 | `3f08cf48` | fix: 加了一系列管理功能 |
| 2023-03-13 | `8ea7ab07` | fix: add retry for 403 |
| 2023-03-12 | `6c35ee85` | fix: 清空队列正则不正确 |
| 2023-03-12 | `debe3e69` | Update 问题反馈.md |
| 2023-03-11 | `4ae57ee0` | fix: openAiBaseUrl为空的情况 |
| 2023-03-11 | `36cdd701` | fix: 画图报错undefined的解决方案 |
| 2023-03-11 | `f0c43ca3` | fix: 支持huggingface的反代 |
| 2023-03-11 | `a277228a` | fix: 画图报错 |
| 2023-03-11 | `08fe3314` | feat: API3的报错优化 |
| 2023-03-11 | `89d3bb52` | fix: 适配官网conversation API变动 |
| 2023-03-10 | `85809385` | fix: 修复sydney 502错误未被catch到的问题 |
| 2023-03-09 | `3b50d28f` | fix: move to self-hosted chatgpt proxy |
| 2023-03-08 | `3c60bc1e` | fix: 修复Sydney模式完全不回复的问题 |
| 2023-03-08 | `45f7034b` | fix: sydney 超时的bug |
| 2023-03-08 | `51abbeab` | fix: 修复sydney moderation filter |
| 2023-03-08 | `8dade22e` | fix: 修复超时replySoFar未传值的问题 |
| 2023-03-08 | `f8385a8e` | fix: 修复部分情况仍然返回风控的问题 |
| 2023-03-08 | `211ccba0` | feat: 遇到风控直接返回 |
| 2023-03-08 | `9377d66b` | fix: 适配openai新版dalle api |
| 2023-03-08 | `e5a0463c` | fix: 画图报错具体 |
| 2023-03-08 | `4c8f1d4f` | fix: ip归属地不正确的问题 |
| 2023-03-08 | `3e8789a3` | fix: 修改帮助样式 |
| 2023-03-08 | `fa1b1877` | feat: 增加API key和设定的配置功能 |
| 2023-03-08 | `d1a8f667` | fix: 增大Bing首条消息等待时间。有时候Bing响应太慢了 |
| 2023-03-07 | `56466462` | fix: 再次优化Bing的错误信息for氷と火の歌 |
| 2023-03-07 | `4f663c39` | fix: add console error log |
| 2023-03-07 | `f0903eee` | feat: 尝试加入重试机制降低Sydney不响应的概率 |
| 2023-03-07 | `af6bd77f` | fix: 增加Bing通信出错错误信息（maybe） |
| 2023-03-07 | `f5faa03d` | feat: 增加sydney创建ws的重试机制，降低失败频率 |
| 2023-03-07 | `88a97b6c` | fix: 增加创建对话的错误提示 |
| 2023-03-07 | `da04370f` | fix: 修复未知原因ws超时部分信息仍然没有拿到的问题 |
| 2023-03-07 | `7910110a` | fix: 增加chat优先级避免被土块抢指令 |
| 2023-03-07 | `355817e2` | fix: bing模式也走sydney代理 |
| 2023-03-07 | `eb15c51d` | fix: try to make sydney more customizable |
| 2023-03-07 | `628f57a8` | fix: fallback to official api |
| 2023-03-07 | `2a7464ad` | fix: 修改默认baseurl |
| 2023-03-07 | `ec74999d` | fix: 整理默认ChatGPTAPI变量 |
| 2023-03-07 | `5c650041` | fix: default chatgpt api3 |
| 2023-03-07 | `3ee5a2f3` | fix: 整理了代理与反代之间的关系 |
| 2023-03-07 | `ad9516d3` | fix: 优化文本提示 |
| 2023-03-07 | `616eb97d` | fix: sydney有代理时忽略反代 |
| 2023-03-07 | `4b66fd08` | fix: update default config |
| 2023-03-07 | `891750cf` | fix: 语音发完再发文字 |
| 2023-03-07 | `58adb3d2` | feat: 语音模式下同时发送文字(默认关闭);锅巴中选择语音人物 |
| 2023-03-07 | `de5707de` | fix: 超时时，如果已经有部分回复则返回这部分回复 |
| 2023-03-06 | `b332170a` | fix: 结束闭嘴的bug |
| 2023-03-06 | `d4470507` | fix: 闭嘴时间过长的bug |
| 2023-03-06 | `156a669e` | fix: 闭嘴功能 |
| 2023-03-06 | `1368c168` | fix: 打招呼增加cd |
| 2023-03-05 | `8ed19c7f` | fix: 超限结束对话的错误提示优化 |
| 2023-03-05 | `970e8996` | fix: add warn log for context＿length＿exceeded error |
| 2023-03-05 | `354183a0` | fix: 打招呼的权限问题 |
| 2023-03-05 | `a6a73a08` | fix: 定时任务的错误 |
| 2023-03-05 | `65d06797` | fix: task格式错误 |
| 2023-03-05 | `c11732be` | feat: api模式下，字数超限自动重置对话 |
| 2023-03-05 | `db649632` | fix: 修改cron |
| 2023-03-05 | `4e988829` | fix: 去除OCR语言限制 |
| 2023-03-05 | `55c5112d` | fix: 随机打招呼使用默认tts角色 |
| 2023-03-05 | `2c5d573e` | fix: 优化日志 |
| 2023-03-05 | `62b64ed9` | fix: 帮助 |
| 2023-03-05 | `84843800` | fix: add log |
| 2023-03-05 | `7a320bc7` | feat: 主动聊天功能 |
| 2023-03-05 | `5cbd2cad` | fix: 优化tts对配置的处理 |
| 2023-03-05 | `d3cea768` | fix: 修复tts报错body alreay used问题 |
| 2023-03-05 | `75a060b8` | fix: 优化一些命令匹配 |
| 2023-03-05 | `312af3cf` | fix: 优化vits报错 |
| 2023-03-05 | `ddce080a` | fix: 只有主人才能结束全部对话 |
| 2023-03-05 | `1619927b` | fix: 减少系统消息发送频率，避免太快到达4096token限制 |
| 2023-03-05 | `c9361c63` | fix: 设置不存在的角色语音时给提示 |
| 2023-03-04 | `a54f8766` | feat: 增加可选依赖 |
| 2023-03-04 | `5680d372` | fix: 清理依赖 |
| 2023-03-04 | `19fca0e1` | feat: 语音模式下，自动转文字的阈值可以调整 |
| 2023-03-04 | `5ddeebfc` | feat: 正式增加语音模式支持 |
| 2023-03-04 | `41ca23dc` | feat: 支持调节vits的一些参数 |
| 2023-03-04 | `59bec4e2` | fix: 优化回复文本 |
| 2023-03-04 | `ac5b7185` | fix: 文字过长无法转换 |
| 2023-03-04 | `6ed7588f` | feat: 支持转语音 |
| 2023-03-04 | `5fc5d2e5` | fix: remove console.log |
| 2023-03-04 | `2769c08e` | feat: 支持Bing的反代，已解决sydney不可用问题 |
| 2023-03-04 | `7c2023e3` | fix: 修复api3结束全部对话的问题 |
| 2023-03-04 | `1edfe817` | fix: sydney模式支持proxy |
| 2023-03-04 | `5ceb9c9d` | fix: no support cache |
| 2023-03-04 | `90c7c992` | fix: sydney模式不生效的问题 |
| 2023-03-04 | `1dae9b5b` | fix: 修复Sydney模式下依赖报错导致无法结束对话的问题 |
| 2023-03-04 | `9910e5d8` | fix: 修复API和API3模式连续对话失效的bug |
| 2023-03-04 | `55910dda` | fix: 优化https-proxy-agent依赖缺失的提示 |
| 2023-03-04 | `a5c0db09` | fix: 优化新引入的依赖安装提示；dalle支持proxy |
| 2023-03-04 | `49bbb5ce` | 添加实验性悉尼，添加必应图片模式样式自适应 (#216) |
| 2023-03-03 | `e580928b` | fix: 命令精准匹配 |
| 2023-03-03 | `2787acb9` | fix: 修复tag问题。 |
| 2023-03-03 | `1d34d7d8` | fix: config read error |
| 2023-03-03 | `a1b53c9d` | fix: 修复文本错误 |
| 2023-03-03 | `6b66a85d` | fix: read tag error |
| 2023-03-03 | `1bb065be` | feat: config帮助文档初始化（WIP） |
| 2023-03-03 | `873deda4` | feat: 修改配置文件格式避免频繁panic；降低api模式重试次数；优化帮助显示；支持必应新增的三种模式切换 |
| 2023-03-03 | `f4a07337` | feat: api and api3 support proxy |
| 2023-03-02 | `aa035662` | fix: open余额也走反代 |
| 2023-03-02 | `904d4948` | fix: 默认API baseurl填值 |
| 2023-03-02 | `446de028` | fix: api反代默认值报错的问题 |
| 2023-03-02 | `f84663e2` | feat: support openai api baseurl |
| 2023-03-02 | `17fb123e` | feat: support system message in api mode |
| 2023-03-02 | `0531ea0b` | fix: update chatgpt version |
| 2023-03-02 | `640dc7d8` | fix: 更新版本号 |
| 2023-03-02 | `a3c2108e` | Update management.js |

### 2023-04（113 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2023-04-29 | `76d26166` | fix: 增加新版本voicevox的新speakers |
| 2023-04-29 | `0c5a5e8e` | 有关私聊影响其他功能体感的问题 (#387) |
| 2023-04-29 | `6267d2d8` | 在新的多TTS源模式下添加了VoiceVox源 (#381) |
| 2023-04-29 | `1454917c` | fix: 调整以支持云转码 |
| 2023-04-29 | `5099ae9d` | feat: 后台新增Azure语音配置项 (#383) |
| 2023-04-25 | `eb6c25d7` | fix: 修复sydney设定抱歉的问题 |
| 2023-04-24 | `06b26ab5` | fix:修复对群友@时 昵称中含空格 导致一部分昵称被统计 (#384) |
| 2023-04-23 | `9e404918` | fix: 结束对话指令改为(结束｜新开｜摧毁｜毁灭｜完结)对话 |
| 2023-04-23 | `d5e3d52d` | fix: 适配无oicq＆icqq；删除存储的azure语音 |
| 2023-04-23 | `1bfb4d7d` | fix: 修改锅巴提示 |
| 2023-04-23 | `1f50e1b7` | fix: azure语音云转码 |
| 2023-04-23 | `2cafdcaa` | fix: azure下云转码适配 |
| 2023-04-23 | `49af9dad` | 修改指令触发方式 (#382) |
| 2023-04-23 | `cb9f0b27` | fix 换源分支少打个break(java17-user是这样的) |
| 2023-04-23 | `78a99801` | fix: 解决角色性格切换问题 |
| 2023-04-23 | `4a540750` | fix: 修改角色性格切换问题 |
| 2023-04-23 | `06495c3c` | fix: 修正voicevox角色风格设置问题 |
| 2023-04-23 | `68ef2d10` | fix: 切换语音模式对各种语言源提示错误 |
| 2023-04-23 | `8baef8b5` | fix: 配置里添加voicevox语音源 |
| 2023-04-23 | `94c44068` | feat: 添加基于voicevox语音支持 |
| 2023-04-22 | `a714c21f` | fix: azure默认角色bug |
| 2023-04-22 | `cf992bbc` | feat: 添加Azure语音支持 |
| 2023-04-22 | `20f6cd53` | fix: 词云增加一些筛选避免太过零碎 |
| 2023-04-22 | `aba80a5d` | fix: add version |
| 2023-04-22 | `7ae248e5` | fix: 语音云转码完善file和url模式。 |
| 2023-04-22 | `49d8dce9` | Feat: 新增云转码模式选择 (#380) |
| 2023-04-21 | `55f060dc` | Feat: 添加语音云转码功能，系统优化和故障修复 (#378) |
| 2023-04-21 | `26b4534c` | fix: 使用不存在的设定的bug |
| 2023-04-21 | `c35c3a66` | fix: node-rs jieba error |
| 2023-04-20 | `cd228128` | fix: unknown |
| 2023-04-20 | `5ded0045` | fix: cd |
| 2023-04-20 | `21fc4cbe` | fix: new group or member wordcloud bug |
| 2023-04-20 | `1475768d` | fix: chat group history bug |
| 2023-04-20 | `8342c583` | fix: add some log |
| 2023-04-20 | `719a810a` | fix: import bug |
| 2023-04-20 | `cee033dc` | fix: add npmrc env for nodejieba |
| 2023-04-20 | `eab19833` | fix: move nodejieba to optional dependencies |
| 2023-04-20 | `e0d3395a` | fix: 依赖 |
| 2023-04-20 | `3cfbe9ea` | feat: 乱七八糟的的统计词云 |
| 2023-04-20 | `7f773dcf` | fix: 调整claude无响应重试时间 |
| 2023-04-20 | `a3ef75cd` | feat: slack支持指定频道以便共享claude机器人 |
| 2023-04-20 | `74f4b641` | Fix: uploadRecord.js |
| 2023-04-20 | `f93f9ea0` | fix: add node silk import error log |
| 2023-04-19 | `2ce0a56e` | Fix: 修复绘图指令表被抢指令的bug。 (#368) |
| 2023-04-19 | `73c88cce` | 添加live2d模型自定义 (#374) |
| 2023-04-18 | `36a51856` | 修复Miao-Yunzai无法使用新渲染的问题 (#372) |
| 2023-04-18 | `3e1fcad1` | fix: 修改claude moderation鉴别方式 |
| 2023-04-18 | `aa040d4b` | fix: 降低slack查询频率避免被限速 |
| 2023-04-18 | `edd705fb` | fix: 必应妹！ |
| 2023-04-18 | `eb4628a4` | 更新个人设定 (#370) |
| 2023-04-18 | `6c5b3115` | fix: 尝试修复userData.cast为null的情况 |
| 2023-04-18 | `e758b37d` | 添加SLACK CLAUDE配置 (#359) |
| 2023-04-17 | `40b72989` | fix: 过长消息（多于4000）被slack夹断切分的问题 |
| 2023-04-17 | `85e7e798` | fix: 尝试处理一下自动化插件导致的对话带上本月已发送x条消息 |
| 2023-04-17 | `a804412c` | fix: 修复部分警告信息被输出的问题 |
| 2023-04-17 | `351d89bd` | 新增查看插件指令表的功能，修复配置群聊黑白名单的bug，修复开启禁用私聊后仍可以使用#chat模式进行对话的bug (#366) |
| 2023-04-17 | `2dc7cd5c` | feat: slack claude结束全部对话 |
| 2023-04-17 | `673fd881` | fix: 打招呼prompt不能热更新的问题 |
| 2023-04-17 | `06fd1219` | feat: claude的设定 |
| 2023-04-16 | `a2d903a2` | fix: 修复Claude的用户ID固定导致无法邀请Claude的bug (#362) |
| 2023-04-16 | `08e95dc6` | fix: 修复slask替换emoji后导致的复读bug |
| 2023-04-16 | `c1599e4f` | feat: 支持claude单人对话；注意：需要重新设置slack权限和配置插件 |
| 2023-04-16 | `3dee3cce` | fix: 还是名片和昵称的恩怨情仇 |
| 2023-04-16 | `ba0c3828` | fix: claude加入首条消息检测应对claude不说话的情况 |
| 2023-04-16 | `a68055c1` | fix: 增加bot校验降低claude复读可能性 |
| 2023-04-16 | `aa91ddee` | fix: 修改模式帮助 |
| 2023-04-16 | `bce9d00a` | fix: nickname and card problem |
| 2023-04-16 | `0451e19b` | fix: claude 结束对话提示 |
| 2023-04-16 | `70472464` | fix: 修复无群名片时at带上了昵称的问题 |
| 2023-04-15 | `7c36f936` | fix: 老模式的bug |
| 2023-04-15 | `7ef6051d` | feat: add support for Claude and Poe(WIP) |
| 2023-04-15 | `a3a16bc5` | fix: group admin page condition error |
| 2023-04-14 | `2895d89f` | 修改错别字 (#353) |
| 2023-04-14 | `414eb1b0` | fix: format code |
| 2023-04-14 | `2679206b` | 更新后台配置内容 (#352) |
| 2023-04-14 | `adae0710` | 修复index错误 (#346) |
| 2023-04-14 | `b3122e5c` | 新增：回复的内容过长时，自动转为文本模式。 (#344) |
| 2023-04-13 | `9b9b6963` | 添加用户管理功能 (#345) |
| 2023-04-13 | `4b29e261` | 新增对群聊黑白名单和启禁用私聊的功能，添加对全局回复模式、语音角色和主动打招呼的指令配置。 (#341) |
| 2023-04-12 | `11a62097` | 系统管理增加ipv6支持 (#342) |
| 2023-04-12 | `98d41493` | 修复了精准/平衡/创意模式下，给bing添加拓展资料后无法正常回复的问题 (#343) |
| 2023-04-12 | `8bdbd623` | fix: at都被挤到消息最前面的问题 |
| 2023-04-12 | `458b04c6` | 新增管理面板，重写必应token管理，错误修复 (#340) |
| 2023-04-11 | `c0a596a6` | fix: move node-silk to optional dependencies to avoid various installation problems |
| 2023-04-09 | `5119e174` | fix: 上下文忽略建议回复 |
| 2023-04-09 | `cfbad097` | fix: 修复at信息未被移除出prompt的问题 |
| 2023-04-08 | `93459ed9` | feat: 尝试添加silk转码支持以避免缺少amr导致无法使用语音 |
| 2023-04-08 | `6b2cd446` | fix: 减少必应token长度限制 |
| 2023-04-08 | `4c0a1852` | 修改了锅巴面板文案的部分问题🤔 (#324) |
| 2023-04-08 | `a8240d51` | 修复空消息 (#323) |
| 2023-04-07 | `3b66f6d3` | 修复bug (#321) |
| 2023-04-07 | `0a0cefe3` | 新渲染模式配置完善和bug修复 (#318) |
| 2023-04-06 | `0926009b` | 新的图片模式页面缓存和配套的API系统 (#315) |
| 2023-04-04 | `f8e741b0` | fix: 移除多余的依赖 |
| 2023-04-04 | `ec826292` | fix: api3传输形式优化 |
| 2023-04-03 | `820cf76e` | feat: 画图支持代理 |
| 2023-04-03 | `93c286e2` | fix: 未传入的主人昵称 |
| 2023-04-03 | `e343d54e` | fix: 无response body的情况 |
| 2023-04-03 | `943ee595` | fix: bing绘图取消权限 |
| 2023-04-03 | `4bd6c8c7` | fix: 优化一些错误提示和一些代码格式化 |
| 2023-04-03 | `c5d11efb` | fix: 修复新版主人认知导致自定义不生效的问题 |
| 2023-04-02 | `af2b879f` | fix: 上传设定改名字无效的问题 |
| 2023-04-02 | `9e69a00c` | fix: 释放出无报错信息的情况 |
| 2023-04-02 | `486b89a5` | docs: 更新部分文档；增加beta过期bing token移除 |
| 2023-04-02 | `fcc96915` | fix: 删除共享设定的笔误bug |
| 2023-04-02 | `10bbbf4f` | fix: 修复对原生bing造成的影响 |
| 2023-04-02 | `95a4d7a6` | feat: 通过降级messageType手段复活限流的账户 |
| 2023-04-01 | `14b4d3cd` | fix: bing绘图重复发送的问题 |
| 2023-04-01 | `d6267e3f` | fix: 画图暂时改为只能主人 |
| 2023-04-01 | `fe0ca177` | fix: 报错 |
| 2023-04-01 | `98943bee` | fix: bing绘图（beta） |
| 2023-04-01 | `da5adc0d` | fix: 增加实验性质的sydney反代，频繁throttle的用户可开启试试 |
| 2023-04-01 | `fd408586` | fix: 修复多token功能带来的一些影响 |

### 2023-05（30 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2023-05-30 | `0efc67f5` | fix: 微软能不能少报一些错啊 |
| 2023-05-30 | `9a8db957` | fix: 画图重试5次 |
| 2023-05-30 | `f2f77235` | fix: 画图画完拿结果503处理 |
| 2023-05-29 | `dc587cb1` | fix: 无关紧要的修改 |
| 2023-05-29 | `455f0e8a` | fix: 加回锅巴的模型选项。gpt-4可以直接填 |
| 2023-05-25 | `c91791ad` | fix: claude空@ |
| 2023-05-25 | `2e8b59bb` | feat: 后台面板更新 (#448) |
| 2023-05-25 | `375fad8a` | feat: 必应无需token即可进行对话（max20-＞5） |
| 2023-05-24 | `3c437ddf` | fix: 调整sydney token过期方式；画图调整增加成功概率 |
| 2023-05-23 | `cc78143c` | fix: 更换Sydney接口 |
| 2023-05-21 | `758aeb67` | fix: 开启内容生成会爆token的问题 |
| 2023-05-21 | `d88550db` | fix: syntax error |
| 2023-05-21 | `ea5c4513` | Update management.js (#431) |
| 2023-05-18 | `f20248a8` | 移除axios依赖，替换百度翻译为有道翻译。指令表支持关键词筛选。 (#434) |
| 2023-05-18 | `82b83bf0` | Feat:Sydney模式添加内容生成支持 (#420) |
| 2023-05-17 | `6551f114` | fix: 开启真at后非yunzai环境报错 |
| 2023-05-14 | `15f579aa` | fix: 修复Poe formkey失效的问题 |
| 2023-05-14 | `1a94d929` | fix: poe添加proxy支持 |
| 2023-05-14 | `63f86290` | fix: claude增加debug模式;poe添加proxy支持 |
| 2023-05-12 | `73e6dc43` | fix: #claude开启新对话被#claude抢走的问题 |
| 2023-05-12 | `3f42c053` | fix: 添加一个报错提示 |
| 2023-05-12 | `926f07c8` | feat: 添加星火支持（beta） |
| 2023-05-11 | `76f0328a` | Fix:修复Live2D的错误，重构Live2D系统 (#410) |
| 2023-05-11 | `2bf3a636` | fix: 微调Bing画图 |
| 2023-05-07 | `fde029cd` | 小优化 (#408) |
| 2023-05-06 | `e47f18a5` | fix: add headers for refresh token |
| 2023-05-05 | `fe42df59` | feat: 查看API余额功能；修复频道和部分情况下无法读取群信息时的报错 |
| 2023-05-04 | `bda04317` | 修复文本和语音重复发送的问题 (#400) |
| 2023-05-04 | `b687d458` | 为azure语音模式添加说话风格配置，支持vits语音模式中文回答转日语语音输出，添加翻译功能，支持指令切换语音模式，支持查看当前语音模式下的支持角色列表 (#404) |
| 2023-05-04 | `bb90c3c3` | fix: 优化slack对话拉取机制，避免过长对话导致的maxContentLength size of -1 exceeded错误 |

### 2023-06（54 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2023-06-29 | `36e592e7` | fix: 稍微修改一下bing ws |
| 2023-06-28 | `d4a3b2ce` | fix: update fastify |
| 2023-06-26 | `8acb3f48` | fix: image caption qq error |
| 2023-06-26 | `c6ce17ff` | fix: 生气了 |
| 2023-06-26 | `1a739402` | fix: 调整一些prompt |
| 2023-06-26 | `aed27147` | fix: 撤回tool的问题 |
| 2023-06-26 | `ca28b006` | feat: 一些小工具 |
| 2023-06-26 | `c99af435` | fix: genshin tool fix |
| 2023-06-26 | `8bc58297` | fix: 修复miaoplugin |
| 2023-06-26 | `328849b3` | fix: 优化一些tool |
| 2023-06-26 | `b7ac3bff` | 解决非QQ平台AI回复后依然发送异常图片 (#491) |
| 2023-06-25 | `16a8c64b` | fix: 漏了一个tool |
| 2023-06-25 | `d3cc6e46` | fix: delete a |
| 2023-06-25 | `ced2b4ee` | feat: add a tool |
| 2023-06-25 | `87182f1a` | fix: 修复sr |
| 2023-06-25 | `9f7a5167` | fix: 这户i对了吧 |
| 2023-06-25 | `3427d230` | fix: try |
| 2023-06-25 | `bcb19db1` | fix: ? |
| 2023-06-25 | `46dc1a8c` | fix: sr |
| 2023-06-25 | `fc029de7` | fix: update sr |
| 2023-06-25 | `7e559881` | fix: 原来是这样 |
| 2023-06-25 | `37572bd6` | fix: 修复ap默认at机器人的问题 |
| 2023-06-25 | `6e912d68` | fix: 支持ap的dev分支 |
| 2023-06-25 | `a35f8a31` | feat: try to support ap-plugin |
| 2023-06-25 | `03b02442` | fix: bump version |
| 2023-06-25 | `feb6b319` | fix: groupId 格式问题 |
| 2023-06-25 | `de8cc481` | fix: tts role |
| 2023-06-25 | `d52f9578` | fix: tts tool |
| 2023-06-25 | `38383e37` | fix: 啊啊啊 |
| 2023-06-25 | `cd168729` | fix: 啊 |
| 2023-06-25 | `da27e6a1` | feat: add a tts tool |
| 2023-06-25 | `c3d9f65a` | fix: 删掉多余的提示 |
| 2023-06-25 | `8a32f7e4` | fix: add visual qa |
| 2023-06-25 | `7bc140a0` | fix: 修复后台面板无法访问的问题 (#490) |
| 2023-06-25 | `5bfd55e7` | fix: 删掉惩罚 |
| 2023-06-25 | `14369c8f` | fix: 又漏了一个tool |
| 2023-06-25 | `33f80519` | fix: 满足AI的任性需求 |
| 2023-06-25 | `637c9211` | fix: 修正fastify版本 |
| 2023-06-25 | `8c463c73` | fix: add dependencies |
| 2023-06-25 | `0dedaf75` | fix: 修正依赖 |
| 2023-06-25 | `b7427e74` | feat: 智能模式，添加群管、试图、联网搜索、发图、发音乐和视频等功能 (#488) |
| 2023-06-25 | `2c5b084b` | 修复在guoba面板填写黑白名单不生效的bug，修复azure语音模式下无参数查看语音角色列表时不返回结果的bug。 (#476) |
| 2023-06-25 | `a3fab731` | feat: 新增ws接口，适配工具 (#482) |
| 2023-06-17 | `d7cb9aa5` | fix: unknown |
| 2023-06-17 | `fbe89536` | 🥰更改chatgpt-plugin的更新代码顺便修复一个正则问题 (#450) |
| 2023-06-16 | `adc08177` | fix: 把随机系统消息加回来 |
| 2023-06-12 | `31728321` | feat: 适配远程渲染服务器，优化Live2D (#463) |
| 2023-06-10 | `508beaec` | fix: 可能能解决findIndex |
| 2023-06-05 | `bdad936c` | feat: 黑白名单支持配置qq号；支持所有语音模式下的随机角色对话；新增查看当前用户的回复设置；完善全局设置的相关功能；支持为Azure语音服务随机选择角色；优化设置全局语音角色和查看角色列表的功能；重构了代码以支持现有语音服务的打招呼功能；修复了Guoba面板上Azure语音角色选择的显示问题。 (#436) |
| 2023-06-05 | `7007cacf` | 临时解决QQ频道、KOOK异常 (#441) |
| 2023-06-05 | `220a3f15` | 增加了“最新词云”功能 (#465) |
| 2023-06-05 | `c00b6d85` | Fix Chat reset (#461) |
| 2023-06-02 | `a46d6d85` | fix: remove 垃圾代码 |
| 2023-06-02 | `5c7d85ef` | fix: 删除必应无token的提示因为不需要token了 |

### 2023-07（45 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2023-07-31 | `4ffc6c1a` | fix: 调整对高版本HttpsProxyAgent支持的一个错误 |
| 2023-07-30 | `9c172e9e` | Create stale.ymlchroe: add stale action |
| 2023-07-29 | `e4854e68` | fix: 区分token过期和出验证码，避免大量无效过码请求和错误 |
| 2023-07-28 | `e445cb3c` | 必应验证码解决方案 (#528) |
| 2023-07-28 | `709a1ceb` | 优化和错误修复 (#527) |
| 2023-07-28 | `a703378c` | 限制了一些管理指令的触发条件防止误触 (#525) |
| 2023-07-28 | `12a94d80` | feat: 必应验证码另一个解决方案 |
| 2023-07-23 | `51f786bd` | fix: 修改默认搜索引擎为必应 |
| 2023-07-23 | `b1570d61` | fix: 回退部分修改；增加验证码提示词 |
| 2023-07-22 | `ef57259e` | fix: bing captcha fix(不建议升级) |
| 2023-07-22 | `521914bb` | fix: 修改context |
| 2023-07-22 | `5d6737d2` | feat: 必应验证码（beta） |
| 2023-07-20 | `bc072d96` | fix: 修改依赖版本 |
| 2023-07-20 | `492a8056` | 修复图片识别bug (#518) |
| 2023-07-19 | `6ee0b0ea` | 添加Sydney图片识别，适配tools接口 (#516) |
| 2023-07-15 | `6628b883` | fix: add trim |
| 2023-07-15 | `a1b450ab` | fix: 智能模式function叠加消息 |
| 2023-07-10 | `b5669de7` | fix: remove unuseful fields to reduce token usage |
| 2023-07-09 | `db24de9a` | fix: stream模式下function＿all参数问题 |
| 2023-07-09 | `b9f45c20` | feat: support stream debug log |
| 2023-07-08 | `75672586` | 修复机器人使用工具发送内容会发送给自己的bug, tool适配新版鳄梨插件的指令. (#506) |
| 2023-07-05 | `66172feb` | fix: 默认使用百度搜索引擎 |
| 2023-07-05 | `4ad4119c` | fix: 无法发送音乐的问题 |
| 2023-07-04 | `7ca35836` | fix: whiletlist的未知问题；修改文档 |
| 2023-07-04 | `636963af` | feat: OpenAI余额查询功能 |
| 2023-07-03 | `3b807211` | fix: group |
| 2023-07-03 | `9be8b54f` | feat: give title |
| 2023-07-03 | `8a531bf5` | fix: 微调必应 |
| 2023-07-03 | `e42307fd` | fix: qq.trim |
| 2023-07-01 | `f1da0d36` | fix: 更换website总结网站内容默认模型 |
| 2023-07-01 | `80b320ff` | fix: 修复openai client由于计算token引起的错误 |
| 2023-07-01 | `285afad9` | fix: 修复website tool的bug（啊） |
| 2023-07-01 | `6ba96eec` | fix: 修复非智能模式的functions报错 |
| 2023-07-01 | `dd249615` | fix: try to add required token |
| 2023-07-01 | `53ad413f` | fix: revert fetch-sse |
| 2023-07-01 | `f01d1d39` | fix: 修复token计算方法 |
| 2023-07-01 | `a94017e6` | fix: add more debug log |
| 2023-07-01 | `877b91c7` | fix: print error |
| 2023-07-01 | `ff69d2e9` | fix: syntax error |
| 2023-07-01 | `e5d43a8c` | fix: version 2.7.2 |
| 2023-07-01 | `7a8b30db` | fix: merge tons of conflict |
| 2023-07-01 | `f0b717be` | fix: 修复 |
| 2023-07-01 | `98384594` | fix: 修复一些智能模式的问题 |
| 2023-07-01 | `ca3788d7` | feat: 新增对tool支持的相关接口 (#495) |
| 2023-07-01 | `2443ed6f` | 🥵🥵🥵 (#496) |

### 2023-08（21 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2023-08-31 | `c3d998ec` | 更新工具箱适配代码 |
| 2023-08-31 | `6ace8720` | 更新工具箱替换原有后台 |
| 2023-08-31 | `b966a090` | 添加工具箱 |
| 2023-08-31 | `6330eeb3` | 移除旧版本渲染和新版本帮助 |
| 2023-08-31 | `57416dcd` | 添加Azure配置支持，修复重复的配置项冲突 |
| 2023-08-30 | `5028c2ea` | 阻止群聊使用快捷登录 |
| 2023-08-30 | `6a61722b` | 添加工具箱快捷登录指令 |
| 2023-08-30 | `34f99a01` | feat:添加工具箱快捷登录接口 |
| 2023-08-29 | `4457fab0` | 修复导出配置问题 |
| 2023-08-29 | `b6c0a042` | 修复星火api模式的一些问题 |
| 2023-08-26 | `043b80dd` | fix: 移除一些headers以减少奇怪的502问题 |
| 2023-08-25 | `007909a1` | feat: 添加星火设定自定义代码功能 |
| 2023-08-25 | `d6ed1bf3` | fix: trim undefined error |
| 2023-08-25 | `d9c25140` | 将无星火ck的情况降低为warn |
| 2023-08-25 | `8df8626d` | fix: 修复星火api上下文 |
| 2023-08-24 | `246aaad9` | fix: syntax error |
| 2023-08-24 | `502cc810` | 能否加入 Azure OpenAI 的相关支持 #471 (#536) |
| 2023-08-24 | `c2c6ea43` | 添加Bard和星火API支持 (#551) |
| 2023-08-15 | `3b1641ca` | fix: add code verefication |
| 2023-08-09 | `7ce058c4` | 后台和工具箱适配、添加群消息合并、优化bing绘图、修复引用空标题 (#530) |
| 2023-08-09 | `4c26d778` | feat. 兼容新版icqq转发消息 (#540) |

### 2023-09（13 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2023-09-23 | `390eb5cd` | fix: update emojiData.json |
| 2023-09-23 | `ad95327b` | fix: bingtoken国企 |
| 2023-09-19 | `7c5e9ea4` | fix: 增加错误输出 |
| 2023-09-19 | `c36a0f9c` | fix: 延长claude超时时间 |
| 2023-09-19 | `77f6d2d8` | fix: 增加claude.ai对话超时配置项 |
| 2023-09-13 | `08e92d87` | fix: add support for claude.ai reverse proxy |
| 2023-09-12 | `a91e2c25` | fix: update forward |
| 2023-09-12 | `f620e10a` | fix: 兼容5和7的proxy依赖 |
| 2023-09-11 | `5e7d7390` | feat: 支持自定义ja3 |
| 2023-09-08 | `078d31dc` | fix: import error |
| 2023-09-08 | `b743259e` | feat: add ja3 support to enable claude2 |
| 2023-09-08 | `56d6b50a` | feat: Claude2 from claude.ai (#561) |
| 2023-09-08 | `bf761c24` | 修复bug和旧代码清理 (#553) |

### 2023-10（58 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2023-10-30 | `6c149265` | fix: 修改必应初始对话次数为30 |
| 2023-10-30 | `7289ae6f` | fix: 优化首次使用插件bing模式下验证码请求被阻拦的问题 |
| 2023-10-30 | `ea687296` | fix: 整理一些长期遗留懒得修的小问题 |
| 2023-10-29 | `efa7fff5` | fix: 复用API和千问模式的设定 |
| 2023-10-29 | `5cecea07` | fix: 千问结束全部对话bug |
| 2023-10-29 | `2a713ca1` | fix: reconstruction clients |
| 2023-10-25 | `b7376407` | 适配星火v3 (#598) |
| 2023-10-25 | `cb6eb9c1` | 修复星火domain错误 |
| 2023-10-25 | `82af06a2` | 适配星火v3 |
| 2023-10-25 | `c0936e6e` | feat: 增加通义千问支持 |
| 2023-10-25 | `e0f96e3a` | fix: 修复context覆盖的问题 |
| 2023-10-21 | `dc19009e` | fix: getUin错误 |
| 2023-10-19 | `9e7a614d` | fix: 修复不知道啥时候不小心碰到键盘导致的错误 |
| 2023-10-19 | `b1e3fb78` | fix: 减少必应接受的context长度不然爆炸 |
| 2023-10-19 | `74626e66` | fix: AI写的代码一定要检查 |
| 2023-10-19 | `1a95c671` | feat: 为必应和claude2提供读取文件能力支持 |
| 2023-10-18 | `6d16861f` | fix: update bing ai bundle version |
| 2023-10-16 | `c68a50e8` | 继续适配Trss (#583) |
| 2023-10-16 | `4cb4dc95` | 更新后台锅巴插件支持 |
| 2023-10-16 | `03daaa66` | 修复headers |
| 2023-10-16 | `ed568c40` | 删除调试信息 |
| 2023-10-16 | `14d7088e` | 修复锅巴代理参数 |
| 2023-10-16 | `22ead6d5` | 优化锅巴接口代理 |
| 2023-10-16 | `6c171b32` | fix: 修复tts代理不正确问题 |
| 2023-10-16 | `fd735c1d` | 添加锅巴代理接口 |
| 2023-10-15 | `f5a31f76` | 更新后台页面 |
| 2023-10-15 | `7e5f723a` | 添加锅巴插件适配 |
| 2023-10-15 | `42bad1cb` | 修复server初始化消息错误 |
| 2023-10-15 | `471da4f3` | 添加锅巴用户数据 |
| 2023-10-15 | `0e826e58` | fix: 更新readme；隐藏日志 |
| 2023-10-15 | `83a82cf9` | fix: 转发微调 |
| 2023-10-14 | `04bab7a8` | 修复错误的后台版本更新 |
| 2023-10-14 | `fb05cccd` | server 适配trss |
| 2023-10-14 | `4c16489c` | fix: 回退 |
| 2023-10-14 | `a4ac59d8` | fix: 兼容性修复 |
| 2023-10-14 | `4c737d57` | fix: 修复智能模式在TRSS下报错的问题 |
| 2023-10-14 | `0a3c95d3` | fix: 某些特殊情况群聊记录 |
| 2023-10-14 | `4066f178` | fix: 修复TRSS转发错误，chronocat linux应该还没适配 |
| 2023-10-13 | `95e730f2` | fix: 聊天记录适配TRSS+chronocat |
| 2023-10-13 | `dce7503c` | fix: 微软更新后，第一次对话手动对话提示以避免无限循环 |
| 2023-10-13 | `ae58a20c` | 添加bing第三方绘图 (#580) |
| 2023-10-13 | `dfbee201` | 适配trss |
| 2023-10-13 | `20ea8cfa` | 使用ap替换第三方绘图 |
| 2023-10-12 | `0666de1a` | 修复视图错误 |
| 2023-10-12 | `096bcbca` | 添加bing第三方绘图图片大小配置 |
| 2023-10-12 | `c5421bb5` | 修复错误 |
| 2023-10-12 | `a0a9630a` | 添加bing第三方绘图采样配置 |
| 2023-10-12 | `7c45b050` | 修复bing绘图第三方调用错误 |
| 2023-10-12 | `fed2fd8d` | 添加bing第三方绘图 |
| 2023-10-08 | `0f310a8f` | fix: 对话反代默认开启 |
| 2023-10-08 | `e574681a` | fix: 默认模式转为Sydney避免新装直接200 |
| 2023-10-08 | `0f9c8a7a` | 适配Trss (#575) |
| 2023-10-08 | `e90d6f11` | 适配其他uin |
| 2023-10-08 | `6e5ef2e1` | 修复路由 |
| 2023-10-08 | `d6fb62c4` | 优化路由 |
| 2023-10-08 | `5d5535ed` | 修复trss不支持sendPrivateMsg的问题 |
| 2023-10-08 | `880edace` | 后台适配Trss |
| 2023-10-05 | `64f2699b` | fix: 适应必应API改版 |

### 2023-11（17 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2023-11-28 | `028fbb75` | fix: 嗯嗯 |
| 2023-11-28 | `823301e5` | fix: 窒息 |
| 2023-11-28 | `b9ca5ce4` | fix: shamrock的小问题 |
| 2023-11-28 | `aefea106` | fix: #612 |
| 2023-11-28 | `1c6c10b1` | fix: #613 |
| 2023-11-21 | `46d88c26` | fix: 修复喵崽多适配器工具箱登录；移除crypto依赖 |
| 2023-11-21 | `2b19302b` | fix: merge conflict |
| 2023-11-21 | `f246e842` | fix: gl |
| 2023-11-12 | `c99019cd` | fix: 跟进shamrock和lain的更新 |
| 2023-11-07 | `56a89373` | fix: 降低词云阈值 |
| 2023-11-07 | `a45be2e2` | fix: 词云bug |
| 2023-11-07 | `0d8ef840` | fix: 修复群名拿不到的问题 |
| 2023-11-07 | `e29e370f` | fix: 模型maxToken更新 gpt4后续更新 |
| 2023-11-07 | `ce65cc86` | fix: 修复lain下部分工具失效问题 |
| 2023-11-07 | `e43b490e` | fix: 修复microsoft-cognitiveservices-speech-sdk版本 |
| 2023-11-07 | `0bff8c85` | feat: 进一步适配铃音+shamrock;词云进化 |
| 2023-11-04 | `61d3b487` | fix: 初步适配铃音语音 |

### 2023-12（35 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2023-12-31 | `35c27884` | 修复 #chatgpt(本群)?(群\\d+)?(闭嘴｜关机｜休眠｜下班) 与 #chatgpt关闭画图 正则表达式冲突 (#632) |
| 2023-12-28 | `a00956ef` | feat: #chatgpt必应禁用搜索 #chatgpt必应开启搜索 |
| 2023-12-17 | `fc4eaf8d` | 添加Gemini配置项 (#626) |
| 2023-12-16 | `3eaa331d` | 添加后台配置项 |
| 2023-12-15 | `22dcb040` | Note: The gemini-pro-vision model (for text-and-image input) is not yet optimized for multi-turn conversations. Make sure to use gemini-pro and text-only input for chat use cases. |
| 2023-12-15 | `4dc5d6fe` | fix: 权限和角色问题导致的工具调用失败 |
| 2023-12-15 | `39ef573d` | fix: guoba |
| 2023-12-15 | `bbe769f1` | fix: 实现Gemini客户端取代官方版本 |
| 2023-12-14 | `6769e9d3` | fix: 增加#chatgpt修补Gemini 以暂时解决google库不支持反代的问题 |
| 2023-12-14 | `3aefa409` | fix: update topP |
| 2023-12-14 | `8e846d9c` | fix: add package patch |
| 2023-12-14 | `315b16ac` | fix: 添加依赖提示 |
| 2023-12-14 | `220525fb` | feat: 支持GeminiPro模型 |
| 2023-12-13 | `ac0aa7d0` | fix: adjust error hint of blocked prompt |
| 2023-12-12 | `6f0a7955` | feat：结束其他模式对话 (#622) |
| 2023-12-12 | `d00ab5df` | fix: https error |
| 2023-12-12 | `ca34338b` | fix: merge |
| 2023-12-12 | `3f98d480` | fix: 优化必应绘图逻辑 |
| 2023-12-12 | `16d9462e` | fix: 必应画图被屏蔽的提示词 |
| 2023-12-12 | `e5d6a415` | fix: 修改必应绘图失败提示词避免ap画出来 |
| 2023-12-12 | `fd0d0ff5` | fix: 修复必应画图多余的svg |
| 2023-12-11 | `b8eaffe9` | fix: query user info tools |
| 2023-12-11 | `e61d4ff3` | fix: 修复和优化群聊文件读取逻辑 |
| 2023-12-10 | `d254163f` | fix: bug fix |
| 2023-12-10 | `247f3e15` | fix: 上下文、文件、ocr等进一步适配shamrock |
| 2023-12-08 | `ae23e6d7` | 修复trss无法快速登陆后台的问题 (#620) |
| 2023-12-08 | `b3c39908` | 奇怪的错误，忽略提示不影响使用 |
| 2023-12-08 | `065d377b` | 修复更新后trss无法快捷登陆面板问题 |
| 2023-12-07 | `46328a97` | fix: headers |
| 2023-12-07 | `2183822b` | fix: 权限 |
| 2023-12-07 | `91abd8a9` | feat: refresh自动获取sessKey作为API Key |
| 2023-12-07 | `f7ee9044` | fix: api3 |
| 2023-12-04 | `85535259` | fix: 必应默认删除前戏 |
| 2023-12-04 | `407ef659` | fix: 移除悉尼，调整必应参数 |
| 2023-12-03 | `fac0863e` | feat：指令查看模型列表，指令设置API模型、API反代、星火版本 (#616) |

## 2024 年

### 2024-01（8 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2024-01-21 | `5acd7cc0` | feat：修复qwen是gemini，增加双子星、智谱结束(全部)对话 |
| 2024-01-17 | `966ea2d0` | fix: add timeout for https |
| 2024-01-17 | `006abb32` | fix: first msg no content |
| 2024-01-17 | `37d1d04d` | fix: content parts |
| 2024-01-17 | `c69358cd` | feat: support chatglm.cn |
| 2024-01-16 | `8bdf9a3b` | feat: 适配copilot pro账户的gpt4-turbo选项 |
| 2024-01-02 | `3709166b` | fix #633 |
| 2024-01-01 | `5e412057` | fix: 清理代码 |

### 2024-02（29 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2024-02-28 | `58e6201e` | fix: replace getMemberMap with gml |
| 2024-02-24 | `bf75c002` | fix: remove long translation result forward |
| 2024-02-23 | `f1b950ce` | fix: 笔误 |
| 2024-02-23 | `edafe602` | fix: 反馈 |
| 2024-02-23 | `4886042e` | fix: 增加指令切换翻译源 |
| 2024-02-23 | `35ad437d` | fix: 语种问题 |
| 2024-02-23 | `e1d40ba0` | fix: 添加基于LLM的翻译 |
| 2024-02-22 | `e5e85621` | fix: claude2 response format |
| 2024-02-22 | `9ef463fd` | fix: claude2 url error |
| 2024-02-22 | `ec2e123e` | fix: claude2 |
| 2024-02-22 | `0cdd2be2` | fix: 使用icqq发送视频 |
| 2024-02-21 | `4cbca97c` | fix: 减少重试次数 |
| 2024-02-21 | `3561f7c9` | fix: query song add fallback |
| 2024-02-21 | `76357816` | fix: 余额不足提示 |
| 2024-02-21 | `324f4474` | fix: 死循环 |
| 2024-02-21 | `6560cec8` | fix: 文本乱了 |
| 2024-02-21 | `76caf5d0` | fix: 邮箱打码 |
| 2024-02-21 | `c46c8fe4` | fix: 循环 |
| 2024-02-21 | `ba3422cd` | fix: suno余额查询：'#suno余额' |
| 2024-02-21 | `eea0748d` | feat: 支持suno：'#suno+prompt'或'#创作歌曲+prompt' |
| 2024-02-19 | `63edc940` | fix: 兼容性问题 |
| 2024-02-18 | `76ecabe1` | fix: 小重构必应 |
| 2024-02-18 | `c9176884` | fix：dalle3 |
| 2024-02-17 | `74a0b7dd` | feat：dalle3 |
| 2024-02-15 | `a32eb61f` | feat：指令查看当前部分配置，api流开关 |
| 2024-02-01 | `38994008` | fix: xh设定 |
| 2024-02-01 | `8cc7105f` | fix: xh prompt turn to system role |
| 2024-02-01 | `8ec1ee4c` | fix: xh 3.5 |
| 2024-02-01 | `ba83d6c3` | fix: #638 |

### 2024-03（34 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2024-03-29 | `57624851` | fix: 微调样式 |
| 2024-03-28 | `b0c6cadb` | 添加后台星火v3.5模式选项 |
| 2024-03-21 | `f68e7cf5` | fix: 优化识图报错 |
| 2024-03-16 | `7d39af6a` | fix: add support for claude vison |
| 2024-03-16 | `81a45b13` | fix: reply |
| 2024-03-16 | `4eaf218d` | feat: add #识图 |
| 2024-03-15 | `a4d07b9d` | fix: 增加均衡模式 |
| 2024-03-14 | `b822e49d` | fix: 流模式带多余undefined的问题 |
| 2024-03-14 | `a539b26e` | fix: remove strange makeforward |
| 2024-03-14 | `267f67bb` | fix: add claude-3-haiku-20240307 |
| 2024-03-13 | `86825589` | fix: 指令添加key的提示 |
| 2024-03-13 | `3b5a26ce` | feat: simple random load balance for claude api key |
| 2024-03-13 | `7d83c34e` | fix: guoba typo |
| 2024-03-13 | `1d42dc6f` | feat: add example turns for bing and prompts |
| 2024-03-12 | `36f0dbd9` | fix: bing full ck |
| 2024-03-12 | `bbe70e39` | fix: qwen contect |
| 2024-03-12 | `b221098c` | fix: refactor qwen mode |
| 2024-03-11 | `32af7b9a` | fix: 生成较长时suno token过期重新刷新 |
| 2024-03-10 | `e47ec3cd` | fix: disable picture mode under md mode |
| 2024-03-10 | `fd2d9766` | cherry-pick: 1 |
| 2024-03-10 | `8e73a28d` | 修改package.json (#662) |
| 2024-03-09 | `bd7aac05` | fix: remove useless thing |
| 2024-03-08 | `56be26e0` | fix: md claude model |
| 2024-03-08 | `b4e017a6` | fix: button |
| 2024-03-08 | `f0c284cc` | fix: copilot乱写的bug |
| 2024-03-08 | `79ab6cbd` | feat: support claude api fix #659 |
| 2024-03-07 | `8b2493a4` | fix: replace stream with file |
| 2024-03-07 | `eef4254e` | fix: typo OpenAI |
| 2024-03-06 | `4581db1b` | fix: error |
| 2024-03-06 | `03068f51` | fix: try to fix no handler version |
| 2024-03-06 | `87af8567` | fix: syntax error |
| 2024-03-06 | `6b58def2` | fix: remove md conditions |
| 2024-03-05 | `1e1584b6` | fix: screenshot command |
| 2024-03-05 | `cb3e57be` | feat: experimental markdown support (#658) |

### 2024-04（2 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2024-04-25 | `5acf874e` | 添加后台缺少的部分配置项 |
| 2024-04-03 | `c622f7eb` | fix: add retry for suno video download |

### 2024-05（31 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2024-05-16 | `01425103` | fix: fallback gpt4-o |
| 2024-05-15 | `5aa90788` | fix: add api3 timeout option |
| 2024-05-15 | `21485df0` | fix: api3 gpt-4o |
| 2024-05-15 | `d82320d0` | fix: remove code about queue |
| 2024-05-15 | `bb871694` | fix: #chatgpt删除token |
| 2024-05-15 | `08e78209` | fix: symbol error |
| 2024-05-15 | `72b6dcf5` | fix: message id |
| 2024-05-15 | `1f807584` | feat: add synthesis for api3 |
| 2024-05-14 | `b76d33d9` | fix: add retry for api3 |
| 2024-05-14 | `a507c85c` | Update message.js |
| 2024-05-14 | `6f7bb4f7` | fix: allow empty api3 token |
| 2024-05-09 | `adcbcf1f` | 更新歌词匹配 |
| 2024-05-09 | `7288e2b8` | 优化歌曲消息匹配，适配更多模型支持生成歌曲 |
| 2024-05-08 | `554f6a69` | 添加后台对话模式选项 |
| 2024-05-08 | `8efcce45` | 去除bard |
| 2024-05-08 | `d111d262` | 修改suno伪造生成策略，支持更多模型调用 |
| 2024-05-08 | `123e5304` | 对原始数据进行编辑 |
| 2024-05-08 | `f66b4a85` | 增加视频下载延迟 |
| 2024-05-07 | `8bd58cf4` | 增加suno生成等待时间，修复下载视频参数错误 |
| 2024-05-07 | `b20a3db0` | 更多样的bing suno生成 |
| 2024-05-07 | `991c63bb` | 修复部分适配器不支持pickMember的问题 |
| 2024-05-07 | `f8f5f8f8` | 添加bing第三方suno生成支持 |
| 2024-05-07 | `ec47a4d9` | 添加对bing suno插件的支持 |
| 2024-05-06 | `33e04c1c` | 修复bing图片生成请求（绘图接口仍有问题） |
| 2024-05-06 | `8dab6fd0` | 修复bing图片识别问题 |
| 2024-05-05 | `03e3094c` | 更新后台面板 (#684) |
| 2024-05-05 | `eb2618b1` | 更新后台 |
| 2024-05-05 | `f3fb9aa0` | 后台适配trss，更新web |
| 2024-05-05 | `b4317944` | 对后台更新 (#683) |
| 2024-05-05 | `369dbd31` | 增加后台对缺少的锅巴配置自动读取，将后台登陆信息添加到redis |
| 2024-05-01 | `7bbe1a9d` | fix: waitForTimeout is not a function (#674) |

### 2024-06（3 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2024-06-27 | `49aade9a` | fix: xh 4.0 |
| 2024-06-13 | `500b7433` | fix: remove adapter check for 'tokenizer' |
| 2024-06-13 | `5c7c430d` | fix: remove adapter check for 'getImg' |

### 2024-07（4 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2024-07-29 | `7c2961cd` | fix: text null |
| 2024-07-29 | `1682b715` | fix: gemini mode text ＆ FunctionCall |
| 2024-07-29 | `e6af4083` | fix: 修复Gemini的图片和工具支持 |
| 2024-07-22 | `1fad082d` | fix: 识图模型报错 |

### 2024-08（3 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2024-08-06 | `b87bf777` | fix: try to fix openai version |
| 2024-08-03 | `beaec147` | gemini智能模式下主人可使用bot管理员禁言权限 (#708) |
| 2024-08-03 | `ac304e0e` | fix: gemini禁言越权问题 |

### 2024-10（5 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2024-10-29 | `2b9734c6` | 兼容trss (#723) |
| 2024-10-11 | `aa2ac7b5` | fix: add example |
| 2024-10-11 | `47902858` | fix: move files |
| 2024-10-11 | `d08e9e41` | feat: 自定义后处理器 |
| 2024-10-11 | `f0a17dc4` | fix: #713 |

### 2024-11（6 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2024-11-19 | `8fc2ca56` | fix: revert openai version |
| 2024-11-19 | `dc751750` | fix: 用AUTO作为gemini工具默认选项 |
| 2024-11-19 | `f6e054b7` | fix: bot一直骂我 |
| 2024-11-19 | `df715e22` | fix: merge (maybe broken?) |
| 2024-11-19 | `a77a0e43` | fix: WIP openai rewrite |
| 2024-11-18 | `30f9c82d` | fix: gemini tool optional |

### 2024-12（9 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2024-12-31 | `5692af69` | fix: bym qq |
| 2024-12-31 | `1149f340` | fix: tool permission |
| 2024-12-29 | `f6ce6dce` | fix: bym 又发现了bym的bug |
| 2024-12-29 | `11fb6f52` | fix: try to fix #732 |
| 2024-12-29 | `5f2b8885` | 修复发送图片 (#729) |
| 2024-12-29 | `027ff17b` | fix: 修复bym发现的bymbug |
| 2024-12-29 | `221cf408` | fix: gemini function call |
| 2024-12-29 | `26444df2` | Update bym.js (#735) |
| 2024-12-12 | `5f6c4e5a` | feat: support search for gemini2: #chatgpt开启gemini搜索 #chatgpt开启代码执行 暂时不可并存 |

## 2025 年

### 2025-01（15 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2025-01-31 | `f7030e84` | fix: adjust bym.js text filter |
| 2025-01-31 | `acb9e76b` | fix: use system＿instruction instead of user for gemini client |
| 2025-01-30 | `65bb1539` | fix: content和reasoning＿content是同时出现的 |
| 2025-01-30 | `6442e371` | fix: 遗漏提交 |
| 2025-01-30 | `4b9dd039` | fix: 非流模式的思考转发 |
| 2025-01-30 | `3cd664ff` | feat: 转发thinking的内容 |
| 2025-01-27 | `5e4d9210` | fix: update prompt management |
| 2025-01-08 | `ced7a5a0` | fix: gemini filter |
| 2025-01-04 | `7974c6a1` | feat: 轮询geminiKeys，用英文逗号隔开 (#744) |
| 2025-01-03 | `25520ba9` | fix: text split error |
| 2025-01-02 | `43faf96c` | fix: filter empty message |
| 2025-01-02 | `802776cf` | fix: filter empty message to avoid -60 |
| 2025-01-02 | `75cf2e35` | fix: filter empty |
| 2025-01-02 | `314c60d0` | fix: bym optimizing |
| 2025-01-02 | `1c34ecbb` | feat: add bymFuckList Configuration (#737) |

### 2025-02（52 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2025-02-27 | `d6cb085c` | fix: 思考转发；claude上下文 |
| 2025-02-26 | `7fcf0c6b` | fix: claude max token |
| 2025-02-21 | `47016aea` | Update SendMusicTool.js (#745) |
| 2025-02-19 | `7bf1c849` | fix: post processors |
| 2025-02-18 | `20195ecf` | fix: 发图工具的小bug |
| 2025-02-17 | `bde81c0a` | fix: MALFORMED＿FUNCTION＿CALL |
| 2025-02-17 | `b9ed12ad` | fix: 设定列表太长发不出来的问题 |
| 2025-02-17 | `a97f01b9` | fix: guoba |
| 2025-02-17 | `0fae49d5` | fix: adjust website tools; trim gemini intermediate response |
| 2025-02-17 | `41be6bef` | fix: github tool adjustment |
| 2025-02-17 | `0ad0e2d2` | feat: add github tool |
| 2025-02-17 | `84e7e6b8` | fix: adjust serp tool |
| 2025-02-17 | `95e776b3` | fix: 死循环 |
| 2025-02-17 | `3b58397a` | fix: 锅巴 |
| 2025-02-17 | `d29bfb0b` | fix: 增加强制工具关键词 看你还不听话 |
| 2025-02-17 | `b486b45f` | fix: adjust tools |
| 2025-02-16 | `d96349dd` | fix: 增加智能模式私聊开关 |
| 2025-02-16 | `777279e4` | fix: 工具调整 |
| 2025-02-16 | `08afc95f` | fix: 修复gemini禁言和提出对非管理员不生效的问题 |
| 2025-02-16 | `fcca28de` | fix: 修复前几天支持multiple tools导致的gemini搜了不发的问题 |
| 2025-02-16 | `213818b6` | fix: 修复搜索为空 |
| 2025-02-15 | `f619035e` | fix: 伪人限制开启上下文，不然笨死了 |
| 2025-02-15 | `c3eb8ac5` | fix: 聊天记录bug；删除日志 |
| 2025-02-15 | `9930e53a` | fix: 聊天记录重复的问题 |
| 2025-02-15 | `afa456f0` | fix: 错误过滤非文本消息的问题 |
| 2025-02-15 | `1911e5ca` | fix: 发癫一样的给bym私聊狂发图 |
| 2025-02-15 | `98d12951` | fix: error when gemini multiple functionCall in one response |
| 2025-02-15 | `69ff552d` | fix: 图片分开发送避免失败 |
| 2025-02-15 | `870eba51` | fix: 智障吧我是 |
| 2025-02-15 | `9f521064` | fix: 搜图工具增加yandex |
| 2025-02-14 | `88360ecc` | fix: 修复上下文聊天大于20时记录顺序错误的问题 |
| 2025-02-12 | `2ad77d81` | fix: 工具私聊 |
| 2025-02-12 | `4a3090c6` | fix: #760 |
| 2025-02-11 | `6d9c842a` | fix: bym也走智能模式配置 |
| 2025-02-10 | `b95bacc7` | fix: 看配置 |
| 2025-02-10 | `8249acaf` | fix: max token |
| 2025-02-07 | `dcc1a4eb` | feat: 伪人禁用群 (#758) |
| 2025-02-07 | `916e1082` | fix: 修改刷新copilot token间隔 |
| 2025-02-06 | `c1dd406b` | fix: task format |
| 2025-02-06 | `e67a1456` | fix: bing自动刷新；＜EMPTY＞匹配错误 |
| 2025-02-05 | `f9a6fafb` | fix: gemini empty text |
| 2025-02-05 | `d6563138` | fix: update refreshToken |
| 2025-02-05 | `ce4504e2` | fix: refresh bing token |
| 2025-02-04 | `d7d4acf3` | fix: 过码第二遍才生效的问题 |
| 2025-02-04 | `243331aa` | fix: 复活Copilot但有代价 |
| 2025-02-04 | `dcae426c` | fix: increase max token for api mode |
| 2025-02-04 | `e2242720` | fix: gemini system cannot be empty |
| 2025-02-03 | `bbba9bc8` | fix: 微调gemini识图，删除本地缓存 |
| 2025-02-03 | `f05da98d` | feat: add switch for thinking content forward |
| 2025-02-03 | `43fb6047` | fix: xh bym |
| 2025-02-03 | `6f3679b7` | fix: add '^#chatgpt(伪人｜bym)切换' |
| 2025-02-03 | `69ab6dcd` | feat: bym.js support multiple models |

### 2025-03（30 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2025-03-26 | `f521e0ed` | fix: history storage初始化 |
| 2025-03-26 | `4216e64e` | fix: history单独存 |
| 2025-03-26 | `fcbdf51e` | fix: read old config |
| 2025-03-25 | `089f6b63` | fix: 伪人错误记录历史的问题 |
| 2025-03-24 | `eb71222e` | fix: merge |
| 2025-03-24 | `c44e47be` | fix: bym conversation history |
| 2025-03-21 | `127ba6d3` | feat: update |
| 2025-03-21 | `2401c5ae` | fix: 对话id |
| 2025-03-21 | `d9b5d77d` | fix: 结束对话计算错误 |
| 2025-03-21 | `2fad5511` | trim text |
| 2025-03-21 | `e1c4de4c` | fix: recall |
| 2025-03-21 | `478080fe` | fix: bym history |
| 2025-03-20 | `66905640` | fix: 很多功能 |
| 2025-03-19 | `a711ec13` | fix: update chaite |
| 2025-03-18 | `66281fc5` | fix: add mimetype for claude |
| 2025-03-18 | `f8591eba` | fix: 图片读取 |
| 2025-03-18 | `3c77da53` | fix: 调试设定和伪人 |
| 2025-03-17 | `efb5a8f1` | fix: host port config |
| 2025-03-17 | `9fcc25a7` | feat: bym |
| 2025-03-16 | `6997d1e0` | fix: use latest chaite to enable dashboard |
| 2025-03-16 | `6ff0453f` | fix: lib version |
| 2025-03-16 | `eee1285e` | fix: 对接 |
| 2025-03-15 | `89ab58b3` | fix: 管理功能（wip） |
| 2025-03-14 | `d20974f2` | fix: todo |
| 2025-03-13 | `54806ee6` | fix: WIP |
| 2025-03-12 | `116479e3` | fix: config |
| 2025-03-11 | `a16538f3` | fix: chaite |
| 2025-03-10 | `fbcf4e6c` | feat: chaite 初始化逻辑 |
| 2025-03-05 | `88312cdf` | fix: gitignore |
| 2025-03-05 | `531986b2` | feat: init v3 |

### 2025-04（19 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2025-04-29 | `185f163c` | fix: system |
| 2025-04-28 | `a3c74f82` | triggers |
| 2025-04-16 | `c3b71273` | feat: file url |
| 2025-04-15 | `85d61ea2` | fix: 修改群聊提示词 |
| 2025-04-14 | `b30488bd` | fix: 对话错误问题 |
| 2025-04-13 | `51765fcf` | fix: tools group storage bug |
| 2025-04-10 | `f4fb3ddd` | fix: config 重复保存 |
| 2025-04-10 | `6b36552c` | fix: config error |
| 2025-04-10 | `3c83e270` | fix: generateId |
| 2025-04-10 | `64c77877` | fix: sqlite api |
| 2025-04-09 | `0c602d6c` | fix: history manager |
| 2025-04-09 | `1788ee6d` | fix: finally |
| 2025-04-09 | `fd197abb` | feat: use sqlite instead of lowdb |
| 2025-04-07 | `7431814d` | fix: reg |
| 2025-04-07 | `60f6ccb2` | feat: 状态 |
| 2025-04-07 | `fd40992c` | fix: 导入 |
| 2025-04-07 | `3318ac04` | fix: time |
| 2025-04-05 | `7be0e61e` | fix: chaite ver |
| 2025-04-05 | `5c1b74bf` | fix: cloud wip |

### 2025-07（1 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2025-07-04 | `602e192b` | fix: 整合多次思考 |

### 2025-08（3 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2025-08-26 | `db386cca` | Fix imageContent condition for base64 check |
| 2025-08-26 | `8a924f91` | Update message.js |
| 2025-08-26 | `dc1ab30b` | Enhance image processing logic in message.js |

### 2025-11（13 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2025-11-30 | `e6618888` | fix : 完善全部工具回调 |
| 2025-11-30 | `d4c8e092` | fix : 修复工具调用错误 |
| 2025-11-30 | `20ffcf6b` | fix : 修复记忆模块错误,修复工具回调错误 |
| 2025-11-30 | `c593d5f3` | fix : 修复主人获取api错误问题,修复模型配置问题 |
| 2025-11-30 | `12748f38` | fix : 修复嵌入模型导致的错误,优化代码与处理 |
| 2025-11-30 | `c05001f3` | fact : 优化错误处理,优化mcp与内置api,新增群聊记忆,移除构建资源上传 |
| 2025-11-30 | `10d437a9` | fix : 完善思考处理.支持关闭思考中实现,优化代码 |
| 2025-11-29 | `164b3410` | fix : 修复触发模式与流请求,修复前端样式 |
| 2025-11-29 | `2c726728` | update better-sqlite3@12.4.1 |
| 2025-11-29 | `f9cd7080` | fix : 优化mcp与前端 |
| 2025-11-27 | `dcece442` | fact : 完全重构插件前后端,重构插件逻辑 |
| 2025-11-08 | `4b1a66b6` | docs: add better-sqlite3 hint |
| 2025-11-07 | `8bfce540` | 试验性的记忆功能 (#812) |

### 2025-12（105 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2025-12-31 | `bd807eaf` | fact : 优化前端,将前端api服务分离,修复一些特性与功能 |
| 2025-12-31 | `59c5739e` | fix : 完善前端问题,修复部分情况下的异常渲染,完善功能性实现 |
| 2025-12-31 | `ea6aa0d6` | fix : 修复自定义前缀不生效问题,完善前端 |
| 2025-12-29 | `d155205d` | fix : 修复渠道在错误状态下直接返回空渠道导致的调用失败问题,增强调用处理与api错误记录 |
| 2025-12-29 | `ae3a80b9` | fact : 更新模型接口列表 |
| 2025-12-29 | `79fd0c22` | fix : 特性与功能修复 |
| 2025-12-28 | `958184f5` | fix : 兼容QQ原生表情获取 |
| 2025-12-28 | `2c9d3361` | fix : 修复渠道错误导致的请求null问题,优化调度策略 |
| 2025-12-28 | `37e64948` | fact : 兼容QQbot相关实现,优化细节 |
| 2025-12-27 | `5650067d` | feat: 完善模型调度与权限管理 |
| 2025-12-27 | `b485c1b6` | fix : 优化群聊总结提示词 |
| 2025-12-26 | `2b70a532` | fix : 细节优化，完善前端 |
| 2025-12-25 | `a8775f34` | feat(groups): 完善群组模型分类配置 |
| 2025-12-25 | `1ef94672` | fact : 优化模型调度实现,完善工具传递方法,完善细节优化 |
| 2025-12-24 | `f9a4e660` | fix: 修复会话上下文隔离和消息解析异常问题 |
| 2025-12-24 | `f55017e7` | fix : 修复表情切割异常问题 |
| 2025-12-24 | `363f1921` | feat(emoji-thief): 新增表情包小偷功能，支持群组独立配置和多触发模式 |
| 2025-12-24 | `31ab201f` | feat(bym): 支持群组独立伪人参数配置 ### 伪人模式群组配置增强 - 新增群组独立触发概率配置 (bymProbability) - 新增群组独立模型选择配置 (bymModel) - 新增群组独立温度参数配置 (bymTemperature) - 新增群组独立最大Token配置 (bymMaxTokens) - 配置优先级：群组配置 ＞ 全局配置 ＞ 默认值 - 优化日志输出，显示参数来源（群组/全局） |
| 2025-12-24 | `18e3e229` | eat(imagegen): 新增图片预处理和伪人群组配置增强 |
| 2025-12-24 | `c550d41c` | feat : 细节优化 |
| 2025-12-24 | `459f818a` | perf(core): 优化启动性能，美化系统日志 |
| 2025-12-24 | `5f6cf40d` | feat(frontend): 新增群组独立功能配置和今日词云功能 |
| 2025-12-24 | `34b561eb` | feat(frontend): 优化类型安全和代码规范，新增记忆总结命令 |
| 2025-12-23 | `ca9c6c0f` | feat(bym): 支持作用域预设和知识库继承 |
| 2025-12-23 | `b9271567` | fix: 修复适配器baseUrl和群组预设不生效的问题 |
| 2025-12-23 | `072e390b` | refactor(stats): 统一使用 StatsService 并优化渠道多 API Key 支持 |
| 2025-12-23 | `69322059` | feat(imagegen): 新增表情包自动切割功能和网格配置支持 |
| 2025-12-23 | `63874ee1` | feat(frontend): 优化使用记录和统计页面的请求日志展示 |
| 2025-12-22 | `02fe0841` | fix: 优化多轮工具调用限制 |
| 2025-12-22 | `04bc765f` | feat(frontend): 新增系统设置页面和优化提示词配置说明 |
| 2025-12-22 | `7c8cd2c7` | feat(frontend): 新增对话详情页面和优化对话列表导航 |
| 2025-12-22 | `f7898e7e` | fact : 完善工具 |
| 2025-12-22 | `e02477e5` | fix : 修复神秘glm在调用工具的时候返回的神秘json工具解析错误问题 |
| 2025-12-22 | `a21553a5` | eat(reaction): 完善NapCat表情回应事件支持和工具调用清理 |
| 2025-12-21 | `80c34688` | ''' feat(mcp): 新增主人消息和伪造转发工具，优化辅助函数 |
| 2025-12-21 | `77b7cefe` | feat(web): 优化Web服务器网络地址显示和前端安全认证 |
| 2025-12-21 | `968e70c8` | fix(tool): 完善工具调用JSON清理和参数验证逻辑 |
| 2025-12-20 | `cc8bb924` | fix(bym): 统一使用全局自动撤回配置替代独立撤回设置 |
| 2025-12-20 | `96ed0f37` | ''' feat(tool): 增强工具调用解析器,支持多种格式和自动修复 |
| 2025-12-20 | `03992b84` | feat(frontend): 优化移动端响应式布局和模型选择器体验 |
| 2025-12-20 | `35fa2014` | feat: 增强作用域管理和工具参数验证 |
| 2025-12-20 | `a32685e0` | fix : 修复绘图功能图片获取顺序问题,完善功能 |
| 2025-12-20 | `95a0a746` | feat: 添加免费小米MiMo API预设并更新GLM/Gemini模型列表 |
| 2025-12-20 | `cb50705b` | feat(tool): 添加扩展工具类别并完善项目文档 |
| 2025-12-20 | `776da99b` | fix: 修复工具解析和上下文配置问题 |
| 2025-12-20 | `90eb13d8` | fix(ci): 移除 --frozen-lockfile 参数修复构建失败 |
| 2025-12-20 | `141d804b` | feat(imagegen): 支持绘图预设的编辑和删除功能 |
| 2025-12-19 | `f8d8a90a` | feat: 增强事件系统和修复预设/记忆相关问题 |
| 2025-12-19 | `e6a7676d` | fix: 修复多个问题和优化 |
| 2025-12-19 | `871f7a6e` | fix : 完善ai声聊平台支持性,优化工具获取框架信息方法,完善画像与记忆生成方法 |
| 2025-12-18 | `a6b3cb06` | docs: 添加 GitHub 模板、贡献指南和 CI/CD 工作流 |
| 2025-12-18 | `4bf6b483` | fact : 完善基础注释,修复与增加功能,合并到公开仓库 |
| 2025-12-18 | `62b37fb3` | 清理个人配置文件，准备公测版本 |
| 2025-12-18 | `bcb9b562` | fix : 优化性能 |
| 2025-12-17 | `06be112b` | fix : 修复模块导入错误问题 |
| 2025-12-17 | `d2982dc7` | fix : 修复工具调用错误问题,修复命令处理优先级错误问题 |
| 2025-12-17 | `bdf8ee38` | fact : 完全重构核心服务,优化前端,优化工具与错误处理,完善mcp与相关示例,优化实现 |
| 2025-12-17 | `e37dc13b` | fix : 优化mcp,完善处理细节完善 |
| 2025-12-16 | `89afc966` | fix : 完善事件处理,支持自定义事件提示词,完善前端 |
| 2025-12-16 | `7c0cd58b` | fix : 修复被回应监听用户出错问题,修复极端情况下出现重复响应问题,修复工具调用错误问题 |
| 2025-12-16 | `890a24d3` | fix : 修复事件监听和处理问题 |
| 2025-12-16 | `9af02deb` | fix : 修复指定群组模型后获取问题 |
| 2025-12-16 | `424e49f4` | fix : 修复初始化错误问题,修复部分场景调用400问题,完善功能 |
| 2025-12-16 | `c9ac7887` | fix : 完善前端分类,优化工具处理与调用 |
| 2025-12-16 | `f6487f36` | fact : 完善工具与事件处理 |
| 2025-12-16 | `166570f3` | feat: 绘图预设管理系统重构 + 适配器完善 |
| 2025-12-15 | `abca49cb` | fix : 修复模型选择与保存错误问题,修复mcp传递问题 |
| 2025-12-15 | `d5538642` | fact : 优化mcp与功能,修复异常初始化问题 |
| 2025-12-15 | `3561c94c` | ''' feat: 新增画像功能与渲染服务,优化命令显示效果 |
| 2025-12-15 | `21bdf069` | fact : 优化前端样式,优化显示效果 |
| 2025-12-14 | `9b7478ab` | fix : 升级依赖版本,修复nextjs漏洞 |
| 2025-12-14 | `1bf18247` | fix : 修复前端解析与处理问题,完善知识库兼容,新增根提示词,支持覆盖与插入全局,完善工具与其他,优化渲染性能 |
| 2025-12-14 | `47e81d65` | fix : 补全工具解析 |
| 2025-12-14 | `8b11f2a4` | fix : 修复后端无法正常保存自定义入口问题 |
| 2025-12-14 | `83f309c3` | fact : 添加知识库功能,修复预设删除问题,修复些许特性与问题,优化工具加载与处理 |
| 2025-12-14 | `60179dab` | fix : 完善工具与命令 |
| 2025-12-14 | `c64fa100` | fix : 修复工具解析错误问题,完善处理 |
| 2025-12-14 | `6aae205e` | fix : 修复模型选择不能正确生效问题 |
| 2025-12-14 | `4ab56775` | fix : 修复思考处理异常问题,修复私聊模型选择问题,修复前端显示问题,修复群聊总结问题 |
| 2025-12-13 | `1e643e66` | fix : 完善前端,支持自定义模型,优化性能 |
| 2025-12-13 | `d477ca0f` | fix : 修复模型传递问题 |
| 2025-12-13 | `5730b24e` | fix : 修复登录url重定向与检测问题,添加代理配置与完善功能 |
| 2025-12-13 | `87f99bd4` | fix : 修复前端关键词无法删除问题,修复伪人判断概率出错问题 |
| 2025-12-13 | `d52698ce` | fix : 修复模型选择异常问题,完善画图与视频生成 |
| 2025-12-12 | `6db148ac` | fix : 修复群聊总结消息来源错误问题,修复私聊无法使用问题,修复触发对话导致的锁处理错误问题 |
| 2025-12-12 | `4c5ace0d` | fix 修复特性，修复ui，修复功能，然后还有什么不记得了 |
| 2025-12-11 | `d5d8cff4` | fix : 修复前端人设相关路由问题,修复部分问题 |
| 2025-12-10 | `50a69697` | fix : 修复总结无效问题,修复发起聊天有概率出现死锁问题,优化前端,完善功能 |
| 2025-12-10 | `6846b3c8` | feat: Next.js 前端重构 + 后端功能增强 |
| 2025-12-04 | `cc51552c` | fix : 修复触发问题,完善功能 |
| 2025-12-04 | `98e779f1` | fix : 修复自身响应重复触发问题,修复上下文切换问题,修复前缀导致的触发问题,修复系统功能不能正常触发的问题 |
| 2025-12-03 | `b5421a8f` | fix : 修复base64转换问题 |
| 2025-12-03 | `61341199` | fix : 修复gemini系列模型传递图片问题 |
| 2025-12-03 | `5442a114` | fix : 修复前缀优先级问题 |
| 2025-12-03 | `f108ec3d` | fix : 修复处理问题 |
| 2025-12-03 | `629fd142` | fix : 修复渠道处理 |
| 2025-12-03 | `77a261cf` | fix : 修复记忆管理,修复图片解析 |
| 2025-12-03 | `d4056188` | fix : 修复nc解析图片问题,优化前端功能与合并重复功能,优化功能描述 |
| 2025-12-03 | `f93e0f57` | feat: 优化前端管理面板，新增事件处理与工具管理功能 |
| 2025-12-02 | `ed68c1d8` | fix : 修复nc平台合并转发解析异常 |
| 2025-12-02 | `a3c2d495` | fix : 优化前端,支持语法高亮,测试性兼容chat v3工具格式,完善mcp相关实现 |
| 2025-12-02 | `c15352b0` | fix : 修复上下文混乱问题,修复工具调用问题,优化合并转发与引用消息处理问题 |
| 2025-12-01 | `27fd2197` | fix : 修复上下文与工具传递不准确问题 |
| 2025-12-01 | `66a7fdc3` | fix : 优化功能 |
| 2025-12-01 | `fa71ec6e` | fix : 修复模型调用工具问题,添加人格与范围设定问题 |

## 2026 年

### 2026-01（82 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2026-01-31 | `d3adc861` | fix :修复群管理面板获取入口未正确获取前缀问题 |
| 2026-01-31 | `5736cd24` | fix : 修复工具配置错误，添加工具需要的B站cookie配置 |
| 2026-01-31 | `3fbc1c28` | fix : 修复历史遗留的在trss环境下挂载路由到根路由以实现的端口共享，完善挂载实现 |
| 2026-01-31 | `a8b01c8f` | fact : 优化工具实现，拓展工具列表，拓展渠道，添加神秘bug中 |
| 2026-01-30 | `6c205589` | fix : 优化长文本输出处理，完善渲染，完善前端与文档 |
| 2026-01-29 | `336d8a79` | fix : 优化模块实现与日志，前端添加初始化引导与实现，完善基础实现与加载速度优化 |
| 2026-01-25 | `4671cfb0` | fact : 完善记忆与Skills相关，完善前端与基础设施，完善文档 |
| 2026-01-24 | `2466a294` | fix : 完善细节与前端 |
| 2026-01-23 | `e64afaa8` | fix(docs) : 完善文档，细化实现 |
| 2026-01-23 | `be90e483` | fix : 完善部分页面样式，伪人功能性优化 |
| 2026-01-21 | `e6c5c8b8` | fix : 完善管理面板实现，添加额外内置渠道，细节优化 |
| 2026-01-17 | `7097ba3e` | fix : 优化启动日志 |
| 2026-01-17 | `e50ca048` | fact : 添加版本相关的管理，优化实现 |
| 2026-01-17 | `58c814eb` | fix : 完善前端渲染，优化主动发送实现与概率判断，优化工具实现 |
| 2026-01-16 | `10c3d198` | fix : 完善前端搜索索引，优化主动发送的判断与概率计算，测试性支持自动总结并结束对话 |
| 2026-01-16 | `8efac109` | fix : 完善主动消息实现 |
| 2026-01-16 | `cb9ccd9f` | fix : 完善自定义路由配置保存，支持主动对话，修复部分问题 |
| 2026-01-15 | `a7809740` | fix : 修复部分问题，完善实现，支持自定义对话与模型获取路由 |
| 2026-01-15 | `26d08a25` | fix : 优化前端样式，支持模型重定向，完善模型显示，重构记忆模块实现，优化模型icon显示 |
| 2026-01-14 | `cdff4336` | fix : 优化前端样式，适配手机端展示效果 |
| 2026-01-14 | `6c8a5e39` | fact : 支持定时任务，完善工具实现 |
| 2026-01-13 | `d13b56d3` | fix : 修复工具测试页面会出现的崩溃问题 |
| 2026-01-13 | `30f7be70` | fix : 修复外部工具没有记录日志的问题，修复前端工具测试页面无法显示与点击的问题 |
| 2026-01-13 | `25ba6dc9` | fix : 完善文档与readme |
| 2026-01-13 | `aa22465e` | fix : 优化MCP管理页面，优化工具测试页面 |
| 2026-01-13 | `2e11ab3a` | fix : 完善SSE MCP工具兼容，完善前端，优化文档 |
| 2026-01-12 | `e91b2c3a` | fact : Skills Agent实现，完善兼容 |
| 2026-01-12 | `ce1d1fd9` | fact : 优化群聊总结样式，修复结束对话处理 |
| 2026-01-12 | `99fe6ffb` | fix : 应该是修复了pb发包解码实现 |
| 2026-01-12 | `390f79ce` | fix : 修复工具上下文参数信息，优化工具实现 |
| 2026-01-12 | `327ac9dd` | fix : 修复绘图预设保存问题，支持使用临时消息发送登录链接 |
| 2026-01-12 | `412f7130` | fix:shell主人权限判断 |
| 2026-01-12 | `24149da7` | fix(messageParser): 修复pb解码顺序问题 |
| 2026-01-12 | `8850baa0` | fix: sse收到的消息不打印ping返回的内容 |
| 2026-01-12 | `e73ac279` | fix(mcp): 不再打印sse的ping日志 |
| 2026-01-12 | `70914d88` | fix(send＿private＿message): 过滤掉QQBot |
| 2026-01-11 | `9387d3bf` | fix : 修复文件热重载问题 |
| 2026-01-11 | `8a43ba7f` | fix : 优化私聊发送工具判断 |
| 2026-01-11 | `12868788` | fact : 修复部分图片获取，优化工具 |
| 2026-01-11 | `e4cf9831` | fix : 修复很多，不知道还有啥大问题，添加n++ bug |
| 2026-01-11 | `d0412e62` | style: 格式化前端和插件 |
| 2026-01-11 | `f8bd3b91` | style: 添加preetier husky lint-staged 在提交时自动格式化代码 |
| 2026-01-11 | `16d59e69` | style(admin): Standardize code formatting and indentation |
| 2026-01-11 | `e82fb477` | fix(groupStats): Standardize speak rank API response parsing and field mapping |
| 2026-01-11 | `198db33e` | fix(groupStats): Correct consecutive＿days field mapping for dragon king stats |
| 2026-01-11 | `641d9024` | feat(mcp): 优化群统计工具和MCP客户端日志输出 |
| 2026-01-11 | `9b02096e` | fix(mcp): 统一logger导入方式和标签设置 |
| 2026-01-11 | `a7d91f79` | fix: 修正logger导入路径 |
| 2026-01-11 | `d3b1a915` | fix: 导入logger到helpers和groupStats |
| 2026-01-11 | `57acab2b` | feat: 添加系统提示词表达式支持和debug输出 |
| 2026-01-11 | `6b04afe0` | refactor: 将群统计相关工具从group.js移动到groupStats.js |
| 2026-01-11 | `4f79630b` | feat(mcp): 添加群统计工具模块 |
| 2026-01-11 | `812291e5` | fix(mcp): 优化管理工具支持批量禁言和踢人功能 |
| 2026-01-10 | `e5072573` | fix : 修复工具导入问题，完善总结实现，优化工具 |
| 2026-01-10 | `549f9777` | fix(mcp): 优化MCP客户端SSE连接和请求处理逻辑 |
| 2026-01-10 | `e1c4663a` | fix(mcp): 修复MCP服务器配置管理和多Bot环境适配问题 |
| 2026-01-09 | `3795aef4` | fix : 修复定时总结全局任务注册错误问题，修复伪人对话传递异常问题 |
| 2026-01-09 | `b98f17e2` | fix : 工具实现修复 |
| 2026-01-09 | `bbf63100` | fix : 修复tts工具部分校验问题 |
| 2026-01-09 | `41444870` | fix : 完善readme，优化样式 |
| 2026-01-09 | `1c2cc1d8` | fix : 完善前端样式，添加删除样式与全局搜索框 |
| 2026-01-09 | `dbfd0e01` | fix : 修复定时总结样式异常，修复清理记忆失败的问题，修复伪人模式下上下文传递问题 |
| 2026-01-09 | `f43fa339` | fix : 优化前端批量测试样式 |
| 2026-01-08 | `bf48483c` | fix : 修改群独立管理字段不足问题，修复权限判断不严谨问题 |
| 2026-01-08 | `d497c69a` | fix : 修复预设404问题 |
| 2026-01-08 | `6a263ff1` | fix : 优化实现，完善功能 |
| 2026-01-08 | `ca60c3e2` | fix : 完善基础实现与功能，移除全部调度相关实现，由对话暂时接管全部工具与对话 |
| 2026-01-08 | `39c81007` | fix : 重构工具上下文实现，预览推送 |
| 2026-01-07 | `c71f465c` | fix : 优化前端构建（此版本为预构建测试，请勿升级） |
| 2026-01-05 | `9c54472a` | fix : 修复画像出现的绘制异常 |
| 2026-01-05 | `adbbd243` | fix : 修复部分兼容性问题,完善模型调度与处理,优化图片绘制实现 |
| 2026-01-04 | `1aedf8ee` | Update installation instructions in README.md |
| 2026-01-04 | `63804586` | fix : 优化工具调度逻辑，完善处理与判断 |
| 2026-01-04 | `cf6399b8` | fix : 优化身份验证、聊天上下文和数学检测 - 从身份验证中间件中删除指纹/签名验证，同时保持令牌登录流程不变 - 支持 skipPersona，为工具调度提供更丰富的历史记录，并扩展任务历史记录查询，以便调度/图片/工具/搜索/对话流程看到更多上下文 - 提升 RenderService 的数学检测启发式算法和格式化，以避免将普通文本误分类 |
| 2026-01-03 | `0fea3cd4` | fix : 修复部分浏览器无法正确校验签名问题,修复总结错误问题 |
| 2026-01-03 | `0d7b6815` | fix : 修复取引用解析错误 |
| 2026-01-03 | `f966ae37` | fix : 添加ipv6入口自动获取功能 |
| 2026-01-03 | `fe7d782b` | fix : 修复群聊上下文错误处理问题,修复前端内置预设不能正确配置问题,修复群聊总结错误使用人设问题,完善功能,合并特性修复 |
| 2026-01-02 | `afe32a45` | fact : 支持共享TRSS端口启动.支持自动监听更新并自动化重启插件,优化部分错误实现 |
| 2026-01-01 | `4182ca3f` | fix : 修复预设保存导致的401错误 |
| 2026-01-01 | `19a09e93` | fact : 添加输出包含数学公式时自动将输出转化为图片并渲染发送，优化上下文人格人设切换与读取问题 |
| 2026-01-01 | `c791c1eb` | fix : 修复人设在工具执行后不能正确传递与获取，修复高级设置未能正确保存问题 |

### 2026-02（31 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2026-02-21 | `36973f1c` | feat: 完善绘图模块渠道配置 |
| 2026-02-16 | `df6c2df8` | fix : 修复bym的定义问题 怎么老是坏 |
| 2026-02-16 | `8d1a362d` | fix(bym): 提前获取群组ID以避免作用域管理器初始化错误 |
| 2026-02-14 | `ddd6c5bc` | feat: 支持群组多独立渠道配置，优化渠道选择逻辑 |
| 2026-02-13 | `385fca62` | docs: 更新 SQLite 原生模块构建方法说明 |
| 2026-02-13 | `bfc57456` | feat: 字符上限检查优化 |
| 2026-02-13 | `fd4f03d6` | feat: 前端页面过渡优化 ＆ 添加前端自动构建工作流 |
| 2026-02-12 | `4c902b31` | feat: 新增渠道字符上限配置，优化消息历史管理 |
| 2026-02-11 | `fef3263e` | fix ： 渠道转换问题修复 |
| 2026-02-11 | `bc13c807` | feat: 绘图结果发送方式支持多种方法 |
| 2026-02-11 | `8615ef48` | fix: 适配器自定义请求体的问题 |
| 2026-02-11 | `189733c3` | feat: 新增绘图服务和QQ空间工具，修复icqq兼容性和工具自动启用 |
| 2026-02-10 | `5be136d2` | fix: 绘图功能四项修复 - 独立模型配置/帮助开关/合并转发/GIF预处理 |
| 2026-02-07 | `a2bcbf50` | feat: 添加全局错误处理组件和仪表板错误处理组件，优化加载指示器 |
| 2026-02-07 | `0de4f32d` | fix : 测试性修复NC平台合并转发问题 |
| 2026-02-06 | `a9d0c04f` | fix : 游戏模块功能性优化 |
| 2026-02-06 | `0cc94787` | fix : 功能细节优化 |
| 2026-02-04 | `137b3620` | fix : 修复在线编辑的部分问题 |
| 2026-02-04 | `6608d571` | fact : 升级netxjs版本，修复低版本漏洞 |
| 2026-02-04 | `cbce36cc` | fact : 优化游戏模式交互，支持表情回应与自然语言回复选项，完善上下文与处理 |
| 2026-02-04 | `a3f6dc1a` | fix : 优化群管理与面板入口发送逻辑 |
| 2026-02-03 | `5418b0e8` | fix: use pause icon for game exit command and add package-lock.json to .gitignore |
| 2026-02-03 | `ca6e5593` | fix: only show configured public URL in #群管理面板 and fix game command names in help |
| 2026-02-03 | `5e46fc75` | fix : 修复日志等级错误问题 |
| 2026-02-03 | `f6acd736` | feat: 添加帮助图片渲染功能，支持三列网格布局 |
| 2026-02-03 | `fb190f21` | feat : 新增游戏模块，支持角色对话、事件系统与好感度机制 |
| 2026-02-03 | `29856358` | fact : 完善工作流，添加在线文档地址 |
| 2026-02-03 | `add8e710` | fix : 重构定时任务，优化工具实现与配置 |
| 2026-02-01 | `76ebf23d` | fix : 修复进退群事件处理问题 |
| 2026-02-01 | `ec5fa422` | fact : 完善工具索引，拓展工具列表 |
| 2026-02-01 | `3ddd22a8` | fact : 新增新的群聊总结格式，使用#群聊总结2来进行测试 |

### 2026-03（7 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2026-03-27 | `409a8a36` | fix : 修复渠道地址解析错误问题 |
| 2026-03-20 | `8e26fc7d` | fact : 支持多baseurl提供商，完善适配器支持 |
| 2026-03-20 | `0dfd92c5` | fix : 修复思考等级不可定义问题，修复工具调用前权限判断问题 |
| 2026-03-16 | `d12e8afe` | fix : 模块细节优化 |
| 2026-03-04 | `3d28a366` | fix : 修复绘图模块渠道选择错误与提示词丢失问题 |
| 2026-03-02 | `08ee738a` | fix : 特性问题修复 |
| 2026-03-01 | `8dc8105a` | fix : 修复#30中的模型使用不准确问题，细节优化 |

### 2026-04（3 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2026-04-20 | `759a42b4` | fix: 修复定时总结发送方式不为图片问题 |
| 2026-04-19 | `1d8abe2e` | fix: 部分细节补全优化 |
| 2026-04-06 | `43805871` | feat: 优化工具实现，细节优化 |

### 2026-05（10 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2026-05-17 | `6623e35e` | feat: 细节优化，更新适配器支持 |
| 2026-05-12 | `41b8fe85` | fix: 修复群管理面板登录鉴权错误问题 |
| 2026-05-12 | `ea83504f` | feat: 修复工具参数错误问题，修复画像总结消息获取来源错误问题，细节优化 |
| 2026-05-12 | `2a7eb30d` | fix: 修复魔搭社区MCP兼容性，增强部分情况下的工具调用错误或者重复调用问题，修复部分情况下的重复响应问题 |
| 2026-05-11 | `bf57dfab` | feat: 增强适配器兼容性，完善部分情况下出现的工具错误识别问题，细节优化 |
| 2026-05-10 | `74c6d7f5` | fix: 补传文件 |
| 2026-05-10 | `0cacfaf9` | feat: 更新工具作用域配置，修复部分潜在的问题 |
| 2026-05-10 | `3ec5de4c` | feat: 支持response接口规范，测试性支持response的websocket规范格式，修复部分潜在问题 |
| 2026-05-10 | `26d31b10` | feat: 支持moda社区MCP格式 |
| 2026-05-09 | `bb39afb8` | Refactor hash command check in chat.js |

### 2026-06（3 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2026-06-24 | `cc3ef880` | fix: 修复图片转换处理实现 |
| 2026-06-20 | `68007b7e` | feat: 修复部分api场景下传递了不支持的系统消息角色导致的调用出错问题，支持自定义系统角色，修复模型会出现工具调用处理错误的问题 |
| 2026-06-08 | `aff45363` | feat: 重构适配器Skills支持，重构OpenAi适配器，优化细节，完善前后端api功能 |

### 2026-07（9 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2026-07-28 | `16afee17` | feat: 增加动态标签管理功能，支持用户动态标签的解析、应用和上下文构建；优化超时设置和消息去重逻辑 |
| 2026-07-28 | `6ad0b4fd` | fix: 优化 RedisClient 连接状态检查，确保在调用前验证可读写状态；改进 UsageStats 错误处理和统计逻辑 |
| 2026-07-27 | `30b0508b` | fix: restore authenticated state endpoint |
| 2026-07-26 | `edda6cca` | feat: implement session bypass expiration and management in ToolApprovalService |
| 2026-07-19 | `a23d6bb5` | feat: 更新统计接口，增加今日统计数据返回；优化全局中间件处理逻辑 |
| 2026-07-18 | `e330cb58` | feat: 修复部分参数编码错误问题 |
| 2026-07-15 | `fa992ea1` | feat: 添加温度解析模块，支持渠道和模型级温度覆盖配置 |
| 2026-07-12 | `1bdddd2d` | feat: 新增错误通知服务并集成聊天错误处理 |
| 2026-07-05 | `7a506ae8` | feat: 添加MCP超时配置，支持streamable-http类型，优化SSE响应处理 |

### 2026-08（1 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2026-08-31 | `d963dc56` | feat: 重构适配器设置，增加对QQbot适配器的兼容，修复部分工具接口错误的问题 |

### 2026-09（13 条）

| 日期 | 提交 | 变更 |
| --- | --- | --- |
| 2026-09-18 | `4e80c318` | feat: 增强图像处理功能，支持根据客户端类型转码图片，优化错误日志记录 |
| 2026-09-18 | `5dda3ef2` | feat: 修复记忆相关的实现，完善插件功能，完善知识图谱模块 |
| 2026-09-17 | `069393cf` | feat: 优化群聊消息处理逻辑，增强低质量记忆清理功能 |
| 2026-09-17 | `09e0e76f` | feat: 修复适配器兼容，新增知识图谱工具 |
| 2026-09-16 | `6e9d9a25` | fix: repair Canvas Markdown rendering and add 2x resolution |
| 2026-09-14 | `5aeb3c45` | fix: preserve inline images across adapters |
| 2026-09-14 | `ccbb6a35` | fix: handle inline base64 image references |
| 2026-09-14 | `ee7a6fa1` | feat: 重构渲染层为canves，组件细节优化 |
| 2026-09-13 | `8254f39a` | feat: 更新依赖项 |
| 2026-09-12 | `f8a2ec25` | feat: 优化私聊触发逻辑，支持多种触发模式 |
| 2026-09-12 | `5351e7d7` | feat: 独立私聊和群聊黑白名单 |
| 2026-09-04 | `21905869` | feat: 优化消息转发逻辑，支持通过目标适配器构建转发消息，改进消息序列化处理 |
| 2026-09-01 | `1192a07b` | feat: 修复QQbot适配器下的群聊消息上下文丢失问题，支持内置索引获取历史消息，修复了消息缓存的逻辑 |
