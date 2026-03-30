<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  Button,
  Loading,
  NavBar,
  showConfirmDialog,
  showFailToast,
  showSuccessToast,
  showToast,
} from 'vant';
import AddFriendForm from '../../components/friends/AddFriendForm.vue';
import BlockedListSection from '../../components/friends/BlockedListSection.vue';
import CreateGroupDialog from '../../components/friends/CreateGroupDialog.vue';
import FriendCodeCard from '../../components/friends/FriendCodeCard.vue';
import FriendLocationPopup from '../../components/friends/FriendLocationPopup.vue';
import GroupChatDialog from '../../components/friends/GroupChatPopup.vue';
import FriendManagePanel from '../../components/friends/FriendManagePanel.vue';
import GroupChatSection from '../../components/friends/GroupChatSection.vue';
import {
  addGroupMembers,
  createGroupChat,
  exitGroupChat,
  getGroupChats,
  getGroupMessages,
  markGroupChatAsRead,
  renameGroupChat,
  removeGroupMember,
  sendGroupMessage,
} from '../../services/friends/groupChatService';
import {
  blockFriend,
  getCurrentUserProfile,
  getBlockedFriendList,
  getFriendList,
  removeFriend,
  sendFriendRequest,
  unblockFriend,
} from '../../services/friends/friendServiceRuntime';

defineProps({
  showNavBar: {
    type: Boolean,
    default: true,
  },
});

const router = useRouter();
const currentUser = ref(null);
const friends = ref([]);
const blockedUsers = ref([]);
const groupChats = ref([]);
const friendCodeInput = ref('');
const pageLoading = ref(true);
const pageError = ref('');
const isSubmitting = ref(false);
const groupSubmitting = ref(false);
const groupMessageLoading = ref(false);
const groupMessageSending = ref(false);
const groupMemberSubmitting = ref(false);
const groupRenaming = ref(false);
const groupFriendSubmitting = ref(false);
const processingFriendId = ref('');
const processingAction = ref('');
const locationPopupVisible = ref(false);
const selectedFriend = ref(null);
const createGroupPopupVisible = ref(false);
const activeGroupChat = ref(null);
const groupChatPopupVisible = ref(false);
const activeGroupMessages = ref([]);
const groupChatPolling = ref(false);
const feedbackText = ref('当前列表会展示已通过确认的好友，新的好友申请需要等待对方处理。');
const feedbackType = ref('info');
const GROUP_CHAT_POLL_INTERVAL = 12000;

let groupChatPollTimer = null;

function setFeedback(type, text) {
  feedbackType.value = type;
  feedbackText.value = text;
}

function updateGroupChatState(nextGroups) {
  groupChats.value = nextGroups;

  if (!activeGroupChat.value?.id) {
    return;
  }

  const matchedGroup = nextGroups.find((group) => group.id === activeGroupChat.value.id) || null;

  if (!matchedGroup) {
    groupChatPopupVisible.value = false;
    activeGroupChat.value = null;
    activeGroupMessages.value = [];
    return;
  }

  activeGroupChat.value = matchedGroup;
}

async function loadPage() {
  pageLoading.value = true;
  pageError.value = '';

  try {
    const userProfile = await getCurrentUserProfile();

    // 中文注释：这里会请求后端 /api/friends/list，并同步读取当前登录用户资料。
    const [friendList, blockedList, storedGroups] = await Promise.all([
      getFriendList(),
      getBlockedFriendList(),
      getGroupChats({ currentUserId: userProfile?.id || '' }),
    ]);

    currentUser.value = userProfile;
    friends.value = friendList;
    blockedUsers.value = blockedList;
    updateGroupChatState(storedGroups);
  } catch (error) {
    console.error('[FriendsPage] 加载好友页面失败', error);
    pageError.value = error.message || '好友页面加载失败，请稍后重试';
  } finally {
    pageLoading.value = false;
  }
}

async function refreshRelationshipData() {
  const [friendList, blockedList] = await Promise.all([
    getFriendList(),
    getBlockedFriendList(),
  ]);

  friends.value = friendList;
  blockedUsers.value = blockedList;
}

async function refreshGroupChats() {
  const nextGroups = await getGroupChats({
    currentUserId: currentUser.value?.id || '',
  });
  updateGroupChatState(nextGroups);
  return nextGroups;
}

function markGroupAsRead(groupId, messages = []) {
  const normalizedGroupId = String(groupId || '').trim();
  const normalizedCurrentUserId = String(currentUser.value?.id || '').trim();

  if (!normalizedGroupId || !normalizedCurrentUserId) {
    return;
  }

  const latestMessage = [...(messages || [])]
    .filter((message) => message?.createdAt)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0];

  markGroupChatAsRead({
    currentUserId: normalizedCurrentUserId,
    groupId: normalizedGroupId,
    readAt: latestMessage?.createdAt || new Date().toISOString(),
  });

  groupChats.value = groupChats.value.map((group) => (
    group.id === normalizedGroupId
      ? { ...group, hasUnread: false }
      : group
  ));
}

function stopGroupChatPolling() {
  if (groupChatPollTimer) {
    window.clearInterval(groupChatPollTimer);
    groupChatPollTimer = null;
  }
}

async function pollGroupChatData() {
  if (groupChatPolling.value || !currentUser.value?.id) {
    return;
  }

  groupChatPolling.value = true;

  try {
    if (groupChatPopupVisible.value && activeGroupChat.value?.id) {
      const nextMessages = await getGroupMessages(activeGroupChat.value.id);
      activeGroupMessages.value = nextMessages;
      markGroupAsRead(activeGroupChat.value.id, nextMessages);
    }

    await refreshGroupChats();
  } catch (error) {
    console.error('[FriendsPage] 轮询群聊数据失败', error);
  } finally {
    groupChatPolling.value = false;
  }
}

function startGroupChatPolling() {
  stopGroupChatPolling();

  if (typeof window === 'undefined') {
    return;
  }

  groupChatPollTimer = window.setInterval(() => {
    pollGroupChatData();
  }, GROUP_CHAT_POLL_INTERVAL);
}

async function handleCopyFriendCode() {
  const code = currentUser.value?.friendCode;

  if (!code) {
    return;
  }

  try {
    if (!navigator?.clipboard?.writeText) {
      throw new Error('当前环境不支持自动复制');
    }

    await navigator.clipboard.writeText(code);
    showSuccessToast('好友码已复制');
  } catch {
    showToast('当前环境不支持自动复制，请手动复制');
  }
}

async function handleAddFriend() {
  const targetFriendCode = friendCodeInput.value.trim().toUpperCase();

  if (!targetFriendCode) {
    setFeedback('error', '请输入对方的好友码后再发送好友请求。');
    showFailToast('请输入好友码');
    return;
  }

  isSubmitting.value = true;

  try {
    // 中文注释：这里连接后端添加好友接口 /api/friends/add，请求体会携带 targetFriendCode。
    const result = await sendFriendRequest({ targetFriendCode });
    friendCodeInput.value = '';
    setFeedback('success', result.message);
    showSuccessToast('好友请求已发送');
    await refreshRelationshipData();
  } catch (error) {
    console.error('[FriendsPage] 添加好友失败', error);
    const message = error.message || '发送好友请求失败，请稍后再试';
    setFeedback('error', message);
    showFailToast(message);
  } finally {
    isSubmitting.value = false;
  }
}

async function handleRemoveFriend(friend) {
  try {
    await showConfirmDialog({
      title: '删除好友',
      message: `确认将 ${friend.username} 从好友列表中删除吗？`,
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }

  processingFriendId.value = friend.id;
  processingAction.value = 'remove';

  try {
    const result = await removeFriend({ friendUserId: friend.id });

    if (selectedFriend.value?.id === friend.id) {
      handlePopupVisibleChange(false);
    }

    setFeedback('success', result.message);
    showSuccessToast('好友已删除');
    await refreshRelationshipData();
  } catch (error) {
    const message = error.message || '删除好友失败，请稍后再试';
    setFeedback('error', message);
    showFailToast(message);
  } finally {
    processingFriendId.value = '';
    processingAction.value = '';
  }
}

async function handleBlockFriend(friend) {
  try {
    await showConfirmDialog({
      title: '拉黑好友',
      message: `确认将 ${friend.username} 拉入黑名单吗？拉黑后会自动解除好友关系。`,
      confirmButtonText: '确认拉黑',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }

  processingFriendId.value = friend.id;
  processingAction.value = 'block';

  try {
    const result = await blockFriend({ friendUserId: friend.id });

    if (selectedFriend.value?.id === friend.id) {
      handlePopupVisibleChange(false);
    }

    setFeedback('success', result.message);
    showSuccessToast('已加入黑名单');
    await refreshRelationshipData();
  } catch (error) {
    const message = error.message || '拉黑好友失败，请稍后再试';
    setFeedback('error', message);
    showFailToast(message);
  } finally {
    processingFriendId.value = '';
    processingAction.value = '';
  }
}

async function handleUnblockFriend(friend) {
  try {
    await showConfirmDialog({
      title: '移出黑名单',
      message: `确认将 ${friend.username} 移出黑名单吗？移出后会自动恢复为好友。`,
      confirmButtonText: '移出',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }

  processingFriendId.value = friend.id;
  processingAction.value = 'unblock';

  try {
    const result = await unblockFriend({ friendUserId: friend.id });
    setFeedback('success', result.message);
    showSuccessToast('已恢复好友');
    await refreshRelationshipData();
  } catch (error) {
    const message = error.message || '移出黑名单失败，请稍后再试';
    setFeedback('error', message);
    showFailToast(message);
  } finally {
    processingFriendId.value = '';
    processingAction.value = '';
  }
}

async function handleSelectFriend(friend) {
  if (!friend.isOnline) {
    showToast('好友当前不在线');
    return;
  }

  if (!friend.isLocationSharingEnabled) {
    showToast('对方暂未开放位置共享');
    return;
  }

  try {
    selectedFriend.value = friend;
    locationPopupVisible.value = true;
  } catch (error) {
    showFailToast(error.message || '获取好友定位失败');
  }
}

function handlePopupVisibleChange(nextVisible) {
  locationPopupVisible.value = nextVisible;

  if (!nextVisible) {
    selectedFriend.value = null;
  }
}

async function handleFriendDataChanged() {
  try {
    await refreshRelationshipData();
  } catch (error) {
    showFailToast(error.message || '刷新好友列表失败');
  }
}

function handleViewFriendFavorites(friend) {
  if (!friend?.id) {
    showFailToast('暂时无法读取这位好友的收藏夹。');
    return;
  }

  router.push({
    path: '/favorites',
    query: {
      userId: friend.id,
    },
  });
}

function handleOpenCreateGroup() {
  if (!friends.value.length) {
    showToast('请先添加至少 1 位好友');
    return;
  }

  createGroupPopupVisible.value = true;
}

async function handleCreateGroup(payload) {
  const selectedFriends = friends.value.filter((friend) => payload.memberIds.includes(friend.id));

  if (!selectedFriends.length) {
    showToast('请至少选择 1 位好友');
    return;
  }

  groupSubmitting.value = true;

  try {
    const nextGroup = await createGroupChat({
      creator: currentUser.value,
      groupName: payload.groupName,
      selectedFriends,
    });

    createGroupPopupVisible.value = false;
    setFeedback('success', `群聊“${nextGroup.name}”已创建。`);
    showSuccessToast('群聊已创建');
    await refreshGroupChats();
  } catch (error) {
    const message = error.message || '创建群聊失败，请稍后再试';
    setFeedback('error', message);
    showFailToast(message);
  } finally {
    groupSubmitting.value = false;
  }
}

async function handleGroupChatDataChanged() {
  try {
    await refreshGroupChats();
  } catch (error) {
    showFailToast(error.message || '刷新群聊列表失败');
  }
}

async function handleOpenGroupChat(group) {
  activeGroupChat.value = group;
  groupChatPopupVisible.value = true;
  groupMessageLoading.value = true;
  activeGroupMessages.value = [];

  try {
    activeGroupMessages.value = await getGroupMessages(group.id);
    markGroupAsRead(group.id, activeGroupMessages.value);
  } catch (error) {
    showFailToast(error.message || '读取群聊消息失败');
  } finally {
    groupMessageLoading.value = false;
  }
}

function handleGroupChatPopupVisibleChange(nextVisible) {
  groupChatPopupVisible.value = nextVisible;

  if (!nextVisible) {
    activeGroupChat.value = null;
    activeGroupMessages.value = [];
    groupMemberSubmitting.value = false;
    groupRenaming.value = false;
    groupFriendSubmitting.value = false;
  }
}

async function handleSendGroupChatMessage(content) {
  if (!activeGroupChat.value?.id) {
    return;
  }

  groupMessageSending.value = true;

  try {
    const nextMessage = await sendGroupMessage({
      groupId: activeGroupChat.value.id,
      sender: currentUser.value,
      content,
    });

    if (nextMessage) {
      activeGroupMessages.value = [...activeGroupMessages.value, nextMessage];
    }
  } catch (error) {
    showFailToast(error.message || '发送群消息失败');
  } finally {
    groupMessageSending.value = false;
  }
}

async function handleInviteGroupMembers(memberIds) {
  if (!activeGroupChat.value?.id) {
    return;
  }

  const selectedFriends = friends.value.filter((friend) => memberIds.includes(friend.id));

  if (!selectedFriends.length) {
    showToast('请至少选择 1 位好友');
    return;
  }

  groupMemberSubmitting.value = true;

  try {
    const nextGroup = await addGroupMembers({
      groupId: activeGroupChat.value.id,
      currentUserId: currentUser.value?.id || '',
      selectedFriends,
    });

    activeGroupChat.value = nextGroup || activeGroupChat.value;
    await refreshGroupChats();
    showSuccessToast('已邀请好友入群');
  } catch (error) {
    showFailToast(error.message || '邀请好友入群失败');
  } finally {
    groupMemberSubmitting.value = false;
  }
}

async function handleRemoveGroupMember(member) {
  if (!activeGroupChat.value?.id || !member?.id) {
    return;
  }

  try {
    await showConfirmDialog({
      title: '移出群成员',
      message: `确认将 ${member.username} 移出该群聊吗？`,
      confirmButtonText: '移出',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }

  groupMemberSubmitting.value = true;

  try {
    const nextGroup = await removeGroupMember({
      groupId: activeGroupChat.value.id,
      currentUserId: currentUser.value?.id || '',
      memberId: member.id,
    });

    activeGroupChat.value = nextGroup || activeGroupChat.value;
    await refreshGroupChats();
    showSuccessToast('成员已移出');
  } catch (error) {
    showFailToast(error.message || '移出群成员失败');
  } finally {
    groupMemberSubmitting.value = false;
  }
}

async function handleExitGroup() {
  if (!activeGroupChat.value?.id) {
    return;
  }

  try {
    await showConfirmDialog({
      title: '退出群聊',
      message: `确认退出“${activeGroupChat.value.name}”吗？`,
      confirmButtonText: '退出',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }

  groupMemberSubmitting.value = true;

  try {
    const result = await exitGroupChat({
      groupId: activeGroupChat.value.id,
      currentUserId: currentUser.value?.id || '',
    });

    await refreshGroupChats();

    if (result?.groupId) {
      activeGroupChat.value = null;
      activeGroupMessages.value = [];
      groupChatPopupVisible.value = false;
    }

    showSuccessToast('你已退出群聊');
  } catch (error) {
    showFailToast(error.message || '退出群聊失败');
  } finally {
    groupMemberSubmitting.value = false;
  }
}

async function handleRenameGroup(groupName) {
  if (!activeGroupChat.value?.id) {
    return;
  }

  groupRenaming.value = true;

  try {
    const nextGroup = await renameGroupChat({
      groupId: activeGroupChat.value.id,
      currentUserId: currentUser.value?.id || '',
      groupName,
    });

    activeGroupChat.value = nextGroup || activeGroupChat.value;
    await refreshGroupChats();
    showSuccessToast('群名已更新');
  } catch (error) {
    showFailToast(error.message || '修改群名失败');
  } finally {
    groupRenaming.value = false;
  }
}

async function handleAddGroupMemberAsFriend(member) {
  const targetFriendCode = String(member?.friendCode || '').trim().toUpperCase();

  if (!targetFriendCode) {
    showFailToast('该成员暂未提供可添加的好友码');
    return;
  }

  groupFriendSubmitting.value = true;

  try {
    const result = await sendFriendRequest({ targetFriendCode });
    setFeedback('success', result.message || `已向 ${member.username} 发送好友请求`);
    showSuccessToast('好友请求已发送');
    await refreshRelationshipData();
  } catch (error) {
    showFailToast(error.message || '发送好友请求失败');
  } finally {
    groupFriendSubmitting.value = false;
  }
}

onMounted(() => {
  loadPage();
  startGroupChatPolling();
  window.addEventListener('friends-updated', handleFriendDataChanged);
  window.addEventListener('group-chats-updated', handleGroupChatDataChanged);
});

onUnmounted(() => {
  stopGroupChatPolling();
  window.removeEventListener('friends-updated', handleFriendDataChanged);
  window.removeEventListener('group-chats-updated', handleGroupChatDataChanged);
});
</script>

<template>
  <div class="friends-page" :class="{ 'is-embedded': !showNavBar }">
    <NavBar v-if="showNavBar" title="好友与定位" fixed placeholder />

    <main class="page-body">
      <section v-if="pageLoading" class="state-card">
        <Loading size="24px" color="#2f8a5c" />
        <p>正在加载好友数据...</p>
      </section>

      <section v-else-if="pageError" class="state-card error-card">
        <h2>页面加载失败</h2>
        <p>{{ pageError }}</p>
        <Button round block type="primary" @click="loadPage">
          重新加载
        </Button>
      </section>

      <template v-else>
        <FriendCodeCard
          v-if="currentUser"
          :user="currentUser"
          @copy="handleCopyFriendCode"
        />

        <AddFriendForm
          v-model="friendCodeInput"
          :submitting="isSubmitting"
          :feedback-text="feedbackText"
          :feedback-type="feedbackType"
          @submit="handleAddFriend"
        />

        <FriendManagePanel
          :friends="friends"
          :processing-id="processingFriendId"
          :processing-action="processingAction"
          @select-friend="handleSelectFriend"
          @view-favorites="handleViewFriendFavorites"
          @remove-friend="handleRemoveFriend"
          @block-friend="handleBlockFriend"
          @open-create-group="handleOpenCreateGroup"
        />

        <GroupChatSection :groups="groupChats" @open-group="handleOpenGroupChat" />
        <BlockedListSection
          :blocked-users="blockedUsers"
          :processing-id="processingFriendId"
          :processing-action="processingAction"
          @unblock-friend="handleUnblockFriend"
        />
      </template>
    </main>

    <FriendLocationPopup
      :show="locationPopupVisible"
      :friend="selectedFriend"
      @update:show="handlePopupVisibleChange"
    />

    <CreateGroupDialog
      v-model:show="createGroupPopupVisible"
      :friends="friends"
      :submitting="groupSubmitting"
      @submit="handleCreateGroup"
    />

    <GroupChatDialog
      v-model:show="groupChatPopupVisible"
      :group="activeGroupChat"
      :current-user-id="currentUser?.id || ''"
      :friends="friends"
      :messages="activeGroupMessages"
      :loading="groupMessageLoading"
      :sending="groupMessageSending"
      :member-submitting="groupMemberSubmitting"
      :renaming="groupRenaming"
      :friend-submitting="groupFriendSubmitting"
      @send="handleSendGroupChatMessage"
      @invite-members="handleInviteGroupMembers"
      @remove-member="handleRemoveGroupMember"
      @exit-group="handleExitGroup"
      @rename-group="handleRenameGroup"
      @add-friend="handleAddGroupMemberAsFriend"
      @update:show="handleGroupChatPopupVisibleChange"
    />
  </div>
</template>

<style scoped>
.friends-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(92, 143, 112, 0.12), transparent 26%),
    linear-gradient(180deg, #f3f6f4 0%, #f8faf8 100%);
}

.friends-page.is-embedded {
  min-height: auto;
}

.page-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 16px calc(24px + env(safe-area-inset-bottom));
  max-width: 560px;
  margin: 0 auto;
}

.state-card {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  border-radius: 20px;
  background: #ffffff;
  color: #536259;
  text-align: center;
  box-shadow: 0 10px 28px rgba(31, 58, 44, 0.08);
}

.state-card p,
.state-card h2 {
  margin: 0;
}

.error-card {
  gap: 14px;
}

@media (min-width: 768px) {
  .page-body {
    padding-top: 24px;
  }

  .friends-page.is-embedded .page-body {
    padding-top: 16px;
  }
}
</style>


