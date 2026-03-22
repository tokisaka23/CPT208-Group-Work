import {
  buildJsonResponse,
  getAuthenticatedUser,
  readJsonBody,
} from './supabase.js';

const ERROR_METHOD_NOT_ALLOWED = 'Method Not Allowed';
const ERROR_MISSING_GROUP_MEMBERS = '\u8bf7\u81f3\u5c11\u9009\u62e9 1 \u4f4d\u597d\u53cb';
const ERROR_GROUP_MEMBERS_INVALID = '\u6240\u9009\u6210\u5458\u4e2d\u5305\u542b\u975e\u597d\u53cb\u7528\u6237\uff0c\u65e0\u6cd5\u5b8c\u6210\u7fa4\u6210\u5458\u64cd\u4f5c';
const ERROR_GROUP_MEMBER_NOT_FOUND = '\u90e8\u5206\u7fa4\u6210\u5458\u4e0d\u5b58\u5728\uff0c\u8bf7\u5237\u65b0\u540e\u91cd\u8bd5';
const ERROR_GROUP_CREATE_FAILED = '\u521b\u5efa\u7fa4\u804a\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5';
const ERROR_GROUP_LIST_FAILED = '\u8bfb\u53d6\u7fa4\u804a\u5217\u8868\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5';
const ERROR_GROUP_MESSAGE_LIST_FAILED = '\u8bfb\u53d6\u7fa4\u804a\u6d88\u606f\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5';
const ERROR_GROUP_SEND_FAILED = '\u53d1\u9001\u7fa4\u6d88\u606f\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5';
const ERROR_GROUP_ADD_MEMBERS_FAILED = '\u9080\u8bf7\u597d\u53cb\u5165\u7fa4\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5';
const ERROR_GROUP_REMOVE_MEMBER_FAILED = '\u79fb\u51fa\u7fa4\u6210\u5458\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5';
const ERROR_GROUP_EXIT_FAILED = '\u9000\u51fa\u7fa4\u804a\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5';
const ERROR_GROUP_RENAME_FAILED = '\u4fee\u6539\u7fa4\u540d\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5';
const DEFAULT_GROUP_SUFFIX = '\u7684\u7fa4\u804a';
const IDEOGRAPHIC_COMMA = '\u3001';
const DEFAULT_UNKNOWN_USER = '\u672a\u547d\u540d\u7528\u6237';
const ERROR_GROUP_NOT_FOUND = '\u7fa4\u804a\u4e0d\u5b58\u5728\u6216\u4f60\u65e0\u6743\u8bbf\u95ee';
const ERROR_MESSAGE_EMPTY = '\u8bf7\u8f93\u5165\u6d88\u606f\u5185\u5bb9';
const ERROR_GROUP_NAME_EMPTY = '\u8bf7\u8f93\u5165\u7fa4\u804a\u540d\u79f0';
const ERROR_GROUP_OWNER_REQUIRED = '\u53ea\u6709\u7fa4\u4e3b\u53ef\u4ee5\u7ba1\u7406\u7fa4\u6210\u5458';
const ERROR_GROUP_MEMBER_REQUIRED = '\u8bf7\u9009\u62e9\u8981\u79fb\u51fa\u7684\u7fa4\u6210\u5458';
const ERROR_GROUP_OWNER_CANNOT_BE_REMOVED = '\u7fa4\u4e3b\u4e0d\u80fd\u88ab\u79fb\u51fa\u7fa4\u804a';
const ERROR_GROUP_OWNER_CANNOT_EXIT = '\u7fa4\u4e3b\u6682\u4e0d\u652f\u6301\u76f4\u63a5\u9000\u51fa\u7fa4\u804a';

function normalizeMemberIds(memberIds) {
  return [...new Set((memberIds || []).map((item) => String(item || '').trim()).filter(Boolean))];
}

function sortMembers(list) {
  return [...list].sort((left, right) => {
    if (left.isCreator !== right.isCreator) {
      return Number(right.isCreator) - Number(left.isCreator);
    }

    return String(left.username || '').localeCompare(String(right.username || ''), 'zh-CN');
  });
}

async function findProfileById(adminClient, userId) {
  const { data, error } = await adminClient
    .from('user_profiles')
    .select('id, username, display_name, friend_code, auth_email')
    .eq('id', userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to read user profile: ${error.message}`);
  }

  return data;
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
    throw new Error(`Failed to read accepted friends: ${requestedResult.error.message}`);
  }

  if (targetedResult.error) {
    throw new Error(`Failed to read accepted friends: ${targetedResult.error.message}`);
  }

  return new Set([
    ...(requestedResult.data || []).map((item) => item.target_user_id),
    ...(targetedResult.data || []).map((item) => item.requester_user_id),
  ]);
}

async function loadProfilesByIds(adminClient, userIds) {
  if (!userIds.length) {
    return [];
  }

  const { data, error } = await adminClient
    .from('user_profiles')
    .select('id, username, display_name, friend_code, auth_email')
    .in('id', userIds);

  if (error) {
    throw new Error(`Failed to read group member profiles: ${error.message}`);
  }

  return data || [];
}

async function isGroupMember(adminClient, groupId, userId) {
  const membership = await loadGroupMembership(adminClient, groupId, userId);
  return Boolean(membership);
}

async function loadGroupMembership(adminClient, groupId, userId) {
  const { data, error } = await adminClient
    .from('group_chat_members')
    .select('id, role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to check group membership: ${error.message}`);
  }

  return data || null;
}

async function loadGroupMemberRows(adminClient, groupId) {
  const { data, error } = await adminClient
    .from('group_chat_members')
    .select('group_id, user_id, role')
    .eq('group_id', groupId);

  if (error) {
    throw new Error(`Failed to read group members: ${error.message}`);
  }

  return data || [];
}

function buildResolvedUsername(profile) {
  return profile?.display_name || profile?.username || DEFAULT_UNKNOWN_USER;
}

function buildDefaultGroupName(creatorProfile, selectedProfiles) {
  const memberNames = selectedProfiles
    .slice(0, 2)
    .map((profile) => buildResolvedUsername(profile))
    .filter(Boolean);

  return [buildResolvedUsername(creatorProfile), ...memberNames].join(IDEOGRAPHIC_COMMA) + DEFAULT_GROUP_SUFFIX;
}

async function loadGroupSummariesByIds(adminClient, groupIds) {
  const normalizedGroupIds = [...new Set((groupIds || []).map((item) => String(item || '').trim()).filter(Boolean))];

  if (!normalizedGroupIds.length) {
    return [];
  }

  const [groupsResult, membersResult, messageResult] = await Promise.all([
    adminClient
      .from('group_chats')
      .select('id, name, creator_user_id, created_at')
      .in('id', normalizedGroupIds)
      .order('created_at', { ascending: false }),
    adminClient
      .from('group_chat_members')
      .select('group_id, user_id, role')
      .in('group_id', normalizedGroupIds),
    adminClient
      .from('group_chat_messages')
      .select('group_id, sender_user_id, created_at')
      .in('group_id', normalizedGroupIds)
      .order('created_at', { ascending: false }),
  ]);

  if (groupsResult.error) {
    throw new Error(`Failed to read group chats: ${groupsResult.error.message}`);
  }

  if (membersResult.error) {
    throw new Error(`Failed to read group members: ${membersResult.error.message}`);
  }

  if (messageResult.error) {
    throw new Error(`Failed to read group messages: ${messageResult.error.message}`);
  }

  const memberRows = membersResult.data || [];
  const latestMessageMap = new Map();
  const memberIds = [...new Set(memberRows.map((item) => item.user_id))];
  const profiles = await loadProfilesByIds(adminClient, memberIds);
  const profileMap = new Map(profiles.map((item) => [item.id, item]));
  const memberMap = new Map();

  (messageResult.data || []).forEach((item) => {
    if (!item?.group_id || latestMessageMap.has(item.group_id)) {
      return;
    }

    latestMessageMap.set(item.group_id, {
      latestMessageAt: item.created_at,
      latestMessageSenderUserId: item.sender_user_id,
    });
  });

  memberRows.forEach((item) => {
    const profile = profileMap.get(item.user_id);

    if (!profile) {
      return;
    }

    if (!memberMap.has(item.group_id)) {
      memberMap.set(item.group_id, []);
    }

    memberMap.get(item.group_id).push({
      id: profile.id,
      username: buildResolvedUsername(profile),
      friendCode: profile.friend_code || '',
      email: profile.auth_email || '',
      isCreator: item.role === 'owner',
    });
  });

  return (groupsResult.data || []).map((group) => ({
    id: group.id,
    name: group.name,
    creatorUserId: group.creator_user_id,
    createdAt: group.created_at,
    latestMessageAt: latestMessageMap.get(group.id)?.latestMessageAt || '',
    latestMessageSenderUserId: latestMessageMap.get(group.id)?.latestMessageSenderUserId || '',
    members: sortMembers(memberMap.get(group.id) || []),
  }));
}

async function loadGroupSummariesForUser(adminClient, userId) {
  const { data: memberships, error: membershipError } = await adminClient
    .from('group_chat_members')
    .select('group_id')
    .eq('user_id', userId);

  if (membershipError) {
    throw new Error(`Failed to read group memberships: ${membershipError.message}`);
  }

  return loadGroupSummariesByIds(
    adminClient,
    (memberships || []).map((item) => item.group_id),
  );
}

async function loadGroupSummaryById(adminClient, groupId) {
  const groups = await loadGroupSummariesByIds(adminClient, [groupId]);
  return groups[0] || null;
}

async function loadGroupMessages(adminClient, groupId) {
  const { data, error } = await adminClient
    .from('group_chat_messages')
    .select('id, group_id, sender_user_id, content, created_at')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to read group messages: ${error.message}`);
  }

  const senderIds = [...new Set((data || []).map((item) => item.sender_user_id))];
  const profiles = await loadProfilesByIds(adminClient, senderIds);
  const profileMap = new Map(profiles.map((item) => [item.id, item]));

  return (data || []).map((item) => {
    const senderProfile = profileMap.get(item.sender_user_id);

    return {
      id: item.id,
      groupId: item.group_id,
      senderUserId: item.sender_user_id,
      senderName: buildResolvedUsername(senderProfile),
      content: item.content,
      createdAt: item.created_at,
    };
  });
}

async function handleCreateGroup(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: ERROR_METHOD_NOT_ALLOWED });
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { groupName = '', memberIds = [] } = readJsonBody(req);
    const normalizedMemberIds = normalizeMemberIds(memberIds).filter((item) => item !== user.id);

    if (!normalizedMemberIds.length) {
      buildJsonResponse(res, 400, { error: ERROR_MISSING_GROUP_MEMBERS });
      return;
    }

    const acceptedFriendIds = await loadAcceptedFriendIds(adminClient, user.id);

    if (normalizedMemberIds.some((memberId) => !acceptedFriendIds.has(memberId))) {
      buildJsonResponse(res, 400, { error: ERROR_GROUP_MEMBERS_INVALID });
      return;
    }

    const creatorProfile = await findProfileById(adminClient, user.id);
    const selectedProfiles = await loadProfilesByIds(adminClient, normalizedMemberIds);

    if (selectedProfiles.length !== normalizedMemberIds.length) {
      buildJsonResponse(res, 404, { error: ERROR_GROUP_MEMBER_NOT_FOUND });
      return;
    }

    const resolvedGroupName = String(groupName || '').trim() || buildDefaultGroupName(creatorProfile, selectedProfiles);
    const { data: insertedGroup, error: groupInsertError } = await adminClient
      .from('group_chats')
      .insert({
        creator_user_id: user.id,
        name: resolvedGroupName.slice(0, 50),
      })
      .select('id, name, creator_user_id, created_at')
      .limit(1)
      .maybeSingle();

    if (groupInsertError || !insertedGroup) {
      throw new Error(groupInsertError?.message || 'Failed to insert group chat');
    }

    const membershipRows = [
      {
        group_id: insertedGroup.id,
        user_id: user.id,
        role: 'owner',
      },
      ...normalizedMemberIds.map((memberId) => ({
        group_id: insertedGroup.id,
        user_id: memberId,
        role: 'member',
      })),
    ];

    const { error: memberInsertError } = await adminClient
      .from('group_chat_members')
      .insert(membershipRows);

    if (memberInsertError) {
      await adminClient.from('group_chats').delete().eq('id', insertedGroup.id);
      throw new Error(`Failed to insert group members: ${memberInsertError.message}`);
    }

    const createdGroup = await loadGroupSummaryById(adminClient, insertedGroup.id);

    buildJsonResponse(res, 200, {
      success: true,
      message: '\u7fa4\u804a\u5df2\u521b\u5efa',
      group: createdGroup,
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || ERROR_GROUP_CREATE_FAILED,
    });
  }
}

async function handleGroupList(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: ERROR_METHOD_NOT_ALLOWED });
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const groups = await loadGroupSummariesForUser(adminClient, user.id);

    buildJsonResponse(res, 200, {
      success: true,
      groups,
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || ERROR_GROUP_LIST_FAILED,
    });
  }
}

async function handleGroupMessages(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: ERROR_METHOD_NOT_ALLOWED });
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { groupId = '' } = readJsonBody(req);
    const normalizedGroupId = String(groupId || '').trim();

    if (!normalizedGroupId || !(await isGroupMember(adminClient, normalizedGroupId, user.id))) {
      buildJsonResponse(res, 404, { error: ERROR_GROUP_NOT_FOUND });
      return;
    }

    const messages = await loadGroupMessages(adminClient, normalizedGroupId);

    buildJsonResponse(res, 200, {
      success: true,
      messages,
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || ERROR_GROUP_MESSAGE_LIST_FAILED,
    });
  }
}

async function handleSendGroupMessage(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: ERROR_METHOD_NOT_ALLOWED });
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { groupId = '', content = '' } = readJsonBody(req);
    const normalizedGroupId = String(groupId || '').trim();
    const normalizedContent = String(content || '').trim();

    if (!normalizedGroupId || !(await isGroupMember(adminClient, normalizedGroupId, user.id))) {
      buildJsonResponse(res, 404, { error: ERROR_GROUP_NOT_FOUND });
      return;
    }

    if (!normalizedContent) {
      buildJsonResponse(res, 400, { error: ERROR_MESSAGE_EMPTY });
      return;
    }

    const { data: insertedMessage, error: insertError } = await adminClient
      .from('group_chat_messages')
      .insert({
        group_id: normalizedGroupId,
        sender_user_id: user.id,
        content: normalizedContent.slice(0, 1000),
      })
      .select('id, group_id, sender_user_id, content, created_at')
      .limit(1)
      .maybeSingle();

    if (insertError || !insertedMessage) {
      throw new Error(insertError?.message || 'Failed to insert group message');
    }

    const senderProfile = await findProfileById(adminClient, user.id);

    buildJsonResponse(res, 200, {
      success: true,
      message: {
        id: insertedMessage.id,
        groupId: insertedMessage.group_id,
        senderUserId: insertedMessage.sender_user_id,
        senderName: buildResolvedUsername(senderProfile),
        content: insertedMessage.content,
        createdAt: insertedMessage.created_at,
      },
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || ERROR_GROUP_SEND_FAILED,
    });
  }
}

async function handleAddGroupMembers(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: ERROR_METHOD_NOT_ALLOWED });
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { groupId = '', memberIds = [] } = readJsonBody(req);
    const normalizedGroupId = String(groupId || '').trim();
    const membership = normalizedGroupId
      ? await loadGroupMembership(adminClient, normalizedGroupId, user.id)
      : null;

    if (!normalizedGroupId || !membership) {
      buildJsonResponse(res, 404, { error: ERROR_GROUP_NOT_FOUND });
      return;
    }

    const normalizedMemberIds = normalizeMemberIds(memberIds).filter((item) => item !== user.id);

    if (!normalizedMemberIds.length) {
      buildJsonResponse(res, 400, { error: ERROR_MISSING_GROUP_MEMBERS });
      return;
    }

    const acceptedFriendIds = await loadAcceptedFriendIds(adminClient, user.id);

    if (normalizedMemberIds.some((memberId) => !acceptedFriendIds.has(memberId))) {
      buildJsonResponse(res, 400, { error: ERROR_GROUP_MEMBERS_INVALID });
      return;
    }

    const currentMemberRows = await loadGroupMemberRows(adminClient, normalizedGroupId);
    const currentMemberIds = new Set(currentMemberRows.map((item) => item.user_id));
    const memberIdsToAdd = normalizedMemberIds.filter((memberId) => !currentMemberIds.has(memberId));

    if (!memberIdsToAdd.length) {
      buildJsonResponse(res, 200, {
        success: true,
        message: '\u6ca1\u6709\u65b0\u7684\u597d\u53cb\u9700\u8981\u52a0\u5165',
        group: await loadGroupSummaryById(adminClient, normalizedGroupId),
      });
      return;
    }

    const selectedProfiles = await loadProfilesByIds(adminClient, memberIdsToAdd);

    if (selectedProfiles.length !== memberIdsToAdd.length) {
      buildJsonResponse(res, 404, { error: ERROR_GROUP_MEMBER_NOT_FOUND });
      return;
    }

    const { error: memberInsertError } = await adminClient
      .from('group_chat_members')
      .insert(
        memberIdsToAdd.map((memberId) => ({
          group_id: normalizedGroupId,
          user_id: memberId,
          role: 'member',
        })),
      );

    if (memberInsertError) {
      throw new Error(`Failed to insert group members: ${memberInsertError.message}`);
    }

    buildJsonResponse(res, 200, {
      success: true,
      message: '\u5df2\u9080\u8bf7\u597d\u53cb\u5165\u7fa4',
      group: await loadGroupSummaryById(adminClient, normalizedGroupId),
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || ERROR_GROUP_ADD_MEMBERS_FAILED,
    });
  }
}

async function handleRemoveGroupMember(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: ERROR_METHOD_NOT_ALLOWED });
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { groupId = '', memberId = '' } = readJsonBody(req);
    const normalizedGroupId = String(groupId || '').trim();
    const normalizedMemberId = String(memberId || '').trim();
    const ownerMembership = normalizedGroupId
      ? await loadGroupMembership(adminClient, normalizedGroupId, user.id)
      : null;

    if (!normalizedGroupId || !ownerMembership) {
      buildJsonResponse(res, 404, { error: ERROR_GROUP_NOT_FOUND });
      return;
    }

    if (ownerMembership.role !== 'owner') {
      buildJsonResponse(res, 403, { error: ERROR_GROUP_OWNER_REQUIRED });
      return;
    }

    if (!normalizedMemberId) {
      buildJsonResponse(res, 400, { error: ERROR_GROUP_MEMBER_REQUIRED });
      return;
    }

    if (normalizedMemberId === user.id) {
      buildJsonResponse(res, 400, { error: ERROR_GROUP_OWNER_CANNOT_BE_REMOVED });
      return;
    }

    const targetMembership = await loadGroupMembership(adminClient, normalizedGroupId, normalizedMemberId);

    if (!targetMembership) {
      buildJsonResponse(res, 404, { error: ERROR_GROUP_MEMBER_NOT_FOUND });
      return;
    }

    if (targetMembership.role === 'owner') {
      buildJsonResponse(res, 400, { error: ERROR_GROUP_OWNER_CANNOT_BE_REMOVED });
      return;
    }

    const { error: deleteError } = await adminClient
      .from('group_chat_members')
      .delete()
      .eq('group_id', normalizedGroupId)
      .eq('user_id', normalizedMemberId);

    if (deleteError) {
      throw new Error(`Failed to delete group member: ${deleteError.message}`);
    }

    buildJsonResponse(res, 200, {
      success: true,
      message: '\u5df2\u5c06\u6210\u5458\u79fb\u51fa\u7fa4\u804a',
      group: await loadGroupSummaryById(adminClient, normalizedGroupId),
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || ERROR_GROUP_REMOVE_MEMBER_FAILED,
    });
  }
}

async function handleExitGroup(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: ERROR_METHOD_NOT_ALLOWED });
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { groupId = '' } = readJsonBody(req);
    const normalizedGroupId = String(groupId || '').trim();
    const membership = normalizedGroupId
      ? await loadGroupMembership(adminClient, normalizedGroupId, user.id)
      : null;

    if (!normalizedGroupId || !membership) {
      buildJsonResponse(res, 404, { error: ERROR_GROUP_NOT_FOUND });
      return;
    }

    if (membership.role === 'owner') {
      buildJsonResponse(res, 400, { error: ERROR_GROUP_OWNER_CANNOT_EXIT });
      return;
    }

    const { error: deleteError } = await adminClient
      .from('group_chat_members')
      .delete()
      .eq('group_id', normalizedGroupId)
      .eq('user_id', user.id);

    if (deleteError) {
      throw new Error(`Failed to exit group: ${deleteError.message}`);
    }

    buildJsonResponse(res, 200, {
      success: true,
      message: '\u4f60\u5df2\u9000\u51fa\u7fa4\u804a',
      groupId: normalizedGroupId,
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || ERROR_GROUP_EXIT_FAILED,
    });
  }
}

async function handleRenameGroup(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: ERROR_METHOD_NOT_ALLOWED });
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { groupId = '', groupName = '' } = readJsonBody(req);
    const normalizedGroupId = String(groupId || '').trim();
    const normalizedGroupName = String(groupName || '').trim();
    const ownerMembership = normalizedGroupId
      ? await loadGroupMembership(adminClient, normalizedGroupId, user.id)
      : null;

    if (!normalizedGroupId || !ownerMembership) {
      buildJsonResponse(res, 404, { error: ERROR_GROUP_NOT_FOUND });
      return;
    }

    if (ownerMembership.role !== 'owner') {
      buildJsonResponse(res, 403, { error: ERROR_GROUP_OWNER_REQUIRED });
      return;
    }

    if (!normalizedGroupName) {
      buildJsonResponse(res, 400, { error: ERROR_GROUP_NAME_EMPTY });
      return;
    }

    const { error: updateError } = await adminClient
      .from('group_chats')
      .update({
        name: normalizedGroupName.slice(0, 50),
      })
      .eq('id', normalizedGroupId);

    if (updateError) {
      throw new Error(`Failed to rename group: ${updateError.message}`);
    }

    buildJsonResponse(res, 200, {
      success: true,
      message: '\u7fa4\u540d\u5df2\u66f4\u65b0',
      group: await loadGroupSummaryById(adminClient, normalizedGroupId),
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || ERROR_GROUP_RENAME_FAILED,
    });
  }
}

function resolveGroupAction(req) {
  const requestUrl = new URL(req.url || '/', 'http://localhost');
  const queryAction = requestUrl.searchParams.get('action');

  if (queryAction) {
    return queryAction;
  }

  const pathnameParts = requestUrl.pathname.split('/').filter(Boolean);
  return pathnameParts[pathnameParts.length - 1] || '';
}

const groupActionHandlers = {
  create: handleCreateGroup,
  list: handleGroupList,
  messages: handleGroupMessages,
  send: handleSendGroupMessage,
  'add-members': handleAddGroupMembers,
  'remove-member': handleRemoveGroupMember,
  exit: handleExitGroup,
  rename: handleRenameGroup,
};

export default async function groupHandler(req, res) {
  const action = resolveGroupAction(req);
  const routeHandler = groupActionHandlers[action];

  if (!routeHandler) {
    buildJsonResponse(res, 404, { error: 'Group route not found' });
    return;
  }

  await routeHandler(req, res);
}

export const groupHandlers = {
  '/api/groups/create': handleCreateGroup,
  '/api/groups/list': handleGroupList,
  '/api/groups/messages': handleGroupMessages,
  '/api/groups/send': handleSendGroupMessage,
  '/api/groups/add-members': handleAddGroupMembers,
  '/api/groups/remove-member': handleRemoveGroupMember,
  '/api/groups/exit': handleExitGroup,
  '/api/groups/rename': handleRenameGroup,
};
