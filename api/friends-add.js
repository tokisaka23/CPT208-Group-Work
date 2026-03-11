import { addFriendByCode } from './supabase-friends.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const result = await addFriendByCode(body, req);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}
