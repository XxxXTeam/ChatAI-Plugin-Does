# 渲染服务（canvasRenderer / RenderService）

## 定位

Markdown/公式渲染为图片的能力由两个文件组成，位于 `src/services/media/`：

| 文件 | 职责 |
|:-----|:-----|
| `canvasRenderer.js` | 底层布局与绘制：`renderMarkdownToCanvas()`（Markdown → 图片）、`unwrapMarkdownFence()`（剥除代码围栏）、`renderLatexToImageBuffer()`（公式 → 图片） |
| `RenderService.js` | 服务封装（单例 `renderService`）：检测数学公式、加载字体、选择渲染策略，向上层提供 `renderMarkdownToImageBuffer` 等入口 |

默认像素密度为 `2`（`DEFAULT_PIXEL_RATIO`），对 Markdown 渲染提供 2 倍分辨率，
`pixelRatio` 只接受 `1` 或 `2`。

## 底层依赖

图片绘制基于 `@napi-rs/canvas`。**模块加载失败不阻止插件启动**：`RenderService`
在 import 时用 try/catch 引入（走 `logService` 记录调试日志），
`this.useCanvas = !!canvasModule`；未加载时调用渲染接口会抛
`Canvas 模块未加载，无法渲染图片`。

## renderMarkdownToCanvas 接口

```javascript
import { renderMarkdownToCanvas, unwrapMarkdownFence } from './canvasRenderer.js'

const imageBuffer = await renderMarkdownToCanvas(markdown, {
    canvasModule,            // 必传：由 RenderService 注入的 canvas 模块
    theme: 'light',          // 主题（THEMES 键，缺省 light）
    width: 800,              // 渲染宽度（240–2400 整数）
    title: '',               // 标题
    subtitle: '',            // 副标题
    showTimestamp: true,     // 是否显示时间戳
    fontSize: 15,            // 字号（8–48）
    pixelRatio: 2,           // 1 或 2（2 倍分辨率约 4 倍像素）
    fontFamily: 'LXGW, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    codeFont: 'Inconsolata, "Courier New", monospace'
})
```

参数校验失败抛出带明确信息的异常（`渲染宽度必须是 240–2400 的整数`、
`渲染字号必须在 8–48 之间`、`Markdown 内容过长` 等）。高度与总像素上限按物理位图
计算（`MAX_HEIGHT` / `MAX_PIXELS`），2 倍密度时按约 4 倍像素预算收缩。

## 支持的 Markdown 特性（CanvasLayout）

- 标题、粗体/斜体/删除线、有序/无序列表、任务列表、引用块
- 代码块与行内代码（等宽字体）、水平分隔线
- 表格（单元格对齐；列数过多抛出 `表格列数过多，请增加渲染宽度`）
- 图片（URL 经 `canvasModule.loadImage` 载入；受限尺寸）
- 数学公式与 Markdown 混合内容
- 长文本自动分页/多列布局

## 公式渲染（RenderService）

`RenderService` 内置数学公式检测（`blockLatex`、`inlineLatex`、`bracketBlock`、
`latexEnv`、`mathCommands`、`integralSymbol` 等十余组正则），将公式区段交给
`renderLatexToImageBuffer` 渲染后合成；无条件渲染的纯文本路径走
`renderMarkdownToCanvas`。

## 典型调用方

- 群聊总结 / 今日群聊（`#群聊总结`、`#今日群聊`）
- 用户画像、分析报告（`#个人画像` / `#画像`）
- 词云与统计报告图片输出

> 注意：`RenderService` 只负责「Markdown/公式 → 图片」这一条链路；
> 在线图片/媒体文件的下发由 `ImageService.js` 与聊天链路处理。