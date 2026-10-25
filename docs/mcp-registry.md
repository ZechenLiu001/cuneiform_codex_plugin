# 发布到 MCP 官方注册表

本文说明如何把 CUNEFLOW 的远程 MCP 服务发布到 [MCP 官方注册表](https://registry.modelcontextprotocol.io)。注册表只登记服务的元数据（名称、简介、地址），不托管代码；发布后，Glama、PulseMCP 等下游目录会定期同步收录。

> [!IMPORTANT]
> 发布出去的内容是公开的，而且同一版本发布后不能修改或删除，只能标记为弃用或删除。请先确认下面的“发布前检查”全部完成。

## 发布前检查

- [ ] 正式环境 `https://mcp.cuneflow.com/mcp` 稳定可用，功能与测试环境一致（目前正式环境缺少 `screensaver:write` 权限）
- [ ] 每个工具都有 `title` 和 `readOnlyHint` 或 `destructiveHint` 标注
- [ ] `server.json` 中的 `version` 已更新为本次要发布的版本
- [ ] 有权限修改 `cuneflow.com` 的 DNS 记录

## 文件说明

仓库根目录的 [`server.json`](../server.json) 是发布用的描述文件：

| 字段 | 值 | 说明 |
| --- | --- | --- |
| `name` | `com.cuneflow/cuneflow` | 以 `com.cuneflow` 开头，需要通过 cuneflow.com 的域名认证 |
| `description` | 不超过 100 个字符 | 只描述功能，不要写营销文案，否则可能被当作垃圾信息删除 |
| `version` | `0.1.0` | 每次发布都要换一个新版本号 |
| `remotes` | `https://mcp.cuneflow.com/mcp` | 正式环境地址，传输方式为 `streamable-http` |

没有填写 `repository`：MCP 服务的源码不公开，填插件仓库会让人误以为那是服务源码。`icons` 需要 HTTPS 地址，等图标放到官网或公开仓库后再补。

## 发布步骤

以下命令需要官方发布工具 `mcp-publisher`，安装方式见[官方文档](https://modelcontextprotocol.io/registry/quickstart#step-3-install-mcp-publisher)（macOS 可用 `brew install mcp-publisher`）。

### 1. 校验 `server.json`

```bash
mcp-publisher validate server.json
```

看到 `✅ server.json is valid` 即可继续。

### 2. 生成密钥并添加 DNS 记录

在仓库之外的安全目录中生成一对 Ed25519 密钥，并输出要添加的 DNS 记录：

```bash
openssl genpkey -algorithm Ed25519 -out key.pem
```

```bash
echo "cuneflow.com. IN TXT \"v=MCPv1; k=ed25519; p=$(openssl pkey -in key.pem -pubout -outform DER | tail -c 32 | base64)\""
```

在 cuneflow.com 的 DNS 服务商处添加这条 TXT 记录（保留现有的 Google、Klaviyo 等记录），等待几分钟生效。可以这样检查：

```bash
dig +short TXT cuneflow.com
```

> [!WARNING]
> `key.pem` 是发布凭据，不要提交到仓库，也不要发到聊天工具里。请保存在密码管理器或团队的密钥管理服务中。仓库的 `.gitignore` 已忽略 `*.pem`。

### 3. 登录注册表

```bash
mcp-publisher login dns --domain cuneflow.com --private-key "$(openssl pkey -in key.pem -noout -text | grep -A3 'priv:' | tail -n +2 | tr -d ' :\n')"
```

### 4. 发布

```bash
mcp-publisher publish
```

### 5. 确认已收录

```bash
curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=com.cuneflow/cuneflow"
```

## 发布之后

- **更新版本**：修改 `server.json` 的 `version` 后重新执行“校验 → 登录 → 发布”。已发布的版本不能修改。
- **下线旧版本**：使用 `mcp-publisher status` 把旧版本标记为弃用。
- **下游目录**：Glama 会自动导入，之后可以通过域名认领条目；GitHub MCP Registry（VS Code 使用）需要另外提交申请。
- **注册表仍是预览版**：正式版之前可能有不兼容的改动，甚至清空数据，发布后请留意官方公告。
