import { getDatabaseSession } from './auth-db.mjs';

function readToken(req) {
  const authorization = req.headers?.authorization || '';

  if (authorization.startsWith('Bearer ')) {
    return authorization.slice(7).trim();
  }

  return '';
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const session = await getDatabaseSession(readToken(req));

    if (!session) {
      return res.status(401).json({ success: false, error: 'Session Not Found' });
    }

    return res.status(200).json({ success: true, session });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}
