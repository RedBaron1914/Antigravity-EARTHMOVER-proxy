# Antigravity EARTHMOVER Proxy 🚀

*[🇷🇺 Читать на русском ниже](#русская-версия)*

> *"We came, we saw, we conquered - the triumph of the will"*

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

*Disclaimer: This is an unofficial tool created for educational and research purposes. Use at your own risk. It relies on undocumented APIs. Google may rotate the client secret or change the API structure at any time wtihout warning. Consider burner accounts.*

---
---

<a name="русская-версия"></a>
# Antigravity EARTHMOVER Прокси 🚀

> *"Пришли, увидели, победили - триумф воли"*

Это ультимативный, **на 100% бессерверный** Cloudflare Worker прокси, который предоставляет OpenAI-совместимый API, работающий поверх скрытого внутреннего эндпоинта Antigravity Cloud Code.

В отличие от других решений, которые заставляют вас держать тяжелое десктопное приложение Antigravity запущенным на фоне (чтобы воровать токены из SQLite), этот прокси **полностью автономен**. Он сам обновляет OAuth токены, сам скачивает словари моделей и сам формирует криптографически выверенные запросы прямо в облаке.

## Особенности
- ☁️ **Никаких серверов:** Задеплойте в Cloudflare и закройте терминал.
- 🎭 **Идеальная маскировка:** Обходит ошибки 500/403 от Google, полностью копируя структуру HTTP-пакетов официального Go-демона (включая `ThinkingConfig`, `model_enum` и нужные метки).
- 🔄 **Автономная авторизация:** Самостоятельно обновляет токены через официальные Client ID и Secret от Antigravity.
- 🛡️ **Защита от банов:** Полностью вырезает телеметрию (Clearcut), маскируясь под клиента, отказавшегося от слежки.
- 📡 **Динамический роутинг:** Автоматически скачивает свежий список моделей напрямую с серверов Google и на лету подменяет их на нужные M-коды.
- 🔌 **Готов к работе:** Идеально работает в Zed, Cursor и любых других фронтэндов.

---

## ⚡ Быстрый старт

### 1. Получение токена
Вам не нужно скачивать оригинальный клиент Antigravity. Мы написали скрипт, который сделает всё за вас:

```bash
npm install
node scripts/login.js
```
Следуйте инструкциям в консоли. Скрипт выдаст вам блок JSON. Скопируйте его.

### 2. Деплой в Cloudflare
Отправьте воркер в свое облако:

```bash
npx wrangler deploy
```

### 3. Добавление секрета
Привяжите ваш токен к запущенному воркеру:

```bash
npx wrangler secret put GCP_SERVICE_ACCOUNT
```
*Вставьте скопированный JSON из первого шага.*

---

## 🛠️ Использование

Впишите эти данные в вашу фронтэнд клиент:
**Base URL:** `https://antigravity-proxy.<ваш-субдомен>.workers.dev/v1`  
**API Key:** `dummy-key` *(Можно писать что угодно, авторизацию берет на себя прокси)*  

Прокси автоматически загрузит список актуальных моделей с их красивыми названиями (например, `Gemini 3.5 Flash (Medium)`, `Claude Opus 4.6 (Thinking)`). Выбирайте любую и наслаждайтесь!

---
*Отказ от ответственности: Это неофициальный инструмент, созданный для образовательных и исследовательских целей. Используйте на свой страх и риск. Он использует недокументированные API. Google может в любое время без предупреждения изменить секрет клиента или структуру API. Рассмотрите использование выкидных аккаунтов.*