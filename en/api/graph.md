# Knowledge Graph API

All knowledge graph endpoints return a unified `{ code, message, data }` envelope. Successful responses return `code` `0`. The admin panel uses the streaming download endpoint `/api/graph/export` so the full graph is never assembled in browser memory.

## Scopes, Stats, and Visualization

```http
GET /api/graph/scopes
GET /api/graph/stats?scopeId=global
GET /api/graph/visualization?scopeId=global&limit=80&focusEntityId=<entityId>
```

`scopeId` may be omitted in the stats endpoint (in which case stats cover all scopes); entity endpoints require a non-empty `scopeId`. The visualization `limit` is capped at 500 and the response includes `totalEntities`, `totalRelationships`, `truncated`, and `limit` metadata.

## Entities

```http
GET    /api/graph/entities?scopeId=global&type=person&limit=100&offset=0
GET    /api/graph/entities/count?scopeId=global&query=Zhang&type=person
GET    /api/graph/entities/search?query=Zhang&scopeIds=global,group:demo&type=person&limit=20&offset=0
GET    /api/graph/entities/:entityId
POST   /api/graph/entities
PUT    /api/graph/entities/:entityId
DELETE /api/graph/entities/:entityId
```

Create entity request body:

```json
{
  "scopeId": "group_123456",
  "name": "Entity Name",
  "type": "person",
  "properties": { "age": 25, "role": "Admin" }
}
```

Entities are read back with the `entityType` field; the create request uses `type`. The two cannot be mixed.

## Entity History and Rollback

```http
GET  /api/graph/entities/:entityId/history?limit=10
POST /api/graph/entities/:entityId/rollback
```

The `targetVersion` in the rollback request body must be an integer greater than or equal to `1` (a decimal string is also accepted):

```json
{ "targetVersion": 2 }
```

Rollback creates a new version record and does not delete history. Deleted entities have no current record and cannot be rolled back through this endpoint.

## Relationships

```http
GET    /api/graph/entities/:entityId/relationships?direction=both
POST   /api/graph/relationships
PUT    /api/graph/relationships/:relationshipId
DELETE /api/graph/relationships/:relationshipId
GET    /api/graph/relationships/:relationshipId/history?limit=10
POST   /api/graph/relationships/:relationshipId/rollback
```

Create relationship request body:

```json
{
  "scopeId": "group_123456",
  "fromEntityId": "group_123456:entity:from",
  "toEntityId": "group_123456:entity:to",
  "relationType": "friend",
  "properties": {}
}
```

Both endpoint entities must exist and belong to the same scope. `direction` may only be `both`, `incoming`, or `outgoing`. Updating a relationship only modifies `properties`, with an optional `changeReason`; the rollback body is the same as for entities.

## Graph Queries

```http
GET /api/graph/subgraph?entityId=<entityId>&depth=2&scopeIds=global&maxNodes=200&maxEdges=400
GET /api/graph/path?fromEntityId=<id>&toEntityId=<id>&maxDepth=5&relationTypes=friend,works_at
GET /api/graph/context?userId=<userId>&groupId=<groupId>&maxEntities=15
```

`depth` and `maxDepth` are counted in relationship edges; for example `maxDepth=1` allows only a single edge. Subgraph node and edge limits are capped at 1000 and 5000 respectively; the response carries `truncated` and `limit`, and the frontend must inform the user when a limit was hit. Relationship edges returned in a subgraph always connect only the entities returned by that request; with `maxEdges=0` only the central entity is returned. Relationships in path results strictly obey the `relationTypes` filter.

Entity and relationship identifiers placed in URL path segments must be URL-encoded (especially when a scope contains `/`, spaces, or `?`). Query parameter values like `scopeIds` and `relationTypes` are comma-separated and encoded by the client.

## Export and Import

### Streaming Export (Recommended)

```http
GET /api/graph/export?scopeId=global
```

The response is an `application/json` attachment with `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`. Export document structure:

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

### Compatibility Export and Import

```http
POST /api/graph/export
POST /api/graph/import
```

The compatibility export request body is `{ "scopeId": "global" }`. The import request body is `{ "graphData": <the export object above>, "targetScopeId": "optional target scope" }`; unknown `schemaVersion` values, `truncated: true`, or summaries inconsistent with `counts` are rejected.