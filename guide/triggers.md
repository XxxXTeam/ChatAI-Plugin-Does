# 触发方式

本文档介绍 ChatAI 插件的各种触发方式配置。

## Web 面板配置

推荐使用 Web 管理面板配置触发方式：

![系统设置](/images/image2.png)

- **私聊触发** - 配置私聊消息的触发方式
- **群聊触发** - 配置群聊消息的触发方式
- **触发词** - 自定义触发关键词

## 触发类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `at` | @机器人触发 | `@机器人 你好` |
| `prefix` | 前缀触发 | `#chat 你好` |
| `both` | 两者皆可 | - |
| `none` | 禁用触发 | - |

## 基础配置

```yaml
trigger:
  # 私聊触发方式
  private: prefix
  
  # 群聊触发方式
  group: at
  
  # 触发前缀
  prefix: "#chat"
```

## @机器人触发

### 配置

```yaml
trigger:
  group: at
```

### 使用

```
@机器人 你好
@机器人 帮我写一首诗
```

### 注意事项

- 需要机器人有管理员权限或群主权限才能接收 @消息
- 某些适配器可能需要额外配置

## 前缀触发

### 配置

```yaml
trigger:
  group: prefix
  prefix: "#chat"
```

### 使用

```
#chat 你好
#chat 今天天气怎么样
```

### 多前缀

```yaml
trigger:
  prefixes:
    - "#chat"
    - "/ai"
    - "AI:"
```

## 关键词触发

### 配置

```yaml
trigger:
  keywords:
    - "问一下"
    - "请问"
    - "帮我"
```

### 使用

消息中包含关键词即触发：

```
问一下明天天气如何
请问怎么做红烧肉
帮我写一封邮件
```

### 正则匹配

```yaml
trigger:
  keywordPatterns:
    - "^(你好|hello)"
    - "天气.*(怎么样|如何)"
```

## 随机触发

### 配置

```yaml
trigger:
  # 随机触发概率 (0-100)
  randomRate: 10
  
  # 触发后的冷却时间（秒）
  randomCooldown: 60
```

### 说明

- 每条消息有 10% 概率触发 AI 回复
- 触发后 60 秒内不会再次随机触发
- 通常用于"伪人"模式

## 群组独立配置

每个群可以有不同的触发配置：

```yaml
groups:
  "123456789":
    trigger:
      type: both
      prefix: "#ai"
      randomRate: 5
      
  "987654321":
    trigger:
      type: at
      randomRate: 0
```

或通过 Web 面板的 **群组设置** 配置。

## 黑白名单

### 用户白名单

只有白名单用户可以触发：

```yaml
trigger:
  userWhitelist:
    - "123456789"
    - "987654321"
```

### 用户黑名单

黑名单用户无法触发：

```yaml
trigger:
  userBlacklist:
    - "111111111"
```

### 群组白名单

只在白名单群组启用：

```yaml
trigger:
  groupWhitelist:
    - "123456789"
```

### 群组黑名单

在黑名单群组禁用：

```yaml
trigger:
  groupBlacklist:
    - "111111111"
```

## 冷却时间

### 全局冷却

```yaml
trigger:
  # 全局冷却（秒）
  globalCooldown: 5
```

### 用户冷却

```yaml
trigger:
  # 用户冷却（秒）
  userCooldown: 10
```

### 群组冷却

```yaml
trigger:
  # 群组冷却（秒）
  groupCooldown: 3
```

## 消息过滤

### 最小长度

```yaml
trigger:
  # 消息最小长度
  minLength: 2
```

### 最大长度

```yaml
trigger:
  # 消息最大长度
  maxLength: 2000
```

### 过滤图片

```yaml
trigger:
  # 纯图片消息是否触发
  allowImageOnly: false
```

## 优先级处理

当消息可能被多个插件处理时：

```yaml
trigger:
  # 优先级（数字越小优先级越高）
  priority: 100
  
  # 是否阻止后续插件处理
  block: false
```

## 调试触发

开启调试模式查看触发判断：

```
#ai调试开启
```

会输出：
- 触发条件检查结果
- 匹配的触发类型
- 冷却状态

## 配置示例

### 活跃群聊

```yaml
trigger:
  type: both
  prefix: "#"
  randomRate: 15
  randomCooldown: 120
```

### 客服模式

```yaml
trigger:
  type: prefix
  prefix: "#客服"
  userCooldown: 0
  groupCooldown: 0
```

### 私密群组

```yaml
trigger:
  type: at
  groupWhitelist:
    - "123456789"
```

## 下一步

- [MCP 工具](./mcp) - 工具调用配置
- [配置概述](/config/) - 完整配置参考
