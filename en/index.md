---
layout: home

hero:
  name: "ChatAI Plugin"
  text: "Yunzai-Bot AI Chat Plugin"
  tagline: Powerful AI conversation plugin with multi-model support, MCP tool calling, long-term memory and more
  image:
    src: /logo.svg
    alt: ChatAI Plugin
  actions:
    - theme: brand
      text: Quick Start
      link: /en/guide/getting-started
    - theme: alt
      text: Architecture
      link: /en/architecture/
    - theme: alt
      text: GitHub
      link: https://github.com/XxxXTeam/chatai-plugin

features:
  - icon: 🤖
    title: Multi-Model Support
    details: Support for OpenAI, Claude, Gemini, DeepSeek and other mainstream AI models with unified interface
  - icon: 🔧
    title: MCP Tool Calling
    details: Based on Model Context Protocol standard, supports built-in tools, custom JS tools and external MCP servers
  - icon: 🧠
    title: Long-term Memory
    details: Vector database based memory system that lets AI remember user preferences and history
  - icon: 💬
    title: Smart Conversations
    details: Context management, multi-turn dialogue, quoted message parsing for natural conversation experience
  - icon: 🎨
    title: Web Admin Panel
    details: Modern web management interface for visual configuration of channels, presets, tools and permissions
  - icon: 🔒
    title: Secure & Controllable
    details: Complete permission control system with user/group level feature restrictions and tool access control
---

## 🚀 Quick Start

::: code-group
```bash [Install]
# Run in Yunzai-Bot root directory
git clone https://github.com/XxxXTeam/chatai-plugin.git ./plugins/chatai-plugin
pnpm install
pnpm rebuild better-sqlite3
```

```bash [Start]
pnpm start
```
:::

::: tip 🎉 Getting Started
After starting, send `#ai管理面板` to get the Web panel login link and follow the setup wizard.
:::

## 📦 Core Features

| Feature | Description | Documentation |
|:--------|:------------|:--------------|
| **Multi-Channel** | Configure multiple API channels for load balancing and failover | [Channels](/en/config/channels) |
| **Preset System** | Rich AI persona presets with custom System Prompt support | [Presets](/en/guide/presets) |
| **Triggers** | Support @mention, prefix trigger, keyword trigger, random trigger | [Triggers](/en/guide/triggers) |
| **Tool Calling** | AI can call 60+ built-in tools to perform actions | [Tools](/en/tools/) |
| **Group Management** | Independent configuration per group with different presets | [Features](/en/config/features) |
| **Long-term Memory** | Vector database based user memory system | [Memory](/en/config/memory) |

## 📚 Documentation Guide

::: tip 📖 Read as Needed
- **New Users**: Start with [Quick Start](/en/guide/getting-started)
- **Advanced Users**: Check [Configuration](/en/config/) for more options
- **Developers**: See [Architecture](/en/architecture/) and [Tool Development](/en/tools/)
:::
