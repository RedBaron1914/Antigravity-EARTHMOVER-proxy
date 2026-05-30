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

**Base URL:** `https://antigravity-earthmover-worker/.<your-subdomain>.workers.dev/v1`  
**API Key:** `dummy-key` *(Can be anything, the worker handles actual auth)*  

The proxy will dynamically populate your model dropdown with the actual display names (e.g., `Gemini 3.5 Flash (Medium)`, `Claude Opus 4.6 (Thinking)`). Select one and start coding!

---

## 🔁 Multi-Account Round-Robin (Bypass Quotas)
Google aggressively limits Claude Opus and Gemini Pro usage (often applying 150+ hour quota bans on free-tier accounts). EARTHMOVER supports a **Multi-Account Hot-Swap Pool** using Cloudflare KV. If an account runs out of quota, the proxy instantly marks it exhausted and retries the exact same request with the next available account.

1. **Create a KV Namespace:**
   ```bash
   npx wrangler kv:namespace create ACCOUNTS_KV
   ```
2. **Bind it in `wrangler.toml`:**
   Uncomment the `[[kv_namespaces]]` block at the bottom of your `wrangler.toml` and paste the `id` you got from Step 1.
3. **Add Accounts to the Pool:**
   Run `node scripts/login.js` multiple times with different burner Google accounts.
   For each JSON block you receive, add it to the KV database using a unique key (e.g., `acc_1`, `acc_2`):
   ```bash
   npx wrangler kv:key put --binding=ACCOUNTS_KV "acc_1" '{"access_token":"...","refresh_token":"..."}'
   ```
4. **Deploy:** `npx wrangler deploy`. The proxy will now intelligently balance requests across all loaded accounts!

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
**Base URL:** `https://antigravity-earthmover-worker/.<your-subdomain>.workers.dev/v1` 
**API Key:** `dummy-key` *(Можно писать что угодно, авторизацию берет на себя прокси)*  

Прокси автоматически загрузит список актуальных моделей с их красивыми названиями (например, `Gemini 3.5 Flash (Medium)`, `Claude Opus 4.6 (Thinking)`). Выбирайте любую и наслаждайтесь!

---

## 🔁 Мульти-Аккаунты и Балансировка (Обход Квот)
Google жестко ограничивает использование Claude Opus и Gemini Pro (часто выдавая баны на 150+ часов для бесплатных аккаунтов). EARTHMOVER поддерживает **Пул Аккаунтов с Горячей Заменой** через Cloudflare KV. Если на одном из аккаунтов заканчивается квота, прокси моментально помечает его как "выжатый" и повторяет тот же самый запрос со следующего доступного аккаунта.

1. **Создайте базу KV:**
   ```bash
   npx wrangler kv:namespace create ACCOUNTS_KV
   ```
2. **Привяжите её в `wrangler.toml`:**
   Раскомментируйте блок `[[kv_namespaces]]` в самом низу вашего файла `wrangler.toml` и вставьте туда `id`, который вы получили на 1 шаге.
3. **Добавьте аккаунты в пул:**
   Запустите `node scripts/login.js` несколько раз с разными "выкидными" Google-аккаунтами.
   Каждый полученный JSON-блок добавьте в базу KV под уникальным ключом (например, `acc_1`, `acc_2`):
   ```bash
   npx wrangler kv:key put --binding=ACCOUNTS_KV "acc_1" '{"access_token":"...","refresh_token":"..."}'
   ```
4. **Задеплойте:** `npx wrangler deploy`. Теперь прокси будет умно балансировать ваши запросы между всеми загруженными аккаунтами!

---
*Отказ от ответственности: Это неофициальный инструмент, созданный для образовательных и исследовательских целей. Используйте на свой страх и риск. Он использует недокументированные API. Google может в любое время без предупреждения изменить секрет клиента или структуру API. Рассмотрите использование выкидных аккаунтов.*
