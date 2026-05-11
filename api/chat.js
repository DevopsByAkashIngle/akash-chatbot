// api/chat.js — Vercel Serverless Function
// Uses Google Gemini API — 100% FREE, no credit card needed

export default async function handler(req, res) {
  console.log('[chat] Request received:', req.method);

  // ── CORS ──────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── API Key ───────────────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('[chat] Gemini API key present:', !!apiKey);
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set in environment variables.' });
  }

  // ── Parse body ────────────────────────────────────────────
  let body = req.body;
  if (!body) return res.status(400).json({ error: 'Empty request body' });
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }

  // ── Convert chat history to Gemini format ─────────────────
  // Incoming: { messages: [{role, content}], systemPrompt, language, userProfile }
  const { messages = [], systemPrompt = '', language = 'English', userProfile = {} } = body;

  // Build system instruction
  const langNote = language !== 'English' ? ` Always respond in ${language}.` : '';
  const profileNote = userProfile.name
    ? ` The user's name is ${userProfile.name}.${userProfile.prefs ? ' User preferences: ' + userProfile.prefs : ''}`
    : '';
  const system = systemPrompt ||
    `You are a helpful, friendly, and knowledgeable general-purpose assistant built by Akash.${profileNote} Be conversational, clear, and warm. Use markdown formatting for code, lists, and structure when helpful.${langNote}`;

  // Convert messages array to Gemini's contents format
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

  console.log('[chat] Calling Gemini with', contents.length, 'messages');

  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

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
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2048
        }
      })
    });

    console.log('[chat] Gemini status:', geminiRes.status);
    const text = await geminiRes.text();

    let data;
    try { data = JSON.parse(text); } catch (e) {
      console.error('[chat] Non-JSON from Gemini:', text.slice(0, 300));
      return res.status(500).json({ error: 'Bad response from Gemini', raw: text.slice(0, 300) });
    }

    if (data.error) {
      console.error('[chat] Gemini error:', JSON.stringify(data.error));
      return res.status(geminiRes.status).json({ error: data.error.message || 'Gemini API error' });
    }

    // Extract reply text from Gemini response
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
    console.log('[chat] Success, reply length:', reply.length);

    // Return in a simple format the frontend expects
    return res.status(200).json({ reply });

  } catch (err) {
    console.error('[chat] Fetch failed:', err.message);
    return res.status(500).json({ error: 'Failed to reach Gemini API: ' + err.message });
  }
}
