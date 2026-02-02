# 模型配置

本文档介绍模型选择和参数配置。

## 模型参数

### 基础参数

```yaml
channels:
  - name: default
    model: gpt-4o
    modelParams:
      temperature: 0.7
      maxTokens: 4096
      topP: 1.0
```

### 参数说明

| 参数 | 类型 | 范围 | 说明 |
|------|------|------|------|
| `temperature` | number | 0-2 | 控制随机性，越高越随机 |
| `maxTokens` | number | - | 最大输出 Token 数 |
| `topP` | number | 0-1 | 核采样参数 |
| `frequencyPenalty` | number | -2~2 | 频率惩罚，减少重复 |
| `presencePenalty` | number | -2~2 | 存在惩罚，增加话题多样性 |

## 常用模型

### OpenAI

| 模型 | 说明 | 上下文 |
|------|------|--------|
| `gpt-4o` | 最新多模态模型 | 128K |
| `gpt-4o-mini` | 轻量高效 | 128K |
| `gpt-4-turbo` | 高性能 | 128K |
| `gpt-3.5-turbo` | 经济实惠 | 16K |

### Claude

| 模型 | 说明 | 上下文 |
|------|------|--------|
| `claude-3-5-sonnet-20241022` | 最新 Sonnet | 200K |
| `claude-3-opus-20240229` | 最强能力 | 200K |
| `claude-3-haiku-20240307` | 快速响应 | 200K |

### Gemini

| 模型 | 说明 | 上下文 |
|------|------|--------|
| `gemini-2.0-flash` | 最新 Flash | 1M |
| `gemini-1.5-pro` | 专业版 | 2M |
| `gemini-1.5-flash` | 快速版 | 1M |

### DeepSeek

| 模型 | 说明 | 上下文 |
|------|------|--------|
| `deepseek-chat` | 对话模型 | 64K |
| `deepseek-coder` | 代码模型 | 64K |

## 模型选择策略

### 按场景选择

```yaml
channels:
  - name: chat
    model: gpt-4o-mini
    tags: [chat, default]
    
  - name: coding
    model: gpt-4o
    tags: [coding]
    
  - name: creative
    model: claude-3-5-sonnet-20241022
    tags: [creative, writing]
```

### 预设中指定

```yaml
# 预设文件
name: coder
model: gpt-4o
modelParams:
  temperature: 0.3
```

## 温度调优

| 场景 | 推荐温度 |
|------|----------|
| 代码生成 | 0.1-0.3 |
| 问答/事实 | 0.3-0.5 |
| 通用对话 | 0.7-0.9 |
| 创意写作 | 0.9-1.2 |

## 上下文长度

### 计算 Token

不同模型的 Token 计算方式不同：
- GPT: ~4 字符/Token（英文），~1.5 字符/Token（中文）
- Claude: 类似 GPT

### 配置最大上下文

```yaml
context:
  # 最大消息数
  maxMessages: 20
  
  # 最大 Token 数（可选，会自动截断）
  maxTokens: 8000
```

## 流式响应

```yaml
channels:
  - name: default
    model: gpt-4o
    stream: true  # 启用流式响应
```

流式响应可以：
- 更快显示首字
- 改善用户体验
- 支持长文本生成

## 工具调用

支持工具调用的模型：

| 模型 | 工具调用 |
|------|----------|
| GPT-4o/4-turbo | ✅ |
| GPT-3.5-turbo | ✅ |
| Claude 3.x | ✅ |
| Gemini 1.5+ | ✅ |

配置：

```yaml
channels:
  - name: default
    model: gpt-4o
    supportTools: true
```

## 视觉能力

支持图片理解的模型：

| 模型 | 视觉 |
|------|------|
| GPT-4o/4-turbo | ✅ |
| Claude 3.x | ✅ |
| Gemini Pro Vision | ✅ |

配置：

```yaml
channels:
  - name: vision
    model: gpt-4o
    supportVision: true
```

## 动态模型选择

通过 API 获取可用模型：

```
#获取模型列表
```

或在 Web 面板中点击「获取模型」按钮。

## 下一步

- [触发配置](./triggers) - 触发方式配置
- [上下文配置](./context) - 上下文管理
