# Authentication API <Badge type="tip" text="Auth" />

API endpoints for authentication and authorization.

## Login {#login}

### POST /api/auth/login

Login with token from bot command.

**Request:**
```json
{
  "token": "temporary_login_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "expiresAt": 1702622400000
  }
}
```

## Verify Token {#verify}

### GET /api/auth/verify

Check if current token is valid.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "userId": "123456789",
    "isMaster": true,
    "expiresAt": 1702622400000
  }
}
```

## Logout {#logout}

### POST /api/auth/logout

Invalidate current session.

**Response:**
```json
{
  "success": true
}
```

## Refresh Token {#refresh}

### POST /api/auth/refresh

Get new token before expiration.

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "expiresAt": 1702708800000
  }
}
```

## Error Codes {#errors}

| Code | Message | Description |
|:-----|:--------|:------------|
| `INVALID_TOKEN` | Token is invalid | Token malformed or expired |
| `TOKEN_EXPIRED` | Token has expired | Need new login |
| `UNAUTHORIZED` | Not authenticated | No token provided |

## Usage Examples {#examples}

::: code-group
```javascript [JavaScript]
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: loginToken })
})
const { data } = await response.json()

// Use token for subsequent requests
const config = await fetch('/api/config', {
  headers: { 'Authorization': `Bearer ${data.token}` }
})
```

```bash [cURL]
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"token": "xxx"}'

# Verify
curl http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer <token>"
```
:::

## Next Steps {#next}

- [Configuration API](./config) - Config endpoints
- [Tools API](./tools) - Tool management
