# 触发配置

本文档详细说明触发方式的配置选项。

## 基础配置

```yaml
trigger:
  # 私聊触发
  private:
    enabled: true
    mode: always    # always | prefix | keyword
  
  # 群聊触发
  group:
    enabled: true
    at: true        # @机器人触发
    prefix: true    # 前缀触发
    keyword: false  # 关键词触发
    random: false   # 随机触发
    randomRate: 0.05  # 随机触发概率
  
  # 触发前缀列表
  prefixes:
    - "#chat"
  
  # 关键词列表
  keywords: []
  
  # 收集群消息（用于上下文）
  collectGroupMsg: true
```

## 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `private.enabled` | boolean | `true` | 启用私聊 |
| `private.mode` | string | `always` | 私聊触发模式 |
| `group.enabled` | boolean | `true` | 启用群聊 |
| `group.at` | boolean | `true` | @触发 |
| `group.prefix` | boolean | `true` | 前缀触发 |
| `group.keyword` | boolean | `false` | 关键词触发 |
| `group.random` | boolean | `false` | 随机触发 |

## 私聊触发模式

| 模式 | 说明 |
|------|------|
| `always` | 始终触发 |
| `prefix` | 需要前缀 |
| `keyword` | 需要关键词 |

## 前缀配置

```yaml
trigger:
  prefixes:
    - "#chat"
    - "/ai"
    - "AI："
```

用户发送 `#chat 你好` 或 `/ai 你好` 都会触发。

## 关键词触发

```yaml
trigger:
  group:
    keyword: true
  keywords:
    - "问一下"
    - "请问"
    - "帮我"
```

消息中包含关键词即触发。

## 随机触发

```yaml
trigger:
  group:
    random: true
    randomRate: 0.05  # 5% 概率
```

## 黑白名单

### 用户名单

```yaml
trigger:
  # 用户白名单（只允许这些用户）
  whitelistUsers: []
  
  # 用户黑名单（禁止这些用户）
  blacklistUsers:
    - "123456789"
```

### 群组名单

```yaml
trigger:
  # 群组白名单
  whitelistGroups: []
  
  # 群组黑名单
  blacklistGroups:
    - "987654321"
```

## 前缀人格映射

不同前缀使用不同人格：

```yaml
trigger:
  prefixPersonas:
    - prefix: "#璃月"
      presetId: "preset-id-1"
    - prefix: "#小助手"
      presetId: "preset-id-2"
```

## 完整示例

```yaml
trigger:
  private:
    enabled: true
    mode: always
  
  group:
    enabled: true
    at: true
    prefix: true
    keyword: false
    random: false
    randomRate: 0.05
  
  prefixes:
    - "#chat"
    - "/ai"
  
  keywords: []
  
  collectGroupMsg: true
  
  blacklistUsers: []
  whitelistUsers: []
  blacklistGroups: []
  whitelistGroups: []
  
  prefixPersonas: []
```

## 下一步

- [上下文配置](./context) - 上下文管理
- [记忆配置](./memory) - 长期记忆
