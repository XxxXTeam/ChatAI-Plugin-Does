# Knowledge Base API

CRUD operations and semantic search for knowledge base documents.

## Get All Documents

```http
GET /api/knowledge
```

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Document Title",
      "content": "Content excerpt (first 500 characters)...",
      "contentLength": 2500,
      "truncated": true,
      "presetId": "default",
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

## Search Knowledge Base

```http
GET /api/knowledge/search
```

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| query | string | Search keyword |
| presetId | string | Filter by preset |
| limit | number | Number of results (default 10) |

## Get a Single Document

```http
GET /api/knowledge/:id
```

## Create a Document

```http
POST /api/knowledge
```

**Request Body**

```json
{
  "title": "Document Title",
  "content": "Document content...",
  "presetId": "default"
}
```

## Update a Document

```http
PUT /api/knowledge/:id
```

## Delete a Document

```http
DELETE /api/knowledge/:id
```