# 知识图谱接口

知识图谱实体、关系的管理和可视化数据查询。

## 获取实体列表

```http
GET /api/graph/entities
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| scopeId | string | **必需**，作用域 ID |
| type | string | 实体类型过滤 |
| limit | number | 返回条数（默认 100） |
| offset | number | 偏移量 |

## 搜索实体

```http
GET /api/graph/entities/search
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| query | string | 搜索关键词 |
| scopeIds | string | 逗号分隔的作用域 ID 列表 |
| type | string | 实体类型过滤 |
| limit | number | 返回条数（默认 20） |

## 获取单个实体

```http
GET /api/graph/entities/:entityId
```

## 创建实体

```http
POST /api/graph/entities
```

**请求体**

```json
{
  "scopeId": "group_123456",
  "name": "实体名称",
  "type": "person",
  "properties": {
    "age": 25,
    "role": "管理员"
  }
}
```

## 更新实体

```http
PUT /api/graph/entities/:entityId
```

## 删除实体

```http
DELETE /api/graph/entities/:entityId
```

## 获取关系列表

```http
GET /api/graph/relations
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| scopeId | string | 作用域 ID |
| entityId | string | 关联实体 ID |

## 创建关系

```http
POST /api/graph/relations
```

**请求体**

```json
{
  "scopeId": "group_123456",
  "sourceId": "entity_1",
  "targetId": "entity_2",
  "type": "friend",
  "properties": {}
}
```

## 删除关系

```http
DELETE /api/graph/relations/:relationId
```

## 获取可视化数据

```http
GET /api/graph/visualization
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| scopeId | string | 作用域 ID |

返回适用于图可视化库（如 D3.js）的节点和边数据。
