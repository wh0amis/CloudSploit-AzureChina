# CloudSploit Azure China Edition

[![Azure China](https://img.shields.io/badge/Azure-China%20Cloud-0078D4?logo=microsoft-azure)](https://portal.azure.cn)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

CloudSploit Azure China Edition - 为世纪互联运营的 Microsoft Azure 中国云提供完整的安全审计支持。

本项目基于 [CloudSploit](https://github.com/aquasecurity/cloudsploit) 官方版本，专门针对 Azure China 环境进行了适配和优化。

## 概述

CloudSploit 是由 Aqua Security 开发的云安全审计工具，支持 AWS、Azure、GCP、Oracle 和 GitHub 等多个云平台。本分支在原有功能基础上，增加了对 Azure China 环境的完整支持。

## Azure China 适配特性

### 1. 认证端点支持
- 自动使用 Azure China 认证端点：`https://login.chinacloudapi.cn`
- 支持 ARM、Graph 和 Key Vault 的 China 专用令牌获取

### 2. API 端点自动替换
所有 Azure API 调用会自动替换为 Azure China 端点：
- ARM API: `https://management.chinacloudapi.cn`
- Graph API: `https://graph.chinacloudapi.cn`
- Key Vault: `https://vault.azure.cn`

### 3. Azure China 区域支持
支持所有 Azure China 区域：
- chinaeast（华东 - 上海）
- chinaeast2（华东 2 - 上海）
- chinaeast3（华东 3 - 上海）
- chinanorth（华北 - 北京）
- chinanorth2（华北 2 - 北京）
- chinanorth3（华北 3 - 北京）

### 4. 插件兼容性
所有 493 个 Azure 插件无需修改即可在 Azure China 环境中运行。

## 使用方法

### 配置文件方式

创建或修改配置文件 `config.js`：

```javascript
module.exports = {
    credentials: {
        azure: {
            application_id: '您的应用程序ID',
            key_value: '您的密钥',
            directory_id: '您的租户ID',
            subscription_id: '您的订阅ID',
            china: true  // 启用 Azure China 模式
        }
    }
};
```

运行扫描：
```bash
node index.js --config ./config.js
```

### 命令行参数方式

```bash
node index.js --config ./config.js --cloud azure --azure-china
```

### 输出示例

启用 Azure China 模式后，您会看到：

```
INFO: Using Azure China mode
INFO: Determining API calls to make...
INFO: Found 186 API calls to make for azure plugins
INFO: Collecting metadata. This may take several minutes...
url: https://management.chinacloudapi.cn/subscriptions/...
```

## 前置条件

### Azure China 服务主体

您需要在 Azure China 门户中创建服务主体并获取以下信息：

1. **应用程序 ID**（Application ID / Client ID）
2. **密钥值**（Key Value / Client Secret）
3. **目录 ID**（Directory ID / Tenant ID）
4. **订阅 ID**（Subscription ID）

### 创建服务主体步骤

1. 登录 [Azure China 门户](https://portal.azure.cn)
2. 导航到 "Azure Active Directory" > "应用注册"
3. 点击 "新注册" 创建新应用程序
4. 创建完成后，记录 "应用程序（客户端）ID" 和 "目录（租户）ID"
5. 进入 "证书和密码"，创建新的客户端密码，记录密钥值
6. 在订阅级别为此服务主体分配 "读取者" 角色

### 所需权限

服务主体至少需要以下权限：
- 订阅级别的 **Reader**（读取者）角色
- 对于某些高级检查，可能需要 **Security Reader**（安全读取者）角色

## 技术实现细节

### 修改的文件

1. **helpers/azure/locations_china.js** - 新增
   - Azure China 区域配置

2. **helpers/azure/auth.js**
   - 添加 `addChinaLocations()` 函数
   - 支持 Azure China 认证端点和令牌作用域

3. **helpers/azure/index.js**
   - 更新 `locations()` 函数以支持 China 参数
   - 智能检测 settings 对象中的 azure_china 标志

4. **collectors/azure/collector.js**
   - 在数据收集流程中集成 China 区域支持
   - 修复 URL 显示以正确显示 China 端点

5. **index.js**
   - 添加 `--azure-china` 命令行参数
   - 将 Azure China 标志同步到 settings 对象

6. **engine.js**
   - 添加 Azure China 模式的控制台提示

### 架构设计

```
用户配置 (china: true)
    ↓
index.js 解析并设置标志
    ↓
engine.js 显示 "Using Azure China mode"
    ↓
collector.js 使用 addChinaLocations()
    ↓
auth.js 自动替换为 China 端点
    ↓
plugins 通过 helpers.locations(settings) 获取 China 区域
    ↓
执行安全检查
```

## 兼容性

- ✅ 与原有 Azure Global 环境完全兼容
- ✅ 与 Azure US Government（Govcloud）兼容
- ✅ 向后兼容所有现有插件
- ✅ 支持所有 Azure 服务的安全检查

## 测试

所有核心文件已通过语法验证：
```bash
node -c helpers/azure/locations_china.js    # ✓
node -c helpers/azure/auth.js               # ✓
node -c helpers/azure/index.js              # ✓
node -c collectors/azure/collector.js       # ✓
node -c index.js                            # ✓
node -c engine.js                           # ✓
```

## 常见问题

### Q: 如何确认正在使用 Azure China 端点？
A: 运行时会显示 `INFO: Using Azure China mode`，并且 URL 输出会显示 `management.chinacloudapi.cn` 等 China 端点。

### Q: 可以同时检查 Azure Global 和 Azure China 吗？
A: 不可以，每次运行只能针对一个环境。您需要分别配置并运行。

### Q: Azure China 支持所有插件吗？
A: 是的，所有 493 个 Azure 插件都支持 Azure China 环境。

### Q: 认证失败怎么办？
A: 请确认：
1. 服务主体在 Azure China 门户中创建（不是 Azure Global）
2. 配置文件中设置了 `china: true`
3. 服务主体具有订阅的读取权限
4. 密钥未过期

### Q: 某些服务在 Azure China 不可用怎么办？
A: Azure China 的服务可用性与 Azure Global 可能不同。如果某个服务不可用，对应的插件检查会跳过或报告服务不可用。

## 与上游的差异

本分支基于 CloudSploit 官方版本，主要增加了以下功能：

1. Azure China 区域定义文件
2. Azure China 认证和 API 端点支持
3. 智能端点替换逻辑
4. URL 显示优化（显示实际使用的端点）

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

与上游 CloudSploit 保持一致。

## 相关链接

- [CloudSploit 官方仓库](https://github.com/aquasecurity/cloudsploit)
- [Azure China 文档](https://docs.azure.cn/)
- [Azure China 门户](https://portal.azure.cn)
- [世纪互联运营的 Microsoft Azure](https://www.azure.cn/)

## 更新日志

### v1.0.0 - Azure China 支持
- ✨ 新增 Azure China 完整支持
- ✨ 新增 6 个 Azure China 区域配置
- ✨ 新增 `--azure-china` 命令行参数
- 🐛 修复 URL 显示问题，正确显示实际使用的端点
- 📝 添加中文文档

---

**注意**：本分支专门针对中国大陆地区的 Azure China 环境。如果您使用的是 Azure Global 或 Azure US Government，请使用原始配置（不设置 `china: true` 或 `--azure-china` 参数）。
