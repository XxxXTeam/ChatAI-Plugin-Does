# 知识图谱服务 <Badge type="info" text="Architecture" />

## 定位

知识图谱服务 `KnowledgeGraphService` 位于 `src/services/storage/KnowledgeGraphService.js`，
提供实体/关系的 CRUD、版本历史、子图/路径查询与作用域共享。
HTTP 出口见[知识图谱接口](/api/graph)，模型侧工具见
[内置工具知识图谱类别](./mcp#knowledgegraph)，抽取侧由
`KnowledgeGraphExtractor`（同目录）完成。

## 数据模型

SQLite 表（`DatabaseService` 初始化）：

| 表 | 用途 |
|:---|:-----|
| `kg_entities` | 实体（`entity_id`、`entity_type`、`name`、`scope_id`、`properties`、`version`） |
| `kg_relationships` | 关系（`relationship_id`、`from_entity_id`、`to_entity_id`、`relation_type`、`scope_id`、`properties`、`version`） |
| `kg_entity_history` | 实体历史版本（回滚依据） |
| `kg_relationship_history` | 关系历史版本 |
| `kg_scope_sharing` | 作用域共享（全局/继承） |

实体读回字段为 `entityType`（创建请求用 `type`）。实体/关系标识符为
`<scopeId>:entity:<uuid>` 形式，作用域支持 `global`、`user:<id>`、`group:<id>`、
`group:<gid>:user:<uid>`。

## 服务能力

| 方法组 | 说明 |
|:-------|:-----|
| 实体 | `createEntity` / `getEntity` / `listEntities` / `searchEntities` / `countEntities` / `updateEntity` / `deleteEntity` |
| 关系 | `createRelationship` / `getRelationship` / `updateRelationship` / `deleteRelationship` / `getEntityRelationships` |
| 版本 | `getEntityHistory` / `hasEntityVersion` / `rollbackEntity`；关系侧同名方法 |
| 图查询 | `querySubgraph`（深度/节点/边上限）、`pathQuery`（最短路径、`relationTypes` 过滤）、`getKnowledgeContext`（用户上下文） |
| 作用域 | `listScopes` / `getScopeStats` |
| 导入导出 | `exportGraph` / `importGraph`（校验 `schemaVersion` / `truncated` / `counts` 一致性）、`iterateScopeEntities` / `iterateScopeRelationships`（流式导出用） |

## 关键语义

- **同名合并**：同一作用域内同 `entity_type` + `name` 保存时合并更新，不产生重复实体。
- **删除保留历史**：删除实体会先清理其关系，再标记不存在；历史版本保留，
  通过 `POST /api/graph/entities/:id/rollback` 恢复为新的当前版本（版本号递增）。
- **回滚实现**：目标快照作为一次新变更写回，而不是把版本号回退。
- **领域错误**：服务层抛 `KnowledgeGraphError(message, statusCode)`，
  路由按 `statusCode` 映射 HTTP 状态（400/404），未知异常统一 500 且不泄露内部细节。
- **可视化摘要**：`getVisualization(scopeId, { limit, focusEntityId })` 返回带
  `totalEntities` / `totalRelationships` / `truncated` 的限幅图谱。

## 抽取侧

`KnowledgeGraphExtractor` 使用 LLM 从对话中抽取结构化知识，实体类型白名单
`person` / `thing` / `place` / `concept` / `event`，与模型侧 `kg_*` 工具
（`src/mcp/tools/knowledgeGraph.js`，12 个工具）及 `/api/graph` 共享同一服务。