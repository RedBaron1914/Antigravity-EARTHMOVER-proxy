# Antigravity EARTHMOVER Proxy 🚀

> *"We came, we saw, we conqured - the triumph of the will"*

This is the ultimate, **100% serverless** Cloudflare Worker proxy that exposes an OpenAI-compatible API backed by the internal Antigravity Cloud Code endpoint. 

Unlike other community proxies that require you to keep the heavy Antigravity desktop app running in the background to scrape SQLite databases, this proxy is **completely autonomous**. It handles its own OAuth token refreshes, dynamic model discovery, and payload manipulation directly in the cloud.

## Features

- ☁️ **100% Serverless:** Deploy to Cloudflare Workers and close your terminal. No background daemons required.
- 🎭 **Perfect Mimicry:** Bypasses Google's 500/403 API errors by perfectly replicating the internal Go daemon's HTTP payload (including `ThinkingConfig`, `model_enum` placeholders, and telemetry labels).
- 🔄 **Autonomous Auth:** Automatically exchanges and refreshes tokens using the official Antigravity Client ID & Secret.
- 🛡️ **Abuse Protection:** Strips out Clearcut telemetry tracking while maintaining a valid request structure.
- 📡 **Dynamic Routing:** Automatically discovers and routes models directly from Google's `fetchAvailableModels` internal dictionary.
- 🔌 **IDE Ready:** Drop-in replacement for OpenAI API in Zed, Cursor, or any other IDE.

---

## ⚡ Quick Start

### 1. Get Your Token
You do not need to install the official Antigravity client. We have included an automated script that mimics the OAuth flow.

```bash
npm install
node scripts/login.js
```
Follow the instructions in the terminal. The script will output a JSON block. Copy this JSON.

### 2. Deploy to Cloudflare
Deploy the worker to your Cloudflare account:

```bash
npx wrangler deploy
```

### 3. Inject the Secret
Bind your OAuth token to the deployed worker:

```bash
npx wrangler secret put GCP_SERVICE_ACCOUNT
```
*Paste the JSON block you copied from Step 1 when prompted.*

*(Optional)* If you have a specific Google Cloud project with the Cloud AI Companion API enabled and you are ready to pay for billing, you can bypass the default free-tier shadow project by setting your own:
```bash
npx wrangler secret put GEMINI_PROJECT_ID
```

---

## 🛠️ Usage in any frontend

Configure your IDE to point to your new Cloudflare Worker URL.

**Base URL:** `https://antigravity-proxy.<your-subdomain>.workers.dev/v1`  
**API Key:** `dummy-key` *(Can be anything, the worker handles actual auth)*  

The proxy will dynamically populate your model dropdown with the actual display names (e.g., `Gemini 3.5 Flash (Medium)`, `Claude Opus 4.6 (Thinking)`). Select one and start coding!

---

## 🧠 The "Triumph of the Will" Architecture

This proxy is the result of exhaustive reverse-engineering of the Antigravity CLI Go binary (`agy.exe`). We discovered that Google protects this endpoint using:
1. **mTLS & Botan C++ Cryptography**
2. **Dynamic Project Provisioning (`loadCodeAssist`)**
3. **Internal Enum Routing (`MODEL_PLACEHOLDER_M187`)**


---
*Disclaimer: This is an unofficial tool created for educational and research purposes. Use at your own risk.*