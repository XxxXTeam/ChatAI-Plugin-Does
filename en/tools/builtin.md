# Built-in Tools <Badge type="info" text="25 Categories" />

Built-in tools are core plugin functionality, located in `src/mcp/tools/` directory, managed by `BuiltinMcpServer`.

::: tip Tool Management
Enable/disable tools by category via Web panel, supports **hot reload** without restart.
:::

## Directory Structure {#directory}

::: details Full Directory Structure (click to expand)
```
src/mcp/tools/
├── index.js         # Tool loader (dynamic import, category management)
├── helpers.js       # Tool helper functions (param validation, permission check)
├── basic.js         # Basic tools
├── user.js          # User info
├── group.js         # Group info
├── message.js       # Message operations
├── admin.js         # Group admin
├── groupStats.js    # Group statistics
├── file.js          # File operations
├── media.js         # Media processing
├── web.js           # Web access
├── search.js        # Search tools
├── utils.js         # Utility tools
├── memory.js        # Memory management
├── context.js       # Context management
├── bot.js           # Bot info
├── voice.js         # Voice/audio
├── extra.js         # Extra tools
├── shell.js         # System commands (⚠️dangerous)
├── schedule.js      # Scheduled tasks
├── bltools.js       # Extended tools
├── reminder.js      # Reminders
├── imageGen.js      # Image generation
├── qzone.js         # QQ Zone/Moments
├── emoji.js         # Emoji management
├── skills.js        # Skills management
└── knowledgeGraph.js # Knowledge graph
```
:::

## Tool Categories (25) {#categories}

::: info Category Description
Each category contains multiple related tools, can be enabled/disabled as a whole.
:::

| Category | Name | Description | Risk Level |
|:---------|:-----|:------------|:----------:|
| `basic` | Basic Tools | Time, random numbers, basic functions | 🟢 Safe |
| `user` | User Info | Get user info, friend list, etc. | 🟢 Safe |
| `group` | Group Info | Get group info, member list, etc. | 🟢 Safe |
| `message` | Message Ops | Send messages, @users, get chat history, parse forwards | 🟡 Medium |
| `admin` | Group Admin | Mute, kick, set card, admin functions | 🟠 Higher |
| `groupStats` | Group Stats | Group level, dragon king, talk ranking, lucky char, inactive members | 🟢 Safe |
| `file` | File Ops | Group file upload/download, local file read/write, URL download | 🟠 Higher |
| `media` | Media | Image parsing, voice processing, QR code generation | 🟢 Safe |
| `web` | Web Access | Access web pages, get content | 🟡 Medium |
| `search` | Search | Web search, Wiki query, translation | 🟢 Safe |
| `utils` | Utilities | Calculation, encoding, time processing | 🟢 Safe |
| `memory` | Memory | User memory CRUD | 🟢 Safe |
| `context` | Context | Conversation context, group context | 🟢 Safe |
| `bot` | Bot Info | Get bot info, status, friend list | 🟢 Safe |
| `voice` | Voice/Audio | AI voice chat, TTS synthesis, voice recognition | 🟢 Safe |
| `extra` | Extra | Weather, quotes, dice, countdown, reminders, illustrations | 🟢 Safe |
| `shell` | System Commands | Execute shell commands, get system info | 🔴 **Dangerous** |
| `schedule` | Scheduled Tasks | Create, manage scheduled tasks, supports periodic execution | 🟡 Medium |
| `bltools` | Extended | QQ Music, stickers, Bilibili, GitHub, AI image editing | 🟢 Safe |
| `reminder` | Reminders | Set timed reminders, supports relative/absolute time, repeat | 🟢 Safe |
| `imageGen` | Image Generation | AI image generation, text-to-image, image-to-image, text-to-video | 🟢 Safe |
| `qzone` | QQ Zone | Post moments, get moments list, like, delete, signature, etc. | 🟡 Medium |
| `emoji` | Emoji Management | Save stickers, send saved stickers, list sticker library | 🟢 Safe |
| `skills` | Skills Management | View, load, unload document skills for models to activate on demand | 🟢 Safe |
| `knowledgeGraph` | Knowledge Graph | Query and maintain the knowledge graph (entities, relationships, subgraphs) | 🟢 Safe |

### Knowledge Graph Tools (kg_*)

The `knowledgeGraph` category provides 12 tools backed by the `kg_entities` / `kg_relationships` tables.

| Tool | Purpose | Key Parameters |
|:-----|:--------|:---------------|
| `kg_get_knowledge` | Get knowledge graph context for the current user/group | `user_id`・`group_id` (default to current session); `max_entities` (default 15, max 100); `include_relations` (default true) |
| `kg_list_entities` | List entities in a scope | `scope_id` (`global` / `user:<id>` / `group:<id>` / `group:<id>:user:<id>`, derived from session if omitted); `type` (person/thing/place/concept/event); `limit` (default 20, max 100) |
| `kg_search_entities` | Fuzzy-search entities by name | `query` (required); `type`; `limit` (default 10, max 100) |
| `kg_save_entity` | Save an entity; same-name entities in the same scope merge automatically | `name`・`type` (required); `scope_id`; `properties` (object, e.g. `{age: 20, job: "student"}`) |
| `kg_update_entity` | Update entity properties or type (for corrections) | `entity_id` (required); `name`; `type`; `properties` (full replace) |
| `kg_delete_entity` | Delete an entity (history kept, reversible) | `entity_id` (required) |
| `kg_entity_history` | Get version history of an entity | `entity_id` (required); `limit` (default 10, max 100) |
| `kg_entity_relations` | Get entities directly related to an entity | `entity_id` (required) |
| `kg_save_relation` | Save a relationship between two entities | `from_entity`・`to_entity`・`relation_type` (required; endpoints may be IDs or exact names); `scope_id`; `properties` |
| `kg_delete_relation` | Delete a relationship (history kept, reversible) | `relationship_id` (required) |
| `kg_query_subgraph` | Explore the subgraph around an entity | `entity_id` (required); `depth` (default 1, max 3) |
| `kg_stats` | Get scope statistics (entity/relation counts, type distribution) | `scope_id` (default current session scope; `null` for global totals) |

When `scope_id` is omitted it is derived from the event context: group+user → `group:<gid>:user:<uid>`; group only → `group:<gid>`; user only → `user:<uid>`; no event → `global`. Entity types match the `KnowledgeGraphExtractor` whitelist (`person` / `thing` / `place` / `concept` / `event`).

The `knowledgeGraph` category was added in 2026-09 and is enabled by default for existing configurations via the built-in "auto-enable new categories" logic.

::: danger shell Category Warning
`shell` category can execute system commands, has security risks. Only enable in trusted environments and restrict to master permission.
:::

## Creating Built-in Tools {#create-tool}

::: tip Development Flow
1. Add tool definition in category file → 2. Register new category (optional) → 3. Configure and enable
:::

### Step 1: Add Tool in Category File {#step-1}

```javascript{2-5,7-16,18-22}
// src/mcp/tools/basic.js
export const basicTools = [
  {
    // Tool name (snake_case, globally unique)
    name: 'my_tool',
    
    // Tool description (visible to AI, clear description helps correct calling)
    description: 'My tool description, explain function and use cases',
    
    // Parameter definition (JSON Schema format)
    inputSchema: {
      type: 'object',
      properties: {
        input: {
          type: 'string',
          description: 'Input parameter description'
        }
      },
      required: ['input']
    },
    
    // Handler function (async)
    handler: async (args) => {
      const { input } = args
      // Implementation logic
      return { success: true, result: input }
    }
  },
  // ...other tools
]
```

### Step 2: Register Tool Module (for new categories) {#step-2}

::: info Only for New Categories
Skip this step if adding tools to existing category.
:::

```javascript{3,9-13}
// src/mcp/tools/index.js
const toolModules = {
  basic: { file: './basic.js', export: 'basicTools' },
  myCategory: { file: './myCategory.js', export: 'myCategoryTools' },
  // ...
}

// Category metadata (for Web panel display)
const categoryMeta = {
  myCategory: { 
    name: 'My Category',        // Display name
    description: 'Category description',  // Category description
    icon: 'Tool'                // Icon name (Lucide icons)
  }
}
```

### Step 3: Configure and Enable {#step-3}

```yaml
# config.yaml
builtinTools:
  enabledCategories:
    - basic
    - myCategory  # Add new category
```

::: tip Manage via Web Panel
Can also enable/disable tool categories in Web Admin Panel → Tool Management.
:::

## Tool Examples {#examples}

::: tip Complete Examples
Two typical built-in tool implementations showing common patterns.
:::

### Example 1: Get Time (No Context) {#example-time}

```javascript{1,3-4,7-17,20-32}
// src/mcp/tools/basic.js
{
  name: 'get_current_time',
  description: 'Get current time and date info, supports timezone and format',
  
  inputSchema: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        description: 'Time format: full, date, time, timestamp',
        enum: ['full', 'date', 'time', 'timestamp']
      },
      timezone: {
        type: 'string',
        description: 'Timezone, default Asia/Shanghai'
      }
    }
  },
  
  handler: async (args) => {
    const now = new Date()
    const tz = args.timezone || 'Asia/Shanghai'
    
    const options = { timeZone: tz }
    const dateStr = now.toLocaleDateString('en-US', { ...options, year: 'numeric', month: '2-digit', day: '2-digit' })
    const timeStr = now.toLocaleTimeString('en-US', { ...options, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    
    return {
      text: `Current time: ${dateStr} ${timeStr}`,
      datetime: now.toISOString(),
      timestamp: now.getTime(),
      timezone: tz
    }
  }
}
```

### Example 2: Send Message (With Context) {#example-message}

```javascript{2,5-6,9-14,17-21}
// src/mcp/tools/message.js
import { getBuiltinToolContext } from '../BuiltinMcpServer.js'

{
  name: 'send_private_message',
  description: 'Send private message to specified user',
  
  inputSchema: {
    type: 'object',
    properties: {
      user_id: { type: 'string', description: 'Target user QQ number' },
      message: { type: 'string', description: 'Message content' }
    },
    required: ['user_id', 'message']
  },
  
  handler: async (args) => {
    const ctx = getBuiltinToolContext()
    const bot = ctx.getBot()
    
    await bot.pickUser(args.user_id).sendMsg(args.message)
    return { success: true, text: 'Message sent' }
  }
}
```

## Tool Properties {#tool-properties}

| Property | Type | Required | Description |
|:---------|:-----|:--------:|:------------|
| `name` | `string` | ✅ | Tool name, globally unique, use `snake_case` format |
| `description` | `string` | ✅ | Tool description, visible to AI, clear description aids correct calling |
| `inputSchema` | `object` | ❌ | JSON Schema format parameter definition, can omit if no params |
| `handler` | `function` | ✅ | Async handler function `async (args) => result` |

::: info inputSchema Format
Parameter definitions follow [JSON Schema](https://json-schema.org/) spec, supports these types:
- `string` - String
- `number` / `integer` - Number
- `boolean` - Boolean
- `array` - Array
- `object` - Object
:::

## Next Steps {#next-steps}

| Document | Description | Use Case |
|:---------|:------------|:---------|
| [Custom JS Tools](./custom-js) | Develop user tools | Quick development, no source modification |
| [Security](./security) | Tool security config | Understand permission control mechanisms |
| [MCP Server](./mcp-server) | External MCP integration | Reuse existing MCP servers |
