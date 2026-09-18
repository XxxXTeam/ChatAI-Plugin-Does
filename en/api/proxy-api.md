# Proxy API

API management for network proxy configuration.

## Get Proxy Config

```http
GET /api/proxy
```

**Response**

```json
{
  "success": true,
  "data": {
    "enabled": false,
    "profiles": [],
    "scopes": {
      "browser": { "enabled": false, "profileId": null },
      "api": { "enabled": false, "profileId": null },
      "channel": { "enabled": false, "profileId": null }
    }
  }
}
```

## Update Proxy Global Switch

```http
PUT /api/proxy
```

**Request Body**

```json
{
  "enabled": true
}
```

## Set Scope Proxy

```http
PUT /api/proxy/scopes/:scope
```

**Path parameter**: `scope` can be `browser`, `api`, or `channel`

**Request Body**

```json
{
  "profileId": "profile_1",
  "enabled": true
}
```

## Manage Proxy Profiles

```http
POST /api/proxy/profiles
PUT /api/proxy/profiles/:id
DELETE /api/proxy/profiles/:id
```

**Request Body (create/update)**

```json
{
  "name": "My Proxy",
  "type": "http",
  "host": "127.0.0.1",
  "port": 7890
}
```

## Test Proxy Connectivity

```http
POST /api/proxy/test
```

**Request Body**

```json
{
  "profileId": "profile_1"
}
```