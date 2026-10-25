import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const pluginRoot = new URL("../plugins/cuneflow/", import.meta.url);
const workspaceRoot = new URL("../", import.meta.url);

async function readJson(relativePath) {
  return JSON.parse(await readFile(new URL(relativePath, pluginRoot), "utf8"));
}

test("shares one plugin identity across Codex and Claude manifests", async () => {
  const codex = await readJson(".codex-plugin/plugin.json");
  const claude = await readJson(".claude-plugin/plugin.json");

  assert.equal(codex.name, "cuneflow");
  assert.equal(claude.name, codex.name);
  assert.equal(claude.version, codex.version);
  assert.equal(claude.description, codex.description);
  assert.equal(codex.mcpServers, "./.mcp.json");
  assert.equal(claude.mcpServers, "./.claude-plugin/mcp.json");
  assert.deepEqual(codex.interface.defaultPrompt, [
    "连接 CUNEFLOW，并总结我最近一次会议的关键决策、风险和行动项",
    "查看我明天的日程安排，找出时间冲突并整理待办",
    "把我刚拖入对话的文件上传到 CUNEFLOW，并创建关联会议"
  ]);
});

test("keeps English and Chinese READMEs linked and structurally aligned", async () => {
  const english = await readFile(new URL("README.md", workspaceRoot), "utf8");
  const chinese = await readFile(new URL("README.zh-CN.md", workspaceRoot), "utf8");
  const sectionCount = (content) => content.match(/^## /gm)?.length ?? 0;

  assert.ok(english.includes("](README.zh-CN.md)"), "README.md must link to the Chinese README");
  assert.ok(chinese.includes("](README.md)"), "README.zh-CN.md must link to the English README");
  assert.equal(sectionCount(english), sectionCount(chinese));
  const commands = [
    "codex plugin marketplace add",
    "codex plugin add cuneflow@cuneflow",
    "claude plugin marketplace add",
    "ZechenLiu001/cuneiform_codex_plugin",
    "claude plugin install cuneflow@cuneflow",
    "plugin:cuneflow:cuneflow",
    "claude --plugin-dir"
  ];
  for (const command of commands) {
    assert.ok(english.includes(command), `README.md is missing: ${command}`);
    assert.ok(chinese.includes(command), `README.zh-CN.md is missing: ${command}`);
  }
});

test("publishes the plugin through a Claude Code marketplace at the repository root", async () => {
  const marketplace = JSON.parse(await readFile(new URL(".claude-plugin/marketplace.json", workspaceRoot), "utf8"));
  const claude = await readJson(".claude-plugin/plugin.json");
  const codexMarketplace = JSON.parse(await readFile(new URL(".agents/plugins/marketplace.json", workspaceRoot), "utf8"));

  // 两个宿主使用相同的安装 ID：cuneflow@cuneflow。
  assert.equal(marketplace.name, codexMarketplace.name);
  assert.ok(marketplace.owner?.name);
  assert.equal(marketplace.plugins.length, 1);
  assert.equal(marketplace.plugins[0].name, claude.name);
  assert.equal(marketplace.plugins[0].source, "./plugins/cuneflow");
  await access(new URL("plugins/cuneflow/.claude-plugin/plugin.json", workspaceRoot));
});

test("gives Claude Code its own sign-in path and an explicit helper location", async () => {
  const mainSkill = await readFile(new URL("skills/cuneflow/SKILL.md", pluginRoot), "utf8");
  const connectSkill = await readFile(new URL("skills/connect-cuneflow/SKILL.md", pluginRoot), "utf8");
  const disconnectSkill = await readFile(new URL("skills/disconnect-cuneflow/SKILL.md", pluginRoot), "utf8");
  const publishing = await readFile(new URL("skills/build-cune-screensavers/references/cuneflow-publishing.md", pluginRoot), "utf8");

  for (const content of [mainSkill, connectSkill, disconnectSkill]) {
    assert.ok(content.includes("plugin:cuneflow:cuneflow"));
    assert.ok(content.includes("不要运行任何 `codex` 命令"));
  }
  for (const content of [mainSkill, publishing]) {
    assert.ok(content.includes("${CLAUDE_PLUGIN_ROOT}/scripts/attachment-helper.mjs"));
    assert.ok(content.includes("../../scripts/attachment-helper.mjs"));
  }
  // 相对路径必须真的指向插件内置的 Helper。
  await access(new URL("skills/cuneflow/../../scripts/attachment-helper.mjs", pluginRoot));
});

test("keeps README examples aligned with Codex default prompts", async () => {
  const codex = await readJson(".codex-plugin/plugin.json");
  // Codex 默认提示词是中文，对应中文 README。
  const readme = await readFile(new URL("README.zh-CN.md", workspaceRoot), "utf8");

  for (const prompt of codex.interface.defaultPrompt) {
    assert.ok(readme.includes(prompt), `README is missing default prompt: ${prompt}`);
  }
});

test("exposes one authenticated CUNEFLOW MCP server on both hosts", async () => {
  const codex = await readJson(".mcp.json");
  const claude = await readJson(".claude-plugin/mcp.json");

  assert.deepEqual(Object.keys(codex.mcpServers), ["cuneflow"]);
  assert.deepEqual(Object.keys(claude.mcpServers), ["cuneflow"]);
  assert.equal(codex.mcpServers.cuneflow.url, claude.mcpServers.cuneflow.url);
  assert.equal(codex.mcpServers.cuneflow.oauth_resource, codex.mcpServers.cuneflow.url);
  await access(new URL("scripts/attachment-helper.mjs", pluginRoot));
});

test("keeps OAuth recovery available after a user cancels initial authorization", async () => {
  const connectSkill = await readFile(new URL("skills/connect-cuneflow/SKILL.md", pluginRoot), "utf8");
  const mainSkill = await readFile(new URL("skills/cuneflow/SKILL.md", pluginRoot), "utf8");
  const readme = await readFile(new URL("README.zh-CN.md", workspaceRoot), "utf8");

  for (const content of [connectSkill, mainSkill]) {
    assert.ok(content.includes("codex mcp login cuneflow"));
    assert.ok(content.includes("一次用户请求最多启动一次登录"));
  }
  assert.ok(connectSkill.includes("不要只回复“请重新连接”"));
  assert.ok(readme.includes("连接或重新授权 CUNEFLOW"));
  assert.ok(readme.includes("不需要卸载插件或编辑配置"));
});

test("disconnects OAuth before a conversational full uninstall", async () => {
  const disconnectSkill = await readFile(new URL("skills/disconnect-cuneflow/SKILL.md", pluginRoot), "utf8");
  const readme = await readFile(new URL("README.zh-CN.md", workspaceRoot), "utf8");

  const logoutIndex = disconnectSkill.indexOf("codex mcp logout cuneflow");
  const removeIndex = disconnectSkill.indexOf("codex plugin remove cuneflow@cuneflow");

  assert.ok(logoutIndex >= 0);
  assert.ok(removeIndex > logoutIndex);
  assert.ok(disconnectSkill.includes("不能拦截 Codex 设置界面的手动卸载按钮"));
  assert.ok(disconnectSkill.includes("不要声称它会删除 CUNEFLOW 账户"));
  assert.ok(readme.includes("彻底卸载 CUNEFLOW，并清除登录状态"));
  assert.ok(readme.includes("直接在 Codex 设置界面点击“卸载”不会触发 Skill"));
});

test("packages all canonical CLI skills and screensaver resources", async () => {
  const required = [
    "skills/connect-cuneflow/SKILL.md",
    "skills/connect-cuneflow/agents/openai.yaml",
    "skills/disconnect-cuneflow/SKILL.md",
    "skills/disconnect-cuneflow/agents/openai.yaml",
    "skills/cuneflow/SKILL.md",
    "skills/build-cune-screensavers/SKILL.md",
    "skills/build-cune-screensavers/agents/openai.yaml",
    "skills/build-cune-screensavers/scripts/cunesaver.py",
    "skills/build-cune-screensavers/scripts/cunesaver.pyz",
    "skills/build-cune-screensavers/references/adb-delivery.md",
    "skills/build-cune-screensavers/references/cuneflow-publishing.md",
    "skills/build-cune-screensavers/references/data-boundary.md",
    "skills/build-cune-screensavers/references/format-v1.md",
    "skills/build-cune-screensavers/references/format-v2.md",
    "skills/build-cune-screensavers/references/testkit-delivery.md"
  ];

  await Promise.all(required.map((relativePath) => access(new URL(relativePath, pluginRoot))));
  assert.ok((await stat(new URL("skills/build-cune-screensavers/scripts/cunesaver.pyz", pluginRoot))).size > 0);
});

test("requires every PDF background meeting in a batch to reuse its source file", async () => {
  const skill = await readFile(new URL("skills/cuneflow/SKILL.md", pluginRoot), "utf8");

  assert.ok(skill.includes("每次 `create_meeting_from_pdf` 复用同一个 `sourceFileId`"));
  assert.ok(skill.includes("源 PDF 保留在文件库，但不会自动成为关联资料"));
});

test("keeps meeting creation independent from schedule creation", async () => {
  const skill = await readFile(new URL("skills/cuneflow/SKILL.md", pluginRoot), "utf8");

  assert.ok(skill.includes("会议创建完成标准：返回本次实际创建结果，然后结束当前流程"));
  assert.ok(skill.includes("PDF 背景会议成功回复字段白名单：会议标题、`meetingId`、PDF 页数和背景转换状态"));
  assert.ok(skill.includes("回复到背景转换状态即结束"));
  assert.ok(skill.includes("日程写入分支：仅当用户明确要求“创建日程”“加入日历”或“设置提醒”时调用 `create_schedule_task`"));
  assert.ok(!skill.includes("未创建日程"));
});

test("treats an explicit attachment-backed meeting request as upload authorization", async () => {
  const skill = await readFile(new URL("skills/cuneflow/SKILL.md", pluginRoot), "utf8");

  assert.ok(skill.includes("原始请求和用途选择已构成本次文件上传和关联创建的明确授权"));
  assert.ok(skill.includes("不要在聊天中再次要求用户回复“同意”"));
  assert.ok(skill.includes("系统级审批仍由宿主管理，不得绕过"));
  assert.ok(skill.includes("实际上传目标和用途超出用户原始请求时，必须先询问"));
});

test("clarifies ambiguous PDF meeting intent before writing on both hosts", async () => {
  // Codex 和 Claude 共用本仓库的 Skill，独立仓库不依赖 CLI 源码。
  const skills = [await readFile(new URL("skills/cuneflow/SKILL.md", pluginRoot), "utf8")];

  for (const skill of skills) {
    assert.ok(skill.includes("导入文件并开会"));
    assert.ok(skill.includes("使用附件开会"));
    assert.ok(skill.includes("作为会议资料关联"));
    assert.ok(skill.includes("每一页作为笔记背景"));
    assert.ok(skill.includes("既作为背景又关联为会议资料"));
    assert.ok(skill.includes("同一个文件 ID 同时放入 `sourceFileId` 和 `linkedFileIds`"));
    assert.ok(skill.includes("用途或背景源尚未确定时，不调用任何文件写入或会议创建工具"));
    assert.ok(skill.includes("EPUB 等非 PDF 文件只能作为关联资料"));
  }
});

test("keeps effective schedule semantics aligned on both hosts", async () => {
  // Codex 和 Claude 共用本仓库的 Skill，独立仓库不依赖 CLI 源码。
  const skills = [await readFile(new URL("skills/cuneflow/SKILL.md", pluginRoot), "utf8")];

  for (const skill of skills) {
    assert.ok(skill.includes("用户只说“查询有效日程”而没有提供时间范围时"));
    assert.ok(skill.includes("左闭右开区间 `[rangeStart, rangeEnd)`"));
    assert.ok(skill.includes("“有效”“待进行”“未完成”“接下来的”使用 `todo`"));
    assert.ok(skill.includes("“已完成”使用 `done`"));
    assert.ok(skill.includes("“已取消”使用 `cancelled`"));
    assert.ok(skill.includes("用户没有表达状态限制时不传 `statusFilters`"));
  }
});

test("links to the live privacy policy and terms of service pages", async () => {
  const codex = await readJson(".codex-plugin/plugin.json");
  const privacy = "https://www.cuneflow.com/privacy-policy";
  const terms = "https://www.cuneflow.com/terms-of-service";

  // /privacy 和 /terms 在官网上是 404，目录审核会检查这两个链接。
  assert.equal(codex.interface.privacyPolicyURL, privacy);
  assert.equal(codex.interface.termsOfServiceURL, terms);
  for (const file of ["README.md", "README.zh-CN.md"]) {
    const readme = await readFile(new URL(file, workspaceRoot), "utf8");
    assert.ok(readme.includes(`](${privacy})`), `${file} is missing the privacy policy link`);
    assert.ok(readme.includes(`](${terms})`), `${file} is missing the terms of service link`);
  }
});

test("describes the production MCP server for the official MCP Registry", async () => {
  const server = JSON.parse(await readFile(new URL("server.json", workspaceRoot), "utf8"));
  const gitignore = await readFile(new URL(".gitignore", workspaceRoot), "utf8");

  // com.cuneflow 前缀依赖 cuneflow.com 的域名认证。
  assert.match(server.name, /^com\.cuneflow\/[a-z0-9._-]+$/);
  assert.ok(server.description.length >= 1 && server.description.length <= 100);
  assert.match(server.version, /^\d+\.\d+\.\d+$/);
  assert.equal(new URL(server.websiteUrl).hostname, "www.cuneflow.com");
  assert.deepEqual(server.remotes, [{ type: "streamable-http", url: "https://mcp.cuneflow.com/mcp" }]);
  // 服务源码不公开，不填写 repository。
  assert.equal(server.repository, undefined);
  // 发布用的私钥不能进入仓库。
  assert.match(gitignore, /^\*\.pem$/m);
});
