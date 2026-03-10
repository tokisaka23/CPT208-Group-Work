// api/chat.js - 兼容本地+Vercel
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// 👇 智能环境变量加载（仅本地需要）
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config({ path: '../.env.local' });
    console.log('✅ 本地环境变量加载成功');
  } catch (e) {
    console.log('ℹ️ 未找到 .env.local（Vercel 环境无需）');
  }
}

// 👇 安全 polyfill（仅当全局不存在时注入）
if (!globalThis.fetch) {
  const fetch = require('node-fetch');
  globalThis.fetch = fetch;
  console.log('🔧 注入 fetch polyfill');
}

if (!globalThis.AbortController) {
  const { AbortController } = require('abort-controller');
  globalThis.AbortController = AbortController;
  console.log('🔧 注入 AbortController polyfill');
}

// 👇 保留配置
const API_ENDPOINT = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const MODEL = 'qwen-max';

export default async function handler(req, res) {
  // CORS 必须放最顶
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.QWEN_API_KEY;
  if (!API_KEY) return res.status(500).json({ success: false, error: 'Missing QWEN_API_KEY' });
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method Not Allowed' });

  try {
    // 安全解析请求体
    let bodyData;
    if (typeof req.body === 'string') {
      bodyData = JSON.parse(req.body);
    } else if (req.body) {
      bodyData = req.body;
    } else {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      bodyData = JSON.parse(Buffer.concat(chunks).toString());
    }

    const { message, gpsLocation } = bodyData;
    if (!message) return res.status(400).json({ success: false, error: 'Message required' });

    // 👇 优化 prompt（简洁有效）
    const systemPrompt = `你是苏州本地资深向导，精通吴文化。用户位置: ${gpsLocation || '未知'}。用亲切口语化中文回复，带1个历史细节或实用提示。`;

    // 30秒超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    console.log(`[API] 调用 ${MODEL} at ${new Date().toISOString()}`);
    console.log(`[User] ${message}`);

    // 👇 关键2：官方最新API格式（2024年3月验证）
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        input: {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ]
        },
        parameters: {
          result_format: 'message'
        }
      }),
      signal: controller.signal
    }).catch(err => {
      clearTimeout(timeoutId);
      throw new Error(err.name === 'AbortError' 
        ? '请求超时(30s)' 
        : `网络错误: ${err.message}`);
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.message || JSON.stringify(errorData);
      } catch (e) {
        errorDetail = response.statusText;
      }
      
      console.error(`[Qwen Error ${response.status}]`, errorDetail);
      
      return res.status(200).json({
        success: true,
        response: `⚠️ 服务繁忙(${response.status})。试试问：'平江路美食' 或 '拙政园历史'`,
        model: MODEL,
        timestamp: new Date().toISOString()
      });
    }

    // 👇 关键3：正确解析官方响应
    const data = await response.json();
    const content = data.output?.choices?.[0]?.message?.content?.trim() || '（无回复内容）';

    console.log(`[Response] ${content.substring(0, 100)}...`);
    
    res.status(200).json({
      success: true,
      response: content,
      model: MODEL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Handler Error]', error);
    res.status(200).json({
      success: true,
      response: `⚠️ ${error.message}。本地推荐：平江路坐手摇船，双塔吃糯米饭团，下午逛苏州博物馆。`,
      timestamp: new Date().toISOString()
    });
  }
}