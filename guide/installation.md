# 安装部署

本文档详细说明 ChatAI 插件的安装部署流程。

## 环境准备

### Node.js

推荐使用 Node.js 18 LTS 或更高版本：

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

`better-sqlite3` 是原生模块，需要编译工具：

::: code-group

```bash [Windows]
# 安装 Visual Studio Build Tools
# 下载地址: https://visualstudio.microsoft.com/visual-cpp-build-tools/
# 安装时选择 "使用 C++ 的桌面开发"
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

## 安装插件

### 方式一：Git 克隆（推荐）

```bash
cd /path/to/yunzai
git clone https://github.com/XxxXTeam/chatai-plugin.git ./plugins/chatai-plugin
```

### 方式二：手动下载

1. 从 [GitHub Releases](https://github.com/XxxXTeam/chatai-plugin/releases) 下载最新版本
2. 解压到 `plugins/chatai-plugin` 目录

## 安装依赖

在 **Yunzai 根目录** 执行：

```bash
pnpm install
```

::: warning 注意
必须在 Yunzai 根目录执行，不是插件目录
:::

## 构建原生模块

```bash
pnpm rebuild better-sqlite3
```

### 常见构建问题

#### 问题：找不到 Python

```bash
# 设置 Python 路径
npm config set python /usr/bin/python3
```

#### 问题：node-gyp 错误

```bash
# 全局安装 node-gyp
npm install -g node-gyp

# 清理缓存后重试
pnpm store prune
pnpm install
pnpm rebuild better-sqlite3
```

#### 问题：ABI 不兼容

```bash
# 完全重建
rm -rf node_modules
pnpm install
pnpm rebuild
```

## 目录结构

安装完成后，插件目录结构如下：

```
plugins/chatai-plugin/
├── apps/              # 应用模块
├── config/            # 配置管理
├── data/              # 运行时数据
│   ├── presets/       # 预设文件
│   ├── tools/         # 自定义工具
│   └── chatai.db      # SQLite 数据库
├── docs/              # 文档
├── resources/         # 静态资源
├── src/               # 源代码
└── index.js           # 插件入口
```

## 启动验证

启动 Yunzai-Bot：

```bash
pnpm start
```

查看控制台输出，确认插件加载成功：

```
[ChatAI] 插件加载成功
```

## TRSS 环境

如果使用 TRSS-Yunzai，插件会自动检测并共享端口：

```yaml
# 配置文件中启用共享端口
web:
  sharePort: true
  mountPath: /chatai
```

## 更新插件

```bash
cd plugins/chatai-plugin
git pull
cd ../..
pnpm install
pnpm rebuild better-sqlite3
```

## 下一步

- [基础配置](./basic-config) - 配置 API 渠道
- [首次使用](./first-use) - 开始使用插件
