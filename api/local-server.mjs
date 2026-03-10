// api/local-server.mjs - Windows 兼容版
import http from 'http';
import url from 'url';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// 👇 关键1：获取项目根目录的绝对路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..'); // 项目根目录

// 👇 关键2：手动加载 .env.local（绕过 dotenv 路径问题）
const envPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...value] = line.trim().split('=');
    if (key && !key.startsWith('#')) {
      process.env[key.trim()] = value.join('=').replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();
    }
  });
  console.log(`✅ 手动加载环境变量: ${envPath}`);
} else {
  console.error(`❌ 环境文件不存在: ${envPath}`);
}

import handler from './chat.js';

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url);
  console.log(`[local-api] ${req.method} ${parsedUrl.pathname}`);

  if (parsedUrl.pathname === '/api/chat') {
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      res.end();
      return;
    }

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    req.body = Buffer.concat(chunks).toString();

    // 👇 关键3：完全兼容 Vercel 格式
    const vercelRes = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      writeHead(statusCode, headers) {
        this.statusCode = statusCode;
        Object.assign(this.headers, headers);
      },
      setHeader(name, value) {
        this.headers[name] = value;
      },
      end(data) {
        res.writeHead(this.statusCode, this.headers);
        res.end(data || '');
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.setHeader('Content-Type', 'application/json');
        this.end(JSON.stringify(data));
        return this;
      }
    };

    try {
      await handler(req, vercelRes);
    } catch (error) {
      console.error('Handler error:', error);
      vercelRes.status(500).json({ error: 'Internal Server Error' });
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ 本地API服务启动: http://localhost:${PORT}/api/chat`);
  console.log(`🔑 QWEN_API_KEY状态: ${process.env.QWEN_API_KEY ? '已加载✅' : '缺失❌'}`);
  console.log(`📂 项目根目录: ${rootDir}`);
});