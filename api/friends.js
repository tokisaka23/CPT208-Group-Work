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
    if (
      error.code === '42P01' ||
      error.code === 'PGRST205' ||
      error.message?.includes('relation') ||
      error.message?.includes('does not exist') ||
      error.message?.includes('schema cache') ||
      error.message?.includes('Could not find the table')
    ) {
      return [];
    }

    throw new Error(`读取位置共享状态失败：${error.message}`);
  }

  return data || [];
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

    const permissions = await loadLocationPermissions(adminClient, user.id, friendIds);
    const permissionMap = new Map((permissions || []).map((item) => [item.owner_user_id, item]));
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

    buildJsonResponse(res, 200, {
      success: true,
      friends: sortFriends(friends),
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
  list: handleFriendList,
  'pending-list': handlePendingFriendList,
  respond: handleRespondFriendRequest,
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
  '/api/friends/list': handleFriendList,
  '/api/friends/pending-list': handlePendingFriendList,
  '/api/friends/respond': handleRespondFriendRequest,
};
