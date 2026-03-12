import { createClient } from '@supabase/supabase-js';

function getAuthConfig() {
  return {
    supabaseUrl: process.env.FY_SUPABASE_URL || process.env.VITE_FY_SUPABASE_URL,
    serviceRoleKey: process.env.FY_SUPABASE_SERVICE_ROLE_KEY,
    anonKey: process.env.FY_SUPABASE_ANON_KEY || process.env.VITE_FY_SUPABASE_ANON_KEY,
  };
}

function ensureAuthConfig() {
  const config = getAuthConfig();

  if (!config.supabaseUrl || !config.serviceRoleKey || !config.anonKey) {
    throw new Error(
      '缺少 Supabase 环境变量，请在 .env.local 中配置 FY_SUPABASE_URL、FY_SUPABASE_SERVICE_ROLE_KEY 和 VITE_FY_SUPABASE_ANON_KEY。'
    );
  }

  return config;
}

function createAdminClient() {
  const { supabaseUrl, serviceRoleKey } = ensureAuthConfig();
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function createPublicClient() {
  const { supabaseUrl, anonKey } = ensureAuthConfig();
  return createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function readAccessToken(req) {
  const authorization = req.headers?.authorization || req.headers?.Authorization || '';

  if (!authorization.startsWith('Bearer ')) {
    throw new Error('缺少登录凭证，请重新登录后再试。');
  }

  return authorization.slice('Bearer '.length).trim();
}

async function verifyUserFromRequest(req) {
  const accessToken = readAccessToken(req);
  const publicClient = createPublicClient();
  const { data, error } = await publicClient.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new Error('登录状态已失效，请重新登录。');
  }

  return data.user;
}

async function findProfileByUserId(userId) {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('user_profiles')
    .select('id, username, display_name, friend_code')
    .eq('id', userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`查询当前用户资料失败：${error.message}`);
  }

  return data;
}

async function findProfileByFriendCode(friendCode) {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('user_profiles')
    .select('id, username, display_name, friend_code')
    .eq('friend_code', friendCode)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`查询好友码失败：${error.message}`);
  }

  return data;
}

async function findExistingRelationship(currentUserId, targetUserId) {
  const adminClient = createAdminClient();
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

async function loadLocationPermissions(currentUserId, friendIds) {
  if (!friendIds.length) {
    return [];
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('location_share_permissions')
    .select('owner_user_id, is_active, granted_at')
    .eq('viewer_user_id', currentUserId)
    .in('owner_user_id', friendIds);

  // 兼容当前数据库里还没有建位置授权表的情况。
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

async function estimateOnlineStatus(userId) {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.getUserById(userId);

  if (error || !data.user?.last_sign_in_at) {
    return false;
  }

  const lastSignInAt = new Date(data.user.last_sign_in_at).getTime();
  if (Number.isNaN(lastSignInAt)) {
    return false;
  }

  // 当前项目还没有实时在线系统，这里先用最近 10 分钟登录作为临时在线判断。
  return Date.now() - lastSignInAt <= 10 * 60 * 1000;
}

function buildFriendMap(profiles) {
  return new Map((profiles || []).map((item) => [item.id, item]));
}

export async function addFriendByCode(reqBody, req) {
  const authUser = await verifyUserFromRequest(req);
  const currentProfile = await findProfileByUserId(authUser.id);

  if (!currentProfile) {
    throw new Error('当前登录用户缺少 user_profiles 资料，请先检查数据库初始化。');
  }

  const friendCode = String(reqBody?.targetFriendCode || '').trim().toUpperCase();

  if (!friendCode) {
    throw new Error('请输入对方的好友码。');
  }

  if (friendCode === String(currentProfile.friend_code || '').toUpperCase()) {
    throw new Error('不能添加自己为好友。');
  }

  const targetProfile = await findProfileByFriendCode(friendCode);

  if (!targetProfile) {
    throw new Error('没有找到该好友码对应的用户。');
  }

  const existingRelationship = await findExistingRelationship(authUser.id, targetProfile.id);
  const adminClient = createAdminClient();

  if (existingRelationship?.status === 'accepted') {
    throw new Error('你们已经是好友了。');
  }

  if (existingRelationship) {
    const { error } = await adminClient
      .from('user_relationships')
      .update({ status: 'accepted' })
      .eq('id', existingRelationship.id);

    if (error) {
      throw new Error(`更新好友关系失败：${error.message}`);
    }
  } else {
    const { error } = await adminClient.from('user_relationships').insert({
      requester_user_id: authUser.id,
      target_user_id: targetProfile.id,
      status: 'accepted',
    });

    if (error) {
      throw new Error(`创建好友关系失败：${error.message}`);
    }
  }

  return {
    success: true,
    friend: {
      id: targetProfile.id,
      username: targetProfile.username || targetProfile.display_name || '未命名用户',
      friendCode: targetProfile.friend_code,
    },
    message: `已将 ${targetProfile.username || targetProfile.display_name || '该用户'} 添加为好友。`,
  };
}

export async function listFriends(req) {
  const authUser = await verifyUserFromRequest(req);
  const adminClient = createAdminClient();

  const [requestedResult, targetedResult] = await Promise.all([
    adminClient
      .from('user_relationships')
      .select('id, target_user_id, updated_at, status')
      .eq('requester_user_id', authUser.id)
      .eq('status', 'accepted'),
    adminClient
      .from('user_relationships')
      .select('id, requester_user_id, updated_at, status')
      .eq('target_user_id', authUser.id)
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
      relationshipId: item.id,
      friendId: item.target_user_id,
      updatedAt: item.updated_at,
    })),
    ...(targetedResult.data || []).map((item) => ({
      relationshipId: item.id,
      friendId: item.requester_user_id,
      updatedAt: item.updated_at,
    })),
  ];

  if (!relationshipRows.length) {
    return [];
  }

  const friendIds = [...new Set(relationshipRows.map((item) => item.friendId))];

  const { data: profiles, error: profileError } = await adminClient
    .from('user_profiles')
    .select('id, username, display_name, friend_code')
    .in('id', friendIds);

  if (profileError) {
    throw new Error(`读取好友资料失败：${profileError.message}`);
  }

  const permissions = await loadLocationPermissions(authUser.id, friendIds);
  const permissionMap = new Map((permissions || []).map((item) => [item.owner_user_id, item]));
  const profileMap = buildFriendMap(profiles);

  const onlineStates = await Promise.all(
    friendIds.map(async (friendId) => [friendId, await estimateOnlineStatus(friendId)])
  );
  const onlineMap = new Map(onlineStates);

  return relationshipRows
    .map((item) => {
      const profile = profileMap.get(item.friendId);

      if (!profile) {
        return null;
      }

      const permission = permissionMap.get(item.friendId);

      return {
        id: profile.id,
        username: profile.username || profile.display_name || '未命名用户',
        friendCode: profile.friend_code,
        isOnline: Boolean(onlineMap.get(item.friendId)),
        isLocationSharingEnabled: Boolean(permission?.is_active),
        latitude: null,
        longitude: null,
        updatedAt: permission?.granted_at || item.updatedAt,
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (left.isOnline !== right.isOnline) {
        return Number(right.isOnline) - Number(left.isOnline);
      }

      return left.username.localeCompare(right.username, 'zh-CN');
    });
}
