// server.js — Local development server (Node 20+)
// Run: node server.js

import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

// ── Middleware ──────────────────────────────────────────────
app.use(express.json({ limit: '20mb' }));

// ── Rate limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please wait a few minutes.' }
});
app.use('/api/', limiter);

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    node: process.version,
    hasApiKey: !!process.env.GEMINI_API_KEY,
    api: 'Google Gemini (Free)',
    time: new Date().toISOString()
  });
});

// ── Chat proxy ──────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  console.log('\n[chat] Received request');
  console.log('[chat] API key present:', !!apiKey);

  if (!apiKey) {
    console.error('[chat] ERROR: GEMINI_API_KEY not in .env');
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set in .env file.' });
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Empty request body' });
  }

  const { messages = [], systemPrompt = '', language = 'English', userProfile = {} } = req.body;

  // Build system instruction
  const langNote = language !== 'English' ? ` Always respond in ${language}.` : '';
  const profileNote = userProfile.name
    ? ` The user's name is ${userProfile.name}.${userProfile.prefs ? ' User preferences: ' + userProfile.prefs : ''}`
    : '';
  const system = systemPrompt ||
    `You are a helpful, friendly, and knowledgeable general-purpose assistant built by Akash.${profileNote} Be conversational, clear, and warm. Use markdown formatting for code, lists, and structure when helpful.${langNote}`;

  // Convert to Gemini format
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: Array.isArray(m.content)
      ? m.content.map(part => {
          if (part.type === 'text') return { text: part.text };
          if (part.type === 'image') return {
            inlineData: { mimeType: part.source.media_type, data: part.source.data }
          };
          return { text: '' };
        })
      : [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
  }));

  console.log('[chat] Calling Gemini, messages:', contents.length);

  try {
    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { temperature: 0.9, maxOutputTokens: 2048 }
      })
    });

    console.log('[chat] Gemini status:', geminiRes.status);
    const text = await geminiRes.text();
    let data;
    try { data = JSON.parse(text); } catch (e) {
      console.error('[chat] Non-JSON:', text.slice(0, 300));
      return res.status(500).json({ error: 'Bad response from Gemini' });
    }

    if (data.error) {
      console.error('[chat] Gemini error:', JSON.stringify(data.error));
      return res.status(geminiRes.status).json({ error: data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, no response generated.';
    console.log('[chat] ✅ Success, reply length:', reply.length);

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('[chat] Fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to reach Gemini: ' + err.message });
  }
});

// ── Static files ────────────────────────────────────────────
app.use(express.static(join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅ My Chatbot by Akash is running! (Gemini Free API)`);
  console.log(`   Chat:   http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   API key: ${process.env.GEMINI_API_KEY ? '✅ loaded' : '❌ MISSING — check .env'}\n`);
});
