import { findUserByFriendCode, mockCurrentUser } from './friendMockData';
import { requestAuthorizedJson } from '../api';
import { getSupabaseClient, isSupabaseConfigured } from '../supabase/clientRuntime';
import { currentLanguage, resolveLocalized } from '../../i18n';
import {
  getFriendLocationFallbackMessage,
  hasRenderableFriendLocation,
} from '../../shared/friendLocation';

const friendStorageKey = 'cpt208_mock_friends';
const blockedFriendStorageKey = 'cpt208_mock_blocked_friends';
const currentProfileCacheKey = 'cpt208_current_profile_cache';

const runtimeTextSource = {
  signedInUser: {
    zh: '已登录用户',
    en: 'Signed-in User',
    ja: 'ログイン中のユーザー',
    ko: '로그인한 사용자',
  },
  getCurrentUserFailed: {
    zh: '获取当前登录用户失败：{message}',
    en: 'Failed to get the current signed-in user: {message}',
    ja: '現在ログイン中のユーザーの取得に失敗しました: {message}',
    ko: '현재 로그인한 사용자를 가져오지 못했습니다: {message}',
  },
  noSession: {
    zh: '当前没有可用的登录会话，请重新登录后再试。',
    en: 'There is no active login session. Please sign in again and retry.',
    ja: '利用可能なログインセッションがありません。再度ログインしてお試しください。',
    ko: '사용 가능한 로그인 세션이 없습니다. 다시 로그인한 뒤 시도해 주세요.',
  },
  readProfileFailed: {
    zh: '读取当前用户资料失败：{message}',
    en: 'Failed to load the current user profile: {message}',
    ja: '現在のユーザープロフィールの読み込みに失敗しました: {message}',
    ko: '현재 사용자 프로필을 불러오지 못했습니다: {message}',
  },
  enterFriendCode: {
    zh: '请输入对方的好友码',
    en: 'Please enter your friend’s code.',
    ja: '相手のフレンドコードを入力してください。',
    ko: '상대방의 친구 코드를 입력해 주세요.',
  },
  cannotAddSelf: {
    zh: '不能添加自己为好友',
    en: 'You cannot add yourself as a friend.',
    ja: '自分自身を友だちに追加することはできません。',
    ko: '자기 자신을 친구로 추가할 수 없습니다.',
  },
  alreadyInList: {
    zh: '该好友已经在列表中了',
    en: 'This friend is already in your list.',
    ja: 'この友だちはすでに一覧にいます。',
    ko: '이 친구는 이미 목록에 있습니다.',
  },
  inBlockedList: {
    zh: '该用户已在黑名单中，请先移出黑名单后再添加',
    en: 'This user is in your block list. Remove them from the block list first.',
    ja: 'このユーザーはブロック一覧にいます。先にブロック解除してください。',
    ko: '이 사용자는 차단 목록에 있습니다. 먼저 차단을 해제해 주세요.',
  },
  friendCodeNotFound: {
    zh: '没有找到该好友码对应的用户',
    en: 'No user was found for that friend code.',
    ja: 'そのフレンドコードに対応するユーザーが見つかりません。',
    ko: '해당 친구 코드에 맞는 사용자를 찾을 수 없습니다.',
  },
  mockAddFriendSuccess: {
    zh: '已将 {username} 加入好友列表。当前为前端原型，结果保存在本地浏览器。',
    en: '{username} has been added to your friend list. You are in frontend prototype mode, so the result is stored in this browser.',
    ja: '{username} を友だち一覧に追加しました。現在はフロントエンド試作版のため、この結果はブラウザに保存されます。',
    ko: '{username} 님을 친구 목록에 추가했습니다. 현재는 프런트엔드 프로토타입 모드라 이 결과가 브라우저에 저장됩니다.',
  },
  missingProfile: {
    zh: '当前登录用户缺少 user_profiles 资料，请先检查数据库初始化。',
    en: 'The current user is missing a user_profiles record. Please check your database initialization first.',
    ja: '現在のユーザーに user_profiles レコードがありません。先にデータベース初期化を確認してください。',
    ko: '현재 사용자에게 user_profiles 레코드가 없습니다. 먼저 데이터베이스 초기화를 확인해 주세요.',
  },
  mockRespondUnsupported: {
    zh: '当前为前端原型模式，暂不支持处理好友请求。',
    en: 'Friend request handling is not available in frontend prototype mode.',
    ja: 'フロントエンド試作版では友だち申請の処理はまだ利用できません。',
    ko: '프런트엔드 프로토타입 모드에서는 친구 요청 처리를 아직 지원하지 않습니다.',
  },
  missingFriendUserId: {
    zh: '缺少好友用户 ID',
    en: 'Missing friend user ID.',
    ja: '友だちユーザー ID がありません。',
    ko: '친구 사용자 ID가 없습니다.',
  },
  removableFriendNotFound: {
    zh: '没有找到可删除的好友',
    en: 'No removable friend was found.',
    ja: '削除できる友だちが見つかりません。',
    ko: '삭제할 수 있는 친구를 찾지 못했습니다.',
  },
  mockRemoveSuccess: {
    zh: '已将该用户从好友列表中删除。',
    en: 'This user has been removed from your friend list.',
    ja: 'このユーザーを友だち一覧から削除しました。',
    ko: '이 사용자를 친구 목록에서 삭제했습니다.',
  },
  blockableFriendNotFound: {
    zh: '没有找到可拉黑的好友',
    en: 'No friend was found to block.',
    ja: 'ブロックできる友だちが見つかりません。',
    ko: '차단할 친구를 찾지 못했습니다.',
  },
  mockBlockSuccess: {
    zh: '已将 {username} 拉入黑名单。',
    en: '{username} has been added to your block list.',
    ja: '{username} をブロック一覧に追加しました。',
    ko: '{username} 님을 차단 목록에 추가했습니다.',
  },
  unblockableFriendNotFound: {
    zh: '没有找到可移出的黑名单用户',
    en: 'No blocked user was found to restore.',
    ja: '解除できるブロック済みユーザーが見つかりません。',
    ko: '해제할 차단 사용자를 찾지 못했습니다.',
  },
  mockUnblockSuccess: {
    zh: '已将该用户移出黑名单，并恢复为好友。',
    en: 'This user has been removed from the block list and restored as a friend.',
    ja: 'このユーザーをブロック一覧から外し、友だちとして復元しました。',
    ko: '이 사용자를 차단 목록에서 제거하고 친구로 복원했습니다.',
  },
  friendNotFound: {
    zh: '未找到该好友',
    en: 'Friend not found.',
    ja: 'その友だちは見つかりませんでした。',
    ko: '해당 친구를 찾지 못했습니다.',
  },
  noLocationData: {
    zh: '暂时没有可展示的定位数据',
    en: 'There is no location data to display right now.',
    ja: '現在表示できる位置データがありません。',
    ko: '지금은 표시할 수 있는 위치 데이터가 없습니다.',
  },
  invalidSharingState: {
    zh: '位置共享状态无效',
    en: 'Invalid location sharing state.',
    ja: '位置共有の状態が無効です。',
    ko: '위치 공유 상태가 올바르지 않습니다.',
  },
  invalidCoordinate: {
    zh: '缺少有效的定位坐标',
    en: 'Missing valid location coordinates.',
    ja: '有効な位置座標がありません。',
    ko: '유효한 위치 좌표가 없습니다.',
  },
  invalidLatitude: {
    zh: '纬度超出有效范围',
    en: 'Latitude is out of range.',
    ja: '緯度が有効範囲を超えています。',
    ko: '위도가 유효 범위를 벗어났습니다.',
  },
  invalidLongitude: {
    zh: '经度超出有效范围',
    en: 'Longitude is out of range.',
    ja: '経度が有効範囲を超えています。',
    ko: '경도가 유효 범위를 벗어났습니다.',
  },
  invalidAccuracy: {
    zh: '定位精度不能为负数',
    en: 'Location accuracy cannot be negative.',
    ja: '位置精度は負の値にできません。',
    ko: '위치 정확도는 음수일 수 없습니다.',
  },
  unableToGetLocation: {
    zh: '未能获取当前位置，请检查浏览器定位权限。',
    en: 'Unable to get your current location. Please check browser location permissions.',
    ja: '現在地を取得できませんでした。ブラウザの位置情報権限を確認してください。',
    ko: '현재 위치를 가져오지 못했습니다. 브라우저 위치 권한을 확인해 주세요.',
  },
};

function formatRuntimeText(template, params = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ''));
}

function getRuntimeText(key, params = {}, language = currentLanguage.value) {
  return formatRuntimeText(resolveLocalized(runtimeTextSource[key] || {}, language), params);
}

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

function readStoredBlockedFriends() {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  try {
    const rawValue = storage.getItem(blockedFriendStorageKey);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function saveStoredBlockedFriends(friends) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(blockedFriendStorageKey, JSON.stringify(friends));
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
    getRuntimeText('signedInUser')
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
    throw new Error(getRuntimeText('getCurrentUserFailed', { message: error.message }));
  }

  if (!user) {
    throw new Error(getRuntimeText('noSession'));
  }

  return user;
}

async function requestFriendApi(path, payload = {}) {
  // 中文注释：统一通过 src/api.js 调用后端好友接口，例如 /api/friends/add、/api/friends/list。
  return requestAuthorizedJson(path, payload);
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
    throw new Error(getRuntimeText('readProfileFailed', { message: error.message }));
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

function normalizeLocationNumber(value) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

async function requestCurrentPosition({
  enableHighAccuracy = true,
  timeout = 8000,
  maximumAge = 60000,
} = {}) {
  if (typeof window === 'undefined' || !navigator?.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => resolve(null),
      { enableHighAccuracy, timeout, maximumAge },
    );
  });
}

async function readGeolocationPermissionState() {
  if (typeof window === 'undefined' || !navigator?.permissions?.query) {
    return 'prompt';
  }

  try {
    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
    return permissionStatus?.state || 'prompt';
  } catch {
    return 'prompt';
  }
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

export async function getBlockedFriendList() {
  await wait(250);

  if (!isSupabaseConfigured()) {
    return sortFriends(readStoredBlockedFriends()).map(cloneFriend);
  }

  const result = await requestFriendApi('/api/friends/blocked-list');
  return sortFriends((result.blockedUsers || []).map(cloneFriend));
}

export async function sendFriendRequest({ targetFriendCode }) {
  const normalizedCode = targetFriendCode.trim().toUpperCase();

  if (!normalizedCode) {
    throw new Error(getRuntimeText('enterFriendCode'));
  }

  await wait(500);

  if (!isSupabaseConfigured()) {
    const currentProfile = await getCurrentUserProfile().catch(() => buildFallbackProfile());

    if (normalizedCode === String(currentProfile.friendCode || '').toUpperCase()) {
      throw new Error(getRuntimeText('cannotAddSelf'));
    }

    const currentFriends = readStoredFriends();
    const blockedFriends = readStoredBlockedFriends();

    if (currentFriends.some((item) => item.friendCode.toUpperCase() === normalizedCode)) {
      throw new Error(getRuntimeText('alreadyInList'));
    }

    if (blockedFriends.some((item) => item.friendCode.toUpperCase() === normalizedCode)) {
      throw new Error(getRuntimeText('inBlockedList'));
    }

    const targetUser = findUserByFriendCode(normalizedCode);

    if (!targetUser) {
      throw new Error(getRuntimeText('friendCodeNotFound'));
    }

    const nextFriends = sortFriends([{ ...targetUser }, ...currentFriends]);
    saveStoredFriends(nextFriends);

    return {
      success: true,
      message: getRuntimeText('mockAddFriendSuccess', { username: targetUser.username }),
      friend: cloneFriend(targetUser),
    };
  }

  const authUser = await getAuthenticatedUser();
  const currentProfile = await findProfileById(authUser.id);

  if (!currentProfile) {
    throw new Error(getRuntimeText('missingProfile'));
  }

  if (normalizedCode === String(currentProfile.friend_code || '').toUpperCase()) {
    throw new Error(getRuntimeText('cannotAddSelf'));
  }

  return requestFriendApi('/api/friends/add', { targetFriendCode: normalizedCode });
}

export async function respondToFriendRequest({ requestId, decision }) {
  await wait(250);

  if (!isSupabaseConfigured()) {
    throw new Error(getRuntimeText('mockRespondUnsupported'));
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

export async function removeFriend({ friendUserId }) {
  const normalizedFriendUserId = String(friendUserId || '').trim();

  if (!normalizedFriendUserId) {
    throw new Error(getRuntimeText('missingFriendUserId'));
  }

  await wait(250);

  if (!isSupabaseConfigured()) {
    const currentFriends = readStoredFriends();
    const nextFriends = currentFriends.filter((item) => item.id !== normalizedFriendUserId);

    if (nextFriends.length === currentFriends.length) {
      throw new Error(getRuntimeText('removableFriendNotFound'));
    }

    saveStoredFriends(nextFriends);
    notifyFriendDataChanged();

    return {
      success: true,
      message: getRuntimeText('mockRemoveSuccess'),
    };
  }

  const result = await requestFriendApi('/api/friends/remove', {
    friendUserId: normalizedFriendUserId,
  });

  notifyFriendDataChanged();
  return result;
}

export async function blockFriend({ friendUserId }) {
  const normalizedFriendUserId = String(friendUserId || '').trim();

  if (!normalizedFriendUserId) {
    throw new Error(getRuntimeText('missingFriendUserId'));
  }

  await wait(250);

  if (!isSupabaseConfigured()) {
    const currentFriends = readStoredFriends();
    const blockedFriends = readStoredBlockedFriends();
    const targetFriend = currentFriends.find((item) => item.id === normalizedFriendUserId);

    if (!targetFriend) {
      throw new Error(getRuntimeText('blockableFriendNotFound'));
    }

    const nextFriends = currentFriends.filter((item) => item.id !== normalizedFriendUserId);
    const nextBlockedFriends = sortFriends([
      {
        id: targetFriend.id,
        username: targetFriend.username,
        friendCode: targetFriend.friendCode,
        blockedAt: new Date().toISOString(),
      },
      ...blockedFriends.filter((item) => item.id !== normalizedFriendUserId),
    ]);

    saveStoredFriends(nextFriends);
    saveStoredBlockedFriends(nextBlockedFriends);
    notifyFriendDataChanged();

    return {
      success: true,
      message: getRuntimeText('mockBlockSuccess', { username: targetFriend.username }),
    };
  }

  const result = await requestFriendApi('/api/friends/block', {
    friendUserId: normalizedFriendUserId,
  });

  notifyFriendDataChanged();
  return result;
}

export async function unblockFriend({ friendUserId }) {
  const normalizedFriendUserId = String(friendUserId || '').trim();

  if (!normalizedFriendUserId) {
    throw new Error(getRuntimeText('missingFriendUserId'));
  }

  await wait(250);

  if (!isSupabaseConfigured()) {
    const blockedFriends = readStoredBlockedFriends();
    const targetBlockedFriend = blockedFriends.find((item) => item.id === normalizedFriendUserId);
    const nextBlockedFriends = blockedFriends.filter((item) => item.id !== normalizedFriendUserId);

    if (nextBlockedFriends.length === blockedFriends.length) {
      throw new Error(getRuntimeText('unblockableFriendNotFound'));
    }

    const currentFriends = readStoredFriends();
    const nextFriends = sortFriends([
      ...currentFriends.filter((item) => item.id !== normalizedFriendUserId),
      {
        id: targetBlockedFriend.id,
        username: targetBlockedFriend.username,
        friendCode: targetBlockedFriend.friendCode,
        isOnline: false,
        isLocationSharingEnabled: false,
        latitude: null,
        longitude: null,
        updatedAt: new Date().toISOString(),
      },
    ]);

    saveStoredFriends(nextFriends);
    saveStoredBlockedFriends(nextBlockedFriends);
    notifyFriendDataChanged();

    return {
      success: true,
      message: getRuntimeText('mockUnblockSuccess'),
    };
  }

  const result = await requestFriendApi('/api/friends/unblock', {
    friendUserId: normalizedFriendUserId,
  });

  notifyFriendDataChanged();
  return result;
}

export async function getFriendLocation(friendId) {
  const normalizedFriendId = String(friendId || '').trim();

  if (!normalizedFriendId) {
    throw new Error(getRuntimeText('missingFriendUserId'));
  }

  await wait(300);

  if (!isSupabaseConfigured()) {
    const targetFriend = readStoredFriends().find((item) => item.id === normalizedFriendId);

    if (!targetFriend) {
      throw new Error(getRuntimeText('friendNotFound'));
    }

    if (!targetFriend.isLocationSharingEnabled) {
      throw new Error(getFriendLocationFallbackMessage({ isOnline: true, isLocationSharingEnabled: false }, currentLanguage.value));
    }

    if (!hasRenderableFriendLocation(targetFriend)) {
      throw new Error(getFriendLocationFallbackMessage(targetFriend, currentLanguage.value));
    }

    return cloneFriend(targetFriend);
  }

  const result = await requestFriendApi('/api/friends/location', {
    friendUserId: normalizedFriendId,
  });

  if (!result?.friend) {
    throw new Error(getRuntimeText('noLocationData'));
  }

  return cloneFriend(result.friend);
}

export async function getLocationSharingOverview() {
  await wait(180);

  if (!isSupabaseConfigured()) {
    return {
      totalFriends: readStoredFriends().length,
      activeFriendCount: 0,
      sharingMode: 'off',
      lastLocationUpdatedAt: null,
      isOnline: false,
    };
  }

  const result = await requestFriendApi('/api/friends/location-sharing');
  return result?.overview || {
    totalFriends: 0,
    activeFriendCount: 0,
    sharingMode: 'off',
    lastLocationUpdatedAt: null,
    isOnline: false,
  };
}

export async function setLocationSharingForAllFriends(isActive) {
  await wait(180);

  if (typeof isActive !== 'boolean') {
    throw new Error(getRuntimeText('invalidSharingState'));
  }

  if (!isSupabaseConfigured()) {
    return {
      totalFriends: readStoredFriends().length,
      activeFriendCount: isActive ? readStoredFriends().length : 0,
      sharingMode: isActive ? 'all' : 'off',
      lastLocationUpdatedAt: null,
      isOnline: false,
    };
  }

  const result = await requestFriendApi('/api/friends/location-sharing', { isActive });
  return result?.overview || null;
}

export async function updateCurrentUserLocation({ latitude, longitude, accuracyMeters = null }) {
  const normalizedLatitude = normalizeLocationNumber(latitude);
  const normalizedLongitude = normalizeLocationNumber(longitude);
  const normalizedAccuracy = normalizeLocationNumber(accuracyMeters);

  if (normalizedLatitude === null || normalizedLongitude === null) {
    throw new Error(getRuntimeText('invalidCoordinate'));
  }

  if (normalizedLatitude < -90 || normalizedLatitude > 90) {
    throw new Error(getRuntimeText('invalidLatitude'));
  }

  if (normalizedLongitude < -180 || normalizedLongitude > 180) {
    throw new Error(getRuntimeText('invalidLongitude'));
  }

  if (normalizedAccuracy !== null && normalizedAccuracy < 0) {
    throw new Error(getRuntimeText('invalidAccuracy'));
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      updatedAt: new Date().toISOString(),
    };
  }

  return requestFriendApi('/api/friends/update-location', {
    latitude: normalizedLatitude,
    longitude: normalizedLongitude,
    accuracyMeters: normalizedAccuracy,
  });
}

export async function updateCurrentUserLocationWithPrompt() {
  const currentPosition = await requestCurrentPosition({
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 0,
  });

  if (!currentPosition?.coords) {
    throw new Error(getRuntimeText('unableToGetLocation'));
  }

  return updateCurrentUserLocation({
    latitude: currentPosition.coords.latitude,
    longitude: currentPosition.coords.longitude,
    accuracyMeters: currentPosition.coords.accuracy,
  });
}

export async function syncCurrentUserLocationSilently() {
  if (!isSupabaseConfigured()) {
    return { synced: false, reason: 'supabase-not-configured' };
  }

  const permissionState = await readGeolocationPermissionState();

  if (permissionState !== 'granted') {
    return { synced: false, reason: permissionState };
  }

  const currentPosition = await requestCurrentPosition();

  if (!currentPosition?.coords) {
    return { synced: false, reason: 'position-unavailable' };
  }

  await updateCurrentUserLocation({
    latitude: currentPosition.coords.latitude,
    longitude: currentPosition.coords.longitude,
    accuracyMeters: currentPosition.coords.accuracy,
  });

  return { synced: true };
}
