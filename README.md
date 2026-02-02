# ChatAI Plugin Documentation

[![Deploy to GitHub Pages](https://github.com/XxxXTeam/ChatAI-Plugin-Does/actions/workflows/deploy.yml/badge.svg)](https://github.com/XxxXTeam/ChatAI-Plugin-Does/actions/workflows/deploy.yml)

ChatAI Plugin 帮助文档，使用 VitePress 构建。

## 🌐 在线访问

**文档地址**: [https://xxxteam.github.io/ChatAI-Plugin-Does/](https://xxxteam.github.io/ChatAI-Plugin-Does/)

## 📦 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 📁 目录结构

```
docs/webs/
├── .github/workflows/   # GitHub Actions 工作流
├── .vitepress/          # VitePress 配置
│   ├── config.mts       # 主配置文件
│   └── theme/           # 自定义主题
├── guide/               # 指南文档
├── config/              # 配置文档
├── architecture/        # 架构文档
├── api/                 # API 文档
├── tools/               # 工具文档
├── en/                  # 英文文档
└── public/              # 静态资源
```

## 🚀 自动部署

推送到 `main` 分支会自动触发 GitHub Actions 构建并部署到 GitHub Pages。

### 首次配置

1. 进入仓库 **Settings** → **Pages**
2. **Source** 选择 **GitHub Actions**
3. 推送代码后等待 Actions 完成

## 📝 贡献指南

欢迎提交 Issue 和 Pull Request 来完善文档！

## 📄 许可证

[MIT License](LICENSE)
