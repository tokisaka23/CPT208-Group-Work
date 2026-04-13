import { buildJsonResponse } from '../supabase.js';

const LOCATION_STALE_MS = 5 * 60 * 1000;

export function requirePostMethod(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return false;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: 'Method Not Allowed' });
    return false;
  }

  return true;
}

export function isMissingRelationError(error) {
  return Boolean(
    error?.code === '42P01'
    || error?.code === 'PGRST205'
    || error?.message?.includes('relation')
    || error?.message?.includes('does not exist')
    || error?.message?.includes('schema cache')
    || error?.message?.includes('Could not find the table')
  );
}

export function normalizeCoordinate(value) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function isFiniteCoordinate(value) {
  return Number.isFinite(Number(value));
}

export function isRecentLocationUpdate(updatedAt, now = new Date()) {
  const updatedTime = new Date(updatedAt);

  if (Number.isNaN(updatedTime.getTime())) {
    return false;
  }

  return now.getTime() - updatedTime.getTime() <= LOCATION_STALE_MS;
}

export function normalizeLiveLocationRow(locationRow) {
  if (!locationRow) {
    return null;
  }

  const latitude = normalizeCoordinate(locationRow.latitude);
  const longitude = normalizeCoordinate(locationRow.longitude);
  const accuracyMeters = normalizeCoordinate(locationRow.accuracy_meters);
  const updatedAt = locationRow.updated_at || null;

  return {
    userId: locationRow.user_id,
    latitude,
    longitude,
    accuracyMeters,
    updatedAt,
    isOnline: Boolean(locationRow.is_online) && isRecentLocationUpdate(updatedAt),
  };
}

export async function findProfileById(adminClient, userId) {
  const { data, error } = await adminClient
    .from('user_profiles')
    .select('id, username, display_name, friend_code')
    .eq('id', userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`读取用户资料失败：${error.message}`);
  }

  return data;
}

export async function findExistingRelationship(adminClient, currentUserId, targetUserId) {
  const { data, error } = await adminClient
    .from('user_relationships')
    .select('id, requester_user_id, target_user_id, status, updated_at')
    .or(
      `and(requester_user_id.eq.${currentUserId},target_user_id.eq.${targetUserId}),and(requester_user_id.eq.${targetUserId},target_user_id.eq.${currentUserId})`
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`检查好友关系失败：${error.message}`);
  }

  return data;
}

export async function loadLocationPermissions(adminClient, currentUserId, friendIds) {
  if (!friendIds.length) {
    return [];
  }

  const { data, error } = await adminClient
    .from('location_share_permissions')
    .select('owner_user_id, is_active, granted_at')
    .eq('viewer_user_id', currentUserId)
    .in('owner_user_id', friendIds);

  if (error) {
    if (isMissingRelationError(error)) {
      return [];
    }

    throw new Error(`读取位置共享状态失败：${error.message}`);
  }

  return data || [];
}

export async function loadOwnerLocationPermissions(adminClient, ownerUserId, viewerIds) {
  if (!viewerIds.length) {
    return [];
  }

  const { data, error } = await adminClient
    .from('location_share_permissions')
    .select('viewer_user_id, is_active, granted_at, revoked_at')
    .eq('owner_user_id', ownerUserId)
    .in('viewer_user_id', viewerIds);

  if (error) {
    if (isMissingRelationError(error)) {
      return [];
    }

    throw new Error(`读取我的位置共享设置失败：${error.message}`);
  }

  return data || [];
}

export async function loadLiveLocations(adminClient, userIds) {
  if (!userIds.length) {
    return [];
  }

  const { data, error } = await adminClient
    .from('user_live_locations')
    .select('user_id, latitude, longitude, accuracy_meters, is_online, updated_at')
    .in('user_id', userIds);

  if (error) {
    if (isMissingRelationError(error)) {
      return [];
    }

    throw new Error(`读取好友定位数据失败：${error.message}`);
  }

  return data || [];
}

export async function loadAcceptedFriendIds(adminClient, userId) {
  const [requestedResult, targetedResult] = await Promise.all([
    adminClient
      .from('user_relationships')
      .select('target_user_id')
      .eq('requester_user_id', userId)
      .eq('status', 'accepted'),
    adminClient
      .from('user_relationships')
      .select('requester_user_id')
      .eq('target_user_id', userId)
      .eq('status', 'accepted'),
  ]);

  if (requestedResult.error) {
    throw new Error(`读取好友关系失败：${requestedResult.error.message}`);
  }

  if (targetedResult.error) {
    throw new Error(`读取好友关系失败：${targetedResult.error.message}`);
  }

  return [
    ...(requestedResult.data || []).map((item) => item.target_user_id),
    ...(targetedResult.data || []).map((item) => item.requester_user_id),
  ].filter(Boolean);
}

export async function loadSingleLiveLocation(adminClient, userId) {
  const { data, error } = await adminClient
    .from('user_live_locations')
    .select('user_id, latitude, longitude, accuracy_meters, is_online, updated_at')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingRelationError(error)) {
      return null;
    }

    throw new Error(`读取当前位置失败：${error.message}`);
  }

  return data || null;
}

export function buildFriendSummary(profile, permission, location, fallbackUpdatedAt) {
  const normalizedLocation = permission?.is_active ? normalizeLiveLocationRow(location) : null;

  return {
    id: profile.id,
    username: profile.display_name || profile.username || '未命名用户',
    friendCode: profile.friend_code,
    isOnline: Boolean(normalizedLocation?.isOnline),
    isLocationSharingEnabled: Boolean(permission?.is_active),
    latitude: normalizedLocation?.latitude ?? null,
    longitude: normalizedLocation?.longitude ?? null,
    accuracyMeters: normalizedLocation?.accuracyMeters ?? null,
    updatedAt: normalizedLocation?.updatedAt || permission?.granted_at || fallbackUpdatedAt || null,
  };
}
