
export const config = {
  runtime: 'nodejs',
  regions: ['iad1'],
};

const ALLOWED_ORIGINS = ['https://contractai-e40.pages.dev'];
const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 8500;
const MAX_BODY_CHARS = 60000;

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ALLOWED_ORIGINS.includes(origin);

  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(allowed ? 204 : 403).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!allowed) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { system, messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 10) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  if (JSON.stringify({ system, messages }).length > MAX_BODY_CHARS) {
    return res.status(413).json({ error: 'Request too large' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        ...(system ? { system } : {}),
        messages,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Anthropic error', response.status, data);
      return res.status(502).json({ error: 'Document generation failed, please try again.' });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('Proxy error', err);
    return res.status(500).json({ error: 'Document generation failed, please try again.' });
  }
}
