---
name: connect-cuneflow
description: 连接或重新授权 CUNEFLOW MCP。当插件安装后没有自动弹出授权、CUNEFLOW 工具提示未连接或未登录、OAuth 凭据失效，或用户明确要求连接 CUNEFLOW 时使用。
---

# 连接 CUNEFLOW

为当前宿主启动 CUNEFLOW OAuth 登录流程。这是本地或 Git 插件安装未自动显示授权界面时的兜底入口。

## Codex

1. 以下任一情况出现时，直接运行 `codex mcp login cuneflow`，不要只回复“请重新连接”：
   - 用户明确要求连接、登录或重新授权 CUNEFLOW；
   - 用户明确请求查询或写入 CUNEFLOW，但工具因未连接、未登录、凭据失效或 OAuth 授权被取消而不可用。
2. 一次用户请求最多启动一次登录流程。用户取消、拒绝或关闭授权页面后，不要自动循环打开；等用户再次明确请求连接或使用 CUNEFLOW 时再重试。
3. 该命令应打开由 Codex 管理的浏览器授权页面。等待用户在页面中完成登录和授权，不要索要、读取或转述 access token、refresh token、授权码或 Cookie。
4. 命令成功结束后，告知用户 CUNEFLOW 已连接。若当前任务的 MCP 工具目录尚未刷新，建议用户新建任务后重试原查询或上传请求。
5. 如果命令失败，只报告必要错误和可执行的下一步；不要让非技术用户手动编辑 MCP 配置，也不要要求安装 `cuneflow-cli`。

## Claude Code

Claude Code 的 MCP 授权在 `/mcp` 面板中完成，只能由用户操作，Agent 无法代为执行。不要运行任何 `codex` 命令。

1. 出现与 Codex 相同的触发情况时，告诉用户：在输入框运行 `/mcp`，选择 `plugin:cuneflow:cuneflow`，按提示在浏览器中完成登录和授权。
2. 一次用户请求最多提示一次。用户完成后，重试原查询或上传请求；用户拒绝或暂不登录时，不要反复提示。
3. 如果 `/mcp` 中找不到该服务器，说明插件可能未启用：请用户运行 `/plugin` 确认 `cuneflow` 已安装并启用。

## 其他宿主

如果当前宿主不是 Codex 或 Claude Code，不要安装或调用 Codex CLI。使用宿主提供的 MCP 连接/授权入口；如果宿主没有该入口，明确说明当前插件无法代替宿主完成 OAuth。

## 安全边界

- 不要求用户粘贴任何令牌、授权码、Cookie 或密码。
- 不把凭据写入文件、日志、命令参数或对话内容。
- 不用 CUNEFLOW CLI 代替 MCP OAuth。
- 用户明确请求使用 CUNEFLOW 时，可以为恢复该请求启动一次 OAuth；这不代表可以绕过用户在授权页面上的同意或拒绝。
- 连接成功不代表可以执行任意写操作；上传、创建或修改数据仍需用户明确提出。
