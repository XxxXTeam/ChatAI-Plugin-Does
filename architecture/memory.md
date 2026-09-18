# 记忆系统架构 <Badge type="info" text="Architecture" />

长期记忆系统让 AI 跨对话记住用户信息，提供更个性化的体验。

::: tip 📚 相关文档
- **用户指南**: [记忆系统指南](/guide/memory) - 如何使用记忆功能
- **API**: [记忆接口](/api/memories) - `/api/memory` 端点
- **配置参考**: [记忆配置](/config/memory) - 配置选项详解
:::

## 组件地图（与源码一致）

| 组件 | 文件 | 职责 |
|:-----|:-----|:-----|
| `MemoryService` | `src/services/memory/MemoryService.js` | `structured_memories` 表 CRUD、分类、搜索、合并；`/api/memory` 路由的数据层 |
| `MemoryExtractor` | `src/services/memory/MemoryExtractor.js` | 从对话自动提取结构化记忆 |
| `MemorySummarizer` | `src/services/memory/MemorySummarizer.js` | AI 总结（`memorySummarizer` 单例；输出 `[分类] 内容` 行） |
| `MemoryTypes` | `src/services/memory/MemoryTypes.js` | 分类/子类型常量与中文标签映射 |
| `MemoryManager` | `src/services/storage/MemoryManager.js` | **轮询分析**（`memory.pollInterval`，默认 5 分钟）与游标管理、群聊上下文采集；`memoryManager` 单例 |
| `llmHelper` | `src/services/memory/llmHelper.js` | 旁路 LLM 调用（经 `LlmDelegate`） |
| `migration` | `src/services/memory/migration.js` | 旧格式迁移 |

> 注意：`/api/memory` 直接使用 `memoryService`；后台轮询整理走 `memoryManager`，
> 两者共享 `structured_memories` 表但入口不同。

## 架构概览 {#overview}

```mermaid
graph TB
    subgraph "提取与整理"
        ME["MemoryExtractor"]
        MS["MemorySummarizer"]
        MM["MemoryManager<br/>轮询 + 游标"]
    end
    
    subgraph "记忆存储"
        MSV["MemoryService"]
        DB["SQLite: structured_memories"]
    end
    
    subgraph "记忆类型"
        MT["MemoryTypes"]
    end
    
    Chat["对话消息"] --> ME
    ME -->|结构化记忆| MSV
    MS -->|摘要记忆| MSV
    MM -->|周期性分析/总结| MSV
    Chat --> MM
    MSV --> DB
    MT --> MSV
    MSV -->|记忆检索| Chat
```

## MemoryManager 轮询与游标

`MemoryManager.pollAndSummarize()` 由 `startPolling()` 周期触发
（`memory.enabled` 为 true 时启动）：

- **周期**：`memory.pollInterval`（分钟，默认 5）；单目标最小间隔
  `memory.minPollInterval`（分钟，默认 30）。
- **双轨游标**：`_resolvePollCursor(pollKey)` 取「内存 Map（`lastPollTime`）」与
  「`kv_store` 持久化值（键前缀 `memory:poll:last:`）」的较大者；进程重启后内存游标
  丢失，由 KV 游标兜底，碰撞窗口内的对话会重新处理一遍，避免漏分析。
- **目标标识（pollKey）**：私聊为 `userId`；共享群为 `group:<gid>:user:<uid>`。
- **共享群归属**：只信任落库消息的 `sender.user_id`（旧记录无 sender 跳过），
  按发送者去重，避免把整个群的对话都记到同一用户头上。
- **限幅**：`lastPollTime` / `lastSummarizeTime` Map 上限 5000 条、过期 7 天
  （`_capTimeMap`）；单次轮询处理上限 100 个目标。
- 群聊上下文采集由 `startGroupContextCollection()` 独立驱动
  （`memory.groupContext.enabled`、`collectInterval` 默认 10 分钟）。

## 核心组件

### MemoryService

统一管理所有记忆操作的服务类。

```javascript
import { memoryService } from './services/memory/MemoryService.js'

// 保存记忆
await memoryService.saveMemory({
  userId: '123456',
  groupId: '789',           // 可选
  category: 'profile',      // 分类
  subType: 'name',          // 子类型
  content: '用户叫小明',
  confidence: 0.9,          // 可信度 0-1
  source: 'auto'            // 来源
})

// 查询记忆
const memories = await memoryService.getMemories('123456', {
  category: 'profile',
  limit: 10
})

// 搜索记忆
const results = await memoryService.searchMemories('123456', '喜欢')
```

### MemoryExtractor

从对话中自动提取用户信息。

```javascript
import { memoryExtractor } from './services/memory/MemoryExtractor.js'

// 设置 LLM 客户端
memoryExtractor.setLLMClient(llmClient)

// 提取记忆
const extracted = await memoryExtractor.extract('123456', messages)
// 返回: [{ category, subType, content, confidence }, ...]
```

### MemorySummarizer

定期生成对话摘要。

```javascript
import { memorySummarizer } from './services/memory/MemorySummarizer.js'

// 生成群聊摘要
const summary = await memorySummarizer.summarizeGroupChat(groupId, messages)
```

## 记忆分类

系统使用结构化分类管理记忆：

| 分类 | 标识 | 说明 | 子类型 |
|:-----|:-----|:-----|:-------|
| **基本信息** | `profile` | 用户个人信息 | name, age, gender, location, occupation, education, contact |
| **偏好习惯** | `preference` | 喜好和习惯 | like, dislike, hobby, habit, food, style |
| **重要事件** | `event` | 日期和计划 | birthday, anniversary, plan, milestone, schedule |
| **人际关系** | `relation` | 社交关系 | family, friend, colleague, partner, pet |
| **话题兴趣** | `topic` | 讨论话题 | interest, discussed, knowledge |
| **自定义** | `custom` | 扩展类型 | - |

### 分类定义

```javascript
import { 
  MemoryCategory,
  ProfileSubType,
  PreferenceSubType,
  getCategoryLabel,
  getSubTypeLabel
} from './services/memory/MemoryTypes.js'

// 使用分类
const memory = {
  category: MemoryCategory.PROFILE,
  subType: ProfileSubType.NAME,
  content: '用户叫小明'
}

// 获取中文标签
getCategoryLabel('profile')  // '基本信息'
getSubTypeLabel('name')      // '姓名'
```

## 数据存储

### 数据库表结构

实际建表语句（`src/services/storage/DatabaseService.js`）：

```sql
CREATE TABLE IF NOT EXISTS structured_memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    group_id TEXT,
    category TEXT NOT NULL,
    sub_type TEXT,
    content TEXT NOT NULL,
    confidence REAL DEFAULT 0.8,
    source TEXT DEFAULT 'auto',
    metadata TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    expires_at INTEGER,
    is_active INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_struct_mem_user ON structured_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_struct_mem_group ON structured_memories(group_id);
CREATE INDEX IF NOT EXISTS idx_struct_mem_category ON structured_memories(category);
CREATE INDEX IF NOT EXISTS idx_struct_mem_user_group ON structured_memories(user_id, group_id);
CREATE INDEX IF NOT EXISTS idx_struct_mem_active ON structured_memories(is_active);
```

（旧版记忆表 `memories` 仍存在，`MemoryService` 在初始化时会做一次迁移合并。）

### 记忆对象结构

```typescript
interface Memory {
  id: number
  userId: string
  groupId?: string
  category: string      // profile | preference | event | relation | topic | custom
  subType?: string      // 子类型
  content: string       // 记忆内容
  confidence: number    // 可信度 0-1
  source: string        // auto | manual | import | summary | migration
  metadata?: object     // 额外元数据
  createdAt: number     // 创建时间戳
  updatedAt: number     // 更新时间戳
  expiresAt?: number    // 过期时间戳
  isActive: number      // 软删除标记（1 活跃）
}
```

## 提取流程

```mermaid
sequenceDiagram
    participant Chat as 对话
    participant Ext as MemoryExtractor
    participant LLM as LLM 模型
    participant Svc as MemoryService
    participant DB as 数据库

    Chat->>Ext: 对话消息列表
    Ext->>LLM: 发送提取 Prompt
    LLM-->>Ext: 结构化提取结果
    Ext->>Ext: 解析结果
    loop 每条记忆
        Ext->>Svc: saveMemory()
        Svc->>Svc: 检查重复
        alt 存在相似记忆
            Svc->>DB: 更新记忆
        else 新记忆
            Svc->>DB: 插入记忆
        end
    end
```

### 提取 Prompt

系统使用专门的 Prompt 指导 LLM 提取记忆：

```
你是一个记忆提取助手，负责从对话中提取用户的关键信息。

【任务】分析对话内容，提取用户个人信息并分类。

【输出格式】每行一条记忆，格式：[分类:子类型] 内容

【示例输出】
[profile:name] 用户叫小明
[profile:age] 25岁
[preference:like] 喜欢打游戏
[event:birthday] 生日是3月15日
```

## 去重机制

保存记忆时自动检测相似内容：

```javascript
// MemoryService.saveMemory() 内部逻辑
const existing = this.findSimilarMemory(userId, category, content, groupId)
if (existing) {
  // 更新现有记忆，取更高可信度
  return this.updateMemory(existing.id, {
    content,
    confidence: Math.max(existing.confidence, confidence),
    updatedAt: now
  })
}
// 插入新记忆
```

## 记忆检索

### 基础查询

```javascript
// 按分类查询
const profiles = await memoryService.getMemories(userId, {
  category: 'profile'
})

// 按子类型查询
const likes = await memoryService.getMemories(userId, {
  category: 'preference',
  subType: 'like'
})

// 分页查询
const memories = await memoryService.getMemories(userId, {
  limit: 20,
  offset: 0
})
```

### 搜索

```javascript
// 关键词搜索
const results = await memoryService.searchMemories(userId, '游戏')

// 带分类过滤
const hobbies = await memoryService.searchMemories(userId, '游戏', {
  category: 'preference'
})
```

## 注入对话

记忆通过 System Prompt 注入 AI 对话：

```javascript
// 构建记忆上下文
const memories = await memoryService.getMemories(userId, { limit: 20 })
const memoryText = memories.map(m => `- ${m.content}`).join('\n')

const systemPrompt = `
你正在与用户对话。以下是关于该用户的记忆：

${memoryText}

请根据这些信息提供个性化回复。
`
```

## 群聊上下文

群聊记忆收集系统：

```mermaid
graph LR
    A["群消息"] --> B["消息缓存"]
    B -->|达到阈值| C["LLM 分析"]
    C --> D["提取用户信息"]
    C --> E["提取讨论话题"]
    C --> F["提取用户关系"]
    D --> G["记忆存储"]
    E --> G
    F --> G
```

### 配置

```yaml
memory:
  groupContext:
    enabled: true
    collectInterval: 10       # 收集间隔（分钟）
    maxMessagesPerCollect: 50 # 每次最大消息数
    analyzeThreshold: 20      # 触发分析的消息数
    extractUserInfo: true     # 提取用户信息
    extractTopics: true       # 提取话题
    extractRelations: true    # 提取关系
```

## 迁移支持

从旧格式迁移记忆：

```javascript
import { migrateMemories } from './services/memory/migration.js'

// 迁移用户记忆
await migrateMemories(userId)
```

## API 接口

### REST API（实际端点，见[记忆接口](/api/memories)）

| 接口 | 方法 | 说明 |
|:-----|:-----|:-----|
| `/api/memory/users` | GET | 有记忆的用户列表（userId/count/lastUpdate/categories） |
| `/api/memory/stats` | GET | 全局统计 `{ total, users, byCategory }` |
| `/api/memory/categories` | GET | 分类定义 |
| `/api/memory/user/:userId` | GET | 用户记忆（format=tree/list） |
| `/api/memory/user/:userId` | POST | 添加记忆（content 必填） |
| `/api/memory/search` | POST | 搜索记忆 |
| `/api/memory/:id` | PUT | 更新单条（数字主键） |
| `/api/memory/:id` | DELETE | 删除单条（hard 参数） |
| `/api/memory/user/:userId` | DELETE | 清空用户记忆 |
| `/api/memory/user/:userId/summarize` | POST | AI 总结 |
| `/api/memory/user/:userId/cleanup` | POST | 低质量清理 |
| `/api/memory/batch` | POST | 批量保存 |
| `/api/memory/merge/:userId` | POST | 合并记忆 |
| `/api/memory/group/:groupId` | GET | 群组记忆 |

### 示例请求

```bash
# 获取用户记忆（树状结构）
curl http://localhost:3000/api/memory/user/123456?format=tree

# 添加记忆
curl -X POST http://localhost:3000/api/memory/user/123456 \
  -H "Content-Type: application/json" \
  -d '{
    "category": "preference",
    "subType": "like",
    "content": "喜欢编程"
  }'
```

### 路由遮蔽（重要）

见[记忆接口](/api/memories#兼容路由的遮蔽语义)：纯数字路径（QQ 号）与
`/user/:userId` 的语义不同，数字路径始终按「主键查单条」处理。

## 下一步

- [存储系统](./storage) - 数据库服务
- [数据流](./data-flow) - 完整请求流程
- [知识图谱服务](./knowledge-graph) - 结构化知识（实体/关系）
- [记忆接口](/api/memories) - `/api/memory` 端点
- [记忆配置](/config/memory) - 配置选项
