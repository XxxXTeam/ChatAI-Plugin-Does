---
layout: home

hero:
  name: "ChatAI Plugin"
  text: "Yunzai-Bot AI 聊天插件"
  tagline: 功能强大的 AI 对话插件，支持多模型、MCP 工具调用、长期记忆等特性
  image:
    src: /logo.svg
    alt: ChatAI Plugin
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看架构
      link: /architecture/
    - theme: alt
      text: GitHub
      link: https://github.com/XxxXTeam/chatai-plugin

features:
  - icon: 🤖
    title: 多模型支持
    details: 支持 OpenAI、Claude、Gemini、DeepSeek 等主流 AI 模型，统一接口无缝切换
  - icon: 🔧
    title: MCP 工具调用
    details: 基于 Model Context Protocol 标准，支持内置工具、自定义 JS 工具和外部 MCP 服务器
  - icon: 🧠
    title: 长期记忆
    details: 基于向量数据库的长期记忆系统，让 AI 记住用户偏好和历史信息
  - icon: 💬
    title: 智能对话
    details: 支持上下文管理、多轮对话、引用消息解析，提供自然流畅的对话体验
  - icon: 🎨
    title: Web 管理面板
    details: 现代化的 Web 管理界面，可视化配置渠道、预设、工具和权限
  - icon: 🔒
    title: 安全可控
    details: 完善的权限控制系统，支持用户/群组级别的功能限制和工具访问控制
---

## 🚀 快速体验

::: code-group
```bash [安装]
# 在 Yunzai-Bot 根目录执行
git clone https://github.com/XxxXTeam/chatai-plugin.git ./plugins/chatai-plugin
pnpm install
```

```bash [启动]
pnpm start
```
:::

::: tip 🎉 开始使用
启动后发送 `#ai管理面板` 获取 Web 面板登录链接，按引导完成配置即可开始使用。
:::

## 📦 核心特性

| 特性 | 说明 | 相关文档 |
|:-----|:-----|:---------|
| **多渠道** | 配置多个 API 渠道，实现负载均衡和故障转移 | [渠道配置](/config/channels) |
| **预设系统** | 丰富的 AI 人格预设，支持自定义 System Prompt | [预设管理](/guide/presets) |
| **触发方式** | 支持 @机器人、前缀触发、关键词触发、随机触发 | [触发配置](/guide/triggers) |
| **工具调用** | 22 个类别的内置工具，覆盖消息、群管、搜索、绘图等 | [工具开发](/tools/) |
| **群组管理** | 群组级别的独立配置，每个群可使用不同预设 | [群组配置](/config/features) |
| **长期记忆** | 基于结构化记忆表的用户记忆系统，总结输出 `[分类] 内容` 结构化行 | [记忆配置](/config/memory) |

## 📚 文档导航

::: tip 📖 按需阅读
- **新手用户**：建议从 [快速开始](/guide/getting-started) 开始阅读
- **进阶用户**：查看 [配置文档](/config/) 了解更多选项
- **开发者**：可直接查看 [架构文档](/architecture/) 和 [工具开发](/tools/)
:::

<div style="display: flex; justify-content: center; margin-top: 2rem;">
  <span style="color: #888; font-size: 13px;">📊 访问统计</span>
</div>

