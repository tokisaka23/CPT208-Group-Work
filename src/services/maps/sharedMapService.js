import { resolveSuzhouPoi } from '../../data/poiMapData';

const sharedMapStorageKey = 'cpt208_shared_maps_v2';
const groupMapStorageKey = 'cpt208_group_shared_maps_v1';

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

  try {
    const rawValue = storage.getItem(key);

    if (!rawValue) {
      return fallbackValue;
    }

    const parsedValue = JSON.parse(rawValue);
    return parsedValue ?? fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function saveJson(key, value) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(key, JSON.stringify(value));
}

function normalizePoint(point, index = 0) {
  if (!point || typeof point !== 'object') {
    return null;
  }

  const lng = Number(point.lng);
  const lat = Number(point.lat);

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return null;
  }

  return {
    lng,
    lat,
    note: String(point.note || `标注点 ${index + 1}`).trim() || `标注点 ${index + 1}`,
  };
}

function normalizeGroupMapSession(session) {
  if (!session || typeof session !== 'object') {
    return null;
  }

  const destination = resolveSuzhouPoi(session.destinationId);

  if (!destination?.id || !session.groupId) {
    return null;
  }

  return {
    id: String(session.id || `${session.groupId}-${destination.id}`),
    groupId: String(session.groupId),
    groupName: String(session.groupName || '共享群组'),
    destinationId: destination.id,
    destinationName: destination.name,
    routeMode: session.routeMode === 'driving' ? 'driving' : 'walking',
    markerNotes: (session.markerNotes || []).map(normalizePoint).filter(Boolean),
    invitedFriendIds: Array.isArray(session.invitedFriendIds)
      ? session.invitedFriendIds.map((item) => String(item)).filter(Boolean)
      : [],
    members: Array.isArray(session.members)
      ? session.members
        .filter((item) => item && item.id)
        .map((item) => ({
          id: String(item.id),
          username: String(item.username || '群成员'),
          friendCode: String(item.friendCode || ''),
        }))
      : [],
    updatedAt: session.updatedAt || new Date().toISOString(),
    updatedBy: String(session.updatedBy || ''),
  };
}

function readShareRecords() {
  const records = readJson(sharedMapStorageKey, []);
  return Array.isArray(records) ? records : [];
}

function readGroupSessions() {
  const sessions = readJson(groupMapStorageKey, []);
  return Array.isArray(sessions)
    ? sessions.map((item) => normalizeGroupMapSession(item)).filter(Boolean)
    : [];
}

function saveShareRecords(records) {
  saveJson(sharedMapStorageKey, records);
}

function saveGroupSessions(sessions) {
  saveJson(groupMapStorageKey, sessions);
}

export function notifySharedMapChanged() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent('shared-maps-updated'));
}

export function getSharedMaps() {
  return readShareRecords()
    .filter((item) => item && typeof item === 'object')
    .sort((left, right) => new Date(right.sharedAt || 0) - new Date(left.sharedAt || 0));
}

export function shareMapRecord({
  owner,
  destination,
  mode = 'walking',
  shareType = 'friend',
  friend = null,
  group = null,
  note = '',
}) {
  if (!owner?.id) {
    throw new Error('缺少当前用户信息，暂时无法共享地图');
  }

  const resolvedDestination = typeof destination === 'string' ? resolveSuzhouPoi(destination) : destination;

  if (!resolvedDestination?.id) {
    throw new Error('请选择一个可共享的目的地');
  }

  if (shareType === 'friend' && !friend?.id) {
    throw new Error('请选择要分享的好友');
  }

  if (shareType === 'group' && !group?.id) {
    throw new Error('请选择要分享的群组');
  }

  const record = {
    id: `shared-map-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ownerId: String(owner.id),
    ownerName: String(owner.username || '我'),
    destinationId: resolvedDestination.id,
    destinationName: resolvedDestination.name,
    mode: mode === 'driving' ? 'driving' : 'walking',
    shareType,
    friendId: friend?.id ? String(friend.id) : '',
    friendName: friend?.username ? String(friend.username) : '',
    groupId: group?.id ? String(group.id) : '',
    groupName: group?.name ? String(group.name) : '',
    note: String(note || '').trim(),
    sharedAt: new Date().toISOString(),
  };

  saveShareRecords([record, ...getSharedMaps()]);
  notifySharedMapChanged();
  return record;
}

export function getVisibleSharedMaps({ currentUser, friends = [], groups = [] }) {
  const currentUserId = String(currentUser?.id || '').trim();
  const friendIdSet = new Set((friends || []).map((item) => String(item.id || '').trim()).filter(Boolean));
  const groupIdSet = new Set((groups || []).map((item) => String(item.id || '').trim()).filter(Boolean));

  return getSharedMaps().filter((item) => {
    if (String(item.ownerId || '').trim() === currentUserId) {
      return true;
    }

    if (item.shareType === 'friend') {
      return friendIdSet.has(String(item.ownerId || '').trim()) && String(item.friendId || '').trim() === currentUserId;
    }

    if (item.shareType === 'group') {
      return groupIdSet.has(String(item.groupId || '').trim());
    }

    return false;
  });
}

export function getAllGroupSharedMaps() {
  return readGroupSessions()
    .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0));
}

export function getGroupSharedMap({ groupId, destinationId = '' }) {
  const normalizedGroupId = String(groupId || '').trim();
  const normalizedDestinationId = String(destinationId || '').trim();

  if (!normalizedGroupId) {
    return null;
  }

  const sessions = getAllGroupSharedMaps();

  if (normalizedDestinationId) {
    return sessions.find((item) => item.groupId === normalizedGroupId && item.destinationId === normalizedDestinationId) || null;
  }

  return sessions.find((item) => item.groupId === normalizedGroupId) || null;
}

export function getGroupSharedMapsByGroupIds(groupIds = []) {
  const groupIdSet = new Set((groupIds || []).map((item) => String(item || '').trim()).filter(Boolean));

  return getAllGroupSharedMaps().filter((item) => groupIdSet.has(item.groupId));
}

export function saveGroupSharedMap({
  group,
  destination,
  routeMode = 'walking',
  markerNotes = [],
  invitedFriendIds = [],
  updatedBy = '',
}) {
  const normalizedGroupId = String(group?.id || '').trim();

  if (!normalizedGroupId) {
    throw new Error('缺少群组信息，无法保存共享地图');
  }

  const resolvedDestination = typeof destination === 'string' ? resolveSuzhouPoi(destination) : resolveSuzhouPoi(destination?.id) || destination;

  if (!resolvedDestination?.id) {
    throw new Error('群组共享地图需要一个目的地');
  }

  const sessionId = `${normalizedGroupId}-${resolvedDestination.id}`;
  const nextSession = normalizeGroupMapSession({
    id: sessionId,
    groupId: normalizedGroupId,
    groupName: String(group?.name || '共享群组'),
    destinationId: resolvedDestination.id,
    routeMode,
    markerNotes,
    invitedFriendIds,
    members: group?.members || [],
    updatedAt: new Date().toISOString(),
    updatedBy: String(updatedBy || ''),
  });

  if (!nextSession) {
    throw new Error('共享地图数据无效');
  }

  const nextSessions = [
    nextSession,
    ...readGroupSessions().filter((item) => item.id !== sessionId),
  ];

  saveGroupSessions(nextSessions);
  notifySharedMapChanged();
  return nextSession;
}
