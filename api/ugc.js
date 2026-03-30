import { getAuthenticatedUser } from './supabase.js';

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
    const trailer = bodyBuffer.slice(offset, offset + 2).toString('utf8');
    if (trailer === '--') {
      break;
    }

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

    const dataEnd = bodyBuffer.slice(nextBoundaryIndex - 2, nextBoundaryIndex).equals(crlfBuf)
      ? nextBoundaryIndex - 2
      : nextBoundaryIndex;
    const data = bodyBuffer.slice(offset, dataEnd);

    parts.push({ headers, data });
    offset = nextBoundaryIndex;
  }

  return parts;
}

function decodeTextPart(part) {
  return Buffer.from(part?.data || '').toString('utf8').trim();
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

function sanitizeFilename(filename) {
  return String(filename || 'photo')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'photo';
}

function resolveFileExt(filename, mimeType) {
  const match = String(filename || '').match(/\.([a-zA-Z0-9]+)$/);
  if (match?.[1]) {
    return match[1].toLowerCase();
  }

  if (mimeType === 'image/png') {
    return 'png';
  }

  if (mimeType === 'image/webp') {
    return 'webp';
  }

  return 'jpg';
}

async function parseMultipartUpload(req) {
  const contentType = readHeader(req, 'content-type');

  if (!String(contentType).includes('multipart/form-data')) {
    const error = new Error('请使用 multipart/form-data 提交图片、标题和描述。');
    error.statusCode = 400;
    throw error;
  }

  const boundary = parseMultipartBoundary(contentType);
  if (!boundary) {
    const error = new Error('缺少 multipart boundary，无法解析上传数据。');
    error.statusCode = 400;
    throw error;
  }

  const rawBody = await readRawBody(req);
  const parts = parseMultipartBody(rawBody, boundary);

  const findPart = (fieldName) =>
    parts.find((part) => {
      const disposition = parseContentDisposition(part.headers['content-disposition']);
      return disposition.name === fieldName;
    });

  const imagePart = findPart('image');
  const title = decodeTextPart(findPart('title'));
  const description = decodeTextPart(findPart('description'));
  const latText = decodeTextPart(findPart('lat'));
  const lngText = decodeTextPart(findPart('lng'));

  if (!imagePart) {
    const error = new Error('请选择要上传的图片文件。');
    error.statusCode = 400;
    throw error;
  }

  if (!title) {
    const error = new Error('请填写照片标题。');
    error.statusCode = 400;
    throw error;
  }

  if (!description) {
    const error = new Error('请填写照片描述。');
    error.statusCode = 400;
    throw error;
  }

  const disposition = parseContentDisposition(imagePart.headers['content-disposition']);
  const mimeType = String(imagePart.headers['content-type'] || 'application/octet-stream').trim();

  if (!mimeType.startsWith('image/')) {
    const error = new Error(`仅支持图片上传，当前类型：${mimeType || '未知'}`);
    error.statusCode = 400;
    throw error;
  }

  const maxBytes = 4 * 1024 * 1024;
  if (imagePart.data.length > maxBytes) {
    const error = new Error('图片过大（超过 4MB），请压缩后再上传。');
    error.statusCode = 413;
    throw error;
  }

  return {
    imageBuffer: imagePart.data,
    filename: disposition.filename || '',
    mimeType,
    title,
    description,
    latText,
    lngText,
  };
}

function buildInsertPayload(userId, uploadInput, imageUrl) {
  const payload = {
    user_id: userId,
    name: uploadInput.title,
    description: uploadInput.description,
    image_url: imageUrl,
  };

  const lat = Number(uploadInput.latText);
  const lng = Number(uploadInput.lngText);

  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    payload.lat = lat;
    payload.lng = lng;
  }

  return payload;
}

async function handleCreateUgc(req, res) {
  try {
    const uploadInput = await parseMultipartUpload(req);
    const { user, adminClient } = await getAuthenticatedUser(req);

    const fileExt = resolveFileExt(uploadInput.filename, uploadInput.mimeType);
    const safeName = sanitizeFilename(uploadInput.filename);
    const filePath = `ugc/${Date.now()}-${safeName}.${fileExt}`;

    const { error: storageError } = await adminClient.storage.from('ugc-images').upload(filePath, uploadInput.imageBuffer, {
      contentType: uploadInput.mimeType,
      cacheControl: '3600',
      upsert: false,
    });

    if (storageError) {
      throw new Error(`图片上传到存储桶失败：${storageError.message}`);
    }

    const { data: publicUrlData } = adminClient.storage.from('ugc-images').getPublicUrl(filePath);
    const imageUrl = publicUrlData?.publicUrl || '';

    if (!imageUrl) {
      await adminClient.storage.from('ugc-images').remove([filePath]).catch(() => {});
      throw new Error('图片上传成功，但未能生成公开地址。');
    }

    const insertPayload = buildInsertPayload(user.id, uploadInput, imageUrl);
    const { data, error: insertError } = await adminClient
      .from('ugc_pois')
      .insert([insertPayload])
      .select('id, user_id, name, description, image_url, created_at')
      .single();

    if (insertError) {
      await adminClient.storage.from('ugc-images').remove([filePath]).catch(() => {});
      throw new Error(`写入数据库失败：${insertError.message}`);
    }

    buildJson(res, 200, {
      success: true,
      message: '上传成功，内容已写入数据库。',
      id: data.id,
      user_id: data.user_id,
      image_url: data.image_url,
      imageUrl: data.image_url,
      title: data.name,
      description: data.description,
      created_at: data.created_at,
    });
  } catch (error) {
    console.error('[ugc] 写入数据库失败', error);
    buildJson(res, error.statusCode || 500, {
      success: false,
      error: error.message || '上传失败，请稍后再试。',
    });
  }
}

async function handleListUgc(req, res) {
  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { data, error } = await adminClient
      .from('ugc_pois')
      .select('id, user_id, name, description, image_url, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`读取记录失败：${error.message}`);
    }

    buildJson(res, 200, {
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('[ugc] 查询记录失败', error);
    buildJson(res, error.statusCode || 500, {
      success: false,
      error: error.message || '读取记录失败，请稍后再试。',
    });
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await handleCreateUgc(req, res);
    return;
  }

  if (req.method === 'GET') {
    await handleListUgc(req, res);
    return;
  }

  buildJson(res, 405, {
    success: false,
    error: 'Method Not Allowed',
  });
}
