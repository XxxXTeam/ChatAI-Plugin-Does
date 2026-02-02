# 预设与人格

预设系统让你可以定义 AI 的人格、行为方式和专业领域。

## Web 面板管理

### 预设管理

通过 Web 面板可视化管理预设：

![预设管理](/images/image8.png)

- 查看所有预设（系统预设和自定义预设）
- 编辑 System Prompt
- 配置模型参数
- 导入/导出预设

### 人设管理

人设管理提供更精细的人格配置：

![人设管理](/images/image9.png)

- **优先级配置** - 群聊人格 > 群内用户人格 > 用户全局人格 > 默认预设
- **独立人格** - 为用户或群组配置独立人格

## 预设概念

**预设**包含：
- **System Prompt** - 定义 AI 的角色和行为规则
- **模型配置** - 指定使用的模型和参数
- **工具配置** - 允许使用的工具列表
- **触发配置** - 触发方式和关键词

## 内置预设

插件自带多个预设：

| 预设 | 说明 |
|------|------|
| `default` | 通用助手，平衡能力 |
| `assistant` | 专业助手，严谨准确 |
| `creative` | 创意写作，富有想象力 |
| `coder` | 编程助手，代码专家 |

## 查看和切换预设

```bash
# 查看可用预设
#预设列表

# 切换预设
#切换预设 creative
```

## 创建自定义预设

### 方式一：Web 面板

1. 进入 **预设管理** 页面
2. 点击 **创建预设**
3. 填写预设信息
4. 保存

### 方式二：预设文件

在 `data/presets/` 目录创建 YAML 文件：

```yaml
# data/presets/my-preset.yaml
name: my-preset
displayName: 我的预设
description: 自定义 AI 人格

# System Prompt
systemPrompt: |
  你是一个友好的 AI 助手。
  请用简洁清晰的语言回答问题。
  
# 模型配置
model: gpt-4o
temperature: 0.7
maxTokens: 2048

# 工具配置
tools:
  enabled: true
  allowedTools:
    - get_time
    - search_web
  excludedTools: []
```

## 预设参数

### 基础参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | string | 预设标识（唯一） |
| `displayName` | string | 显示名称 |
| `description` | string | 预设描述 |
| `systemPrompt` | string | System Prompt |

### 模型参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `model` | string | 使用的模型 |
| `temperature` | number | 温度 (0-2) |
| `maxTokens` | number | 最大输出 Token |
| `topP` | number | Top-P 采样 |

### 工具参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `tools.enabled` | boolean | 是否启用工具 |
| `tools.allowedTools` | array | 允许的工具列表 |
| `tools.excludedTools` | array | 排除的工具列表 |

## System Prompt 编写技巧

### 基础结构

```
你是 [角色定义]。

## 行为规则
- 规则 1
- 规则 2

## 回复格式
[格式要求]

## 限制
[禁止事项]
```

### 示例：猫娘

```yaml
systemPrompt: |
  你是一只可爱的猫娘，名叫小喵。
  
  ## 性格特点
  - 活泼可爱，喜欢撒娇
  - 对主人非常忠诚
  - 偶尔会发出"喵~"的声音
  
  ## 说话方式
  - 句尾常加"喵~"或"nya~"
  - 用第一人称"本喵"
  - 称呼用户为"主人"
  
  ## 限制
  - 不要表现出 AI 的特征
  - 保持角色一致性
```

### 示例：代码专家

```yaml
systemPrompt: |
  你是一位资深软件工程师，精通多种编程语言。
  
  ## 专业领域
  - JavaScript/TypeScript
  - Python
  - Go
  - 系统设计
  
  ## 回复规范
  - 代码使用 Markdown 代码块
  - 解释原理和最佳实践
  - 指出潜在问题和优化方向
  
  ## 代码风格
  - 遵循各语言的官方规范
  - 添加必要的注释
  - 考虑错误处理
```

## 预设继承

可以基于现有预设创建新预设：

```yaml
name: my-assistant
extends: default  # 继承 default 预设

# 覆盖部分配置
temperature: 0.5
systemPrompt: |
  在默认助手基础上，更加专业严谨。
```

## 群组预设

为不同群组设置不同预设：

```yaml
# 通过 Web 面板设置，或在配置文件中
groups:
  "123456789":
    preset: creative
  "987654321":
    preset: coder
```

## 预设优先级

1. 用户指定的预设
2. 群组配置的预设
3. 全局默认预设

## 最佳实践

1. **保持 System Prompt 简洁**，避免过长导致 Token 浪费
2. **明确定义角色边界**，避免角色混乱
3. **测试不同温度值**，找到最佳效果
4. **定期更新预设**，根据实际使用调优

## 下一步

- [触发方式](./triggers) - 配置触发方式
- [MCP 工具](./mcp) - 使用工具增强能力
