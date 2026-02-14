# 快速开始 <Badge type="tip" text="5分钟" />

本指南帮助你在 **5 分钟**内完成 ChatAI 插件的安装和基础配置。

## 环境要求 {#requirements}

::: info 前置条件
确保你的环境满足以下要求，否则可能导致安装失败。
:::

| 依赖 | 版本要求 | 说明 | 检查命令 |
|:-----|:---------|:-----|:---------|
| **Node.js** | `≥ 18.0` | 推荐使用 LTS 版本 | `node -v` |
| **pnpm** | `≥ 8.0` | 包管理器 | `pnpm -v` |
| **Yunzai-Bot** | V3 | Miao-Yunzai 或 TRSS-Yunzai | - |

## 安装步骤 {#installation}

### 第一步：克隆插件 {#step-1}

在 **Yunzai-Bot 根目录**执行：

```bash
git clone https://github.com/XxxXTeam/chatai-plugin.git ./plugins/chatai-plugin
```

::: details 使用 SSH 克隆（可选）
```bash
git clone git@github.com:XxxXTeam/chatai-plugin.git ./plugins/chatai-plugin
```
:::

### 第二步：安装依赖 {#step-2}

```bash
pnpm install
```

::: warning 注意
必须在 **Yunzai 根目录**执行，而不是插件目录！
:::

### 第三步：构建原生模块 {#step-3}

插件使用 `better-sqlite3` 作为本地数据库，需要构建原生模块：

```bash
pnpm rebuild better-sqlite3
```

::: tip 编译工具安装指南
如果构建失败，请根据你的操作系统安装编译工具：

::: code-group
```bash [Windows]
# 安装 Visual Studio Build Tools
# 下载地址: https://visualstudio.microsoft.com/visual-cpp-build-tools/
# 安装时选择 "使用 C++ 的桌面开发"
npm install -g windows-build-tools
```

```bash [Linux (Debian/Ubuntu)]
sudo apt update
sudo apt install build-essential python3
```

```bash [Linux (CentOS/RHEL)]
sudo yum groupinstall "Development Tools"
sudo yum install python3
```

```bash [macOS]
xcode-select --install
```
:::

### 第四步：启动服务 {#step-4}

::: code-group
```bash [pnpm]
pnpm start
```

```bash [node]
node app
```
:::

## 首次配置 {#first-config}

### 获取管理面板 {#get-panel}

启动成功后，向机器人发送：

```txt
#ai管理面板
```

机器人会私聊发送一个**临时登录链接**，点击即可进入 Web 管理面板。

::: tip 💡 永久链接
发送 `#ai管理面板 永久` 可获取永久登录链接（需妥善保管）
:::

### 管理面板预览 {#panel-preview}

![仪表盘](/images/image.png)

<div class="features-grid">

管理面板提供可视化配置界面，包括：

| 模块 | 功能 | 描述 |
|:-----|:-----|:-----|
| 🏠 **仪表盘** | 状态概览 | 实时显示系统状态、使用统计、版本信息 |
| 📡 **渠道管理** | API 配置 | 配置多个 API 渠道，支持负载均衡和故障转移 |
| 🎭 **预设管理** | AI 人格 | 管理和切换不同的 AI 人格预设 |
| 👥 **群组管理** | 群聊配置 | 为每个群设置独立的预设、触发方式 |
| 📊 **使用统计** | 数据分析 | Token 消耗、对话统计、工具调用分析 |

</div>

### 初始化向导 {#setup-wizard}

::: info 引导设置
首次进入面板会自动弹出初始化引导向导，按步骤完成配置即可。
:::

<div class="steps-container">

**Step 1** - 选择渠道
> 从预设渠道选择（如 OpenAI、DeepSeek）或手动配置自定义渠道

**Step 2** - 填写 API Key
> 输入你的 API 密钥，支持环境变量引用 `${ENV_VAR}`

**Step 3** - 测试连接
> 点击测试按钮验证 API 配置是否正确

**Step 4** - 选择模型
> 从渠道自动获取可用模型列表，选择默认模型

**Step 5** - 选择预设
> 选择 AI 人格预设，或使用默认预设

**Step 6** - 配置触发
> 设置触发前缀（如 `#chat`）、@触发等

</div>

::: tip 🎉 免费体验
选择 **OpenEL 免费渠道** 可直接体验，无需 API Key！

⚠️ 免费渠道由第三方提供，**不保证可用性和稳定性**，仅供体验使用。建议尽快配置自己的 API Key，详见 [渠道配置](../config/channels#free-channels)。
:::

## 开始对话 {#start-chat}

配置完成后，使用设置的触发方式与 AI 对话：

::: code-group
```txt [前缀触发]
#chat 你好，请介绍一下自己
```

```txt [@触发]
@机器人 今天天气怎么样？
```

```txt [私聊]
你好，请帮我写一段代码
```
:::

## 常用命令 {#commands}

::: tip 命令速查表
所有命令均以配置的前缀开头（默认 `#`）
:::

| 命令 | 说明 | 权限 |
|:-----|:-----|:-----|
| `#ai管理面板` | 获取 Web 管理面板链接 | 主人 |
| `#ai管理面板 永久` | 获取永久登录链接 | 主人 |
| `#结束对话` | 结束对话并清除上下文 | 所有人 |
| `#清除记忆` | 清除个人记忆数据 | 所有人 |
| `#ai状态` | 查看插件运行状态 | 所有人 |
| `#ai调试开启` | 开启调试模式 | 主人 |
| `#mcp状态` | 查看 MCP 工具状态 | 主人 |

::: details 更多命令
```txt
#ai重载配置     - 重新加载配置文件
#工具日志       - 查看工具调用日志
#ai帮助         - 显示帮助信息
```
:::

## 内置工具概览 {#builtin-tools}

插件内置 **22 个工具类别**，涵盖消息、群管、搜索、媒体、绘图等各类功能：

| 工具类别 | 功能描述 |
|:---------|:---------|
| **基础工具** | 时间获取、随机数、环境信息等 |
| **用户/群组信息** | 获取用户信息、群信息、成员列表 |
| **消息操作** | 发送消息、@用户、聊天记录、转发消息解析 |
| **群管理** | 禁言、踢人、设置群名片等管理功能 |
| **群统计** | 发言榜、龙王、不活跃成员分析 |
| **文件操作** | 群文件上传下载、本地文件读写、URL下载 |
| **媒体处理** | 图片解析、OCR、二维码生成、语音处理 |
| **搜索/网页** | 网页搜索、Wiki查询、翻译、访问网页 |
| **记忆/上下文** | 用户记忆管理、对话上下文管理 |
| **语音/声聊** | TTS语音合成、语音识别、AI语音对话 |
| **定时任务/提醒** | 自然语言定时任务、定时提醒 |
| **绘图服务** | AI绘图生成、文生图、图生图、文生视频 |
| **扩展工具集** | QQ音乐、表情包、B站视频、GitHub、AI图片编辑 |
| **QQ空间** | 发布说说、点赞、个性签名、戳一戳 |

::: tip 工具配置
在 Web 管理面板的「工具管理」中可以按类别启用/禁用工具，支持热重载。详见 [内置工具](../tools/builtin)。
:::

## 下一步 {#next-steps}

<div class="next-steps">

::: tip 📖 推荐阅读
根据你的需求，选择下一步要阅读的文档：
:::

| 文档 | 适合人群 | 内容 |
|:-----|:---------|:-----|
| [安装部署](./installation) | 新手用户 | 详细的安装流程、环境配置、常见问题 |
| [基础配置](./basic-config) | 所有用户 | 了解核心配置选项和参数说明 |
| [多渠道配置](./channels) | 进阶用户 | 配置多个 API 渠道实现负载均衡 |
| [预设与人格](./presets) | 进阶用户 | 创建和管理 AI 人格预设 |
| [架构概述](/architecture/) | 开发者 | 了解插件内部架构和设计理念 |

</div>
