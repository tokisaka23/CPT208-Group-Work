import { registerUsernameUser } from './supabase-username-auth.mjs';

function readUsername(body) {
  return body.username || body.userId || body.account || '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { session } = await registerUsernameUser({
      username: readUsername(body),
      password: body.password,
    });

    return res.status(200).json({ success: true, session });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}
