/**
 * 文档知识库构建脚本
 * 
 * 功能：
 * - 读取所有中文 Markdown 文档
 * - 按标题（## / ###）拆分为独立片段
 * - 提取关键词用于搜索匹配
 * - 输出 data/knowledge.json 供 Worker 使用
 * 
 * 用法：node scripts/build-knowledge.js
 */

import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, relative, basename } from 'path'

/* 文档根目录（相对于本脚本） */
const DOCS_ROOT = join(import.meta.dirname, '..', '..', '..')

/* 排除的目录和文件 */
const EXCLUDE_DIRS = ['node_modules', 'dist', '.vitepress', 'en', 'workers', 'public']
const EXCLUDE_FILES = ['README.md']

/* 中文停用词（搜索时忽略） */
const STOP_WORDS = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
  '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
  '自己', '这', '他', '她', '它', '们', '那', '些', '什么', '怎么', '如何', '为什么',
  '可以', '能', '吗', '呢', '吧', '啊', '哦', '嗯', '请问', '请',
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'to', 'of', 'in', 'for', 'on', 'with',
  'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after',
  'and', 'but', 'or', 'not', 'no', 'if', 'then', 'else', 'when', 'up',
  'this', 'that', 'these', 'those', 'it', 'its',
])

/**
 * @description 递归扫描目录，收集所有 .md 文件路径
 */
function collectMarkdownFiles(dir, files = []) {
  const entries = readdirSync(dir)
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry)) {
        collectMarkdownFiles(fullPath, files)
      }
    } else if (entry.endsWith('.md') && !EXCLUDE_FILES.includes(entry)) {
      files.push(fullPath)
    }
  }
  return files
}

/**
 * @description 从文件路径推断页面分类
 */
function getCategory(filePath) {
  const rel = relative(DOCS_ROOT, filePath).replace(/\\/g, '/')
  const parts = rel.split('/')
  if (parts.length > 1) {
    const categoryMap = {
      'guide': '使用指南',
      'config': '配置说明',
      'architecture': '系统架构',
      'api': 'API 参考',
      'tools': '工具开发',
      'deploy': '部署教程',
    }
    return categoryMap[parts[0]] || parts[0]
  }
  return '通用'
}

/**
 * @description 从 Markdown 内容中提取页面标题（第一个 # 标题）
 */
function extractPageTitle(content) {
  const match = content.match(/^#\s+(.+?)(\s*\{#.*\})?$/m)
  return match ? match[1].replace(/<[^>]+>/g, '').trim() : ''
}

/**
 * @description 将 Markdown 按标题拆分为片段
 */
function splitIntoChunks(content, filePath) {
  const pageTitle = extractPageTitle(content)
  const category = getCategory(filePath)
  const relPath = relative(DOCS_ROOT, filePath).replace(/\\/g, '/')
  const chunks = []

  /* 清理 Markdown 中的 VitePress 特殊语法 */
  const cleaned = content
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/::: (tip|warning|danger|info|details).*?\n/g, '')
    .replace(/:::/g, '')
    .replace(/<Badge[^>]*\/>/g, '')
    .replace(/```mermaid[\s\S]*?```/g, '')
    .trim()

  /* 按 ## 标题拆分 */
  const sections = cleaned.split(/^(?=##\s)/m)

  for (const section of sections) {
    const trimmed = section.trim()
    if (!trimmed || trimmed.length < 20) continue

    /* 提取章节标题 */
    const titleMatch = trimmed.match(/^##\s+(.+?)(\s*\{#.*\})?$/m)
    const sectionTitle = titleMatch
      ? titleMatch[1].replace(/<[^>]+>/g, '').trim()
      : pageTitle

    /* 进一步按 ### 拆分大章节 */
    const subSections = trimmed.split(/^(?=###\s)/m)

    for (const sub of subSections) {
      const subTrimmed = sub.trim()
      if (!subTrimmed || subTrimmed.length < 15) continue

      const subTitleMatch = subTrimmed.match(/^###\s+(.+?)(\s*\{#.*\})?$/m)
      const subTitle = subTitleMatch
        ? subTitleMatch[1].replace(/<[^>]+>/g, '').trim()
        : null

      /* 清理内容：去除 HTML 标签、多余空行 */
      const cleanContent = subTrimmed
        .replace(/<[^>]+>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()

      /* 跳过过短的片段 */
      if (cleanContent.length < 30) continue

      /* 截断过长的片段（保持合理的上下文大小） */
      const finalContent = cleanContent.length > 2000
        ? cleanContent.substring(0, 2000) + '...'
        : cleanContent

      const fullTitle = subTitle
        ? `${pageTitle} > ${sectionTitle} > ${subTitle}`
        : `${pageTitle} > ${sectionTitle}`

      chunks.push({
        title: fullTitle,
        pageTitle,
        category,
        path: relPath,
        content: finalContent,
        keywords: extractKeywords(fullTitle + ' ' + finalContent),
      })
    }
  }

  /* 如果没有拆分出片段（可能是没有二级标题的小文件），整体作为一个片段 */
  if (chunks.length === 0 && cleaned.length > 30) {
    const finalContent = cleaned.length > 2000
      ? cleaned.substring(0, 2000) + '...'
      : cleaned

    chunks.push({
      title: pageTitle || basename(filePath, '.md'),
      pageTitle: pageTitle || basename(filePath, '.md'),
      category,
      path: relPath,
      content: finalContent,
      keywords: extractKeywords(pageTitle + ' ' + finalContent),
    })
  }

  return chunks
}

/**
 * @description 从文本中提取关键词（用于搜索匹配）
 */
function extractKeywords(text) {
  /* 提取英文单词和中文词汇 */
  const words = new Set()

  /* 英文单词（2+ 字符） */
  const englishWords = text.match(/[a-zA-Z][a-zA-Z0-9_-]{1,}/g) || []
  for (const w of englishWords) {
    const lower = w.toLowerCase()
    if (!STOP_WORDS.has(lower) && lower.length >= 2) {
      words.add(lower)
    }
  }

  /* 中文分词（简单的 2-4 字组合） */
  const chineseChars = text.replace(/[^\u4e00-\u9fff]/g, '')
  for (let i = 0; i < chineseChars.length - 1; i++) {
    const bigram = chineseChars.substring(i, i + 2)
    if (!STOP_WORDS.has(bigram)) {
      words.add(bigram)
    }
    if (i < chineseChars.length - 2) {
      words.add(chineseChars.substring(i, i + 3))
    }
  }

  return [...words]
}

/* ==================== 主流程 ==================== */
function main() {
  console.log('📚 开始构建文档知识库...')
  console.log(`文档目录: ${DOCS_ROOT}`)

  const mdFiles = collectMarkdownFiles(DOCS_ROOT)
  console.log(`找到 ${mdFiles.length} 个 Markdown 文件`)

  let allChunks = []

  for (const file of mdFiles) {
    const content = readFileSync(file, 'utf-8')
    const chunks = splitIntoChunks(content, file)
    allChunks.push(...chunks)
    console.log(`  ✅ ${relative(DOCS_ROOT, file)} → ${chunks.length} 个片段`)
  }

  /* 为每个片段添加唯一 ID */
  allChunks = allChunks.map((chunk, idx) => ({
    id: idx,
    ...chunk,
  }))

  /* 输出统计 */
  const totalSize = JSON.stringify(allChunks).length
  console.log(`\n📊 知识库统计:`)
  console.log(`  片段总数: ${allChunks.length}`)
  console.log(`  JSON 大小: ${(totalSize / 1024).toFixed(1)} KB`)

  /* 写入文件 */
  const outputDir = join(import.meta.dirname, '..', 'data')
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  const outputPath = join(outputDir, 'knowledge.json')
  writeFileSync(outputPath, JSON.stringify(allChunks), 'utf-8')
  console.log(`\n✅ 知识库已写入: ${outputPath}`)
}

main()
