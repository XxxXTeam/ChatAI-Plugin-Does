# Installation <Badge type="tip" text="Detailed" />

Complete installation guide for ChatAI Plugin.

## Prerequisites {#prerequisites}

| Dependency | Version | Check Command |
|:-----------|:--------|:--------------|
| **Node.js** | `≥ 18.0` | `node -v` |
| **pnpm** | `≥ 8.0` | `pnpm -v` |
| **Yunzai-Bot** | V3 | - |
| **Build Tools** | Latest | See below |

## Step 1: Clone Repository {#clone}

::: code-group
```bash [HTTPS]
cd Yunzai-Bot
git clone https://github.com/XxxXTeam/chatai-plugin.git ./plugins/chatai-plugin
```

```bash [SSH]
cd Yunzai-Bot
git clone git@github.com:XxxXTeam/chatai-plugin.git ./plugins/chatai-plugin
```
:::

## Step 2: Install Dependencies {#deps}

```bash
pnpm install
```

## Step 3: Build Native Module {#build}

```bash
pnpm rebuild better-sqlite3
```

::: warning Build Tools Required
Install build tools if rebuild fails:

::: code-group
```bash [Windows]
npm install -g windows-build-tools
```

```bash [Linux]
sudo apt install build-essential python3
```

```bash [macOS]
xcode-select --install
```
:::

## Step 4: Start {#start}

```bash
pnpm start
```

## Verify Installation {#verify}

Send to bot:
```txt
#ai状态
```

::: tip Success
If you see plugin version and status info, installation is complete!
:::

## Directory Structure {#structure}

```
plugins/chatai-plugin/
├── apps/           # Yunzai plugin modules
├── config/         # Configuration
├── data/           # Runtime data
├── src/            # Source code
│   ├── core/       # Core layer
│   ├── mcp/        # MCP system
│   └── services/   # Service layer
├── frontend/       # Web panel source
└── resources/      # Static resources
```

## Next Steps {#next}

- [Quick Start](./getting-started) - Basic setup
- [Basic Config](./basic-config) - Configuration options
- [Troubleshooting](/en/troubleshooting) - Common issues
