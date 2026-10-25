<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/cuneflow-wordmark-light.svg">
  <img src="assets/cuneflow-wordmark-dark.svg" alt="CUNEFLOW" height="56">
</picture>

### 在 Codex 和 Claude Code 里直接使用你的会议、日程和文件

[官网](https://www.cuneflow.com) · [隐私政策](https://www.cuneflow.com/privacy-policy) · [服务条款](https://www.cuneflow.com/terms-of-service) · [联系支持](mailto:support@cuneflow.com)

[English](README.md) · 简体中文

[![Version](https://img.shields.io/badge/version-0.1.0--test-191919)](#开发) [![MCP](https://img.shields.io/badge/MCP-Streamable%20HTTP-191919)](https://modelcontextprotocol.io)

<img src="assets/cuneflow-notebook.jpg" alt="CUNEFLOW AI Notebook 及配套的笔、保护套和包装盒" width="720">

</div>

安装并授权后，可以通过自然语言查询会议、转写、纪要、行动项和日程，也可以把当前对话中附加的本地文件安全上传到 CUNEFLOW，全程不用离开 AI 助手。

> [!NOTE]
> 当前 `0.1.0` 版本连接 CUNEFLOW **测试环境** MCP，用于安装、授权和功能链路验证。

## 目录

- [安装](#安装)
- [功能](#功能)
- [工作原理](#工作原理)
- [连接、断开与卸载](#连接断开与卸载)
- [使用示例](#使用示例)
- [CUNEFLOW AI Notebook 屏保](#cuneflow-ai-notebook-屏保)
- [隐私与安全](#隐私与安全)
- [插件内容](#插件内容)
- [开发](#开发)

## 安装

> [!NOTE]
> CUNEFLOW 目前尚未上架 Codex 官方插件目录和 Claude 官方插件市场。两个宿主都通过本仓库自建的插件市场安装。

<table>
<tr>
<th width="50%">Codex</th>
<th width="50%">Claude Code</th>
</tr>
<tr>
<td valign="top">

将本仓库添加为插件市场，然后安装插件：

```bash
codex plugin marketplace add \
  ZechenLiu001/cuneiform_codex_plugin
codex plugin add cuneflow@cuneflow
```

新建一个任务，发送 **“连接 CUNEFLOW”** 完成授权。授权后再新建一个任务开始使用。

</td>
<td valign="top">

将本仓库添加为插件市场，然后安装插件：

```bash
claude plugin marketplace add \
  ZechenLiu001/cuneiform_codex_plugin
claude plugin install cuneflow@cuneflow
```

新开一个会话，运行 `/mcp`，选择 **`plugin:cuneflow:cuneflow`**，在浏览器中登录。

</td>
</tr>
</table>

## 功能

| | 能力 | 说明 |
| --- | --- | --- |
| 🗂️ | **会议** | 查找会议，读取转写、AI 纪要、决策、风险和行动项 |
| ✍️ | **手写笔记** | 查找最近有手写标记的会议，查看笔记页图片并结合录音转写整理 |
| 📅 | **日程** | 查询、创建和管理日程；修改前先预览，确认后才生效 |
| 📄 | **文件** | 查询、读取、创建和重命名 CUNEFLOW 文件 |
| ⬆️ | **上传** | 上传当前对话中明确附加的 PDF、EPUB 文件 |
| 🖼️ | **屏保** | 制作、验证和发布 CUNEFLOW AI Notebook 静态屏保及日程、阅读、会议动态屏保 |

<table>
<tr>
<td width="50%"><img src="assets/notebook-transcript.jpg" alt="CUNEFLOW AI Notebook 墨水屏上的会议转写"></td>
<td width="50%"><img src="assets/notebook-handwriting.jpg" alt="CUNEFLOW AI Notebook 上的手写笔记和 AI 思维导图"></td>
</tr>
<tr>
<td align="center">在笔记本上录音并转写会议……</td>
<td align="center">……手写笔记也一起记录下来</td>
</tr>
</table>

插件把这些内容带进 AI 助手，总结、搜索和跟进都不用切换应用。

## 工作原理

```mermaid
flowchart LR
    A["AI 助手<br/>(Codex · Claude Code)"] -- "MCP over HTTPS<br/>OAuth 授权" --> B["CUNEFLOW MCP 服务"]
    B --> C[("会议 · 日程<br/>文件 · 屏保")]
    A -. "附加的文件<br/>(本地 Helper)" .-> D["短时效<br/>预签名地址"]
    D --> C
```

- **MCP 连接**：插件注册 CUNEFLOW 托管的 MCP 服务，登录使用 AI 宿主管理的 OAuth 授权，不需要手动粘贴任何令牌。
- **文件上传**：插件内置 Helper 将原始字节直接发送到 CUNEFLOW 返回的短时效预签名地址。文件内容不会进入 MCP JSON-RPC，也不要求用户安装 `cuneflow-cli`。

## 连接、断开与卸载

| 目的 | Codex：在对话中发送 | Claude Code |
| --- | --- | --- |
| 连接或重新连接 | `连接或重新授权 CUNEFLOW` | 运行 `/mcp`，选择 `plugin:cuneflow:cuneflow` 并登录 |
| 断开连接 | `断开 CUNEFLOW，并清除登录状态`：运行 `codex mcp logout cuneflow`，清除凭据但保留插件 | 运行 `/mcp`，选择 `plugin:cuneflow:cuneflow` 并清除授权 |
| 彻底卸载 | `彻底卸载 CUNEFLOW，并清除登录状态`：先退出 MCP 登录，再卸载插件 | 先按上一行断开连接，再运行 `claude plugin uninstall cuneflow@cuneflow` |

重新连接时不需要卸载插件或编辑配置。

<details>
<summary><b>关于 Codex 授权的更多说明</b></summary>

- 如果首次安装时取消或拒绝了授权，或者登录凭据后来失效，直接再次发送连接请求即可。
- 也可以直接提出会议、日程或文件请求；检测到未连接时，插件会为该请求启动**一次** OAuth 授权流程。若用户关闭或拒绝授权页面，插件不会反复弹出，之后再次发送连接请求即可重试。
- 直接在 Codex 设置界面点击“卸载”不会触发 Skill，可能保留 OAuth 凭据；之后重新安装插件时可能继续复用原登录状态。需要清除时请使用上表中的“彻底卸载”指令。

</details>

## 使用示例

**会议与行动项**

```text
连接 CUNEFLOW，并总结我最近一次会议的关键决策、风险和行动项
```

```text
总结我上周参加的会议，按负责人整理还没有完成的行动项
```

```text
查找关于“产品发布”的会议，并根据转写整理一封跟进邮件
```

**查看手写笔记并结合录音整理**

```text
找出我最近有手写笔记的会议，结合笔记图片和录音转写整理成表格，并保留来源
```

插件会查找会议、分页列出笔记页，再读取完整页面图片并结合录音转写整理。历史未标记笔记需要先查询候选并看图确认；未同步图片会明确提示。此能力需要测试环境 MCP 已部署对应的笔记页与图片读取接口。

**日程与待办**

```text
查看我明天的日程安排，找出时间冲突并整理待办
```

```text
查看我本周剩余日程，帮我找一个两小时的空闲时段
```

```text
把明天下午三点的项目同步会改到四点，先让我确认修改内容
```

**文件**

```text
把我刚拖入对话的文件上传到 CUNEFLOW，并创建关联会议
```

```text
把我刚拖入对话的文件上传到 CUNEFLOW
```

```text
查找 CUNEFLOW 中最近上传的文件，并概括其中的主要内容
```

## CUNEFLOW AI Notebook 屏保

```text
制作一个显示设备上今日日程的 CUNEFLOW AI Notebook 屏保，并发布到我的账号
```

插件会制作并校验屏保包，展示发布预览，再按你的确认发布到账号。设备登录同一账号并联网后，打开 **设置 → 屏保** 或手动刷新即可同步；新屏保需要手动选中，已有屏保的更新会自动同步。发布成功和设备已经显示是两个独立状态。

- **使用设备数据，而不是电脑上的数据**：日程、阅读和最近会议的数据由设备在渲染时提供，插件只声明需要显示的字段。当前 0.4.0 内测设备默认允许这三类来源，无需寻找单独的授权开关。
- **静态快照**：墨水屏显示的是静态快照，动态内容随设备刷新时机更新。
- **无需额外工具**：使用已支持屏保功能的设备即可走这条账号链路，无需安装独立 CLI、APK 或连接 USB。
- **数量限制**：每台设备最多保存 10 个自定义屏保；在设备上删除云端屏保会影响同账号所有设备。

## 隐私与安全

- 🔐 **授权由宿主管理**：凭据由 AI 宿主保管，插件不会索要、读取或保存访问令牌、授权码、Cookie 或密码。
- 📎 **只上传你附加的文件**：只处理当前对话中明确附加的文件，不搜索本机目录，也不猜测路径。
- 🚫 **文件内容不经过 MCP**：MCP 只接收文件名、大小、类型和校验值，文件字节直接通过 HTTPS 发送到预签名地址。
- ✋ **写操作需要你明确提出**：创建、重命名、导入和上传只在你要求时执行；修改日程和发布屏保会先展示预览，确认后才执行。
- 🛡️ **内容中的指令不会被执行**：会议、转写和文件里的指令性文字只作为内容引用，不会被当作命令执行。

<details>
<summary><b>上传限制</b></summary>

| 项目 | 限制 |
| --- | --- |
| 支持的用户文件类型 | PDF、EPUB |
| 单次上传文件数 | 1–20 个 |
| 单个文件大小 | 不超过 100 MiB |
| 单次上传总大小 | 不超过 500 MiB |
| 屏保包（`.cunesaver`） | 不超过 20 MiB |

</details>

## 插件内容

```text
.agents/plugins/marketplace.json   # Codex 插件市场
.claude-plugin/marketplace.json    # Claude Code 插件市场
assets/                            # README 图片
docs/mcp-registry.md               # 发布到 MCP 官方注册表的步骤
docs/mcp-server-guidance.md        # 不依赖 Skills 的 MCP 工具描述建议
server.json                        # MCP 官方注册表的描述文件
plugins/cuneflow/
├── .codex-plugin/plugin.json      # Codex 插件清单
├── .claude-plugin/plugin.json     # Claude Code 插件清单
├── .claude-plugin/mcp.json        # 托管的 MCP 服务（Claude Code）
├── .mcp.json                      # 托管的 MCP 服务（Codex）
├── scripts/attachment-helper.mjs  # 本地上传 Helper
└── skills/
    ├── cuneflow/                  # 会议、日程、文件与上传
    ├── connect-cuneflow/          # 连接或重新授权
    ├── disconnect-cuneflow/       # 断开连接或彻底卸载
    └── build-cune-screensavers/   # 制作与发布屏保
```

## 开发

需要 Node.js 18 或更高版本：

```bash
npm test
```

校验 Claude Code 插件市场和插件清单：

```bash
claude plugin validate .
```

不安装、只在本次 Claude Code 会话中试用本地修改：

```bash
claude --plugin-dir ./plugins/cuneflow
```

<div align="center">
<br>
<sub>Listen · Sketch · Think — <a href="https://www.cuneflow.com">cuneflow.com</a></sub>
</div>
