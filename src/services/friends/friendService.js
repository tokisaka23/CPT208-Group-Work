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

function buildFallbackProfile(authUser = null) {
  if (!authUser) {
    return { ...mockCurrentUser };
  }

  return {
    id: authUser.id,
    username:
      authUser.user_metadata?.username ||
      authUser.user_metadata?.display_name ||
      authUser.email?.split('@')[0] ||
      '已登录用户',
    friendCode: '',
  };
}

function sortFriends(list) {
  return [...list].sort((left, right) => {
    if (left.isOnline !== right.isOnline) {
      return Number(right.isOnline) - Number(left.isOnline);
    }

    return left.username.localeCompare(right.username, 'zh-CN');
  });
}

export async function getCurrentUserProfile() {
  await wait(250);

  if (!isSupabaseConfigured()) {
    return readCachedCurrentProfile() || { ...mockCurrentUser };
  }

  const supabase = getSupabaseClient();
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    const cachedProfile = readCachedCurrentProfile();

    if (cachedProfile) {
      return cachedProfile;
    }

    throw new Error(`获取当前登录用户失败：${authError.message}`);
  }

  if (!authUser) {
    const cachedProfile = readCachedCurrentProfile();
    return cachedProfile || { ...mockCurrentUser };
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, username, display_name, friend_code')
    .eq('id', authUser.id)
    .limit(1)
    .maybeSingle();

  if (profileError) {
    const cachedProfile = readCachedCurrentProfile();

    if (cachedProfile) {
      return cachedProfile;
    }

    throw new Error(`读取当前用户资料失败：${profileError.message}`);
  }

  const resolvedProfile = {
    id: authUser.id,
    username:
      profile?.username ||
      authUser.user_metadata?.username ||
      profile?.display_name ||
      authUser.user_metadata?.display_name ||
      authUser.email?.split('@')[0] ||
      '已登录用户',
    friendCode: profile?.friend_code || '',
  };

  saveCachedCurrentProfile(resolvedProfile);
  return resolvedProfile;
}

export async function getFriendList() {
  await wait(400);
  return sortFriends(readStoredFriends()).map(cloneFriend);
}

export async function sendFriendRequest({ targetFriendCode }) {
  const normalizedCode = targetFriendCode.trim().toUpperCase();

  if (!normalizedCode) {
    throw new Error('请输入对方的好友码');
  }

  await wait(500);

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
