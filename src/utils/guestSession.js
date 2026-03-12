let guestSession = null;

export function createGuestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `guest_${crypto.randomUUID()}`;
  }

  return `guest_${Date.now()}`;
}

export function getGuestSession() {
  return guestSession;
}

export function saveGuestSession(session) {
  guestSession = session;
  return guestSession;
}

export function clearGuestSession() {
  guestSession = null;
}

export function ensureGuestSession() {
  if (guestSession) {
    return guestSession;
  }

  return saveGuestSession({
    id: createGuestId(),
    mode: 'guest',
    createdAt: new Date().toISOString(),
  });
}
