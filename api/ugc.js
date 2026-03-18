// api/ugc.js
// 用户个人上传的 UGC（包含图片上传演示）

function buildJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

function readHeader(req, key) {
  return req.headers?.[key] || req.headers?.[key.toLowerCase()] || '';
}

function parseMultipartBoundary(contentType) {
  const match = String(contentType || '').match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match?.[1] || match?.[2] || '';
}

function parsePartHeaders(headerText) {
  const headers = {};
  String(headerText || '')
    .split('\r\n')
    .forEach((line) => {
      const [rawKey, ...rest] = line.split(':');
      const key = String(rawKey || '').trim().toLowerCase();
      const value = rest.join(':').trim();
      if (key) {
        headers[key] = value;
      }
    });

  return headers;
}

function parseContentDisposition(value) {
  const result = { name: '', filename: '' };
  const normalized = String(value || '');
  const nameMatch = normalized.match(/name="([^"]+)"/i);
  const fileMatch = normalized.match(/filename="([^"]+)"/i);
  result.name = nameMatch?.[1] || '';
  result.filename = fileMatch?.[1] || '';
  return result;
}

function parseMultipartBody(bodyBuffer, boundary) {
  const boundaryBuf = Buffer.from(`--${boundary}`);
  const delimiterBuf = Buffer.from('\r\n\r\n');
  const crlfBuf = Buffer.from('\r\n');

  const parts = [];
  let offset = 0;

  while (offset < bodyBuffer.length) {
    const boundaryIndex = bodyBuffer.indexOf(boundaryBuf, offset);
    if (boundaryIndex === -1) {
      break;
    }

    offset = boundaryIndex + boundaryBuf.length;

    // `--boundary--` 表示结束
    const trailer = bodyBuffer.slice(offset, offset + 2).toString('utf8');
    if (trailer === '--') {
      break;
    }

    // 跳过边界后的 CRLF
    if (bodyBuffer.slice(offset, offset + 2).equals(crlfBuf)) {
      offset += 2;
    }

    const headerEndIndex = bodyBuffer.indexOf(delimiterBuf, offset);
    if (headerEndIndex === -1) {
      break;
    }

    const headerText = bodyBuffer.slice(offset, headerEndIndex).toString('utf8');
    const headers = parsePartHeaders(headerText);
    offset = headerEndIndex + delimiterBuf.length;

    const nextBoundaryIndex = bodyBuffer.indexOf(boundaryBuf, offset);
    if (nextBoundaryIndex === -1) {
      break;
    }

    // part data 末尾一般会有一个 CRLF，需要剔除
    const dataEnd = bodyBuffer.slice(nextBoundaryIndex - 2, nextBoundaryIndex).equals(crlfBuf)
      ? nextBoundaryIndex - 2
      : nextBoundaryIndex;
    const data = bodyBuffer.slice(offset, dataEnd);

    parts.push({ headers, data });
    offset = nextBoundaryIndex;
  }

  return parts;
}

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) {
    return req.body;
  }

  if (typeof req.body === 'string') {
    return Buffer.from(req.body, 'utf8');
  }

  if (req.body && typeof req.body === 'object') {
    try {
      return Buffer.from(JSON.stringify(req.body), 'utf8');
    } catch {
      return Buffer.from('', 'utf8');
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const contentType = readHeader(req, 'content-type');

      // 支持 multipart/form-data 图片上传
      if (String(contentType).includes('multipart/form-data')) {
        const boundary = parseMultipartBoundary(contentType);

        if (!boundary) {
          buildJson(res, 400, { success: false, error: '缺少 multipart boundary，无法解析上传数据。' });
          return;
        }

        const rawBody = await readRawBody(req);
        const parts = parseMultipartBody(rawBody, boundary);

        const imagePart = parts.find((part) => {
          const disposition = parseContentDisposition(part.headers['content-disposition']);
          return disposition.name === 'image';
        });

        if (!imagePart) {
          buildJson(res, 400, { success: false, error: '未找到字段名为 image 的文件，请检查前端 FormData.append(\"image\", file)。' });
          return;
        }

        const disposition = parseContentDisposition(imagePart.headers['content-disposition']);
        const mimeType = String(imagePart.headers['content-type'] || 'application/octet-stream').trim();

        if (!mimeType.startsWith('image/')) {
          buildJson(res, 400, { success: false, error: `仅支持图片上传，当前类型：${mimeType || '未知'}` });
          return;
        }

        // 避免返回过大的 base64（演示用途）
        const maxBytes = 2 * 1024 * 1024;
        if (imagePart.data.length > maxBytes) {
          buildJson(res, 413, { success: false, error: '图片过大（超过 2MB），请压缩后再上传。' });
          return;
        }

        const dataUrl = `data:${mimeType};base64,${imagePart.data.toString('base64')}`;

        buildJson(res, 200, {
          success: true,
          message: '图片上传成功（演示：以 dataURL 形式返回）。',
          image_url: dataUrl, // 兼容前端字段
          filename: disposition.filename || '',
          size: imagePart.data.length,
        });
        return;
      }

      // 兼容旧版：如果不是 multipart，就继续返回原来的 mock 成功提示
      buildJson(res, 200, {
        success: true,
        message: 'UGC 景点已成功写入 Supabase 数据库（mock）。',
        action: '图片上传建议使用 multipart/form-data，并传 image 字段。',
      });
    } catch (error) {
      console.error('[ugc] 处理上传失败', error);
      buildJson(res, 500, { success: false, error: error.message || '上传失败，请稍后再试。' });
    }
    return;
  }

  buildJson(res, 200, {
    success: true,
    data: [
      {
        id: 'ugc_001',
        author_id: 'mock_user_123',
        name: '发现一家超赞的碧螺春奶茶',
        coordinates: { lat: 31.314, lng: 120.6295 },
        image_url: 'https://mock-storage.supabase.co/img1.jpg',
        is_public: false, // 对应默认不公开，可手动分享
      },
    ],
  });
}
