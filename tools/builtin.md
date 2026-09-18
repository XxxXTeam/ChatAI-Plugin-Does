# 内置工具 <Badge type="info" text="25 Categories" />

内置工具是插件核心功能的一部分，位于 `src/mcp/tools/` 目录，由 `BuiltinMcpServer` 管理。

::: tip 工具管理
通过 Web 面板可以按类别启用/禁用工具，支持**热重载**无需重启。
:::

## 目录结构 {#directory}

::: details 完整目录结构（点击展开）
```
src/mcp/tools/
├── index.js         # 工具加载器（动态导入、类别管理）
├── helpers.js       # 工具辅助函数（参数校验、权限检查）
├── basic.js         # 基础工具
├── user.js          # 用户信息
├── group.js         # 群组信息
├── message.js       # 消息操作
├── admin.js         # 群管理
├── groupStats.js    # 群统计
├── file.js          # 文件操作
├── media.js         # 媒体处理
├── web.js           # 网页访问
├── search.js        # 搜索工具
├── utils.js         # 实用工具
├── memory.js        # 记忆管理
├── context.js       # 上下文管理
├── bot.js           # Bot信息
├── voice.js         # 语音/声聊
├── extra.js         # 扩展工具
├── shell.js         # 系统命令（⚠️危险）
├── nlSchedule.js    # 定时任务（toolModules 键为 schedule）
├── bltools.js       # 扩展工具集
├── reminder.js      # 定时提醒
├── imageGen.js      # 绘图服务
├── qzone.js         # QQ空间/说说
├── emoji.js         # 表情包管理
├── skills.js        # Skills 技能管理
└── knowledgeGraph.js # 知识图谱
```
:::

## 工具类别（25个）{#categories}

::: info 类别说明
类别键、模块文件与导出名一一对应 `src/mcp/tools/index.js` 的 `toolModules` 表，
共 25 类。以下「名称」列取自同文件 `categoryMeta` 的中文显示名；「工具数」为
当前源码实际导出数量（动态导入统计）。
:::

| 类别 | 模块文件 | 名称 | 工具数 | 说明 | 风险等级 |
|:-----|:---------|:-----|:------:|:-----|:--------:|
| `basic` | `basic.js` | 基础工具 | 9 | 时间/农历/节日、sleep/echo、环境、工具列表、数字格式化 | 🟢 安全 |
| `user` | `user.js` | 用户信息 | 9 | 用户资料、好友关系、头像、点赞、发送者信息 | 🟢 安全 |
| `group` | `group.js` | 群组信息 | 10 | 群信息/成员/管理员/公告/搜索 | 🟢 安全 |
| `message` | `message.js`（messageTools + forwardDataTools） | 消息操作 | 37 | 发消息、@、聊天记录、合并转发、撤回、协议包 | 🟡 中等 |
| `admin` | `admin.js` | 群管理 | 19 | 禁言、踢人、设群名片/头衔/公告、加群申请、退群 | 🟠 较高 |
| `groupStats` | `groupStats.js` | 群统计 | 14 | 群星级、龙王、打卡、发言榜、幸运字符、荣誉 | 🟢 安全 |
| `file` | `file.js` | 文件操作 | 29 | 群文件上传下载、本地文件读写、URL下载、OCR | 🟠 较高 |
| `web` | `web.js` | 网页访问 | 2 | 动态渲染访问（website）、只读 HTTP（fetch_url） | 🟡 中等 |
| `memory` | `memory.js` | 记忆管理 | 5 | save/get/search/delete/update_user_memory | 🟢 安全 |
| `context` | `context.js` | 上下文管理 | 6 | 会话/群聊上下文、回复消息、@列表、清除对话 | 🟢 安全 |
| `media` | `media.js` | 媒体处理 | 18 | 图片/视频/骰子/音乐/分享/QQ表情/二维码/下载 | 🟢 安全 |
| `search` | `search.js` | 搜索工具 | 17 | 搜索、百科、翻译、天气、热搜、笑话、油价 | 🟢 安全 |
| `utils` | `utils.js` | 实用工具 | 25 | 计算、编码、正则、文本处理、密码、抽签 | 🟢 安全 |
| `bot` | `bot.js` | Bot信息 | 8 | 登录信息、状态、版本、在线客户端、头像、机型 | 🟢 安全 |
| `voice` | `voice.js` | 语音/声聊 | 16 | AI声聊、TTS、语音识别、语音文件操作 | 🟢 安全 |
| `extra` | `extra.js` | 扩展工具 | 6 | 一言、骰子、随机选择、短链、IP、插画 | 🟢 安全 |
| `shell` | `shell.js` | 系统命令 | 4 | 执行命令、系统信息、进程信息、环境变量 | 🔴 **危险** |
| `schedule` | `nlSchedule.js` | 定时任务 | 3 | 自然语言定时任务（schedule_task 等） | 🟡 中等 |
| `bltools` | `bltools.js` | 扩展工具 | 11 | QQ音乐、表情包、Bing图片、B站、GitHub、AI图片编辑、思维导图 | 🟢 安全 |
| `reminder` | `reminder.js` | 定时提醒 | 3 | set/list/cancel_reminder | 🟢 安全 |
| `imageGen` | `imageGen.js` | 绘图服务 | 5 | 文生图/图生图/视频、预设、状态 | 🟢 安全 |
| `qzone` | `qzone.js` | QQ空间/说说 | 10 | 说说发布/点赞/删除、签名、戳一戳、收藏 | 🟡 中等 |
| `emoji` | `emoji.js` | 表情包管理 | 3 | save/send_saved/list_saved_emojis | 🟢 安全 |
| `skills` | `skills.js` | Skills 技能管理 | 12 | 技能查询/加载/卸载、自定义工具热加载 | 🟢 安全 |
| `knowledgeGraph` | `knowledgeGraph.js` | 知识图谱 | 12 | 实体/关系/历史/子图/统计（kg_*） | 🟢 安全 |

合计 25 类 293 个工具定义（各模块 `name` 字段计数；去重与启用过滤发生在
`getAllTools` 层）。

### 各类工具名清单（与源码导出逐一对齐）

以下清单按「文件 → 导出 → 工具名」核对，括号内为该类实际导出数量。

#### 知识图谱工具（kg_*，12 个）

`knowledgeGraph` 类别共 12 个工具，统一读写 `kg_entities` / `kg_relationships` 表。

| 工具 | 作用 | 参数要点 |
|:-----|:-----|:---------|
| `kg_get_knowledge` | 获取当前用户/群的知识图谱上下文 | `user_id`・`group_id`（默认取当前会话）；`max_entities`（默认 15，最大 100）；`include_relations`（默认 true） |
| `kg_list_entities` | 列出指定作用域的实体 | `scope_id`（`global` / `user:<id>` / `group:<id>` / `group:<id>:user:<id>`，默认按会话推导）；`type`（person/thing/place/concept/event，五选一）；`limit`（默认 20，最大 100） |
| `kg_search_entities` | 按名称模糊搜索实体 | `query`（必填）；`type`；`limit`（默认 10，最大 100） |
| `kg_save_entity` | 保存实体，同作用域同名自动合并更新 | `name`・`type`（必填）；`scope_id`；`properties`（对象，如 `{age: 20, job: "学生"}`） |
| `kg_update_entity` | 更新实体属性或类型（用户纠正信息时） | `entity_id`（必填）；`name`；`type`；`properties`（整体替换） |
| `kg_delete_entity` | 删除实体（保留历史可回滚） | `entity_id`（必填） |
| `kg_entity_history` | 获取实体的历史版本记录 | `entity_id`（必填）；`limit`（默认 10，最大 100） |
| `kg_entity_relations` | 获取与某实体直接关联的实体（关系列表） | `entity_id`（必填） |
| `kg_save_relation` | 保存两个实体间的关系 | `from_entity`・`to_entity`・`relation_type`（必填，端点可为 ID 或精确名称）；`scope_id`；`properties` |
| `kg_delete_relation` | 删除关系（保留历史可回滚） | `relationship_id`（必填） |
| `kg_query_subgraph` | 以某实体为中心探索子图 | `entity_id`（必填）；`depth`（默认 1，最大 3） |
| `kg_stats` | 获取作用域统计（实体数、关系数、类型分布） | `scope_id`（默认当前会话作用域；传 `null` 查全局合计） |

`scope_id` 未显式传入时按当前事件上下文推导：群+用户 → `group:<gid>:user:<uid>`；仅群 → `group:<gid>`；仅用户 → `user:<uid>`；无事件 → `global`。实体类型枚举与 `KnowledgeGraphExtractor` 白名单一致（`person` / `thing` / `place` / `concept` / `event`）。

`knowledgeGraph` 为 2026-09 新增类别，既有配置通过「自动启用新增分类」逻辑默认启用。

#### memory.js（5 个，memoryTools）

| 工具名 | description 摘录（以源码为准） |
|:-------|:-------------------------------|
| `save_user_memory` | 保存关于用户的重要信息到记忆库 |
| `get_user_memories` | 获取用户的记忆列表 |
| `search_user_memory` | 搜索用户记忆，支持多关键词 |
| `delete_user_memory` | 删除指定的用户记忆（仅当前会话用户） |
| `update_user_memory` | 更新已有的记忆内容（仅当前会话用户） |

#### group.js（10 个，groupTools）

`get_group_info`、`get_group_list`、`get_group_member_list`、`get_group_member_info`、
`get_current_group`、`get_group_admins`、`search_group_member`、`get_group_notice`、
`check_in_group`、`search_group`

#### admin.js（19 个，adminTools）

`mute_member`、`kick_member`、`set_group_card`、`set_group_whole_ban`、`set_group_admin`、
`set_group_name`、`set_group_special_title`、`send_group_notice`、`delete_group_notice`、
`set_group_add_request`、`set_friend_add_request`、`get_group_muted_list`、`set_group_leave`、
`delete_friend`、`set_group_portrait`、`get_group_at_all_remain`、`set_group_anonymous_ban`、
`set_group_anonymous`、`get_group_system_msg`

#### 其余类别要点（按名称与源码比对）

- `basic`（9）：`get_current_time`、`sleep`、`echo`、`get_environment`、`list_available_tools`、`get_tool_info`、`get_lunar_date`、`get_festival`、`format_number`
- `user`（9）：`get_user_info`、`get_friend_list`、`send_like`、`get_avatar`、`get_sender_info`、`search_friend`、`check_is_friend`、`get_bot_info`、`get_user_profile`
- `message`（37，messageTools + forwardDataTools 合并）：`send_to_master`、`get_master_info`、`send_private_message`、`send_group_message`、`reply_current_message`、`at_user`、`at_role`、`random_at`、`get_chat_history`、`recall_message`、`get_forward_msg`、`deep_parse_message`、`send_forward_msg`、`resend_quoted_card`、`mark_msg_as_read`、`get_essence_msg_list`、`set_essence_msg`、`delete_essence_msg`、`poke_user`、`set_msg_emoji_like`、`get_msg`、`send_raw_message`、`send_card`、`send_markdown`、`send_button`、`call_api`、`send_long_msg`、`get_msg_reactions`、`send_long_message`、`send_protocol_packet`、`send_pb_message`、`send_forward_direct`、`make_forward_msg`、`extract_forward_data`、`deserialize_message`、`decode_protobuf`、`get_message_record`
- `groupStats`（14）：`get_group_level`、`get_dragon_king`、`get_sign_in_today`、`get_speak_rank`、`get_group_data`、`get_lucky_list`、`draw_lucky`、`equip_lucky`、`switch_lucky`、`get_inactive_members`、`get_recent_join_members`、`get_group_honor`、`get_group_stat`、`get_random_group_member`
- `file`（29）：`get_group_files`、`get_file_url`、`upload_group_file`、`delete_group_file`、`create_group_folder`、`get_group_file_system_info`、`get_group_root_files`、`get_group_files_by_folder`、`move_group_file`、`rename_group_file`、`delete_group_folder`、`upload_private_file`、`get_private_file_url`、`download_file`、`send_file_message`、`get_file`、`ocr_image`、`can_send_record`、`can_send_image`、`read_file`、`write_file`、`list_directory`、`download_to_file`、`download_group_file_to_file`、`delete_file`、`copy_file`、`move_file`、`get_file_info`、`create_directory`
- `web`（2）：`website`、`fetch_url`
- `context`（6）：`get_current_context`、`get_conversation_context`、`clear_conversation`、`get_reply_message`、`get_at_members`、`get_group_context`
- `media`（18）：`parse_image`、`generate_qrcode`、`get_image_info`、`send_image`、`send_video`、`parse_video`、`send_dice`、`send_rps`、`send_music`、`send_location`、`send_share`、`send_face`、`send_mface`、`send_flash_image`、`send_gift`、`get_face_list`、`parse_mface`、`download_image`
- `search`（17）：`bing_search`、`fetch_webpage`、`web_search`、`search_wiki`、`search_group_history`、`translate`、`get_weather`、`get_ip_info`、`search_baike`、`get_hitokoto`、`get_hot_search`、`get_douyin_hot`、`get_history_today`、`get_joke`、`get_morning_paper`、`get_short_url`、`get_oil_price`
- `utils`（25）：`calculate`、`random_number`、`random_choice`、`uuid`、`hash`、`base64_encode`、`base64_decode`、`url_encode`、`json_format`、`timestamp`、`countdown`、`regex_match`、`regex_replace`、`text_stats`、`text_transform`、`extract_urls`、`extract_emails`、`extract_phones`、`split_text`、`join_text`、`truncate_text`、`escape_html`、`generate_password`、`dice_roll`、`draw_lots`
- `bot`（8）：`get_login_info`、`get_bot_status`、`get_stranger_info`、`get_version_info`、`get_online_clients`、`set_qq_avatar`、`get_model_show`、`get_self_info`
- `voice`（16）：`set_ai_voice_chat`、`get_ai_voice_characters`、`send_ai_voice`、`send_voice`、`parse_voice`、`get_record`、`get_tts_speakers`、`send_tts`、`get_ai_record`、`send_private_ai_record`、`get_voice_info`、`download_voice`、`voice_to_text`、`get_ai_voice_status`、`list_voice_formats`、`send_voice_reply`
- `extra`（6）：`hitokoto`、`roll_dice`、`random_choose`、`create_short_url`、`query_ip_info`、`get_illustration`
- `shell`（4）：`execute_command`、`get_system_info`、`get_process_info`、`read_env`
- `schedule`（3）：`schedule_task`、`cancel_scheduled_task`、`list_my_scheduled_tasks`
- `bltools`（11）：`search_music_qq`、`search_emoji`、`search_image_bing`、`set_msg_reaction`、`search_wallpaper`、`bilibili_search`、`github_repo_info`、`ai_image_edit`、`bilibili_video_summary`、`video_analysis`、`ai_mindmap`
- `reminder`（3）：`set_reminder`、`list_reminders`、`cancel_reminder`
- `imageGen`（5）：`generate_image`、`generate_video`、`list_image_presets`、`use_image_preset`、`get_image_gen_status`
- `qzone`（10）：`publish_qzone_mood`、`get_qzone_feeds`、`like_qzone_post`、`delete_qzone_mood`、`set_self_longnick`、`friend_poke`、`group_poke`、`get_profile_like`、`create_collection`、`get_collection_list`
- `emoji`（3）：`save_emoji`、`send_saved_emoji`、`list_saved_emojis`
- `skills`（12）：`list_skills`、`load_skill`、`get_skill_info`、`list_skill_files`、`read_skill_file`、`search_skills`、`unload_skill`、`reload_skills`、`create_custom_tool`、`update_custom_tool`、`invoke_custom_tool`、`delete_custom_tool`

::: danger shell 类别警告
`shell` 类别可执行系统命令，存在安全风险。建议仅在可信环境下启用，并限制为主人权限。
:::

## 创建内置工具 {#create-tool}

::: tip 开发流程
1. 在类别文件中添加工具定义 → 2. 注册新类别（可选）→ 3. 配置启用
:::

### Step 1：在对应类别文件中添加工具 {#step-1}

```javascript{2-5,7-16,18-22}
// src/mcp/tools/basic.js
export const basicTools = [
  {
    // 工具名称（snake_case，全局唯一）
    name: 'my_tool',
    
    // 工具描述（AI 可见，描述清晰有助于正确调用）
    description: '我的工具描述，说明功能和使用场景',
    
    // 参数定义（JSON Schema 格式）
    inputSchema: {
      type: 'object',
      properties: {
        input: {
          type: 'string',
          description: '输入参数说明'
        }
      },
      required: ['input']
    },
    
    // 处理函数（异步）
    handler: async (args) => {
      const { input } = args
      // 实现逻辑
      return { success: true, result: input }
    }
  },
  // ...其他工具
]
```

### Step 2：注册工具模块（新类别时需要）{#step-2}

::: info 仅新类别需要
如果是在已有类别中添加工具，跳过此步骤。
:::

```javascript{3,9-13}
// src/mcp/tools/index.js
const toolModules = {
  basic: { file: './basic.js', export: 'basicTools' },
  myCategory: { file: './myCategory.js', export: 'myCategoryTools' },
  // ...
}

// 类别元信息（用于 Web 面板展示）
const categoryMeta = {
  myCategory: { 
    name: '我的类别',         // 显示名称
    description: '类别描述',   // 类别说明
    icon: 'Tool'              // 图标名称（Lucide 图标）
  }
}
```

### Step 3：配置启用 {#step-3}

内置工具的启用由 `builtinTools` 配置控制（管理面板 → 工具管理可改，对应
`GET/PUT /api/tools/builtin/config`）：

```yaml
# config.yaml
builtinTools:
  enabled: true
  enabledCategories:
    - basic
    - myCategory  # 添加新类别
```

::: tip 通过 Web 面板管理
也可以在 Web 管理面板 → 工具管理 中启用/禁用工具类别。
:::

## 工具示例 {#examples}

::: tip 完整示例
以下是两个典型的内置工具实现示例，展示常见模式。
:::

### 示例 1：获取时间（无上下文）{#example-time}

```javascript{1,3-4,7-17,20-32}
// src/mcp/tools/basic.js
{
  name: 'get_current_time',
  description: '获取当前时间和日期信息，支持指定时区和格式',
  
  inputSchema: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        description: '时间格式：full(完整)、date(仅日期)、time(仅时间)、timestamp(时间戳)',
        enum: ['full', 'date', 'time', 'timestamp']
      },
      timezone: {
        type: 'string',
        description: '时区，默认 Asia/Shanghai'
      }
    }
  },
  
  handler: async (args) => {
    const now = new Date()
    const tz = args.timezone || 'Asia/Shanghai'
    
    const options = { timeZone: tz }
    const dateStr = now.toLocaleDateString('zh-CN', { ...options, year: 'numeric', month: '2-digit', day: '2-digit' })
    const timeStr = now.toLocaleTimeString('zh-CN', { ...options, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    const weekday = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()]
    
    return {
      text: `当前时间: ${dateStr} ${timeStr} 星期${weekday}`,
      datetime: now.toISOString(),
      timestamp: now.getTime(),
      timezone: tz
    }
  }
}
```

### 示例 2：发送消息（需要上下文）{#example-message}

```javascript{2,5-6,9-14,17-21}
{
  name: 'send_private_message',
  description: '发送私聊消息给指定用户',
  
  inputSchema: {
    type: 'object',
    properties: {
      user_id: { type: 'string', description: '目标用户QQ号' },
      message: { type: 'string', description: '消息内容' }
    },
    required: ['user_id', 'message']
  },
  
  handler: async (args, context) => {
    await context.getApi().sendPrivate(args.user_id, args.message)
    return { success: true, text: '消息已发送' }
  }
}
```

## 工具属性 {#tool-properties}

| 属性 | 类型 | 必需 | 说明 |
|:-----|:-----|:----:|:-----|
| `name` | `string` | ✅ | 工具名称，全局唯一，使用 `snake_case` 格式 |
| `description` | `string` | ✅ | 工具描述，AI 可见，描述清晰有助于正确调用 |
| `inputSchema` | `object` | ❌ | JSON Schema 格式的参数定义，无参数时可省略 |
| `handler` | `function` | ✅ | 异步处理函数 `async (args) => result` |

::: info inputSchema 格式
参数定义遵循 [JSON Schema](https://json-schema.org/) 规范，支持以下类型：
- `string` - 字符串
- `number` / `integer` - 数值
- `boolean` - 布尔值
- `array` - 数组
- `object` - 对象
:::

## 下一步 {#next-steps}

| 文档 | 说明 | 适用场景 |
|:-----|:-----|:---------|
| [自定义 JS 工具](./custom-js) | 开发用户工具 | 快速开发、无需修改源码 |
| [安全与权限](./security) | 工具安全配置 | 了解权限控制机制 |
| [MCP 服务器](./mcp-server) | 接入外部 MCP | 复用现有 MCP 服务器 |
