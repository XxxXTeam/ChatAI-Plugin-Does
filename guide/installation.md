# 安装部署

本文档详细说明 ChatAI 插件的安装部署流程。

## 系统要求 {#requirements}

| 依赖 | 版本要求 | 说明 |
|:-----|:---------|:-----|
| **Node.js** | `≥ 18.0` | 推荐 LTS 版本（18/20/22） |
| **pnpm** | `≥ 8.0` | 包管理器 |
| **Yunzai-Bot** | V3 | Miao-Yunzai 或 TRSS-Yunzai |
| **编译工具** | 最新 | 用于构建 `better-sqlite3` 原生模块 |
| **Git** | 最新 | 用于克隆和更新 |

::: details 可选依赖
| 依赖 | 说明 |
|:-----|:-----|
| **Redis** | 缓存支持（可选，推荐启用） |
| **Puppeteer/Chrome** | Markdown 渲染为图片（可选） |
:::

## 环境准备 {#env}

### Node.js

```bash
# 检查版本
node -v  # 应输出 v18.x.x 或更高

# 使用 nvm 安装（推荐）
nvm install 18
nvm use 18
```

### pnpm

```bash
# 安装 pnpm
npm install -g pnpm

# 检查版本
pnpm -v  # 应输出 8.x.x 或更高
```

### 编译工具

`better-sqlite3` 是原生 C++ 模块，需要系统编译工具链：

::: code-group

```bash [Windows]
# 方式1：安装 Visual Studio Build Tools（推荐）
# 下载地址: https://visualstudio.microsoft.com/visual-cpp-build-tools/
# 安装时勾选 "使用 C++ 的桌面开发" 工作负载

# 方式2：使用 winget 安装
winget install Microsoft.VisualStudio.2022.BuildTools
```

```bash [Linux (Debian/Ubuntu)]
sudo apt update
sudo apt install build-essential python3 make g++
```

```bash [Linux (CentOS/RHEL)]
sudo yum groupinstall "Development Tools"
sudo yum install python3
```

```bash [macOS]
xcode-select --install
```

:::

## 安装插件 {#install}

### 方式一：Git 克隆（推荐）

在 **Yunzai 根目录** 执行：

```bash
git clone https://github.com/XxxXTeam/chatai-plugin.git ./plugins/chatgpt-plugin
```

### 方式二：手动下载

1. 从 [GitHub Releases](https://github.com/XxxXTeam/chatai-plugin/releases) 下载最新版本
2. 解压到 `plugins/chatgpt-plugin` 目录

## 安装依赖 {#deps}

在 **Yunzai 根目录** 执行：

```bash
pnpm install
```

::: warning 注意
必须在 **Yunzai 根目录**执行，不是插件目录！Yunzai 使用 workspace 管理依赖。
:::

## 构建原生模块 {#build}

运行 pnpm 周期脚本来构建原生模块：

```bash
pnpm approve-builds
```

运行周期脚本后，需要删除依赖和锁文件重新安装：

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 常见构建问题 {#build-issues}

::: details 问题：找不到 Python
```bash
# 确认 Python 已安装
python3 --version

# 设置 Python 路径
npm config set python /usr/bin/python3

# Windows 用户：确保 Python 已加入 PATH 环境变量
```
:::

::: details 问题：node-gyp 编译错误
```bash
# 全局安装 node-gyp
npm install -g node-gyp

# 清理缓存后重试
pnpm store prune
pnpm install
pnpm approve-builds
```
:::

::: details 问题：ABI 版本不兼容（切换 Node.js 版本后）
```bash
# 删除依赖和锁文件后重新安装并构建
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm approve-builds
rm -rf node_modules pnpm-lock.yaml
pnpm install
```
:::

::: details 问题：Windows 上编译失败
```bash
# 确认安装了 Visual Studio Build Tools
# 如果仍然失败，尝试指定 VS 版本
npm config set msvs_version 2022

# 或尝试使用预编译版本
npm install --build-from-source=false better-sqlite3
```
:::

## 目录结构 {#structure}

安装完成后，插件目录结构如下：

```
plugins/chatgpt-plugin/
├── apps/              # 应用模块（命令处理、事件响应）
│   ├── chat.js        # 主聊天处理器
│   ├── Commands.js    # 命令管理
│   ├── Management.js  # 插件管理
│   ├── ImageGen.js    # 图片生成
│   ├── Galgame.js     # Galgame 游戏
│   └── ...
├── config/            # 配置管理
│   └── config.yaml    # 主配置文件（首次启动自动生成）
├── data/              # 运行时数据
│   ├── chaite.db      # SQLite 数据库
│   ├── presets.json    # 预设数据
│   └── tools/         # 自定义工具脚本
├── src/               # 源代码
│   ├── core/          # 核心层（适配器、缓存、类型）
│   ├── mcp/           # MCP 工具系统
│   ├── services/      # 服务层（聊天、存储、记忆等）
│   └── utils/         # 工具函数
├── frontend/          # Web 管理面板前端
├── resources/         # 静态资源和模板
└── index.js           # 插件入口
```

## 启动验证 {#verify}

启动 Yunzai-Bot：

```bash
pnpm start
```

看到类似以下输出说明插件加载成功：

```
╔══════════════════════════════════════════╗
║          ChatAI Plugin v1.x.x           ║
╚══════════════════════════════════════════╝
  Web 面板: http://xxx.xxx.xxx.xxx:3000
  工具数量: xx 个
```

### 验证清单

- [ ] 控制台无报错信息
- [ ] Web 面板地址可访问
- [ ] 发送 `#ai状态` 有响应
- [ ] 发送 `#ai管理面板` 收到登录链接

## TRSS 环境 {#trss}

如果使用 TRSS-Yunzai，插件会自动检测并共享端口：

```yaml
web:
  sharePort: true       # 启用共享端口
  mountPath: /chatai    # 挂载路径
```

::: tip TRSS 端口共享
TRSS 环境下插件会自动挂载到 TRSS 的 Express 实例，无需额外端口。
管理面板地址变为 `http://your-host:TRSS端口/chatai`
:::

## 更新插件 {#update}

### 命令更新（推荐）

直接向机器人发送：

```
#ai更新
```

### 手动更新

```bash
cd plugins/chatgpt-plugin
git pull
cd ../..
pnpm install
pnpm approve-builds  # 如涉及原生模块更新
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

::: tip 更新前备份
建议更新前备份 `config/config.yaml` 和 `data/` 目录。配置文件更新后会自动合并（新增字段使用默认值）。
:::

## 卸载插件 {#uninstall}

```bash
# 删除插件目录
rm -rf plugins/chatgpt-plugin

# 重新安装依赖（清理孤立包）
pnpm install
```

## 下一步

- [基础配置](./basic-config) - 配置 API 渠道
- [首次使用](./first-use) - 开始使用插件
- [故障排除](/troubleshooting) - 安装问题排查