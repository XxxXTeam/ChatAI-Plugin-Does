# 功能配置

本文档介绍插件的各项功能配置选项。

## 群聊摘要

自动生成群聊摘要：

```yaml
features:
  groupSummary:
    enabled: true
    maxMessages: 10000    # 最大处理消息数
    autoTrigger: false    # 自动触发
    maxChars: 6000        # 最大字符数
    model: ""             # 使用的模型
    
    # 定时推送
    push:
      enabled: false
      intervalType: day   # day | hour
      intervalValue: 1    # 间隔值
      pushHour: 20        # 推送小时
      messageCount: 100   # 消息数量
      model: ""
```

### 使用命令

```
#ai群总结
#ai群总结 100    # 最近100条消息
```

## 用户画像

自动生成用户画像：

```yaml
features:
  userPortrait:
    enabled: true
    minMessages: 1300     # 最小消息数
    model: ""             # 使用的模型
```

### 使用命令

```
#ai用户画像
#ai用户画像 @用户
```

## 戳一戳

响应戳一戳事件：

```yaml
features:
  poke:
    enabled: true
    pokeBack: true        # 戳回去
    message: "别戳了~"     # 默认回复
    prompt: "[事件通知] {nickname} 戳了你一下..."
```

## 表情回应

响应消息表情回应：

```yaml
features:
  reaction:
    enabled: true
    prompt: "[事件通知] {nickname} 对你之前的消息做出了\"{emoji}\"的表情回应..."
    removePrompt: ""
    handleRemove: false   # 处理取消回应
```

## 撤回消息

响应消息撤回：

```yaml
features:
  recall:
    enabled: false
    aiResponse: true      # AI 回应撤回
    prompt: ""
```

## 欢迎消息

新成员入群欢迎：

```yaml
features:
  welcome:
    enabled: true
    message: ""           # 固定欢迎语
    prompt: ""            # AI 生成欢迎语
```

## 退群消息

成员退群响应：

```yaml
features:
  goodbye:
    enabled: true
    aiResponse: true
    prompt: ""
```

## 禁言响应

成员被禁言响应：

```yaml
features:
  ban:
    enabled: true
    aiResponse: true
    prompt: ""
```

## 管理员变动

响应管理员变动：

```yaml
features:
  admin:
    enabled: false
    prompt: ""
```

## 运气王

响应红包运气王：

```yaml
features:
  luckyKing:
    enabled: true
    congratulate: false   # 祝贺
    prompt: ""
```

## 群荣誉

响应群荣誉变动：

```yaml
features:
  honor:
    enabled: true
    prompt: ""
```

## 精华消息

响应精华消息设置：

```yaml
features:
  essence:
    enabled: false
    prompt: ""
```

## AI 图片生成

```yaml
features:
  imageGen:
    enabled: true
    model: gemini-3-flash-image
    videoModel: gemini-3-pro-preview-video
    timeout: 60000000
    maxImages: 30
    
    # API 配置
    apis:
      - baseUrl: https://api.example.com/
        apiKey: sk-xxx
        models:
          - gemini-2.5-flash-image
    
    # 预设来源
    presetSources:
      - name: 云端预设
        url: https://example.com/presets.json
        enabled: true
    
    # 自定义预设
    customPresets: []
    
    # 内置预设
    builtinPresets:
      - keywords: ["手办", "手办化"]
        needImage: true
        prompt: "转换为手办风格..."
```

### 内置预设关键词

| 关键词 | 功能 |
|--------|------|
| 手办/手办化 | 转换为手办风格 |
| Q版/表情包 | 生成表情包 |
| 动漫化/二次元化 | 动漫风格转换 |
| 赛博朋克 | 赛博朋克风格 |
| 油画/油画风 | 油画风格 |
| 水彩/水彩画 | 水彩风格 |

## 语音回复

```yaml
features:
  voiceReply:
    enabled: false
    ttsProvider: system   # system | azure | ...
    triggerOnTool: false  # 工具调用触发
    triggerAlways: false  # 始终语音回复
    maxTextLength: 500    # 最大文本长度
```

## 表情包偷取

```yaml
features:
  emojiThief:
    globalEnabled: false
    separateFolder: false # 分群存储
    maxCount: 1000        # 最大数量
    stealRate: 1          # 偷取概率
    triggerMode: chat_random
    triggerRate: 0.1
```

## 错误自动清理

```yaml
features:
  autoCleanOnError:
    enabled: false
    notifyUser: false
```

## 完整示例

```yaml
features:
  groupSummary:
    enabled: true
    maxMessages: 10000
    autoTrigger: false
    maxChars: 6000
    
  userPortrait:
    enabled: true
    minMessages: 1300
    
  poke:
    enabled: true
    pokeBack: true
    
  reaction:
    enabled: true
    
  welcome:
    enabled: true
    
  goodbye:
    enabled: true
    aiResponse: true
    
  imageGen:
    enabled: true
    model: gemini-3-flash-image
```

## 下一步

- [伪人配置](./bym) - 伪人模式配置
- [代理配置](./proxy) - 网络代理设置
