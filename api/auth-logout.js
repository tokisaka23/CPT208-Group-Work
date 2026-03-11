import { deleteDatabaseSession } from './auth-db.mjs';

function readToken(req) {
  const authorization = req.headers?.authorization || '';

  if (authorization.startsWith('Bearer ')) {
    return authorization.slice(7).trim();
  }

  return '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    await deleteDatabaseSession(readToken(req));
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}
