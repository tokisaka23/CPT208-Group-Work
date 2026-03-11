<script setup>
import { onMounted, ref } from 'vue';
import { Button, Loading, NavBar, showFailToast, showSuccessToast, showToast } from 'vant';
import AddFriendForm from '../../components/friends/AddFriendForm.vue';
import FriendCodeCard from '../../components/friends/FriendCodeCard.vue';
import FriendListSection from '../../components/friends/FriendListSection.vue';
import FriendLocationPopup from '../../components/friends/FriendLocationPopup.vue';
import {
  getCurrentUserProfile,
  getFriendList,
  sendFriendRequest,
} from '../../services/friends/friendServiceRuntime';

defineProps({
  showNavBar: {
    type: Boolean,
    default: true,
  },
});

const currentUser = ref(null);
const friends = ref([]);
const friendCodeInput = ref('');
const pageLoading = ref(true);
const pageError = ref('');
const isSubmitting = ref(false);
const locationPopupVisible = ref(false);
const selectedFriend = ref(null);
const feedbackText = ref('当前列表初始为空，只有你手动添加成功的好友才会显示在这里。');
const feedbackType = ref('info');

function setFeedback(type, text) {
  feedbackType.value = type;
  feedbackText.value = text;
}

async function loadPage() {
  pageLoading.value = true;
  pageError.value = '';

  try {
    const [userProfile, friendList] = await Promise.all([
      getCurrentUserProfile(),
      getFriendList(),
    ]);

    currentUser.value = userProfile;
    friends.value = friendList;
  } catch (error) {
    pageError.value = error.message || '好友页面加载失败，请稍后重试';
  } finally {
    pageLoading.value = false;
  }
}

async function refreshFriendList() {
  friends.value = await getFriendList();
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
    setFeedback('error', '请输入对方的好友码后再添加。');
    showFailToast('请输入好友码');
    return;
  }

  isSubmitting.value = true;

  try {
    const result = await sendFriendRequest({ targetFriendCode });
    friendCodeInput.value = '';
    setFeedback('success', result.message);
    showSuccessToast('好友已加入列表');
    await refreshFriendList();
  } catch (error) {
    const message = error.message || '添加好友失败，请稍后再试';
    setFeedback('error', message);
    showFailToast(message);
  } finally {
    isSubmitting.value = false;
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

onMounted(() => {
  loadPage();
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

        <FriendListSection :friends="friends" @select-friend="handleSelectFriend" />
      </template>
    </main>

    <FriendLocationPopup
      :show="locationPopupVisible"
      :friend="selectedFriend"
      @update:show="handlePopupVisibleChange"
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
