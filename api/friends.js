import {
  buildJsonResponse,
  getAuthenticatedUser,
  readJsonBody,
} from './supabase.js';

function sortFriends(list) {
  return [...list].sort((left, right) => {
    if (left.isOnline !== right.isOnline) {
      return Number(right.isOnline) - Number(left.isOnline);
    }

    return left.username.localeCompare(right.username, 'zh-CN');
  });
}

const LOCATION_STALE_MS = 5 * 60 * 1000;

function isMissingRelationError(error) {
  return Boolean(
    error?.code === '42P01'
    || error?.code === 'PGRST205'
    || error?.message?.includes('relation')
    || error?.message?.includes('does not exist')
    || error?.message?.includes('schema cache')
    || error?.message?.includes('Could not find the table')
  );
}

function normalizeCoordinate(value) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function isFiniteCoordinate(value) {
  return Number.isFinite(Number(value));
}

function requirePostMethod(req, res) {
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

function isRecentLocationUpdate(updatedAt, now = new Date()) {
  const updatedTime = new Date(updatedAt);

  if (Number.isNaN(updatedTime.getTime())) {
    return false;
  }

  return now.getTime() - updatedTime.getTime() <= LOCATION_STALE_MS;
}

function normalizeLiveLocationRow(locationRow) {
  if (!locationRow) {
    return null;
  }

  const latitude = Number(locationRow.latitude);
  const longitude = Number(locationRow.longitude);
  const accuracyMeters = Number(locationRow.accuracy_meters);
  const updatedAt = locationRow.updated_at || null;

  return {
    userId: locationRow.user_id,
    latitude: isFiniteCoordinate(latitude) ? latitude : null,
    longitude: isFiniteCoordinate(longitude) ? longitude : null,
    accuracyMeters: Number.isFinite(accuracyMeters) ? accuracyMeters : null,
    updatedAt,
    isOnline: Boolean(locationRow.is_online) && isRecentLocationUpdate(updatedAt),
  };
}

function buildFriendSummary(profile, permission, location, fallbackUpdatedAt) {
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

async function findProfileById(adminClient, userId) {
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

async function findProfileByFriendCode(adminClient, friendCode) {
  const { data, error } = await adminClient
    .from('user_profiles')
    .select('id, username, display_name, friend_code')
    .ilike('friend_code', friendCode)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`查询好友码失败：${error.message}`);
  }

  return data;
}

async function findExistingRelationship(adminClient, currentUserId, targetUserId) {
  const { data, error } = await adminClient
    .from('user_relationships')
    .select('id, requester_user_id, target_user_id, status')
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

async function loadLocationPermissions(adminClient, currentUserId, friendIds) {
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

async function loadOwnerLocationPermissions(adminClient, ownerUserId, viewerIds) {
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

async function loadLiveLocations(adminClient, userIds) {
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

async function loadAcceptedFriendIds(adminClient, userId) {
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

async function loadSingleLiveLocation(adminClient, userId) {
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

async function clearLocationPermissionsBetweenUsers(adminClient, leftUserId, rightUserId) {
  const { error } = await adminClient
    .from('location_share_permissions')
    .delete()
    .or(
      `and(owner_user_id.eq.${leftUserId},viewer_user_id.eq.${rightUserId}),and(owner_user_id.eq.${rightUserId},viewer_user_id.eq.${leftUserId})`
    );

  if (error) {
    if (isMissingRelationError(error)) {
      return;
    }

    throw new Error(`清理位置共享权限失败：${error.message}`);
  }
}

async function handleAddFriend(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { targetFriendCode = '' } = readJsonBody(req);
    const normalizedCode = String(targetFriendCode).trim().toUpperCase();

    if (!normalizedCode) {
      buildJsonResponse(res, 400, { error: '请输入对方的好友码' });
      return;
    }

    const currentProfile = await findProfileById(adminClient, user.id);

    if (!currentProfile) {
      buildJsonResponse(res, 404, {
        error: '当前登录用户缺少 user_profiles 资料，请先检查数据库初始化。',
      });
      return;
    }

    if (normalizedCode === String(currentProfile.friend_code || '').trim().toUpperCase()) {
      buildJsonResponse(res, 400, { error: '不能添加自己为好友' });
      return;
    }

    const targetProfile = await findProfileByFriendCode(adminClient, normalizedCode);

    if (!targetProfile) {
      buildJsonResponse(res, 404, { error: '没有找到该好友码对应的用户' });
      return;
    }

    const existingRelationship = await findExistingRelationship(adminClient, user.id, targetProfile.id);

    if (existingRelationship?.status === 'accepted') {
      buildJsonResponse(res, 400, { error: '你们已经是好友了' });
      return;
    }

    if (existingRelationship?.status === 'blocked') {
      buildJsonResponse(res, 400, { error: '当前好友关系已被限制，暂时无法发送请求' });
      return;
    }

    if (existingRelationship?.status === 'pending') {
      if (existingRelationship.requester_user_id === user.id) {
        buildJsonResponse(res, 200, {
          success: true,
          message: '好友请求已发送，等待对方确认。',
        });
        return;
      }

      buildJsonResponse(res, 400, {
        error: '对方已经向你发送过好友请求，请登录后在弹窗中处理。',
      });
      return;
    }

    if (existingRelationship) {
      const { error } = await adminClient
        .from('user_relationships')
        .update({
          requester_user_id: user.id,
          target_user_id: targetProfile.id,
          status: 'pending',
        })
        .eq('id', existingRelationship.id);

      if (error) {
        throw new Error(`更新好友关系失败：${error.message}`);
      }
    } else {
      const { error } = await adminClient.from('user_relationships').insert({
        requester_user_id: user.id,
        target_user_id: targetProfile.id,
        status: 'pending',
      });

      if (error) {
        throw new Error(`创建好友关系失败：${error.message}`);
      }
    }

    buildJsonResponse(res, 200, {
      success: true,
      message: `已向 ${targetProfile.display_name || targetProfile.username || '该用户'} 发送好友请求，等待对方确认。`,
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || '发送好友请求失败，请稍后再试。',
    });
  }
}

async function handleFriendList(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);

    const [requestedResult, targetedResult] = await Promise.all([
      adminClient
        .from('user_relationships')
        .select('id, target_user_id, updated_at')
        .eq('requester_user_id', user.id)
        .eq('status', 'accepted'),
      adminClient
        .from('user_relationships')
        .select('id, requester_user_id, updated_at')
        .eq('target_user_id', user.id)
        .eq('status', 'accepted'),
    ]);

    if (requestedResult.error) {
      throw new Error(`读取好友列表失败：${requestedResult.error.message}`);
    }

    if (targetedResult.error) {
      throw new Error(`读取好友列表失败：${targetedResult.error.message}`);
    }

    const relationshipRows = [
      ...(requestedResult.data || []).map((item) => ({
        friendId: item.target_user_id,
        updatedAt: item.updated_at,
      })),
      ...(targetedResult.data || []).map((item) => ({
        friendId: item.requester_user_id,
        updatedAt: item.updated_at,
      })),
    ];

    if (!relationshipRows.length) {
      buildJsonResponse(res, 200, { success: true, friends: [] });
      return;
    }

    const friendIds = [...new Set(relationshipRows.map((item) => item.friendId))];
    const { data: profiles, error: profileError } = await adminClient
      .from('user_profiles')
      .select('id, username, display_name, friend_code')
      .in('id', friendIds);

    if (profileError) {
      throw new Error(`读取好友资料失败：${profileError.message}`);
    }

    const [permissions, liveLocations] = await Promise.all([
      loadLocationPermissions(adminClient, user.id, friendIds),
      loadLiveLocations(adminClient, friendIds),
    ]);
    const permissionMap = new Map((permissions || []).map((item) => [item.owner_user_id, item]));
    const liveLocationMap = new Map((liveLocations || []).map((item) => [item.user_id, item]));
    const profileMap = new Map((profiles || []).map((item) => [item.id, item]));

    const friends = relationshipRows
      .map((item) => {
        const profile = profileMap.get(item.friendId);

        if (!profile) {
          return null;
        }

        const permission = permissionMap.get(item.friendId);

        return {
          id: profile.id,
          username: profile.display_name || profile.username || '未命名用户',
          friendCode: profile.friend_code,
          isOnline: false,
          isLocationSharingEnabled: Boolean(permission?.is_active),
          latitude: null,
          longitude: null,
          updatedAt: permission?.granted_at || item.updatedAt,
        };
      })
      .filter(Boolean);

    const resolvedFriends = relationshipRows
      .map((item) => {
        const profile = profileMap.get(item.friendId);

        if (!profile) {
          return null;
        }

        return buildFriendSummary(
          profile,
          permissionMap.get(item.friendId),
          liveLocationMap.get(item.friendId),
          item.updatedAt,
        );
      })
      .filter(Boolean);

    buildJsonResponse(res, 200, {
      success: true,
      friends: sortFriends(resolvedFriends.length ? resolvedFriends : friends),
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || '读取好友列表失败，请稍后再试。',
    });
  }
}

async function handlePendingFriendList(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { data: relationships, error: relationshipError } = await adminClient
      .from('user_relationships')
      .select('id, requester_user_id, created_at, updated_at')
      .eq('target_user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (relationshipError) {
      throw new Error(`读取待处理好友请求失败：${relationshipError.message}`);
    }

    const requesterIds = [...new Set((relationships || []).map((item) => item.requester_user_id))];

    if (!requesterIds.length) {
      buildJsonResponse(res, 200, {
        success: true,
        requests: [],
      });
      return;
    }

    const { data: profiles, error: profileError } = await adminClient
      .from('user_profiles')
      .select('id, username, display_name, friend_code')
      .in('id', requesterIds);

    if (profileError) {
      throw new Error(`读取好友请求发起人资料失败：${profileError.message}`);
    }

    const profileMap = new Map((profiles || []).map((item) => [item.id, item]));
    const requests = (relationships || [])
      .map((item) => {
        const profile = profileMap.get(item.requester_user_id);

        if (!profile) {
          return null;
        }

        return {
          id: item.id,
          requesterUserId: item.requester_user_id,
          username: profile.display_name || profile.username || '未命名用户',
          friendCode: profile.friend_code,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        };
      })
      .filter(Boolean);

    buildJsonResponse(res, 200, {
      success: true,
      requests,
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || '读取待处理好友请求失败，请稍后再试。',
    });
  }
}

async function handleRemoveFriend(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { friendUserId = '' } = readJsonBody(req);
    const normalizedFriendUserId = String(friendUserId).trim();

    if (!normalizedFriendUserId) {
      buildJsonResponse(res, 400, { error: '缺少好友用户 ID' });
      return;
    }

    if (normalizedFriendUserId === user.id) {
      buildJsonResponse(res, 400, { error: '不能删除自己' });
      return;
    }

    const relationship = await findExistingRelationship(adminClient, user.id, normalizedFriendUserId);

    if (!relationship || relationship.status !== 'accepted') {
      buildJsonResponse(res, 404, { error: '没有找到可删除的好友关系' });
      return;
    }

    const { error: deleteError } = await adminClient
      .from('user_relationships')
      .delete()
      .eq('id', relationship.id);

    if (deleteError) {
      throw new Error(`删除好友关系失败：${deleteError.message}`);
    }

    await clearLocationPermissionsBetweenUsers(adminClient, user.id, normalizedFriendUserId);

    buildJsonResponse(res, 200, {
      success: true,
      message: '已将该用户从好友列表中删除。',
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || '删除好友失败，请稍后再试。',
    });
  }
}

async function handleBlockedFriendList(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { data: relationships, error: relationshipError } = await adminClient
      .from('user_relationships')
      .select('id, target_user_id, updated_at')
      .eq('requester_user_id', user.id)
      .eq('status', 'blocked')
      .order('updated_at', { ascending: false });

    if (relationshipError) {
      throw new Error(`读取黑名单失败：${relationshipError.message}`);
    }

    const blockedUserIds = [...new Set((relationships || []).map((item) => item.target_user_id))];

    if (!blockedUserIds.length) {
      buildJsonResponse(res, 200, {
        success: true,
        blockedUsers: [],
      });
      return;
    }

    const { data: profiles, error: profileError } = await adminClient
      .from('user_profiles')
      .select('id, username, display_name, friend_code')
      .in('id', blockedUserIds);

    if (profileError) {
      throw new Error(`读取黑名单用户资料失败：${profileError.message}`);
    }

    const profileMap = new Map((profiles || []).map((item) => [item.id, item]));
    const blockedUsers = (relationships || [])
      .map((item) => {
        const profile = profileMap.get(item.target_user_id);

        if (!profile) {
          return null;
        }

        return {
          id: profile.id,
          username: profile.display_name || profile.username || '未命名用户',
          friendCode: profile.friend_code,
          blockedAt: item.updated_at,
        };
      })
      .filter(Boolean);

    buildJsonResponse(res, 200, {
      success: true,
      blockedUsers,
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || '读取黑名单失败，请稍后再试。',
    });
  }
}

async function handleBlockFriend(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { friendUserId = '' } = readJsonBody(req);
    const normalizedFriendUserId = String(friendUserId).trim();

    if (!normalizedFriendUserId) {
      buildJsonResponse(res, 400, { error: '缺少好友用户 ID' });
      return;
    }

    if (normalizedFriendUserId === user.id) {
      buildJsonResponse(res, 400, { error: '不能将自己拉入黑名单' });
      return;
    }

    const targetProfile = await findProfileById(adminClient, normalizedFriendUserId);

    if (!targetProfile) {
      buildJsonResponse(res, 404, { error: '没有找到对应的用户' });
      return;
    }

    const relationship = await findExistingRelationship(adminClient, user.id, normalizedFriendUserId);

    if (relationship) {
      const { error: updateError } = await adminClient
        .from('user_relationships')
        .update({
          requester_user_id: user.id,
          target_user_id: normalizedFriendUserId,
          status: 'blocked',
        })
        .eq('id', relationship.id);

      if (updateError) {
        throw new Error(`更新黑名单关系失败：${updateError.message}`);
      }
    } else {
      const { error: insertError } = await adminClient
        .from('user_relationships')
        .insert({
          requester_user_id: user.id,
          target_user_id: normalizedFriendUserId,
          status: 'blocked',
        });

      if (insertError) {
        throw new Error(`创建黑名单关系失败：${insertError.message}`);
      }
    }

    await clearLocationPermissionsBetweenUsers(adminClient, user.id, normalizedFriendUserId);

    buildJsonResponse(res, 200, {
      success: true,
      message: `已将 ${targetProfile.display_name || targetProfile.username || '该用户'} 拉入黑名单。`,
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || '拉黑好友失败，请稍后再试。',
    });
  }
}

async function handleUnblockFriend(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { friendUserId = '' } = readJsonBody(req);
    const normalizedFriendUserId = String(friendUserId).trim();

    if (!normalizedFriendUserId) {
      buildJsonResponse(res, 400, { error: '缺少好友用户 ID' });
      return;
    }

    const relationship = await findExistingRelationship(adminClient, user.id, normalizedFriendUserId);

    if (
      !relationship ||
      relationship.status !== 'blocked' ||
      relationship.requester_user_id !== user.id ||
      relationship.target_user_id !== normalizedFriendUserId
    ) {
      buildJsonResponse(res, 404, { error: '没有找到可解除的黑名单关系' });
      return;
    }

    const { error: updateError } = await adminClient
      .from('user_relationships')
      .update({ status: 'accepted' })
      .eq('id', relationship.id);

    if (updateError) {
      throw new Error(`恢复好友关系失败：${updateError.message}`);
    }

    buildJsonResponse(res, 200, {
      success: true,
      message: '已将该用户移出黑名单，并恢复为好友。',
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || '移出黑名单失败，请稍后再试。',
    });
  }
}

async function handleRespondFriendRequest(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { requestId = '', decision = '' } = readJsonBody(req);
    const normalizedDecision = String(decision).trim().toLowerCase();

    if (!requestId) {
      buildJsonResponse(res, 400, { error: '缺少好友请求 ID' });
      return;
    }

    if (!['accepted', 'rejected'].includes(normalizedDecision)) {
      buildJsonResponse(res, 400, { error: '好友请求处理结果无效' });
      return;
    }

    const { data: relationship, error: relationshipError } = await adminClient
      .from('user_relationships')
      .select('id, requester_user_id, target_user_id, status')
      .eq('id', requestId)
      .limit(1)
      .maybeSingle();

    if (relationshipError) {
      throw new Error(`读取好友请求失败：${relationshipError.message}`);
    }

    if (!relationship || relationship.target_user_id !== user.id) {
      buildJsonResponse(res, 404, { error: '没有找到可处理的好友请求' });
      return;
    }

    if (relationship.status !== 'pending') {
      buildJsonResponse(res, 400, { error: '该好友请求已处理，请刷新页面后重试' });
      return;
    }

    const { error: updateError } = await adminClient
      .from('user_relationships')
      .update({ status: normalizedDecision })
      .eq('id', requestId);

    if (updateError) {
      throw new Error(`更新好友请求状态失败：${updateError.message}`);
    }

    buildJsonResponse(res, 200, {
      success: true,
      decision: normalizedDecision,
      message:
        normalizedDecision === 'accepted'
          ? '已接受该好友请求，对方现在会出现在你的好友列表中。'
          : '已拒绝该好友请求。',
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || '处理好友请求失败，请稍后再试。',
    });
  }
}

function buildSharingOverview(friendIds, permissions, liveLocation) {
  const activePermissions = (permissions || []).filter((item) => item.is_active);
  const normalizedLiveLocation = normalizeLiveLocationRow(liveLocation);

  return {
    totalFriends: friendIds.length,
    activeFriendCount: activePermissions.length,
    sharingMode:
      activePermissions.length === 0
        ? 'off'
        : activePermissions.length === friendIds.length
          ? 'all'
          : 'partial',
    lastLocationUpdatedAt: normalizedLiveLocation?.updatedAt || null,
    isOnline: Boolean(normalizedLiveLocation?.isOnline),
  };
}

async function handleFriendLocation(req, res) {
  if (!requirePostMethod(req, res)) {
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { friendUserId = '' } = readJsonBody(req);
    const normalizedFriendUserId = String(friendUserId).trim();

    if (!normalizedFriendUserId) {
      buildJsonResponse(res, 400, { error: '缺少好友用户 ID' });
      return;
    }

    const relationship = await findExistingRelationship(adminClient, user.id, normalizedFriendUserId);

    if (!relationship || relationship.status !== 'accepted') {
      buildJsonResponse(res, 404, { error: '没有找到可查看定位的好友关系' });
      return;
    }

    const [profile, permissions, locations] = await Promise.all([
      findProfileById(adminClient, normalizedFriendUserId),
      loadLocationPermissions(adminClient, user.id, [normalizedFriendUserId]),
      loadLiveLocations(adminClient, [normalizedFriendUserId]),
    ]);

    if (!profile) {
      buildJsonResponse(res, 404, { error: '没有找到该好友' });
      return;
    }

    const friend = buildFriendSummary(
      profile,
      (permissions || [])[0] || null,
      (locations || [])[0] || null,
      relationship.updated_at || null,
    );

    if (!friend.isLocationSharingEnabled) {
      buildJsonResponse(res, 403, { error: '对方暂未开放位置共享' });
      return;
    }

    if (!isFiniteCoordinate(friend.latitude) || !isFiniteCoordinate(friend.longitude)) {
      buildJsonResponse(res, 404, { error: '暂时没有可展示的定位数据' });
      return;
    }

    buildJsonResponse(res, 200, {
      success: true,
      friend,
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || '读取好友定位失败，请稍后再试。',
    });
  }
}

async function handleLocationSharing(req, res) {
  if (!requirePostMethod(req, res)) {
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { isActive } = readJsonBody(req);
    const friendIds = [...new Set(await loadAcceptedFriendIds(adminClient, user.id))];

    if (typeof isActive === 'boolean') {
      if (isActive) {
        if (friendIds.length) {
          const now = new Date().toISOString();
          const rows = friendIds.map((viewerUserId) => ({
            owner_user_id: user.id,
            viewer_user_id: viewerUserId,
            is_active: true,
            granted_at: now,
            revoked_at: null,
          }));

          const { error } = await adminClient
            .from('location_share_permissions')
            .upsert(rows, {
              onConflict: 'owner_user_id,viewer_user_id',
            });

          if (error) {
            if (isMissingRelationError(error)) {
              throw new Error('缺少 location_share_permissions 表，请先检查数据库初始化。');
            }

            throw new Error(`开启位置共享失败：${error.message}`);
          }
        }
      } else if (friendIds.length) {
        const { error } = await adminClient
          .from('location_share_permissions')
          .update({
            is_active: false,
            revoked_at: new Date().toISOString(),
          })
          .eq('owner_user_id', user.id)
          .in('viewer_user_id', friendIds);

        if (error) {
          if (isMissingRelationError(error)) {
            throw new Error('缺少 location_share_permissions 表，请先检查数据库初始化。');
          }

          throw new Error(`关闭位置共享失败：${error.message}`);
        }
      }
    }

    const [permissions, liveLocation] = await Promise.all([
      loadOwnerLocationPermissions(adminClient, user.id, friendIds),
      loadSingleLiveLocation(adminClient, user.id),
    ]);

    buildJsonResponse(res, 200, {
      success: true,
      overview: buildSharingOverview(friendIds, permissions, liveLocation),
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || '读取位置共享状态失败，请稍后再试。',
    });
  }
}

async function handleUpdateFriendLocation(req, res) {
  if (!requirePostMethod(req, res)) {
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const {
      latitude = null,
      longitude = null,
      accuracyMeters = null,
    } = readJsonBody(req);

    const normalizedLatitude = normalizeCoordinate(latitude);
    const normalizedLongitude = normalizeCoordinate(longitude);
    const normalizedAccuracy = accuracyMeters === null ? null : normalizeCoordinate(accuracyMeters);

    if (normalizedLatitude === null || normalizedLongitude === null) {
      buildJsonResponse(res, 400, { error: '缺少有效的定位坐标' });
      return;
    }

    if (normalizedLatitude < -90 || normalizedLatitude > 90) {
      buildJsonResponse(res, 400, { error: '纬度超出有效范围' });
      return;
    }

    if (normalizedLongitude < -180 || normalizedLongitude > 180) {
      buildJsonResponse(res, 400, { error: '经度超出有效范围' });
      return;
    }

    if (accuracyMeters !== null && (normalizedAccuracy === null || normalizedAccuracy < 0)) {
      buildJsonResponse(res, 400, { error: '定位精度无效' });
      return;
    }

    const updatedAt = new Date().toISOString();
    const { error } = await adminClient
      .from('user_live_locations')
      .upsert({
        user_id: user.id,
        latitude: normalizedLatitude,
        longitude: normalizedLongitude,
        accuracy_meters: normalizedAccuracy,
        is_online: true,
        updated_at: updatedAt,
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      if (isMissingRelationError(error)) {
        throw new Error('缺少 user_live_locations 表，请先执行 `database/003_user_live_location.sql`。');
      }

      throw new Error(`更新当前位置失败：${error.message}`);
    }

    buildJsonResponse(res, 200, {
      success: true,
      updatedAt,
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || '更新当前位置失败，请稍后再试。',
    });
  }
}

function resolveFriendAction(req) {
  const requestUrl = new URL(req.url || '/', 'http://localhost');
  const queryAction = requestUrl.searchParams.get('action');

  if (queryAction) {
    return queryAction;
  }

  const pathnameParts = requestUrl.pathname.split('/').filter(Boolean);
  return pathnameParts[pathnameParts.length - 1] || '';
}

const friendActionHandlers = {
  add: handleAddFriend,
  block: handleBlockFriend,
  'blocked-list': handleBlockedFriendList,
  list: handleFriendList,
  location: handleFriendLocation,
  'location-sharing': handleLocationSharing,
  'pending-list': handlePendingFriendList,
  remove: handleRemoveFriend,
  respond: handleRespondFriendRequest,
  unblock: handleUnblockFriend,
  'update-location': handleUpdateFriendLocation,
};

export default async function friendHandler(req, res) {
  const action = resolveFriendAction(req);
  const routeHandler = friendActionHandlers[action];

  if (!routeHandler) {
    buildJsonResponse(res, 404, { error: 'Friend route not found' });
    return;
  }

  await routeHandler(req, res);
}

export const friendHandlers = {
  '/api/friends/add': handleAddFriend,
  '/api/friends/block': handleBlockFriend,
  '/api/friends/blocked-list': handleBlockedFriendList,
  '/api/friends/list': handleFriendList,
  '/api/friends/location': handleFriendLocation,
  '/api/friends/location-sharing': handleLocationSharing,
  '/api/friends/pending-list': handlePendingFriendList,
  '/api/friends/remove': handleRemoveFriend,
  '/api/friends/respond': handleRespondFriendRequest,
  '/api/friends/unblock': handleUnblockFriend,
  '/api/friends/update-location': handleUpdateFriendLocation,
};
