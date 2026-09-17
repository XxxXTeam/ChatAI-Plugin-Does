# 知识图谱接口

知识图谱接口统一返回 `{ code, message, data }`。成功响应的 `code` 为 `0`；管理面板使用
`/api/graph/export` 的流式下载接口，不把完整图谱先组装到浏览器内存。

## 作用域、统计与可视化

```http
GET /api/graph/scopes
GET /api/graph/stats?scopeId=global
GET /api/graph/visualization?scopeId=global&limit=80&focusEntityId=<entityId>
```

`scopeId` 在统计接口中可省略（省略时统计全部作用域）；实体接口必须提供非空 `scopeId`。
可视化 `limit` 最大为 500，返回 `totalEntities`、`totalRelationships`、`truncated` 和
`limit` 元数据。

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

回滚请求体中的 `targetVersion` 必须是不小于 `1` 的整数（也接受十进制字符串）：

```json
{ "targetVersion": 2 }
```

回滚会创建新的版本记录，不删除历史；已删除实体没有当前记录，不能通过此接口回滚。

## 关系

```http
GET    /api/graph/entities/:entityId/relationships?direction=both
POST   /api/graph/relationships
PUT    /api/graph/relationships/:relationshipId
DELETE /api/graph/relationships/:relationshipId
GET    /api/graph/relationships/:relationshipId/history?limit=10
POST   /api/graph/relationships/:relationshipId/rollback
```

创建关系请求体：

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
`outgoing`。更新关系只修改 `properties`，可选 `changeReason`；回滚体与实体相同。

## 图查询

```http
GET /api/graph/subgraph?entityId=<entityId>&depth=2&scopeIds=global&maxNodes=200&maxEdges=400
GET /api/graph/path?fromEntityId=<id>&toEntityId=<id>&maxDepth=5&relationTypes=friend,works_at
GET /api/graph/context?userId=<userId>&groupId=<groupId>&maxEntities=15
```

`depth` 与 `maxDepth` 按关系边数计算；例如 `maxDepth=1` 只允许一条边。子图节点上限最大为
1000、边上限最大为 5000；响应带 `truncated` 与 `limit`，前端必须把达到上限告知用户。返回的
子图关系始终只连接本次返回的实体，`maxEdges=0` 时只返回中心实体。路径结果中的关系会严格
遵守 `relationTypes` 过滤。

实体和关系标识符位于 URL 路径段时必须使用 URL 编码（尤其是作用域含 `/`、空格或 `?` 的情况），
查询参数中的 `scopeIds`、`relationTypes` 则按逗号分隔后由客户端编码参数值。

## 导出与导入

### 流式导出（推荐）

```http
GET /api/graph/export?scopeId=global
```

响应为 `application/json` 附件，带 `Cache-Control: no-store` 和 `X-Content-Type-Options:
nosniff`。导出文档结构：

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

兼容导出请求体为 `{ "scopeId": "global" }`。导入请求体为
`{ "graphData": <上面的导出对象>, "targetScopeId": "可选目标作用域" }`；不接受未知
`schemaVersion`、`truncated: true` 或与 `counts` 不一致的摘要。
