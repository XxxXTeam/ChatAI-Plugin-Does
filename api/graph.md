# 知识图谱接口

知识图谱路由位于 `src/services/routes/graphRoutes.js`，挂载于 `/api/graph`（JWT 认证），
数据层为 `KnowledgeGraphService`（表 `kg_entities` / `kg_relationships` 及各自历史表）。
接口统一返回 `{ code, data, message }`，成功 `code` 为 `0`；领域错误返回
`KnowledgeGraphError.statusCode`（400/404），未知错误统一 `500`
（message 为 `知识图谱操作失败`，不泄露内部细节）。管理面板使用
`/api/graph/export` 的流式下载接口，不把完整图谱先组装到浏览器内存。

## 作用域、统计与可视化

```http
GET /api/graph/scopes                                 # 所有有数据的作用域
GET /api/graph/stats?scopeId=global                   # scopeId 可省略（省略时统计全部）
GET /api/graph/visualization?scopeId=global&limit=80&focusEntityId=<entityId>
```

`/stats` 响应 `data` 为 `getScopeStats` 结构。`/visualization` 的 `scopeId` **必填**
（缺失返回 `400`），`limit` 默认 `80`、最大 `500`，返回 `totalEntities`、
`totalRelationships`、`truncated` 和 `limit` 元数据。实体接口必须提供非空 `scopeId`。

## 实体

```http
GET    /api/graph/entities?scopeId=global&type=person&limit=100&offset=0
GET    /api/graph/entities/count?scopeId=global&query=张&type=person
GET    /api/graph/entities/search?query=张&scopeIds=global,group:demo&type=person&limit=20&offset=0
GET    /api/graph/entities/:entityId
POST   /api/graph/entities
PUT    /api/graph/entities/:entityId
DELETE /api/graph/entities/:entityId
```

- `GET /entities`：`scopeId` 必填（缺失 `400` `scopeId is required`）；`limit`
  默认 `100`、最大 `1000`；`offset` 下限 0、最大 `1000000`。
- `GET /entities/count`：筛选与列表接口一致（`query`、`type`），返回 `{ count }`。
- `GET /entities/search`：`query` 留空为匹配全部；`scopeIds` 支持重复查询键
  （`?scopeIds=a&scopeIds=b`）或旧版逗号分隔。
- `POST /entities`：请求体 `{ name, type, scopeId, properties }`，
  `name` / `type` / `scopeId` 必填（缺失 `400`）；成功返回 `201`。
- `DELETE /entities/:entityId`：不存在返回 `404`（`实体不存在`）。

创建实体请求体：

```json
{
  "scopeId": "group_123456",
  "name": "实体名称",
  "type": "person",
  "properties": { "age": 25, "role": "管理员" }
}
```

实体读回对象使用 `entityType` 字段；创建请求使用 `type`，两者不能混用。

## 实体历史与回滚

```http
GET  /api/graph/entities/:entityId/history?limit=10
POST /api/graph/entities/:entityId/rollback
```

历史 `limit` 默认 `10`、最大 `500`。回滚请求体中的 `targetVersion` 必须是不小于
`1` 的整数（也接受十进制字符串）：

```json
{ "targetVersion": 2 }
```

非法版本返回 `400`（`targetVersion 必须为不小于 1 的整数`）；实体不存在返回
`404`（`实体不存在: <id>`）；版本不存在返回 `404`（`未找到版本 <v>`）。
回滚目标快照作为一次新变更写回（版本号继续递增），不删除历史；
已删除实体没有当前记录，不能通过此接口回滚。

## 关系

```http
GET    /api/graph/entities/:entityId/relationships?direction=both
POST   /api/graph/relationships
PUT    /api/graph/relationships/:relationshipId
DELETE /api/graph/relationships/:relationshipId
GET    /api/graph/relationships/:relationshipId/history?limit=10
POST   /api/graph/relationships/:relationshipId/rollback
```

创建关系请求体（`fromEntityId` / `toEntityId` / `relationType` / `scopeId` 必填）：

```json
{
  "scopeId": "group_123456",
  "fromEntityId": "group_123456:entity:from",
  "toEntityId": "group_123456:entity:to",
  "relationType": "friend",
  "properties": {}
}
```

关系两端实体必须存在且属于同一作用域。`direction` 只能是 `both`、`incoming` 或
`outgoing`（非法值由服务层拒绝）。更新关系只修改 `properties`，可选 `changeReason`；
回滚体与实体相同（`targetVersion`）。

## 图查询

```http
GET /api/graph/subgraph?entityId=<entityId>&depth=2&scopeIds=global&maxNodes=200&maxEdges=400
GET /api/graph/path?fromEntityId=<id>&toEntityId=<id>&maxDepth=5&relationTypes=friend,works_at
GET /api/graph/context?userId=<userId>&groupId=<groupId>&maxEntities=15
```

- `/subgraph`：`entityId` 必填；`depth` 默认 2、最大 10；`maxNodes` 默认 200、
  最大 1000；`maxEdges` 默认 400、最大 5000（可以传 0，只返回中心实体）。
- `/path`：`fromEntityId` / `toEntityId` 必填；`maxDepth` 默认 5、最大 10。
- `/context`：`userId` 必填（缺失 400）；`maxEntities` 默认 15、最大 200；
  响应 `data` 为 `{ context: [...] }`。

`depth` 与 `maxDepth` 按关系边数计算；例如 `maxDepth=1` 只允许一条边。子图节点上限
最大为 1000、边上限最大为 5000；响应带 `truncated` 与 `limit`，前端必须把达到上限
告知用户。返回的子图关系始终只连接本次返回的实体。路径结果中的关系会严格遵守
`relationTypes` 过滤。

实体和关系标识符位于 URL 路径段时必须使用 URL 编码（尤其是作用域含 `/`、空格或
`?` 的情况），查询参数中的 `scopeIds`、`relationTypes` 则建议以重复查询键传递
（`?scopeIds=a&scopeIds=b`），旧版逗号分隔字符串仍兼容。

## 导出与导入

### 流式导出（推荐）

```http
GET /api/graph/export?scopeId=global
```

`scopeId` 必填。响应为 `application/json` 附件
（`Content-Disposition: attachment; filename="graph-<safeScope>-<ts>.json"`），带
`Cache-Control: no-store` 和 `X-Content-Type-Options: nosniff`。导出文档结构：

```json
{
  "schemaVersion": 1,
  "scopeId": "global",
  "exportedAt": 1700000000000,
  "counts": { "entities": 1, "relationships": 0 },
  "truncated": false,
  "entities": [],
  "relationships": []
}
```

### 兼容导出与导入

```http
POST /api/graph/export
POST /api/graph/import
```

兼容导出（POST）请求体为 `{ "scopeId": "global" }`，`scopeId` 必填；响应一次性组装
JSON。导入请求体为 `{ "graphData": <上面的导出对象>, "targetScopeId": "可选目标作用域" }`
（`graphData` 必填）；不接受未知 `schemaVersion`、`truncated: true` 或与 `counts`
不一致的摘要。
