# Chat API <Badge type="tip" text="Chat" />

API endpoints for chat and conversation management.

## Send Message {#send}

### POST /api/chat

Send a message and get AI response.

**Request:**
```json
{
  "message": "Hello, how are you?",
  "userId": "123456789",
  "groupId": "987654321",
  "preset": "default"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "I'm doing great, thank you for asking!",
    "conversationId": "conv_abc123",
    "usage": {
      "promptTokens": 50,
      "completionTokens": 20,
      "totalTokens": 70
    }
  }
}
```

## Stream Message {#stream}

### POST /api/chat/stream

Send message with streaming response.

**Request:**
Same as `/api/chat`

**Response (SSE):**
```
data: {"type": "start", "conversationId": "conv_abc123"}
data: {"type": "content", "text": "I'm "}
data: {"type": "content", "text": "doing "}
data: {"type": "content", "text": "great!"}
data: {"type": "end", "usage": {...}}
```

## List Conversations {#list}

### GET /api/conversations

Get conversation history.

**Query Parameters:**
| Param | Type | Description |
|:------|:-----|:------------|
| `userId` | string | Filter by user |
| `groupId` | string | Filter by group |
| `limit` | number | Max results |
| `offset` | number | Pagination |

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv_abc123",
        "userId": "123456789",
        "groupId": "987654321",
        "messageCount": 10,
        "lastMessage": "Thanks for the help!",
        "updatedAt": 1702622400000
      }
    ],
    "total": 50
  }
}
```

## Get Conversation {#get}

### GET /api/conversations/:id

Get specific conversation with messages.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv_abc123",
    "messages": [
      {
        "role": "user",
        "content": "Hello",
        "timestamp": 1702622300000
      },
      {
        "role": "assistant",
        "content": "Hi there!",
        "timestamp": 1702622310000
      }
    ]
  }
}
```

## Delete Conversation {#delete}

### DELETE /api/conversations/:id

Delete a conversation.

**Response:**
```json
{
  "success": true
}
```

## Clear Context {#clear}

### POST /api/conversations/:id/clear

Clear conversation context.

**Response:**
```json
{
  "success": true,
  "message": "Context cleared"
}
```

## Error Codes {#errors}

| Code | Description |
|:-----|:------------|
| `CONVERSATION_NOT_FOUND` | Conversation doesn't exist |
| `CHANNEL_UNAVAILABLE` | No available channels |
| `RATE_LIMITED` | Too many requests |
| `MODEL_ERROR` | Model returned error |

## Next Steps {#next}

- [Configuration API](./config) - Config endpoints
- [Tools API](./tools) - Tool management
