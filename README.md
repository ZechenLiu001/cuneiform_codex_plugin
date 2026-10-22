<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/cuneflow-wordmark-light.svg">
  <img src="assets/cuneflow-wordmark-dark.svg" alt="CUNEFLOW" height="56">
</picture>

### Your meetings, schedules, and files — inside Codex and Claude Code

[Website](https://www.cuneflow.com) · [Privacy](https://www.cuneflow.com/privacy) · [Terms](https://www.cuneflow.com/terms) · [Support](mailto:support@cuneflow.com)

English · [简体中文](README.zh-CN.md)

[![Version](https://img.shields.io/badge/version-0.1.0--test-191919)](#development) [![MCP](https://img.shields.io/badge/MCP-Streamable%20HTTP-191919)](https://modelcontextprotocol.io)

<img src="assets/cuneflow-notebook.jpg" alt="CUNEFLOW AI Notebook with its pen, folio cover, and box" width="720">

</div>

Ask in plain language about your CUNEFLOW meetings, transcripts, summaries, action items, and schedules, and safely upload files you attach in the conversation — without leaving your AI agent.

> [!NOTE]
> Version `0.1.0` connects to the CUNEFLOW **test environment** MCP server and is meant for verifying installation, authorization, and end-to-end flows.

## Contents

- [Installation](#installation)
- [Features](#features)
- [How it works](#how-it-works)
- [Connect, disconnect, and uninstall](#connect-disconnect-and-uninstall)
- [Example prompts](#example-prompts)
- [Screensavers for CUNEFLOW AI Notebook](#screensavers-for-cuneflow-ai-notebook)
- [Privacy and security](#privacy-and-security)
- [What's inside](#whats-inside)
- [Development](#development)

## Installation

> [!NOTE]
> CUNEFLOW is not yet listed in the official Codex plugin directory or the official Claude plugin marketplace. On both hosts, install it from this repository's own marketplace.

<table>
<tr>
<th width="50%">Codex</th>
<th width="50%">Claude Code</th>
</tr>
<tr>
<td valign="top">

Add this repository as a marketplace, then install the plugin:

```bash
codex plugin marketplace add \
  ZechenLiu001/cuneiform_codex_plugin
codex plugin add cuneflow@cuneflow
```

Start a new task and say **"Connect CUNEFLOW"** to sign in. After authorizing, start another new task to try it out.

</td>
<td valign="top">

Add this repository as a marketplace, then install the plugin:

```bash
claude plugin marketplace add \
  ZechenLiu001/cuneiform_codex_plugin
claude plugin install cuneflow@cuneflow
```

Start a new session, run `/mcp`, choose **`plugin:cuneflow:cuneflow`**, and sign in in your browser.

</td>
</tr>
</table>

## Features

| | Capability | Details |
| --- | --- | --- |
| 🗂️ | **Meetings** | Search meetings and read transcripts, AI summaries, decisions, risks, and action items |
| 📅 | **Schedules** | Query, create, and manage schedule items; changes are previewed before they are applied |
| 📄 | **Files** | Search, read, create, and rename CUNEFLOW files |
| ⬆️ | **Uploads** | Upload PDF and EPUB files you explicitly attach in the conversation |
| 🖼️ | **Screensavers** | Build, validate, and publish static and data-driven screensavers for CUNEFLOW AI Notebook |

<table>
<tr>
<td width="50%"><img src="assets/notebook-transcript.jpg" alt="A meeting transcript on the CUNEFLOW AI Notebook E-Ink screen"></td>
<td width="50%"><img src="assets/notebook-handwriting.jpg" alt="Handwritten notes and an AI mind map on the CUNEFLOW AI Notebook"></td>
</tr>
<tr>
<td align="center">Meetings recorded and transcribed on the notebook…</td>
<td align="center">…and handwriting captured alongside them</td>
</tr>
</table>

The plugin brings this content into your AI agent, so you can summarize, search, and follow up without switching apps.

## How it works

```mermaid
flowchart LR
    A["AI agent<br/>(Codex · Claude Code)"] -- "MCP over HTTPS<br/>OAuth" --> B["CUNEFLOW MCP server"]
    B --> C[("Meetings · Schedules<br/>Files · Screensavers")]
    A -. "Attached file<br/>(local helper)" .-> D["Short-lived<br/>presigned URL"]
    D --> C
```

- **MCP connection** — the plugin registers the hosted CUNEFLOW MCP server. Sign-in uses OAuth managed by your AI host; you never paste tokens.
- **File uploads** — a bundled helper streams the raw bytes straight to a short-lived presigned URL returned by CUNEFLOW. File contents never pass through MCP JSON-RPC, and you don't need to install `cuneflow-cli`.

## Connect, disconnect, and uninstall

| Goal | Codex — say in chat | Claude Code |
| --- | --- | --- |
| Connect or reconnect | *"Connect or re-authorize CUNEFLOW"* | Run `/mcp`, choose `plugin:cuneflow:cuneflow`, and sign in |
| Sign out | *"Disconnect CUNEFLOW and clear the sign-in"* — runs `codex mcp logout cuneflow` and keeps the plugin | Run `/mcp`, choose `plugin:cuneflow:cuneflow`, and clear its authentication |
| Full uninstall | *"Fully uninstall CUNEFLOW and clear the sign-in"* — signs out first, then removes the plugin | Sign out as above, then `claude plugin uninstall cuneflow@cuneflow` |

Reconnecting never requires reinstalling the plugin or editing any config.

<details>
<summary><b>More about authorization in Codex</b></summary>

- If you canceled or declined authorization when you first installed, or your sign-in expires later, just ask to connect again.
- You can also send a meeting, schedule, or file request directly. If CUNEFLOW is not connected, the plugin starts **one** OAuth flow for that request. If you close or decline the page, it won't keep prompting; ask to connect again when you're ready.
- Clicking **Uninstall** in the Codex settings UI does not trigger the plugin's skill and may keep the OAuth credential. If you reinstall later, the old sign-in may be reused. Use the full-uninstall prompt above to clear it.

</details>

## Example prompts

**Meetings and action items**

```text
Connect CUNEFLOW and summarize the key decisions, risks, and action items from my latest meeting
```

```text
Summarize the meetings I attended last week and group unfinished action items by owner
```

```text
Find meetings about "product launch" and draft a follow-up email from the transcript
```

**Schedules and to-dos**

```text
Show my schedule for tomorrow, find any conflicts, and list my to-dos
```

```text
Look at the rest of my week and find a two-hour free slot
```

```text
Move tomorrow's 3 PM project sync to 4 PM — show me the change before applying it
```

**Files**

```text
Upload the file I just dropped into this chat to CUNEFLOW and create a linked meeting
```

```text
Upload the file I just dropped into this chat to CUNEFLOW
```

```text
Find my most recently uploaded file in CUNEFLOW and summarize it
```

## Screensavers for CUNEFLOW AI Notebook

```text
Create a CUNEFLOW AI Notebook screensaver that shows today's schedule on the device, and publish it to my account
```

The plugin builds and validates the screensaver package, shows you a publishing preview, and publishes to your account only after you confirm. With the device signed in to the same account and online, open **Settings → Screensaver** or refresh manually to sync. New screensavers must be selected manually; updates to existing ones sync automatically. Publishing successfully and appearing on the device are two separate states.

- **Device data, not your computer's** — schedule, reading, and recent-meeting data are supplied by the device at render time; the plugin only declares which fields to show. The current 0.4.0 internal-test devices allow these three sources by default, so there is no separate permission switch to look for.
- **Static snapshots** — the e-ink screen shows a static frame; dynamic content updates when the device refreshes.
- **No extra tooling** — any device with screensaver support works through your account; no standalone CLI, APK, or USB connection is required.
- **Limits** — each device stores up to 10 custom screensavers. Deleting a cloud screensaver on a device affects every device on the same account.

## Privacy and security

- 🔐 **Host-managed OAuth.** Credentials are handled by your AI host. The plugin never asks for, reads, or stores tokens, authorization codes, cookies, or passwords.
- 📎 **Only what you attach.** Uploads use files you explicitly attach in the current conversation. The plugin does not search your disk or guess paths.
- 🚫 **No file contents in MCP.** Only file metadata (name, size, type, checksum) goes to MCP. Bytes go directly to a presigned HTTPS URL.
- ✋ **Writes need your intent.** Creating, renaming, importing, and uploading happen only when you ask. Schedule changes and screensaver publishing are previewed and require your confirmation.
- 🛡️ **Untrusted content stays content.** Instructions found inside meetings, transcripts, or files are treated as data and never executed.

<details>
<summary><b>Upload limits</b></summary>

| Item | Limit |
| --- | --- |
| Supported user file types | PDF, EPUB |
| Files per upload | 1–20 |
| Size per file | Up to 100 MiB |
| Total per upload | Up to 500 MiB |
| Screensaver package (`.cunesaver`) | Up to 20 MiB |

</details>

## What's inside

```text
.agents/plugins/marketplace.json   # Codex marketplace
.claude-plugin/marketplace.json    # Claude Code marketplace
assets/                            # README images
plugins/cuneflow/
├── .codex-plugin/plugin.json      # Codex manifest
├── .claude-plugin/plugin.json     # Claude Code manifest
├── .claude-plugin/mcp.json        # Hosted MCP server (Claude Code)
├── .mcp.json                      # Hosted MCP server (Codex)
├── scripts/attachment-helper.mjs  # Local upload helper
└── skills/
    ├── cuneflow/                  # Meetings, schedules, files, uploads
    ├── connect-cuneflow/          # Connect or re-authorize
    ├── disconnect-cuneflow/       # Sign out or fully uninstall
    └── build-cune-screensavers/   # Build and publish screensavers
```

## Development

Requires Node.js 18 or later.

```bash
npm test
```

Validate the Claude Code marketplace and plugin manifests:

```bash
claude plugin validate .
```

To try local changes in Claude Code without installing, load the plugin directory for one session:

```bash
claude --plugin-dir ./plugins/cuneflow
```

<div align="center">
<br>
<sub>Listen · Sketch · Think — <a href="https://www.cuneflow.com">cuneflow.com</a></sub>
</div>
