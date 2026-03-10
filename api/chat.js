// Simple AI chat relay with model fallbacks (Cerebras)
import 'dotenv/config';

const MODELS = ['llama3.1-8b', 'gpt-oss-120b'];

export default async function handler(req, res) {
  const API_KEY = process.env.CEREBRAS_API_KEY;

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }

  try {
    let rawBody = '';
    if (req.body) {
      rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    } else {
      for await (const chunk of req) rawBody += chunk.toString();
    }

    const { message, gpsLocation } = JSON.parse(rawBody || '{}');

    if (!message) {
      res.status(400).json({ success: false, error: 'Message is required' });
      return;
    }
    if (!API_KEY) {
      res.status(500).json({ success: false, error: 'Missing CEREBRAS_API_KEY' });
      return;
    }

    const systemPrompt =
      `你是一个友好的苏州旅行向导。 User location: ${gpsLocation || 'unknown'}. ` +
      `给出有好的，富有文化底蕴的建议，小于100个字符`;

    const errors = [];

    for (const model of MODELS) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15_000);

      const aiResponse = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 300
        }),
        signal: controller.signal
      }).catch(err => ({ ok: false, statusText: err.message, _abort: err.name === 'AbortError' }));

      clearTimeout(timeoutId);

      if (aiResponse && aiResponse.ok) {
        const data = await aiResponse.json();
        res.status(200).json({
          success: true,
          model,
          response: data.choices?.[0]?.message?.content || 'No content returned',
          timestamp: new Date().toISOString()
        });
        return;
      }

      let body = {};
      if (aiResponse && aiResponse.json) {
        body = await aiResponse.json().catch(() => ({}));
      }
      errors.push({ model, status: aiResponse?.status, detail: body.error?.message || aiResponse?.statusText });

      if (aiResponse?.status === 401) {
        res.status(200).json({
          success: true,
          response: '鉴权失败 (401)：请确认 CEREBRAS_API_KEY 是否有效或是否有对应模型权限。',
          errors
        });
        return;
      }

      if (aiResponse?.status === 403) {
        res.status(200).json({
          success: true,
          response: '额度/权限受限 (403)：可能免费额度用完或该模型未开通，尝试更换密钥或改用其他提供商。',
          errors
        });
        return;
      }
    }

    // All models failed
    res.status(200).json({
      success: true,
      response: '抱歉，当前所有模型均不可用，我先给你本地推荐：拙政园、留园、苏州博物馆排一天，午饭去松鹤楼试试。',
      errors
    });
  } catch (error) {
    console.error('Backend error:', error);

    if (error.name === 'AbortError') {
      res.status(504).json({ success: false, error: 'Upstream request timed out (15s). Please try again.' });
      return;
    }

    res.status(500).json({ success: false, error: `AI service unavailable: ${error.message?.substring(0, 120) || 'unknown'}` });
  }
}
