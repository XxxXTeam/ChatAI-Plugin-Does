# 代理配置

本文档说明网络代理的配置方式。

## 全局代理

```yaml
proxy:
  # 启用代理
  enabled: true
  
  # 代理类型: http | socks5
  type: http
  
  # 代理地址
  host: 127.0.0.1
  
  # 代理端口
  port: 7890
```

## 代理类型

### HTTP 代理

```yaml
proxy:
  type: http
  host: 127.0.0.1
  port: 7890
```

### SOCKS5 代理

```yaml
proxy:
  type: socks5
  host: 127.0.0.1
  port: 1080
```

### 认证代理

```yaml
proxy:
  type: http
  host: proxy.example.com
  port: 8080
  auth:
    username: user
    password: pass
```

## 渠道代理

为特定渠道配置代理：

```yaml
channels:
  - name: openai
    baseUrl: https://api.openai.com/v1
    apiKey: sk-xxx
    proxy:
      type: http
      host: 127.0.0.1
      port: 7890
```

### 使用全局代理

```yaml
channels:
  - name: openai
    useProxy: true  # 使用全局代理配置
```

### 禁用代理

```yaml
channels:
  - name: domestic
    baseUrl: https://api.deepseek.com/v1
    useProxy: false  # 不使用代理
```

## 环境变量

也可以通过环境变量配置：

```bash
# HTTP 代理
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# SOCKS5 代理
export ALL_PROXY=socks5://127.0.0.1:1080
```

配置文件中引用：

```yaml
proxy:
  enabled: true
  url: ${HTTP_PROXY}
```

## 代理规则

### 排除列表

```yaml
proxy:
  enabled: true
  type: http
  host: 127.0.0.1
  port: 7890
  
  # 不走代理的地址
  noProxy:
    - localhost
    - 127.0.0.1
    - "*.local"
    - api.deepseek.com
```

### 按域名配置

```yaml
proxy:
  rules:
    - pattern: "*.openai.com"
      type: http
      host: 127.0.0.1
      port: 7890
      
    - pattern: "*.anthropic.com"
      type: socks5
      host: 127.0.0.1
      port: 1080
```

## 代理池

配置多个代理实现负载均衡：

```yaml
proxy:
  pool:
    - type: http
      host: proxy1.example.com
      port: 8080
      weight: 2
      
    - type: http
      host: proxy2.example.com
      port: 8080
      weight: 1
```

## 健康检查

```yaml
proxy:
  healthCheck:
    # 启用健康检查
    enabled: true
    
    # 检查间隔（秒）
    interval: 60
    
    # 超时时间（毫秒）
    timeout: 5000
    
    # 测试 URL
    testUrl: https://www.google.com
```

## 完整示例

```yaml
proxy:
  enabled: true
  type: http
  host: 127.0.0.1
  port: 7890
  
  noProxy:
    - localhost
    - 127.0.0.1
    - api.deepseek.com
    
  healthCheck:
    enabled: true
    interval: 60
    timeout: 5000

channels:
  - name: openai
    baseUrl: https://api.openai.com/v1
    useProxy: true
    
  - name: deepseek
    baseUrl: https://api.deepseek.com/v1
    useProxy: false
```

## 故障排除

### 代理连接失败

1. 检查代理服务是否运行
2. 确认端口是否正确
3. 测试代理连通性

```bash
curl -x http://127.0.0.1:7890 https://api.openai.com/v1/models
```

### 证书问题

```yaml
proxy:
  # 跳过证书验证（不推荐）
  rejectUnauthorized: false
```

## 下一步

- [配置概述](./index) - 返回配置概述
- [渠道配置](./channels) - 渠道配置详情
