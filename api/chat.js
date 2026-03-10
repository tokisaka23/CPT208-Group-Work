// 与AI对话，模型: Llama3.1 8b
const API_KEY = process.env.CEREBRAS_API_KEY;

export default async function handler(req) {
  // 1. 只处理 POST 请求
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { message, gpsLocation } = body;

    // 2. 简化系统指令（移除所有 poi 依赖）
    const systemPrompt = `你是一个苏州平江路旅游助手。用户当前坐标: ${gpsLocation || '未知'}。请提供景点导览和解说。保持回答简洁友好，富有文化底蕴，字数150字以内。`;

    // 3. 直接调用 AI
    const aiResponse = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3.1-8b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message || "你好" }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`API error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    return new Response(JSON.stringify({
      success: true,
      response: data.choices[0].message.content,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // 4. 增强错误处理（关键！）
    console.error("Backend error:", error.message);
    return new Response(JSON.stringify({
      success: false,
      error: `AI服务暂时不可用: ${error.message.substring(0, 50)}`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}