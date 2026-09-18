# 更新日志

本文档记录 ChatAI Plugin 的版本更新历史。

## 2026-09 未发布

> 以下变更已完成开发与验证，尚未随正式版本发布。

### 修复

- 🐛 **协议 tool_call ID 归一化修复** - 旧数据与部分上游中转站将数组下标当作工具调用 ID 下发（数字型 `tool_call id`），OpenAI 兼容端点在请求校验时直接报 400/500。新增 `src/core/adapters/tooling.js` 的 `generateDeterministicToolCallId`（工具名+参数哈希，Gemini 无原生 id 场景使用）与 `normalizeAnyToolCallId`（统一 ID 字符串化口径，空值兜底随机 UUID），并接入 `openai/converter.js` 的 `tool_calls[].id`/`tool_call_id` 出口、`OpenAIClient` 的 `getResponsesOutputItemKey`/`call_id`、`AbstractClient` 全部 6 处工具结果兜底（`normalizeToolCallIdForResult`）及 `ToolApprovalService`
- 🐛 **Gemini `functionResponse.name` 400 修复** - `gemini/converter.js` 的 `functionResponse.name` 改为多元兜底 `resolveToolResultName`，绝不负空名；不再静默丢弃无 name 的结果 part；functionCall 的 id（含流式）改用确定性 ID
- 🐛 **at 触发失效修复（多协议兜底）** - `apps/chat.js` 的 `checkTrigger` 补齐 icqq/TRSS（`e.atBot` + at 段 `qq`/`data.qq`）与 QQBot 官方（at 段 `data.user_id`）、`e.atme`、`data.all`（@全体）判定；botId 兜底链 `e.self_id → e.bot.uin → e.bot.self_id → globalThis.Bot.uin`；修复「纯 @ 无文本」与 `replyBot` 组合真值表误吞消息的问题（清理后为空但原始文本非空时回退原文）
- 🐛 **渠道禁用后模型仍出现在可用列表** - 后端 `groupAdminRoutes.js` 聚合渠道时过滤 `enabled === false`；前端 `useConfig.ts`、群编辑器、`group-admin/page.tsx`、用户页、`imagegen/page.tsx` 等全部聚合点同步过滤
- 🐛 **hard 参数恒 false 修复** - `memoryRoutes.js` 的 `DELETE /user/:userId` 与 `DELETE /:id` 修复 `hard === 'true'` 查询参数恒为 false 的问题，兼容 `'1'`，硬删除语义可用
- 🐛 **前端 lint 阻塞构建修复** - eslint-config-next 16.0.8（eslint-plugin-react-hooks 7.x）新规则使 57 处存量 effect 代码报错阻塞 `bun run build`；按 44 个文件逐条重构（初始值冗余置位删除 / 缓冲变量+finally / sync 迁移 setTimeout / IIFE 包裹），未改 eslint 配置、未加 eslint-disable，`bun run lint`/`typecheck`/`build`/`export` 全绿

### 改进

- ⚡ **LlmDelegate 旁路调用统一委托** - 新增 `src/services/llm/LlmDelegate.js`：记忆、知识图谱、上下文总结等旁路 LLM 调用统一遵循渠道 `advanced.streaming`、错误分类上报渠道冷却、渠道切换与指数退避重试；`fallback.enableChannelSwitch` 可关闭渠道切换
- ⚡ **记忆总结结构化输出** - `MemorySummarizer` 的 `SUMMARY_PROMPT` 改为 `[分类] 内容` 结构化行硬约束（分类白名单 profile/preference/event/relation/topic/custom），显式禁止推理/解释/分析；解析器双通道（分类行白名单直接采信 + 自由文本三关过滤），修复思考过程文本整行入库的坏数据问题，并同步覆盖 `MemoryManager` 轮询总结旧表路径
- ⚡ **工具轮数限制重构** - `AbstractClient.updateToolCallTracking` 增加简化签名与 exactRepeated 判定；连续重复 3 次或达到 soft 上限（gemini 6 / 非 gemini 10）才 `toolChoice:none` 软降级；硬上限放宽至 `maxRoundsHard=60`
- ⚡ **工具调用中间句回传** - 无文本纯工具轮次回复轻量提示（`正在调用……`），`ChatAgent` 补齐 `requestOptions` 回调继承，中间文本不再丢弃
- ⚡ **清理与总结门槛优化** - 总结接口接入 `cleanup` 参数；新增 `POST /api/memory/user/:userId/cleanup`（低质量记忆清理端点）；LLM 总结门槛由桶内 >5 降至桶内 >2 且分类累计 ≥5

### 新增

- ✨ **知识图谱工具集** - 新增 `src/mcp/tools/knowledgeGraph.js` 共 12 个 `kg_*` 工具（`kg_get_knowledge` / `kg_list_entities` / `kg_search_entities` / `kg_save_entity` / `kg_update_entity` / `kg_delete_entity` / `kg_entity_history` / `kg_entity_relations` / `kg_save_relation` / `kg_delete_relation` / `kg_query_subgraph` / `kg_stats`），默认启用该类别；`preserveTargetId` 归一化各协议 user/group 标识，读写两侧一致
- ✨ **引导模型主动记忆** - `ChatAgent._addToolPrompt` 注入 `KNOWLEDGE_GRAPH_TOOL_GUIDE`，模型发现新记忆时可主动调用 `kg_save_entity` / `save_user_memory`
- ✨ **渲染全面 Canvas 化** - 渲染由 Puppeteer 迁移至 `src/services/media/canvasRenderer.js`（`@napi-rs/canvas` + `mathjax-full`），`renderMarkdownToImage` 改名为 `renderMarkdownToCanvas`，删除 puppeteer/marked 链路并移除 katex 直接依赖

---

## [1.3.0] - 2026-07

### 新增

- ✨ **Skills 文件系统** - `SkillDocumentLoader` 支持扫描 `SKILL.md`、`*.skill.yaml`、`*.skill.json` 三种格式；可配置扫描路径 `paths`、递归深度 `maxDepth`（默认 6）、单文件大小上限 `maxFileBytes`（默认 64KB），并按真实路径去重避免软链接重复加载
- ✨ **Skills 懒加载机制** - `SkillsLoader` 区分 `exposedSkills`（仅暴露名称+描述的技能清单）与 `loadedSkills`（已完整注入会话上下文的技能），按需加载完整技能内容，降低上下文占用
- ✨ **Skills 内置工具** - 新增 `list_skills`（列出可用技能）、`load_skill`（按名称加载技能到当前会话）、`get_skill_info`（查看技能详情）三个内置工具
- ✨ **上下文压缩** - `ContextManager` 支持三种压缩策略：`summarize`（总结压缩，默认）、`truncate`（截断）、`sliding-window`（滑动窗口）；按 Token 阈值（`compressionThreshold` 默认 0.8）或消息数阈值触发
- ✨ **压缩后 Skills 自动重注入** - 上下文压缩后通过 `reinjectSkills` 自动将已加载技能重新注入，避免压缩丢失技能约束
- ✨ **错误通知服务（ErrorNotifier）** - API 错误时统一通知，支持群聊、私聊主人（`admin.masterQQ`）两类通知目标，基于 `cooldownMap` 按错误类型冷却去重（默认冷却 60 秒），已集成至聊天错误处理链路
- ✨ **SSE 工具测试** - 工具测试改为 SSE 模式，防止长耗时请求导致前端超时或 UI 挂起
- ✨ **MCP 超时配置** - 支持 `streamable-http` 传输类型，新增细分超时配置（`connect`/`request`/`sseConnect`/`sseEndpoint`/`startup`/`ping`/`heartbeat`/`terminate`），兼容旧版 `timeout` 单字段

### 改进

- ⚡ **适配器 Skills 支持重构** - 重构 OpenAI 适配器，完善前后端 API 功能
- ⚡ **前端渲染修复** - 工具测试页自适应缩放，修复多处页面渲染错位问题
- ⚡ 嵌套模型选择器 Dialog，避免关闭内层时误关外层渠道表单

### 修复

- 🐛 **Debug 模式错误信息保留** - API 错误时在抛出前同步 `switchChain`、`totalRetryCount`、`channelSwitched` 等 debug 信息，避免 debug 信息丢失
- 🐛 修复部分 API 场景下传递了不支持的系统消息角色导致的调用出错问题，支持自定义系统角色
- 🐛 修复模型出现工具调用处理错误的问题
- 🐛 修复图片转换处理实现

---

## [1.2.0] - 2026-02

### 新增
- ✨ 新增群聊总结格式（使用 `#群聊总结2` 测试）
- ✨ 拓展工具列表和工具索引
- ✨ 添加 B 站 cookie 配置支持

### 修复
- 🐛 修复进退群事件处理问题
- 🐛 修复群管理面板前缀获取问题
- 🐛 修复 TRSS 环境端口共享挂载问题

---

## [1.1.0] - 2026-01

### 新增
- ✨ **Skills Agent 实现** - 统一技能代理层
- ✨ **主动对话功能** - 支持 AI 主动参与群聊
- ✨ **定时任务支持** - 群聊定时总结推送
- ✨ **群统计工具模块** - 发言排行、龙王统计等
- ✨ **版本管理** - 支持版本检查和更新通知
- ✨ **系统提示词表达式** - 动态变量支持
- ✨ 自动总结并结束对话功能
- ✨ 自定义对话与模型获取路由
- ✨ 模型重定向支持
- ✨ 临时消息发送登录链接
- ✨ 批量禁言和踢人功能

### 改进
- ⚡ 优化长文本输出处理和渲染
- ⚡ 前端添加初始化引导
- ⚡ 加载速度优化
- ⚡ 完善记忆模块实现
- ⚡ 优化 MCP 客户端 SSE 连接
- ⚡ 优化前端样式，适配手机端
- ⚡ 优化主动发送概率判断
- ⚡ 完善 SSE MCP 工具兼容
- ⚡ 优化群聊总结样式
- ⚡ 优化工具调度逻辑
- ⚡ 添加 Prettier + Husky 代码格式化

### 修复
- 🐛 修复伪人模式上下文传递问题
- 🐛 修复定时总结任务注册错误
- 🐛 修复工具上下文参数信息
- 🐛 修复绘图预设保存问题
- 🐛 修复 pb 发包解码问题
- 🐛 修复文件热重载问题
- 🐛 修复外部工具日志记录
- 🐛 修复工具测试页面崩溃
- 🐛 修复 TTS 工具校验问题
- 🐛 修复清理记忆失败问题
- 🐛 修复预设 404 问题
- 🐛 修复画像绘制异常
- 🐛 修复渠道错误状态处理
- 🐛 修复浏览器签名校验问题
- 🐛 修复引用解析错误

---

## [1.0.0] - 2024-12

### 新增

- 🎉 全新架构设计
  - 基于 MCP 协议的工具系统
  - Skills Agent 技能代理层
  - 模块化分层架构

- 🤖 多模型支持
  - OpenAI (GPT-4o, GPT-4, GPT-3.5)
  - Anthropic Claude (Claude 3.5, Claude 3)
  - Google Gemini (Gemini 2.0, Gemini 1.5)
  - DeepSeek, Moonshot 等兼容 API

- 🔧 MCP 工具系统
  - 内置工具（基础、用户、群组、消息、媒体、网络）
  - 自定义 JS 工具支持
  - 外部 MCP 服务器接入（npm/stdio/SSE/HTTP）
  - 工具热重载

- 🧠 长期记忆
  - 基于向量数据库的语义检索
  - 用户/群组/全局记忆
  - 自动记忆识别与保存

- 💬 对话管理
  - 多种上下文清理策略
  - 对话持久化
  - 引用消息解析

- 🎨 Web 管理面板
  - 现代化 UI 设计
  - 渠道/预设/工具可视化配置
  - 群组独立配置
  - 实时状态监控

- 🔒 安全控制
  - 危险工具管控
  - 管理员权限工具
  - 预设级工具过滤
  - 调用日志审计

### 改进

- ⚡ 性能优化
  - 并行工具执行
  - 工具结果缓存
  - 流式响应支持

- 📝 文档完善
  - VitePress 文档站点
  - 完整的 API 参考
  - 工具开发指南

---

## 版本规划

### 即将推出

- [ ] 图片生成增强
- [ ] 语音对话支持
- [ ] 插件市场
- [ ] 更多 MCP 服务器预置
---

## 贡献者

感谢所有为项目做出贡献的开发者！

---

## 反馈

如果你有任何问题或建议，欢迎：
- 提交 [GitHub Issue](https://github.com/XxxXTeam/chatai-plugin/issues)
- 参与 [Discussions](https://github.com/XxxXTeam/chatai-plugin/discussions)
