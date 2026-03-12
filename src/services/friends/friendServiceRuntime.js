import { findUserByFriendCode, mockCurrentUser } from './friendMockData';
import { getSupabaseClient, isSupabaseConfigured } from '../supabase/clientRuntime';

const friendStorageKey = 'cpt208_mock_friends';
const currentProfileCacheKey = 'cpt208_current_profile_cache';

function wait(ms = 400) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function cloneFriend(friend) {
  return { ...friend };
}

export function notifyFriendDataChanged() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent('friends-updated'));
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function readStoredFriends() {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  try {
    const rawValue = storage.getItem(friendStorageKey);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function saveStoredFriends(friends) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(friendStorageKey, JSON.stringify(friends));
}

function readCachedCurrentProfile() {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  try {
    const rawValue = storage.getItem(currentProfileCacheKey);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);

    if (!parsedValue || typeof parsedValue !== 'object') {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
}

function saveCachedCurrentProfile(profile) {
  const storage = getStorage();

  if (!storage || !profile) {
    return;
  }

  storage.setItem(currentProfileCacheKey, JSON.stringify(profile));
}

function buildResolvedUsername(authUser, profile = null) {
  return (
    profile?.display_name ||
    authUser?.user_metadata?.display_name ||
    profile?.username ||
    authUser?.user_metadata?.username ||
    authUser?.email?.split('@')[0] ||
    '已登录用户'
  );
}

function sortFriends(list) {
  return [...list].sort((left, right) => {
    if (left.isOnline !== right.isOnline) {
      return Number(right.isOnline) - Number(left.isOnline);
    }

    return left.username.localeCompare(right.username, 'zh-CN');
  });
}

async function getAuthenticatedUser() {
  const supabase = getSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`获取当前登录用户失败：${error.message}`);
  }

  if (!user) {
    throw new Error('当前没有可用的登录会话，请重新登录后再试。');
  }

  return user;
}

async function getAccessToken() {
  const supabase = getSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`获取当前登录会话失败：${error.message}`);
  }

  if (!session?.access_token) {
    throw new Error('当前没有可用的登录会话，请重新登录后再试。');
  }

  return session.access_token;
}

async function requestFriendApi(path, payload = {}) {
  const accessToken = await getAccessToken();
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  let result = null;

  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch {
    result = null;
  }

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.error ||
      (rawText && rawText.length < 200 ? rawText : '') ||
      `请求好友接口失败，状态码：${response.status}`
    );
  }

  return result;
}

async function findProfileById(userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, username, display_name, friend_code')
    .eq('id', userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`读取当前用户资料失败：${error.message}`);
  }

  return data;
}

function buildFallbackProfile(authUser = null) {
  if (!authUser) {
    return { ...mockCurrentUser };
  }

  return {
    id: authUser.id,
    username: buildResolvedUsername(authUser),
    friendCode: '',
  };
}

export async function getCurrentUserProfile() {
  await wait(250);

  if (!isSupabaseConfigured()) {
    return readCachedCurrentProfile() || { ...mockCurrentUser };
  }

  try {
    const authUser = await getAuthenticatedUser();
    const profile = await findProfileById(authUser.id);

    const resolvedProfile = {
      id: authUser.id,
      username: buildResolvedUsername(authUser, profile),
      friendCode: profile?.friend_code || '',
    };

    saveCachedCurrentProfile(resolvedProfile);
    return resolvedProfile;
  } catch (error) {
    const cachedProfile = readCachedCurrentProfile();

    if (cachedProfile) {
      return cachedProfile;
    }

    throw error;
  }
}

export async function getFriendList() {
  await wait(400);

  if (!isSupabaseConfigured()) {
    return sortFriends(readStoredFriends()).map(cloneFriend);
  }

  const result = await requestFriendApi('/api/friends/list');
  return sortFriends((result.friends || []).map(cloneFriend));
}

export async function getPendingFriendRequests() {
  await wait(250);

  if (!isSupabaseConfigured()) {
    return [];
  }

  const result = await requestFriendApi('/api/friends/pending-list');
  return Array.isArray(result.requests) ? result.requests.map(cloneFriend) : [];
}

export async function sendFriendRequest({ targetFriendCode }) {
  const normalizedCode = targetFriendCode.trim().toUpperCase();

  if (!normalizedCode) {
    throw new Error('请输入对方的好友码');
  }

  await wait(500);

  if (!isSupabaseConfigured()) {
    const currentProfile = await getCurrentUserProfile().catch(() => buildFallbackProfile());

    if (normalizedCode === String(currentProfile.friendCode || '').toUpperCase()) {
      throw new Error('不能添加自己为好友');
    }

    const currentFriends = readStoredFriends();

    if (currentFriends.some((item) => item.friendCode.toUpperCase() === normalizedCode)) {
      throw new Error('该好友已经在列表中了');
    }

    const targetUser = findUserByFriendCode(normalizedCode);

    if (!targetUser) {
      throw new Error('没有找到该好友码对应的用户');
    }

    const nextFriends = sortFriends([{ ...targetUser }, ...currentFriends]);
    saveStoredFriends(nextFriends);

    return {
      success: true,
      message: `已将 ${targetUser.username} 加入好友列表。当前为前端原型，结果保存在本地浏览器。`,
      friend: cloneFriend(targetUser),
    };
  }

  const authUser = await getAuthenticatedUser();
  const currentProfile = await findProfileById(authUser.id);

  if (!currentProfile) {
    throw new Error('当前登录用户缺少 user_profiles 资料，请先检查数据库初始化。');
  }

  if (normalizedCode === String(currentProfile.friend_code || '').toUpperCase()) {
    throw new Error('不能添加自己为好友');
  }

  return requestFriendApi('/api/friends/add', { targetFriendCode: normalizedCode });
}

export async function respondToFriendRequest({ requestId, decision }) {
  await wait(250);

  if (!isSupabaseConfigured()) {
    throw new Error('当前为前端原型模式，暂不支持处理好友请求。');
  }

  const result = await requestFriendApi('/api/friends/respond', {
    requestId,
    decision,
  });

  if (decision === 'accepted') {
    notifyFriendDataChanged();
  }

  return result;
}

export async function getFriendLocation(friendId) {
  await wait(300);

  const targetFriend = readStoredFriends().find((item) => item.id === friendId);

  if (!targetFriend) {
    throw new Error('未找到该好友');
  }

  if (!targetFriend.isOnline) {
    throw new Error('好友当前不在线');
  }

  if (!targetFriend.isLocationSharingEnabled) {
    throw new Error('对方暂未开放位置共享');
  }

  if (typeof targetFriend.latitude !== 'number' || typeof targetFriend.longitude !== 'number') {
    throw new Error('暂时没有可展示的定位数据');
  }

  return cloneFriend(targetFriend);
}
