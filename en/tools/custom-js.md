# Custom JS Tools <Badge type="tip" text="Easy" />

Create custom tools without modifying plugin source code.

## Overview {#overview}

Custom JS tools are stored in `data/tools/` directory with **hot reload** support.

::: tip Quick Start
1. Create `.js` file in `data/tools/`
2. Export tool definition
3. Tool is automatically available
:::

## Directory Structure {#structure}

```
data/tools/
├── example_tool.js    # Example tool
├── my_weather.js      # Custom weather tool
└── README.md          # Documentation
```

## Tool Template {#template}

```javascript
// data/tools/my_tool.js
export const tools = [
  {
    name: 'my_custom_tool',
    description: 'What this tool does',
    
    inputSchema: {
      type: 'object',
      properties: {
        param1: {
          type: 'string',
          description: 'Parameter description'
        }
      },
      required: ['param1']
    },
    
    handler: async (args, context) => {
      const { param1 } = args
      
      // Your logic here
      return {
        success: true,
        result: `Processed: ${param1}`
      }
    }
  }
]

export default tools
```

## Context Access {#context}

Access runtime context via second parameter:

```javascript
handler: async (args, context) => {
  const { userId, groupId, event } = context
  
  // Use context info
  return { userId, groupId }
}
```

## Examples {#examples}

### Simple Calculator {#example-calc}

```javascript
export const tools = [{
  name: 'calculate',
  description: 'Perform arithmetic calculation',
  
  inputSchema: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Math expression like "2 + 2"'
      }
    },
    required: ['expression']
  },
  
  handler: async ({ expression }) => {
    try {
      // Safe eval for simple math
      const result = Function(`return ${expression}`)()
      return { result: String(result) }
    } catch {
      return { error: 'Invalid expression' }
    }
  }
}]
```

### Web Fetch {#example-fetch}

```javascript
export const tools = [{
  name: 'fetch_url',
  description: 'Fetch content from URL',
  
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'URL to fetch' }
    },
    required: ['url']
  },
  
  handler: async ({ url }) => {
    const response = await fetch(url)
    const text = await response.text()
    return { 
      status: response.status,
      content: text.slice(0, 1000)
    }
  }
}]
```

## Hot Reload {#hot-reload}

::: tip Auto Reload
Files in `data/tools/` are watched. Changes apply automatically without restart.
:::

To manually reload:
```txt
#ai重载配置
```

## Best Practices {#best-practices}

| Practice | Description |
|:---------|:------------|
| **Clear naming** | Use descriptive `snake_case` names |
| **Good descriptions** | Help AI understand when to use |
| **Error handling** | Always handle exceptions |
| **Input validation** | Validate parameters |
| **Limit output** | Keep responses concise |

## Next Steps {#next}

- [Built-in Tools](./builtin) - Core tool reference
- [MCP Server](./mcp-server) - External MCP integration
- [Security](./security) - Permission control
