# Antigravity EARTHMOVER Proxy 🚀

*[🇷🇺 Читать на русском ниже](#русская-версия)*

> *"We came, we saw, we conquered - the triumph of the will"*

💖 **Support the author:** [Boosty](https://boosty.to/redbaron1914)

This is the ultimate, **100% serverless** Cloudflare Worker proxy that exposes an OpenAI-compatible API backed by the internal Antigravity Cloud Code endpoint. 

Unlike other community proxies that require you to keep the heavy Antigravity desktop app running in the background to scrape SQLite databases, this proxy is **completely autonomous**. It handles its own OAuth token refreshes, dynamic model discovery, and payload manipulation directly in the cloud.

## Features
- ☁️ **100% Serverless:** Deploy to Cloudflare Workers and close your terminal. No background daemons required.
- 🎭 **Perfect Mimicry:** Bypasses Google's 500/403 API errors by perfectly replicating the internal Go daemon's HTTP payload (including `ThinkingConfig`, `model_enum` placeholders, and telemetry labels).
- 🔄 **Autonomous Auth:** Automatically exchanges and refreshes tokens using the official Antigravity Client ID & Secret.
- 🛡️ **Abuse Protection:** Strips out Clearcut telemetry tracking while maintaining a valid request structure.
- 📡 **Dynamic Routing:** Automatically discovers and routes models directly from Google's `fetchAvailableModels` internal dictionary.
- 🔌 **IDE Ready:** Drop-in replacement for OpenAI API in Zed, Cursor, or any other frontend.
- 👁️ **Full Multimodality:** Send Images, Audio, Video, and PDFs seamlessly. Bypasses internal restrictions using intelligent tool-call masking.
- 🎨 **Image Generation (Nanobanano):** Built-in support for generating images via the standard SD WebUI API (`/sdapi/v1/txt2img`). Compatible with SillyTavern out-of-the-box.

---

## ⚡ Quick Start (For Beginners)

Even if you have never opened a terminal before, just follow these simple steps!

### Step 0: Prerequisites
1. Download and install [Node.js](https://nodejs.org/) (LTS version).
2. Create a free account on [Cloudflare](https://dash.cloudflare.com/sign-up).
3. Download this repository (Click the green `Code` button -> `Download ZIP`) and extract it to a folder.
4. Open your computer's Terminal (Command Prompt / PowerShell on Windows, Terminal on Mac) and navigate to that folder:
   ```bash
   cd path/to/extracted/folder
   ```

### Step 1: Install Dependencies & Login
Install the required tools and link your Cloudflare account to your terminal:
```bash
npm install
npx wrangler login
```
*(A browser window will open asking you to authorize Cloudflare. Click "Allow".)*

### Step 2: Get Your Google Token
You do not need to install the official Antigravity client. We have included an automated script that mimics the OAuth flow.
```bash
node scripts/login.js
```
Follow the instructions in the terminal. The script will output a massive JSON block at the end. Copy this entire JSON block.

### Step 3: Deploy the Proxy
Upload the code to your Cloudflare account:
```bash
npx wrangler deploy
```

### Step 4: Inject the Secret
Bind your Google OAuth token to the deployed worker securely:
```bash
npx wrangler secret put GCP_SERVICE_ACCOUNT
```
*Paste the JSON block you copied from Step 2 when prompted and hit Enter.*

*(Optional)* If you have a specific Google Cloud project with the Cloud AI Companion API enabled and you are ready to pay for billing, you can bypass the default free-tier shadow project by setting your own:
```bash
npx wrangler secret put GEMINI_PROJECT_ID
```

---

## 🛠️ Usage in any frontend
Configure your IDE (like Zed or Cursor) or chat UI to point to your new Cloudflare Worker URL.

**Base URL:** `https://antigravity-earthmover-worker.<your-subdomain>.workers.dev/v1`  
*(You can find your exact URL in the terminal output after running `npx wrangler deploy`)*

**API Key:** `dummy-key` *(Can be anything, the worker handles actual auth)*  

The proxy will dynamically populate your model dropdown with the actual display names (e.g., `Gemini 3.5 Flash (Medium)`, `Claude Opus 4.6 (Thinking)`). Select one and start coding!

---

## 🎨 Image Generation (SD WebUI API)

EARTHMOVER includes built-in support for image generation using Google's Gemini 3.1 Flash Image model via a standard SD WebUI compatible endpoint.

To use this in clients like **SillyTavern**:
1. Go to the Image Generation extension settings.
2. Select **Stable Diffusion WebUI** as the provider.
3. Set the API URL to: `https://antigravity-earthmover-worker.<your-subdomain>.workers.dev` (Do **not** add `/v1` at the end).
4. Generate images using standard prompts! (Under the hood, it uses the nanobanano approach to seamlessly route requests to Gemini).

---

## 🔁 Multi-Account Round-Robin (Bypass Quotas)
Google aggressively limits Claude Opus and Gemini Pro usage (often applying 150+ hour quota bans on free-tier accounts). EARTHMOVER supports a **Multi-Account Hot-Swap Pool** using Cloudflare KV. If an account runs out of quota, the proxy instantly marks it exhausted and retries the exact same request with the next available account.

1. **Create a KV Database:**
   ```bash
   npx wrangler kv:namespace create ACCOUNTS_KV
   ```
2. **Bind it in `wrangler.toml`:**
   Open the `wrangler.toml` file in a text editor. Look at the bottom of the file. Replace `YOUR_ACCOUNTS_KV_ID_HERE` with the `id` you got from Step 1.
3. **Add Accounts to the Pool:**
   We've included an automated script that handles OAuth and injects the credentials directly into your KV database. Run this script for each burner account you want to add:
   ```bash
   node scripts/add-account.js
   ```
   Follow the prompts to authorize and name your account.
4. **Deploy:** 
   ```bash
   npx wrangler deploy
   ```
   The proxy will now intelligently balance requests across all loaded accounts!

---

*Disclaimer: This is an unofficial tool created for educational and research purposes. Use at your own risk. It relies on undocumented APIs. Google may rotate the client secret or change the API structure at any time without warning. Consider burner accounts.*

---
---

<a name="русская-версия"></a>
# Antigravity EARTHMOVER Прокси 🚀

> *"Пришли, увидели, победили - триумф воли"*

💖 **Поддержать автора:** [Boosty](https://boosty.to/redbaron1914)

Это ультимативный, **на 100% бессерверный** Cloudflare Worker прокси, который предоставляет OpenAI-совместимый API, работающий поверх скрытого внутреннего эндпоинта Antigravity Cloud Code.

В отличие от других решений, которые заставляют вас держать тяжелое десктопное приложение Antigravity запущенным на фоне (чтобы воровать токены из SQLite), этот прокси **полностью автономен**. Он сам обновляет OAuth токены, сам скачивает словари моделей и сам формирует криптографически выверенные запросы прямо в облаке.

## Особенности
- ☁️ **Никаких серверов:** Задеплойте в Cloudflare и закройте терминал.
- 🎭 **Идеальная маскировка:** Обходит ошибки 500/403 от Google, полностью копируя структуру HTTP-пакетов официального Go-демона.
- 🔄 **Автономная авторизация:** Самостоятельно обновляет токены через официальные Client ID и Secret от Antigravity.
- 🛡️ **Защита от банов:** Полностью вырезает телеметрию (Clearcut), маскируясь под клиента, отказавшегося от слежки.
- 📡 **Динамический роутинг:** Автоматически скачивает свежий список моделей напрямую с серверов Google и на лету подменяет их на нужные M-коды.
- 🔌 **Готов к работе:** Идеально работает в Zed, Cursor и любых других фронтэндах.
- 👁️ **Полная мультимодальность:** Отправляйте картинки, аудио, видео и PDF. Умно обходит внутренние ограничения API с помощью маскировки под вызовы инструментов.
- 🎨 **Генерация картинок (Nanobanano):** Встроенная поддержка генерации изображений через стандартный SD WebUI API (`/sdapi/v1/txt2img`). Идеально работает с SillyTavern из коробки.

---

## ⚡ Быстрый старт (Для новичков)

Даже если вы никогда в жизни не открывали консоль, просто следуйте этим шагам!

### Шаг 0: Подготовка
1. Скачайте и установите [Node.js](https://nodejs.org/) (версию LTS).
2. Создайте бесплатный аккаунт на [Cloudflare](https://dash.cloudflare.com/sign-up).
3. Скачайте этот код (Нажмите зеленую кнопку `Code` -> `Download ZIP`) и распакуйте папку.
4. Откройте терминал (Командная строка / PowerShell на Windows) и перейдите в эту папку:
   ```bash
   cd путь/до/распакованной/папки
   ```

### Шаг 1: Установка и Логин
Установите нужные библиотеки и свяжите терминал с вашим аккаунтом Cloudflare:
```bash
npm install
npx wrangler login
```
*(Откроется окно браузера. Нажмите "Allow" (Разрешить), чтобы авторизовать Cloudflare).*

### Шаг 2: Получение токена Google
Вам не нужно скачивать оригинальный клиент Antigravity. Мы написали скрипт, который сделает всё за вас:
```bash
node scripts/login.js
```
Следуйте инструкциям в консоли. Скрипт выдаст вам огромный блок JSON. Скопируйте его целиком.

### Шаг 3: Деплой в Cloudflare
Отправьте код прокси в свое облако:
```bash
npx wrangler deploy
```

### Шаг 4: Добавление секрета
Привяжите ваш токен Google к запущенному воркеру, чтобы он мог безопасно авторизовываться:
```bash
npx wrangler secret put GCP_SERVICE_ACCOUNT
```
*Вставьте скопированный JSON из Шага 2, когда консоль попросит об этом, и нажмите Enter.*

---

## 🛠️ Использование

Впишите эти данные в ваш фронтэнд клиент (например, Zed или Cursor):

**Base URL:** `https://antigravity-earthmover-worker.<ваш-субдомен>.workers.dev/v1`  
*(Свой точный адрес вы увидите в консоли после выполнения Шага 3)*

**API Key:** `dummy-key` *(Можно писать что угодно, авторизацию берет на себя прокси)*  

Прокси автоматически загрузит список актуальных моделей с их красивыми названиями (например, `Gemini 3.5 Flash (Medium)`, `Claude Opus 4.6 (Thinking)`). Выбирайте любую и наслаждайтесь!

---

## 🎨 Генерация изображений (SD WebUI API)

В EARTHMOVER встроена поддержка генерации картинок через модель Gemini 3.1 Flash Image с использованием стандартного SD WebUI эндпоинта.

Чтобы подключить это в клиентах вроде **SillyTavern**:
1. Откройте настройки расширения Image Generation.
2. Выберите провайдером **Stable Diffusion WebUI**.
3. Укажите API URL: `https://antigravity-earthmover-worker.<ваш-субдомен>.workers.dev` (Строго **без** `/v1` на конце).
4. Генерируйте картинки как обычно! (Под капотом используется подход nanobanano для прозрачного роутинга запросов в Gemini).

---

## 🔁 Мульти-Аккаунты и Балансировка (Обход Квот)
Google жестко ограничивает использование Claude Opus и Gemini Pro (часто выдавая баны на 150+ часов для бесплатных аккаунтов). EARTHMOVER поддерживает **Пул Аккаунтов с Горячей Заменой** через Cloudflare KV. Если на одном из аккаунтов заканчивается квота, прокси моментально помечает его как "выжатый" и повторяет тот же самый запрос со следующего доступного аккаунта.

1. **Создайте базу KV:**
   ```bash
   npx wrangler kv namespace create ACCOUNTS_KV
   ```
2. **Привяжите её в `wrangler.toml`:**
   Откройте файл `wrangler.toml` в любом текстовом редакторе. Найдите в самом низу строку `id = "YOUR_ACCOUNTS_KV_ID_HERE"` и замените этот текст на `id`, который вам выдала команда на 1 шаге.
3. **Добавьте аккаунты в пул:**
   Мы написали автоматический скрипт, который сам проведет вас через авторизацию и загрузит ключи напрямую в базу KV. Запустите его для каждого "выкидного" аккаунта, который хотите добавить:
   ```bash
   node scripts/add-account.js
   ```
   Следуйте инструкциям в терминале, чтобы авторизоваться и задать имя аккаунту.
4. **Задеплойте:** 
   ```bash
   npx wrangler deploy
   ```
   Теперь прокси будет умно балансировать ваши запросы между всеми загруженными аккаунтами!

---
*Отказ от ответственности: Это неофициальный инструмент, созданный для образовательных и исследовательских целей. Используйте на свой страх и риск. Он использует недокументированные API. Google может в любое время без предупреждения изменить секрет клиента или структуру API. Рассмотрите использование выкидных аккаунтов.*
