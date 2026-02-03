import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// GitHub Pages 使用仓库名作为 base，其他平台使用 /
const base = process.env.GITHUB_ACTIONS ? '/ChatAI-Plugin-Does/' : '/'

export default withMermaid({
  title: "ChatAI Plugin Does",
  description: "Yunzai-Bot AI Chat Plugin Documentation",
  base,
  lastUpdated: true,
  outDir: './dist',
  markdown: {
    lineNumbers: true,
    image: {
      lazyLoading: true
    },
    // 代码高亮主题
    theme: {
      light: 'github-light',
      dark: 'one-dark-pro'
    },
    // 支持的语言别名
    languages: [],
    // 代码块配置
    codeTransformers: [
      {
        // 添加语言类名便于样式控制
        postprocess(code) {
          return code
        }
      }
    ],
    // 默认高亮语言
    defaultHighlightLang: 'javascript',
  },

  vite: {
    optimizeDeps: {
      include: ['mermaid'],
    },
    ssr: {
      noExternal: ['mermaid'],
    },
    build: {
      chunkSizeWarningLimit: 1000 
    },
  },
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['script', {}, `
      !function(p){"use strict";!function(t){var s=window,e=document,i=p,c="".concat("https:"===e.location.protocol?"https://":"http://","sdk.51.la/js-sdk-pro.min.js"),n=e.createElement("script"),r=e.getElementsByTagName("script")[0];n.type="text/javascript",n.setAttribute("charset","UTF-8"),n.async=!0,n.src=c,n.id="LA_COLLECT",i.d=n;var o=function(){s.LA.ids.push(i)};s.LA?s.LA.ids&&o():(s.LA=p,s.LA.ids=[],o()),r.parentNode.insertBefore(n,r)}()}({id:"3OtXvS8im2uEkg2s",ck:"3OtXvS8im2uEkg2s",hashMode:true,screenRecord:true});
    `],
    ['script', { id: 'LA-DATA-WIDGET', crossorigin: 'anonymous', charset: 'UTF-8', src: 'https://v6-widget.51.la/v6/3OtXvS8im2uEkg2s/quote.js?theme=0&f=14' }],
  ],

  // 多语言配置
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/',
      description: 'Yunzai-Bot AI 聊天插件帮助文档',
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      description: 'Yunzai-Bot AI Chat Plugin Documentation',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Guide', link: '/en/guide/getting-started' },
          { text: 'Config', link: '/en/config/' },
          { text: 'Architecture', link: '/en/architecture/' },
          { text: 'API', link: '/en/api/' },
          {
            text: 'More',
            items: [
              { text: 'Tool Development', link: '/en/tools/' },
              { text: 'Troubleshooting', link: '/en/troubleshooting' },
              { text: 'Changelog', link: '/en/changelog' }
            ]
          }
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Quick Start', link: '/en/guide/getting-started' },
                { text: 'Installation', link: '/en/guide/installation' },
                { text: 'Basic Config', link: '/en/guide/basic-config' },
                { text: 'First Use', link: '/en/guide/first-use' }
              ]
            },
            {
              text: 'Advanced Usage',
              items: [
                { text: 'Multi-Channel', link: '/en/guide/channels' },
                { text: 'Presets & Personas', link: '/en/guide/presets' },
                { text: 'Triggers', link: '/en/guide/triggers' },
                { text: 'MCP Tools', link: '/en/guide/mcp' },
                { text: 'Galgame', link: '/en/guide/galgame' },
                { text: 'Commands', link: '/en/guide/commands' }
              ]
            },
            {
              text: 'Developer',
              items: [
                { text: 'Developer Guide', link: '/en/guide/developer' },
                { text: 'About', link: '/en/guide/about' }
              ]
            }
          ],
          '/en/config/': [
            {
              text: 'Configuration',
              items: [
                { text: 'Overview', link: '/en/config/' },
                { text: 'Basic Config', link: '/en/config/basic' },
                { text: 'Channels', link: '/en/config/channels' },
                { text: 'Models', link: '/en/config/models' },
                { text: 'Triggers', link: '/en/config/triggers' },
                { text: 'Context', link: '/en/config/context' },
                { text: 'Memory', link: '/en/config/memory' },
                { text: 'MCP', link: '/en/config/mcp' },
                { text: 'Proxy', link: '/en/config/proxy' },
                { text: 'Frontend', link: '/en/config/frontend' }
              ]
            },
            {
              text: 'Advanced Features',
              items: [
                { text: 'Features', link: '/en/config/features' },
                { text: 'BYM Mode', link: '/en/config/bym' }
              ]
            }
          ],
          '/en/architecture/': [
            {
              text: 'System Architecture',
              items: [
                { text: 'Overview', link: '/en/architecture/' },
                { text: 'Core Architecture', link: '/en/architecture/core' },
                { text: 'Layered Architecture', link: '/en/architecture/layers' },
                { text: 'MCP System', link: '/en/architecture/mcp' },
                { text: 'Skills Agent', link: '/en/architecture/skills-agent' },
                { text: 'Data Flow', link: '/en/architecture/data-flow' }
              ]
            },
            {
              text: 'Core Modules',
              items: [
                { text: 'LLM Adapters', link: '/en/architecture/adapters' },
                { text: 'Chat Service', link: '/en/architecture/chat-service' },
                { text: 'Web Server', link: '/en/architecture/web-server' },
                { text: 'Storage', link: '/en/architecture/storage' }
              ]
            }
          ],
          '/en/api/': [
            {
              text: 'API Reference',
              items: [
                { text: 'Overview', link: '/en/api/' },
                { text: 'Authentication', link: '/en/api/auth' },
                { text: 'Configuration', link: '/en/api/config' },
                { text: 'Tools', link: '/en/api/tools' },
                { text: 'MCP', link: '/en/api/mcp' },
                { text: 'Chat', link: '/en/api/chat' }
              ]
            }
          ],
          '/en/tools/': [
            {
              text: 'Tool Development',
              items: [
                { text: 'Overview', link: '/en/tools/' },
                { text: 'Built-in Tools', link: '/en/tools/builtin' },
                { text: 'Custom JS Tools', link: '/en/tools/custom-js' },
                { text: 'MCP Server', link: '/en/tools/mcp-server' },
                { text: 'Security', link: '/en/tools/security' }
              ]
            }
          ]
        },
        footer: {
          message: 'Released under the MIT License',
          copyright: 'Copyright © 2024 XxxXTeam Team'
        },
        editLink: {
          pattern: 'https://github.com/XxxXTeam/ChatAI-Plugin-Does/edit/main/:path',
          text: 'Edit this page on GitHub'
        },
        lastUpdated: {
          text: 'Last updated',
          formatOptions: {
            dateStyle: 'short',
            timeStyle: 'short'
          }
        },
        docFooter: {
          prev: 'Previous',
          next: 'Next'
        },
        outline: {
          label: 'On this page',
          level: [2, 3]
        },
        returnToTopLabel: 'Back to top',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Theme',
        lightModeSwitchTitle: 'Switch to light theme',
        darkModeSwitchTitle: 'Switch to dark theme'
      }
    }
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'ChatAI Plugin',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: '配置', link: '/config/' },
      { text: '架构', link: '/architecture/' },
      { text: 'API', link: '/api/' },
      {
        text: '更多',
        items: [
          { text: '工具开发', link: '/tools/' },
          { text: '故障排除', link: '/troubleshooting' },
          { text: '更新日志', link: '/changelog' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '入门指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装部署', link: '/guide/installation' },
            { text: '基础配置', link: '/guide/basic-config' },
            { text: '首次使用', link: '/guide/first-use' }
          ]
        },
        {
          text: '进阶使用',
          items: [
            { text: '多渠道配置', link: '/guide/channels' },
            { text: '预设与人格', link: '/guide/presets' },
            { text: '触发方式', link: '/guide/triggers' },
            { text: 'MCP 工具', link: '/guide/mcp' },
            { text: 'Galgame 游戏', link: '/guide/galgame' },
            { text: '命令列表', link: '/guide/commands' }
          ]
        },
        {
          text: '开发者',
          items: [
            { text: '开发者指南', link: '/guide/developer' },
            { text: '关于插件', link: '/guide/about' }
          ]
        }
      ],
      '/config/': [
        {
          text: '配置管理',
          items: [
            { text: '配置概述', link: '/config/' },
            { text: '基础配置', link: '/config/basic' },
            { text: '渠道配置', link: '/config/channels' },
            { text: '模型配置', link: '/config/models' },
            { text: '触发配置', link: '/config/triggers' },
            { text: '上下文配置', link: '/config/context' },
            { text: '记忆配置', link: '/config/memory' },
            { text: 'MCP 配置', link: '/config/mcp' },
            { text: '代理配置', link: '/config/proxy' },
            { text: '前端配置', link: '/config/frontend' }
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: '功能配置', link: '/config/features' },
            { text: '伪人配置', link: '/config/bym' }
          ]
        }
      ],
      '/architecture/': [
        {
          text: '系统架构',
          items: [
            { text: '架构概述', link: '/architecture/' },
            { text: '核心架构详解', link: '/architecture/core' },
            { text: '分层架构', link: '/architecture/layers' },
            { text: 'MCP 系统', link: '/architecture/mcp' },
            { text: 'Skills Agent', link: '/architecture/skills-agent' },
            { text: '数据流', link: '/architecture/data-flow' }
          ]
        },
        {
          text: '核心模块',
          items: [
            { text: 'LLM 适配器', link: '/architecture/adapters' },
            { text: '聊天服务', link: '/architecture/chat-service' },
            { text: 'Web 服务', link: '/architecture/web-server' },
            { text: '存储系统', link: '/architecture/storage' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'API 概述', link: '/api/' },
            { text: '认证接口', link: '/api/auth' },
            { text: '配置接口', link: '/api/config' },
            { text: '工具接口', link: '/api/tools' },
            { text: 'MCP 接口', link: '/api/mcp' },
            { text: '聊天接口', link: '/api/chat' }
          ]
        }
      ],
      '/tools/': [
        {
          text: '工具开发',
          items: [
            { text: '工具开发概述', link: '/tools/' },
            { text: '内置工具', link: '/tools/builtin' },
            { text: '自定义 JS 工具', link: '/tools/custom-js' },
            { text: 'MCP 服务器', link: '/tools/mcp-server' },
            { text: '安全与权限', link: '/tools/security' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/XxxXTeam/chatai-plugin' }
    ],

    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024 XxxXTeam Team'
    },

    editLink: {
      pattern: 'https://github.com/XxxXTeam/ChatAI-Plugin-Does/edit/main/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航',
      level: [2, 3]
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换'
            }
          }
        }
      }
    },

    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  }
})
