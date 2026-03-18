// api/chat.js - 纯净 ES Module 版
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // 1. 跨域防御
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    let bodyData = req.body;
    if (typeof req.body === 'string') {
      try { bodyData = JSON.parse(req.body); } catch(e) {}
    }

    const message = bodyData?.message || '你好';
    const gpsLocation = bodyData?.gpsLocation || '未知';

    const API_KEY = process.env.QWEN_API_KEY;
    if (!API_KEY) throw new Error('未检测到 QWEN_API_KEY 环境变量');

    const systemPrompt = `你是苏州本地资深向导，精通吴文化。用户位置: ${gpsLocation}。用亲切口语化中文回复，带1个历史细节或实用提示。字数控制在150字以内。`;

    console.log(`[User] ${message}`);

    // 2. 发射火力
    const aiResponse = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "qwen-turbo",
        input: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ]
        },
        parameters: { result_format: "message" }
      })
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.json().catch(() => ({}));
      throw new Error(err.message || `阿里云服务器拥堵，状态码: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const content = data.output?.choices?.[0]?.message?.content?.trim() || '未返回内容';

    console.log(`[Agent] ${content}`);
    return res.status(200).json({ success: true, response: content });

  } catch (error) {
    console.error('[Handler Error]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
