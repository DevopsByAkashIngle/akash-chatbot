export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    node: process.version,
    hasApiKey: !!process.env.GEMINI_API_KEY,
    api: 'Google Gemini (Free)',
    time: new Date().toISOString()
  });
}
