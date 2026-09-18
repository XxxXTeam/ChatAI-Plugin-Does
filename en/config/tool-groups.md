# Tool Group Configuration

Tool Groups group built-in tools by purpose so the **tool dispatcher** can select them on demand, avoiding pushing every tool to the model at once. Managed by `src/services/tools/ToolGroupManager.js`.

## Load Sources and Priority

`ToolGroupManager.init()` loads tool groups in the following order:

1. **`skills.groups` in `data/skills.yaml`** (priority): used when it exists and has enabled groups; source marked `skills-config`.
2. **Built-in tool categories `toolCategories`** (fallback): used when skills.yaml has no usable groups; source marked `builtin`.
3. **External MCP server tool groups** (appended): tools of connected external MCP servers form groups automatically, numbered after the built-in groups; source marked `mcp`.

::: warning About the toolGroups section in config.yaml
`config/config.yaml` may contain a `toolGroups` section; it is the **persisted artifact written by `saveGroups()`** (`config.set('toolGroups', ...)`) when tool groups are added/modified/deleted through the admin endpoints. `ToolGroupManager.init()` **does not** treat that section as a load source — the runtime tool groups follow `skills.yaml`. To adjust groups in the long term, edit `data/skills.yaml`.
:::

## Tool Group Definition in skills.yaml

Tool groups are defined in the `skills.groups` array of `data/skills.yaml`. Fields of each group:

```yaml
skills:
  groups:
    - index: 0                  # Tool group index (referenced during dispatch)
      name: 'basic'             # Group identifier
      description: 'Basic tools: time, date, lunar date, festivals, system environment info, etc.'
      tools:                    # Tool name list of this group
        - get_current_time
        - get_lunar_date
        # ...
      enabled: true             # Whether this group is enabled
    - index: 6
      name: 'admin'
      description: 'Group admin: mute, kick, set group card/title, send announcements, etc. (admin permission required)'
      tools: ['mute_member', 'kick_member', '...']
      enabled: true
      requiredPermission: 'admin'  # Permission required to use this group
```

### Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `index` | number | Yes | Group index; the dispatcher selects groups by index |
| `name` | string | Yes | Group identifier |
| `description` | string | Yes | Group description; the part before the colon (`：`) is used as the `displayName` |
| `tools` | string[] | Yes | Tool name list of this group |
| `enabled` | boolean | No | Whether enabled; defaults to `true`, disabled only when `false` |
| `requiredPermission` | string | No | Permission required to use this group (e.g. `admin`, `master`); any user can use it when unset |

> Note: `displayName` is derived from `description.split('：')[0]` (falls back to `name` when there is no colon); permission checks depend on the call context, and `requiredPermission` only applies when the request carries permission info.

## Built-in Tool Group Overview

The following are the default tool groups in `data/skills.yaml` (28 groups, index 0-27):

| Index | name | Description | Special Mark |
|-------|------|-------------|--------------|
| 0 | `basic` | Basic tools: time, date, lunar date, festivals, system environment, etc. | |
| 1 | `user` | User info: QQ profile, friend list, sender info, likes, etc. | |
| 2 | `bot` | Bot info: bot's own info, status, friend list, etc. | |
| 3 | `group` | Group info: group profile, member list, admins, announcements, etc. | |
| 4 | `group-stats` | Group stats: star ratings, dragon king, message leaderboard, lucky characters, group honors, etc. | |
| 5 | `message` | Message operations: send messages, @user, chat history, recall, forward parsing, etc. | |
| 6 | `admin` | Group admin: mute, kick, group card/title, announcements, etc. | `requiredPermission: admin` |
| 7 | `media` | Media processing: send images/videos/stickers, QR codes, image parsing, etc. | |
| 8 | `voice` | Voice: AI voice chat, TTS, speech recognition, sending voice, etc. | |
| 9 | `search` | Search: Bing/DuckDuckGo, web fetch, Wikipedia, translation, weather, trending, etc. | |
| 10 | `web` | Web access: visit a URL and fetch its content | |
| 11 | `memory` | Memory management: save, retrieve, delete user memories | |
| 12 | `context` | Context management: current/group context, clear conversation, quoted messages, etc. | |
| 13 | `file` | File operations: group file upload/download, local read/write, directory management, URL download, etc. | |
| 14 | `utils` | Utility tools: calculation, random, encoding, timestamp, regex, text processing, etc. | |
| 15 | `extra` | Extended tools: weather, hitokoto, dice, countdown, short links, IP lookup, illustrations, etc. | |
| 16 | `schedule` | Scheduled tasks: create natural-language scheduled tasks, view and cancel | |
| 17 | `shell` | System commands: execute shell, system/process info, environment variables, etc. | `enabled: false`, `requiredPermission: master` |
| 18 | `bltools-music` | Music search: QQ Music search and send music cards | |
| 19 | `bltools-emoji` | Sticker tools: sticker search, message sticker reactions | |
| 20 | `bltools-image` | Image tools: Bing images, wallpaper search, AI image editing | |
| 21 | `bltools-bilibili` | Bilibili tools: video search, video AI summary | |
| 22 | `bltools-video` | Video analysis: analyze video content with Zhipu AI | |
| 23 | `bltools-github` | GitHub tools: get detailed repository info | |
| 24 | `bltools-mindmap` | AI mind map: generate a mind map image from a description | |
| 25 | `reminder` | Reminders: relative/absolute time, daily/weekly repeats | |
| 26 | `imageGen` | AI drawing: text-to-image, image-to-image, text/image-to-video, preset-keyword generation | |
| 27 | `qzone` | QQ Space feeds: post/delete feeds, like, signature, poke, favorites, etc. | |

::: tip Dangerous tool group disabled by default
`shell` (index 17) defaults to `enabled: false` and requires `master` permission, containing high-risk tools such as `execute_command`. Before enabling it, make sure only the master can trigger it.
:::

## Tool Groups and Dispatch

The tool dispatcher (`buildDispatchPrompt`) lists enabled tool groups in the form `[index] display name: description` for the dispatch model to choose from. After the model returns the selected group indexes, `getToolsByGroupIndexes()` aggregates the tools of those groups (applying permission filtering and the security checks from `skills.yaml`) for the current conversation.

External MCP server groups are named `mcp_<server name>` with the display name `MCP: <server name>` and take part in dispatch automatically.

## Next Steps

- [MCP Config](./mcp) - Built-in tool categories and external MCP servers
- [Skills Agent Architecture](/architecture/skills-agent) - Skill system and tool loading