import { listFriends } from './supabase-friends.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const friends = await listFriends(req);
    return res.status(200).json({ success: true, friends });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}
