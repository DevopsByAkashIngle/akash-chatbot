# 🤖 My Chatbot — by Akash
> Powered by Claude (Anthropic) · Full-featured AI chatbot

## Features
- 💬 General-purpose AI chat (Claude Sonnet)
- 🔍 Real-time web search
- 🎨 Image generation (SVG art)
- 📎 Image & PDF upload + analysis
- 🎤 Voice input & 🔊 voice output
- 🌐 Multi-language responses (10 languages)
- 👤 User profile & memory
- 🗂️ Multiple chat sessions
- ⭐ Star/pin important messages
- 🌙 Dark / light mode
- 💾 Auto-save chat history
- 📥 Export chat

---

## Project Structure

```
akash-chatbot/
├── api/
│   └── chat.js          ← Vercel serverless function (API proxy)
├── public/
│   └── index.html       ← Your chatbot frontend
├── server.js            ← Express server (local dev / Render hosting)
├── package.json
├── vercel.json          ← Vercel deployment config
├── .env.example         ← Copy to .env and add your key
└── .gitignore
```

---

## 🚀 DEPLOY IN 5 STEPS (Vercel — Free)

### Step 1 — Get your Anthropic API Key
1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)
5. Set a monthly budget under **Billing → Usage Limits** (recommended: $10)

---

### Step 2 — Put this project on GitHub

> ⚠️ **CRITICAL — The #1 mistake people make:** When you unzip the file, you get a folder called
> `akash-chatbot/`. The FILES inside that folder (`api/`, `public/`, `vercel.json`, etc.)
> must be at the ROOT of your GitHub repo — NOT inside a subfolder.
>
> ✅ Correct repo root:
> ```
> api/
> public/
> vercel.json
> package.json
> server.js
> README.md
> ```
> ❌ Wrong (will cause NOT_FOUND):
> ```
> akash-chatbot/       ← extra folder layer
>   api/
>   public/
>   vercel.json
> ```

**Option A — Upload via GitHub website (easiest, no Terminal needed):**
1. Go to https://github.com and sign up (free)
2. Click **+** → **New repository** → name it `akash-chatbot` → **Create repository**
3. On the next screen click **uploading an existing file**
4. Open the unzipped `akash-chatbot/` folder on your computer
5. Select ALL files and folders INSIDE it (Ctrl+A / Cmd+A) and drag them into the GitHub upload box
6. Scroll down → click **Commit changes**

**Option B — Terminal (if comfortable):**
```bash
cd akash-chatbot           # go INTO the folder first
git init
git add .
git commit -m "Initial commit — My Chatbot by Akash"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/akash-chatbot.git
git push -u origin main
```
> Replace `YOUR_USERNAME` with your GitHub username

After pushing, verify your repo looks like Option A's ✅ structure above before continuing.

---

### Step 3 — Deploy to Vercel
1. Go to https://vercel.com and sign up with GitHub
2. Click **Add New → Project**
3. Find your `akash-chatbot` repo and click **Import**
4. Leave all settings as default
5. Click **Deploy** → wait ~1 minute

---

### Step 4 — Add your API key to Vercel
1. In your Vercel project, go to **Settings → Environment Variables**
2. Click **Add New**
   - Name: `ANTHROPIC_API_KEY`
   - Value: paste your key (`sk-ant-...`)
3. Click **Save**
4. Go to **Deployments** → click the 3-dot menu on latest → **Redeploy**

---

### Step 5 — Your chatbot is live! 🎉
Vercel gives you a URL like:
```
https://akash-chatbot.vercel.app
```
Share this with anyone. It works on phone, tablet, and desktop.

---

## 🌐 Custom Domain (Optional — ~$10/year)

1. Buy a domain at https://namecheap.com (e.g. `akashbot.in`)
2. In Vercel → **Settings → Domains** → Add your domain
3. Follow the DNS instructions Vercel shows you
4. Done — your bot is now at `https://akashbot.in` 🚀

---

## 💻 Run Locally (for testing)

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env
# Open .env and paste your ANTHROPIC_API_KEY

# 3. Start the server
node server.js

# 4. Open in browser
# http://localhost:3000
```

---

## 💰 Cost Estimate

| Usage | Estimated Monthly Cost |
|-------|----------------------|
| 100 conversations | ~$0.50 |
| 500 conversations | ~$2–3 |
| 2000 conversations | ~$8–12 |

> Set a budget cap at https://console.anthropic.com → Billing

---

## 🔒 Security Notes
- Your API key is stored as an **environment variable** on the server — never in the browser
- Rate limiting is enabled: max 30 requests per IP per 10 minutes
- `.env` is in `.gitignore` — it will never be pushed to GitHub

---

## 🛠 Other Hosting Options

### Render.com (free tier)
1. Go to https://render.com → New → Web Service
2. Connect GitHub repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add `ANTHROPIC_API_KEY` under Environment

### Railway.app
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add environment variable `ANTHROPIC_API_KEY`

---

Built with ❤️ by Akash
