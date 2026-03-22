import { requestAuthorizedJson } from '../api';
import { isSupabaseConfigured } from '../supabase/clientRuntime';

const groupChatStorageKey = 'cpt208_mock_group_chats';
const groupMessageStorageKey = 'cpt208_mock_group_chat_messages';
const groupReadStateStorageKey = 'cpt208_group_chat_read_state_v1';
const IDEOGRAPHIC_COMMA = '\u3001';
const DEFAULT_GROUP_SUFFIX = '\u7684\u7fa4\u804a';
const ERROR_MISSING_CREATOR = '\u7f3a\u5c11\u5f53\u524d\u7528\u6237\u4fe1\u606f\uff0c\u6682\u65f6\u65e0\u6cd5\u521b\u5efa\u7fa4\u804a';
const ERROR_MISSING_MEMBERS = '\u8bf7\u81f3\u5c11\u9009\u62e9 1 \u4f4d\u597d\u53cb';
const DEFAULT_SELF_NAME = '\u6211';
const ERROR_MESSAGE_EMPTY = '\u8bf7\u8f93\u5165\u6d88\u606f\u5185\u5bb9';
const ERROR_GROUP_NOT_FOUND = '\u7fa4\u804a\u4e0d\u5b58\u5728';
const ERROR_GROUP_NAME_EMPTY = '\u8bf7\u8f93\u5165\u7fa4\u804a\u540d\u79f0';
const ERROR_GROUP_OWNER_REQUIRED = '\u53ea\u6709\u7fa4\u4e3b\u53ef\u4ee5\u7ba1\u7406\u7fa4\u6210\u5458';
const ERROR_GROUP_OWNER_CANNOT_EXIT = '\u7fa4\u4e3b\u6682\u4e0d\u652f\u6301\u76f4\u63a5\u9000\u51fa\u7fa4\u804a';

function sortMembers(members) {
  return [...(members || [])].sort((left, right) => {
    if (Boolean(left.isCreator) !== Boolean(right.isCreator)) {
      return Number(Boolean(right.isCreator)) - Number(Boolean(left.isCreator));
    }

    return String(left.username || '').localeCompare(String(right.username || ''), 'zh-CN');
  });
}

function wait(ms = 200) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function readStoredGroups() {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  try {
    const rawValue = storage.getItem(groupChatStorageKey);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function saveStoredGroups(groups) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(groupChatStorageKey, JSON.stringify(groups));
}

function readStoredMessages() {
  const storage = getStorage();

  if (!storage) {
    return {};
  }

  try {
    const rawValue = storage.getItem(groupMessageStorageKey);

    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : {};
  } catch {
    return {};
  }
}

function saveStoredMessages(messageMap) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(groupMessageStorageKey, JSON.stringify(messageMap));
}

function readStoredGroupReadState() {
  const storage = getStorage();

  if (!storage) {
    return {};
  }

  try {
    const rawValue = storage.getItem(groupReadStateStorageKey);

    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : {};
  } catch {
    return {};
  }
}

function saveStoredGroupReadState(readState) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(groupReadStateStorageKey, JSON.stringify(readState));
}

function getGroupOwnerId(group) {
  if (group?.creatorUserId) {
    return group.creatorUserId;
  }

  return (group?.members || []).find((member) => member.isCreator)?.id || '';
}

function sortGroups(groups) {
  return [...groups].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

function buildDefaultGroupName(creator, members) {
  const memberNames = members
    .slice(0, 2)
    .map((member) => member.username)
    .filter(Boolean);

  return [creator?.username, ...memberNames].filter(Boolean).join(IDEOGRAPHIC_COMMA) + DEFAULT_GROUP_SUFFIX;
}

function createGroupId() {
  return `group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createMessageId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeTimestamp(value) {
  const time = new Date(value || '').getTime();

  if (Number.isNaN(time)) {
    return '';
  }

  return new Date(time).toISOString();
}

function getLatestMessageMeta(messages) {
  return [...(messages || [])].reduce(
    (latestMeta, message) => {
      const createdAt = normalizeTimestamp(message?.createdAt);

      if (!createdAt) {
        return latestMeta;
      }

      if (!latestMeta.latestMessageAt || new Date(createdAt).getTime() > new Date(latestMeta.latestMessageAt).getTime()) {
        return {
          latestMessageAt: createdAt,
          latestMessageSenderUserId: String(message?.senderUserId || '').trim(),
        };
      }

      return latestMeta;
    },
    {
      latestMessageAt: '',
      latestMessageSenderUserId: '',
    },
  );
}

function attachLatestMessageMeta(groups, messageMap = {}) {
  return sortGroups(
    (groups || []).map((group) => {
      const localMeta = getLatestMessageMeta(messageMap?.[group.id] || []);

      return {
        ...group,
        latestMessageAt: localMeta.latestMessageAt || normalizeTimestamp(group?.latestMessageAt),
        latestMessageSenderUserId: localMeta.latestMessageSenderUserId || String(group?.latestMessageSenderUserId || '').trim(),
      };
    }),
  );
}

function getUserReadStateMap(currentUserId) {
  const normalizedCurrentUserId = String(currentUserId || '').trim();

  if (!normalizedCurrentUserId) {
    return {};
  }

  const readState = readStoredGroupReadState();
  const userReadState = readState[normalizedCurrentUserId];
  return userReadState && typeof userReadState === 'object' ? userReadState : {};
}

function hasUnreadGroupMessage(group, currentUserId, lastReadAt = '') {
  const normalizedCurrentUserId = String(currentUserId || '').trim();
  const latestMessageAt = normalizeTimestamp(group?.latestMessageAt);
  const latestMessageSenderUserId = String(group?.latestMessageSenderUserId || '').trim();
  const normalizedLastReadAt = normalizeTimestamp(lastReadAt);

  if (!normalizedCurrentUserId || !latestMessageAt) {
    return false;
  }

  if (latestMessageSenderUserId && latestMessageSenderUserId === normalizedCurrentUserId) {
    return false;
  }

  if (!normalizedLastReadAt) {
    return true;
  }

  return new Date(latestMessageAt).getTime() > new Date(normalizedLastReadAt).getTime();
}

function attachUnreadState(groups, currentUserId) {
  const readStateMap = getUserReadStateMap(currentUserId);

  return (groups || []).map((group) => ({
    ...group,
    hasUnread: hasUnreadGroupMessage(group, currentUserId, readStateMap[group.id]),
  }));
}

export function notifyGroupChatDataChanged() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent('group-chats-updated'));
}

export function markGroupChatAsRead({ currentUserId, groupId, readAt = '' }) {
  const normalizedCurrentUserId = String(currentUserId || '').trim();
  const normalizedGroupId = String(groupId || '').trim();

  if (!normalizedCurrentUserId || !normalizedGroupId) {
    return;
  }

  const nextReadAt = normalizeTimestamp(readAt) || new Date().toISOString();
  const readState = readStoredGroupReadState();
  const userReadState = {
    ...(readState[normalizedCurrentUserId] || {}),
  };
  const existingReadAt = normalizeTimestamp(userReadState[normalizedGroupId]);

  if (existingReadAt && new Date(existingReadAt).getTime() >= new Date(nextReadAt).getTime()) {
    return;
  }

  userReadState[normalizedGroupId] = nextReadAt;
  saveStoredGroupReadState({
    ...readState,
    [normalizedCurrentUserId]: userReadState,
  });
  notifyGroupChatDataChanged();
}

function clearGroupChatReadState({ currentUserId, groupId }) {
  const normalizedCurrentUserId = String(currentUserId || '').trim();
  const normalizedGroupId = String(groupId || '').trim();

  if (!normalizedCurrentUserId || !normalizedGroupId) {
    return;
  }

  const readState = readStoredGroupReadState();
  const userReadState = {
    ...(readState[normalizedCurrentUserId] || {}),
  };

  if (!(normalizedGroupId in userReadState)) {
    return;
  }

  delete userReadState[normalizedGroupId];
  saveStoredGroupReadState({
    ...readState,
    [normalizedCurrentUserId]: userReadState,
  });
}

export async function getGroupChats(options = {}) {
  const currentUserId = String(options?.currentUserId || '').trim();

  await wait(180);

  if (!isSupabaseConfigured()) {
    return attachUnreadState(
      attachLatestMessageMeta(readStoredGroups(), readStoredMessages()),
      currentUserId,
    );
  }

  const result = await requestAuthorizedJson('/api/groups/list');
  return attachUnreadState(sortGroups((result.groups || []).map(cloneGroup)), currentUserId);
}

export async function getGroupMessages(groupId) {
  const normalizedGroupId = String(groupId || '').trim();

  if (!normalizedGroupId) {
    return [];
  }

  await wait(120);

  if (!isSupabaseConfigured()) {
    return cloneMessages(readStoredMessages()[normalizedGroupId] || []);
  }

  const result = await requestAuthorizedJson('/api/groups/messages', {
    groupId: normalizedGroupId,
  });

  return cloneMessages(result.messages || []);
}

export async function sendGroupMessage({ groupId, sender, content }) {
  const normalizedGroupId = String(groupId || '').trim();
  const normalizedContent = String(content || '').trim();

  if (!normalizedContent) {
    throw new Error(ERROR_MESSAGE_EMPTY);
  }

  if (isSupabaseConfigured()) {
    const result = await requestAuthorizedJson('/api/groups/send', {
      groupId: normalizedGroupId,
      content: normalizedContent,
    });

    const nextMessage = cloneMessage(result.message || null);

    if (nextMessage && sender?.id) {
      markGroupChatAsRead({
        currentUserId: sender.id,
        groupId: normalizedGroupId,
        readAt: nextMessage.createdAt,
      });
    }

    return nextMessage;
  }

  if (!sender?.id) {
    throw new Error(ERROR_MISSING_CREATOR);
  }

  await wait(120);

  const nextMessage = {
    id: createMessageId(),
    groupId: normalizedGroupId,
    senderUserId: sender.id,
    senderName: sender.username || DEFAULT_SELF_NAME,
    content: normalizedContent,
    createdAt: new Date().toISOString(),
  };

  const storedMessages = readStoredMessages();
  const nextGroupMessages = [...(storedMessages[normalizedGroupId] || []), nextMessage];
  saveStoredMessages({
    ...storedMessages,
    [normalizedGroupId]: nextGroupMessages,
  });
  markGroupChatAsRead({
    currentUserId: sender.id,
    groupId: normalizedGroupId,
    readAt: nextMessage.createdAt,
  });

  return cloneMessage(nextMessage);
}

export async function createGroupChat({ creator, groupName, selectedFriends }) {
  if (!isSupabaseConfigured() && !creator?.id) {
    throw new Error(ERROR_MISSING_CREATOR);
  }

  if (!Array.isArray(selectedFriends) || !selectedFriends.length) {
    throw new Error(ERROR_MISSING_MEMBERS);
  }

  if (isSupabaseConfigured()) {
    const result = await requestAuthorizedJson('/api/groups/create', {
      groupName: String(groupName || '').trim(),
      memberIds: selectedFriends.map((friend) => friend.id),
    });

    notifyGroupChatDataChanged();
    return cloneGroup(result.group || null);
  }

  await wait(240);

  const members = [
    {
      id: creator.id,
      username: creator.username || DEFAULT_SELF_NAME,
      isCreator: true,
    },
    ...selectedFriends.map((friend) => ({
      id: friend.id,
      username: friend.username,
      friendCode: friend.friendCode,
      isCreator: false,
    })),
  ];

  const nextGroup = {
    id: createGroupId(),
    name: groupName || buildDefaultGroupName(creator, selectedFriends),
    creatorUserId: creator.id,
    createdAt: new Date().toISOString(),
    members: sortMembers(members),
  };

  const nextGroups = sortGroups([nextGroup, ...readStoredGroups()]);
  saveStoredGroups(nextGroups);
  notifyGroupChatDataChanged();
  return nextGroup;
}

export async function addGroupMembers({ groupId, currentUserId, selectedFriends }) {
  const normalizedGroupId = String(groupId || '').trim();
  const normalizedCurrentUserId = String(currentUserId || '').trim();
  const normalizedFriends = Array.isArray(selectedFriends) ? selectedFriends.filter((friend) => friend?.id) : [];

  if (!normalizedFriends.length) {
    throw new Error(ERROR_MISSING_MEMBERS);
  }

  if (isSupabaseConfigured()) {
    const result = await requestAuthorizedJson('/api/groups/add-members', {
      groupId: normalizedGroupId,
      memberIds: normalizedFriends.map((friend) => friend.id),
    });

    notifyGroupChatDataChanged();
    return cloneGroup(result.group || null);
  }

  await wait(180);

  const storedGroups = readStoredGroups();
  const targetGroup = storedGroups.find((group) => group.id === normalizedGroupId);

  if (!targetGroup) {
    throw new Error(ERROR_GROUP_NOT_FOUND);
  }

  const isCurrentUserMember = (targetGroup.members || []).some((member) => member.id === normalizedCurrentUserId);

  if (!isCurrentUserMember) {
    throw new Error(ERROR_GROUP_NOT_FOUND);
  }

  const existingIds = new Set((targetGroup.members || []).map((member) => member.id));
  const membersToAdd = normalizedFriends
    .filter((friend) => !existingIds.has(friend.id))
    .map((friend) => ({
      id: friend.id,
      username: friend.username,
      friendCode: friend.friendCode,
      isCreator: false,
    }));

  if (!membersToAdd.length) {
    return cloneGroup(targetGroup);
  }

  const nextGroup = {
    ...targetGroup,
    members: sortMembers([...(targetGroup.members || []), ...membersToAdd]),
  };

  saveStoredGroups(storedGroups.map((group) => (group.id === normalizedGroupId ? nextGroup : group)));
  notifyGroupChatDataChanged();
  return cloneGroup(nextGroup);
}

export async function removeGroupMember({ groupId, currentUserId, memberId }) {
  const normalizedGroupId = String(groupId || '').trim();
  const normalizedCurrentUserId = String(currentUserId || '').trim();
  const normalizedMemberId = String(memberId || '').trim();

  if (!normalizedMemberId) {
    throw new Error('\u7f3a\u5c11\u7fa4\u6210\u5458 ID');
  }

  if (isSupabaseConfigured()) {
    const result = await requestAuthorizedJson('/api/groups/remove-member', {
      groupId: normalizedGroupId,
      memberId: normalizedMemberId,
    });

    notifyGroupChatDataChanged();
    return cloneGroup(result.group || null);
  }

  await wait(180);

  const storedGroups = readStoredGroups();
  const targetGroup = storedGroups.find((group) => group.id === normalizedGroupId);

  if (!targetGroup) {
    throw new Error(ERROR_GROUP_NOT_FOUND);
  }

  if (getGroupOwnerId(targetGroup) !== normalizedCurrentUserId) {
    throw new Error(ERROR_GROUP_OWNER_REQUIRED);
  }

  if (getGroupOwnerId(targetGroup) === normalizedMemberId) {
    throw new Error('\u7fa4\u4e3b\u4e0d\u80fd\u88ab\u79fb\u51fa\u7fa4\u804a');
  }

  const nextMembers = (targetGroup.members || []).filter((member) => member.id !== normalizedMemberId);

  if (nextMembers.length === (targetGroup.members || []).length) {
    throw new Error('\u8be5\u7fa4\u6210\u5458\u4e0d\u5b58\u5728');
  }

  const nextGroup = {
    ...targetGroup,
    members: sortMembers(nextMembers),
  };

  saveStoredGroups(storedGroups.map((group) => (group.id === normalizedGroupId ? nextGroup : group)));
  notifyGroupChatDataChanged();
  return cloneGroup(nextGroup);
}

export async function renameGroupChat({ groupId, currentUserId, groupName }) {
  const normalizedGroupId = String(groupId || '').trim();
  const normalizedCurrentUserId = String(currentUserId || '').trim();
  const normalizedGroupName = String(groupName || '').trim();

  if (!normalizedGroupName) {
    throw new Error(ERROR_GROUP_NAME_EMPTY);
  }

  if (isSupabaseConfigured()) {
    const result = await requestAuthorizedJson('/api/groups/rename', {
      groupId: normalizedGroupId,
      groupName: normalizedGroupName,
    });

    notifyGroupChatDataChanged();
    return cloneGroup(result.group || null);
  }

  await wait(180);

  const storedGroups = readStoredGroups();
  const targetGroup = storedGroups.find((group) => group.id === normalizedGroupId);

  if (!targetGroup) {
    throw new Error(ERROR_GROUP_NOT_FOUND);
  }

  if (getGroupOwnerId(targetGroup) !== normalizedCurrentUserId) {
    throw new Error(ERROR_GROUP_OWNER_REQUIRED);
  }

  const nextGroup = {
    ...targetGroup,
    name: normalizedGroupName.slice(0, 50),
  };

  saveStoredGroups(storedGroups.map((group) => (group.id === normalizedGroupId ? nextGroup : group)));
  notifyGroupChatDataChanged();
  return cloneGroup(nextGroup);
}

export async function exitGroupChat({ groupId, currentUserId }) {
  const normalizedGroupId = String(groupId || '').trim();
  const normalizedCurrentUserId = String(currentUserId || '').trim();

  if (isSupabaseConfigured()) {
    const result = await requestAuthorizedJson('/api/groups/exit', {
      groupId: normalizedGroupId,
    });

    clearGroupChatReadState({
      currentUserId: normalizedCurrentUserId,
      groupId: normalizedGroupId,
    });
    notifyGroupChatDataChanged();
    return {
      groupId: String(result.groupId || normalizedGroupId).trim(),
    };
  }

  await wait(180);

  const storedGroups = readStoredGroups();
  const targetGroup = storedGroups.find((group) => group.id === normalizedGroupId);

  if (!targetGroup) {
    throw new Error(ERROR_GROUP_NOT_FOUND);
  }

  if (getGroupOwnerId(targetGroup) === normalizedCurrentUserId) {
    throw new Error(ERROR_GROUP_OWNER_CANNOT_EXIT);
  }

  const nextMembers = (targetGroup.members || []).filter((member) => member.id !== normalizedCurrentUserId);

  if (nextMembers.length === (targetGroup.members || []).length) {
    throw new Error('\u4f60\u4e0d\u5728\u8fd9\u4e2a\u7fa4\u91cc');
  }

  saveStoredGroups(
    storedGroups
      .map((group) => (group.id === normalizedGroupId ? { ...group, members: sortMembers(nextMembers) } : group))
      .filter((group) => (group.members || []).length),
  );

  clearGroupChatReadState({
    currentUserId: normalizedCurrentUserId,
    groupId: normalizedGroupId,
  });
  notifyGroupChatDataChanged();
  return {
    groupId: normalizedGroupId,
  };
}

function cloneGroup(group) {
  if (!group || typeof group !== 'object') {
    return null;
  }

  return {
    ...group,
    members: sortMembers(Array.isArray(group.members) ? group.members.map((member) => ({ ...member })) : []),
    latestMessageAt: normalizeTimestamp(group.latestMessageAt),
    latestMessageSenderUserId: String(group.latestMessageSenderUserId || '').trim(),
    hasUnread: Boolean(group.hasUnread),
  };
}

function cloneMessage(message) {
  if (!message || typeof message !== 'object') {
    return null;
  }

  return { ...message };
}

function cloneMessages(messages) {
  return (messages || []).map((message) => cloneMessage(message)).filter(Boolean);
}
