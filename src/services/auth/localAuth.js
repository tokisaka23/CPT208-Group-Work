const userStorageKey = 'cpt208_local_users';
const sessionStorageKey = 'cpt208_local_session';

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function readJson(key, fallbackValue) {
  const storage = getStorage();

  if (!storage) {
    return fallbackValue;
  }

  const rawValue = storage.getItem(key);

  if (!rawValue) {
    return fallbackValue;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return fallbackValue;
  }
}

function writeJson(key, value) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(key, JSON.stringify(value));
}

function createSession(payload) {
  const session = {
    ...payload,
    loggedInAt: new Date().toISOString(),
  };

  writeJson(sessionStorageKey, session);
  return session;
}

export function getCurrentLocalSession() {
  return readJson(sessionStorageKey, null);
}

export function logoutLocalUser() {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(sessionStorageKey);
}

export function registerLocalUser({ username, password }) {
  const normalizedUsername = username.trim();
  const users = readJson(userStorageKey, []);
  const existingUser = users.find((item) => item.username === normalizedUsername);

  if (existingUser) {
    throw new Error('这个用户名已经注册过了，请换一个用户名。');
  }

  const newUser = {
    id: `user_${Date.now()}`,
    username: normalizedUsername,
    loginId: normalizedUsername,
    password,
    createdAt: new Date().toISOString(),
  };

  writeJson(userStorageKey, [...users, newUser]);

  return createSession({
    mode: 'registered',
    user: {
      id: newUser.id,
      username: newUser.username,
      loginId: newUser.loginId,
    },
  });
}

export function loginLocalUser({ account, password }) {
  const normalizedAccount = account.trim();
  const users = readJson(userStorageKey, []);

  const matchedUser = users.find(
    (item) =>
      item.username === normalizedAccount ||
      item.loginId === normalizedAccount
  );

  if (!matchedUser) {
    throw new Error('没有找到这个账号，请先注册。');
  }

  if (matchedUser.password !== password) {
    throw new Error('密码不正确，请重新输入。');
  }

  return createSession({
    mode: 'registered',
    user: {
      id: matchedUser.id,
      username: matchedUser.username,
      loginId: matchedUser.loginId,
    },
  });
}

export function continueAsGuestUser() {
  return createSession({
    mode: 'guest',
    user: {
      id: `guest_${Date.now()}`,
      username: '游客',
      loginId: 'guest',
    },
  });
}
