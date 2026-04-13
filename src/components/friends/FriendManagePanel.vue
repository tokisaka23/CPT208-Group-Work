<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Button, Empty, Icon, Tag } from 'vant';
import { resolveLocalized, useLanguage } from '../../i18n';

const { language } = useLanguage();

const textSource = {
  title: {
    zh: '我的好友',
    en: 'My Friends',
    ja: '友だち一覧',
    ko: '내 친구',
  },
  desc: {
    zh: '点击好友可查看状态或定位，也可以直接删除或拉黑',
    en: 'Tap a friend to view status or location, or remove and block them directly.',
    ja: '友だちをタップすると状態や位置を確認でき、削除やブロックもできます。',
    ko: '친구를 누르면 상태나 위치를 볼 수 있고 바로 삭제하거나 차단할 수도 있습니다.',
  },
  createLabel: {
    zh: '新建',
    en: 'Create',
    ja: '新規作成',
    ko: '새로 만들기',
  },
  createGroup: {
    zh: '发起群聊',
    en: 'Create Group Chat',
    ja: 'グループチャットを作成',
    ko: '그룹 채팅 만들기',
  },
  empty: {
    zh: '暂时还没有好友，先去交换好友码吧',
    en: 'No friends yet. Start by exchanging friend codes.',
    ja: 'まだ友だちがいません。まずはフレンドコードを交換しましょう。',
    ko: '아직 친구가 없습니다. 먼저 친구 코드를 교환해 보세요.',
  },
  online: {
    zh: '在线',
    en: 'Online',
    ja: 'オンライン',
    ko: '온라인',
  },
  offline: {
    zh: '离线',
    en: 'Offline',
    ja: 'オフライン',
    ko: '오프라인',
  },
  sharingOn: {
    zh: '已开放位置共享',
    en: 'Location sharing on',
    ja: '位置共有オン',
    ko: '위치 공유 켜짐',
  },
  sharingOff: {
    zh: '未开放位置共享',
    en: 'Location sharing off',
    ja: '位置共有オフ',
    ko: '위치 공유 꺼짐',
  },
  statusOnline: {
    zh: '当前在线，可以点击查看实时定位',
    en: 'Currently online. Tap to view live location.',
    ja: '現在オンラインです。タップすると現在地を確認できます。',
    ko: '현재 온라인입니다. 눌러서 실시간 위치를 볼 수 있습니다.',
  },
  statusSharingOff: {
    zh: '当前在线，但暂未开放位置共享',
    en: 'Currently online, but location sharing is not enabled.',
    ja: '現在オンラインですが、位置共有はまだ有効ではありません。',
    ko: '현재 온라인이지만 위치 공유는 아직 열려 있지 않습니다.',
  },
  statusOffline: {
    zh: '当前离线，暂时无法查看定位',
    en: 'Currently offline. Location is unavailable.',
    ja: '現在オフラインのため、位置は確認できません。',
    ko: '현재 오프라인이라 위치를 볼 수 없습니다.',
  },
  statusOfflineLastShared: {
    zh: '当前离线，但仍可查看最近一次共享位置',
    en: 'Currently offline. You can still view the last shared location.',
    ja: '現在オフラインですが、最後に共有した位置は確認できます。',
    ko: '현재 오프라인이지만 마지막으로 공유한 위치는 확인할 수 있습니다.',
  },
  viewLocation: {
    zh: '查看定位',
    en: 'View Location',
    ja: '位置を見る',
    ko: '위치 보기',
  },
  viewStatus: {
    zh: '查看状态',
    en: 'View Status',
    ja: '状態を見る',
    ko: '상태 보기',
  },
  remove: {
    zh: '删除好友',
    en: 'Remove',
    ja: '削除',
    ko: '삭제',
  },
  block: {
    zh: '拉黑',
    en: 'Block',
    ja: 'ブロック',
    ko: '차단',
  },
};

const text = computed(() => resolveLocalized(textSource, language.value));

const props = defineProps({
  friends: {
    type: Array,
    default: () => [],
  },
  processingId: {
    type: String,
    default: '',
  },
  processingAction: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['select-friend', 'remove-friend', 'block-friend', 'open-create-group']);

const menuVisible = ref(false);
const menuRef = ref(null);

function getStatusText(friend) {
  if (!friend.isLocationSharingEnabled) {
    return text.value.statusSharingOff;
  }

  if (!friend.isOnline) {
    return text.value.statusOfflineLastShared;
  }

  return text.value.statusOnline;
}

function isActionLoading(friendId, action) {
  return props.processingId === friendId && props.processingAction === action;
}

function isActionDisabled(friendId, action) {
  return Boolean(props.processingId) && !isActionLoading(friendId, action);
}

function toggleMenu() {
  menuVisible.value = !menuVisible.value;
}

function handleCreateGroup() {
  menuVisible.value = false;
  emit('open-create-group');
}

function handleDocumentClick(event) {
  if (!menuVisible.value) {
    return;
  }

  if (menuRef.value?.contains(event.target)) {
    return;
  }

  menuVisible.value = false;
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick);
});
</script>

<template>
  <section class="panel-card">
    <div class="section-head">
      <div class="section-copy">
        <h2 class="section-title">{{ text.title }}</h2>
        <p class="section-desc">{{ text.desc }}</p>
      </div>

      <div ref="menuRef" class="section-tools">
        <span class="count-badge">{{ friends.length }}</span>

        <button
          class="add-button"
          type="button"
          :aria-label="text.createLabel"
          @click.stop="toggleMenu"
        >
          <Icon name="plus" size="18" />
        </button>

        <div v-if="menuVisible" class="action-menu">
          <button class="action-menu__item" type="button" @click="handleCreateGroup">
            <Icon name="friends-o" size="18" />
            <span>{{ text.createGroup }}</span>
          </button>
        </div>
      </div>
    </div>

    <Empty
      v-if="!friends.length"
      image="search"
      :description="text.empty"
    />

    <div v-else class="friend-list">
      <article
        v-for="friend in friends"
        :key="friend.id"
        class="friend-item"
      >
        <button
          class="friend-main"
          type="button"
          @click="emit('select-friend', friend)"
        >
          <div class="friend-avatar">
            {{ friend.username.slice(0, 1) }}
          </div>

          <div class="friend-info">
            <div class="friend-top">
              <strong class="friend-name">{{ friend.username }}</strong>
              <span class="friend-code">{{ friend.friendCode }}</span>
            </div>

            <div class="tag-row">
              <Tag :type="friend.isOnline ? 'success' : 'default'" plain>
                {{ friend.isOnline ? text.online : text.offline }}
              </Tag>
              <Tag :type="friend.isLocationSharingEnabled ? 'primary' : 'warning'" plain>
                {{ friend.isLocationSharingEnabled ? text.sharingOn : text.sharingOff }}
              </Tag>
            </div>

            <p class="friend-status">
              {{ getStatusText(friend) }}
            </p>
          </div>
        </button>

        <div class="friend-actions">
          <span class="action-text">
            {{ friend.isLocationSharingEnabled ? text.viewLocation : text.viewStatus }}
          </span>

          <div class="action-buttons">
            <Button
              plain
              size="small"
              type="default"
              :disabled="isActionDisabled(friend.id, 'remove')"
              :loading="isActionLoading(friend.id, 'remove')"
              @click.stop="emit('remove-friend', friend)"
            >
              {{ text.remove }}
            </Button>
            <Button
              plain
              size="small"
              type="danger"
              :disabled="isActionDisabled(friend.id, 'block')"
              :loading="isActionLoading(friend.id, 'block')"
              @click.stop="emit('block-friend', friend)"
            >
              {{ text.block }}
            </Button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.panel-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 16px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(31, 58, 44, 0.08);
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.section-copy {
  min-width: 0;
}

.section-title {
  margin: 0 0 6px;
  font-size: 18px;
  color: #1f2a22;
}

.section-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #6f7a71;
}

.section-tools {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.count-badge {
  min-width: 32px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef5f0;
  color: #2f5d44;
  font-size: 13px;
  text-align: center;
}

.add-button {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(47, 93, 68, 0.12);
  border-radius: 12px;
  background: linear-gradient(180deg, #f9fbf9 0%, #eef5f0 100%);
  color: #2f5d44;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(31, 58, 44, 0.08);
  cursor: pointer;
}

.action-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 152px;
  padding: 8px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 18px 40px rgba(31, 58, 44, 0.16);
  z-index: 10;
}

.action-menu::before {
  content: '';
  position: absolute;
  top: -6px;
  right: 12px;
  width: 12px;
  height: 12px;
  background: #ffffff;
  transform: rotate(45deg);
  border-radius: 2px;
}

.action-menu__item {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #233228;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}

.action-menu__item:hover {
  background: #f4f8f5;
}

.friend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.friend-item {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
  border-radius: 18px;
  background: #f7faf8;
}

.friend-main {
  display: flex;
  align-items: flex-start;
  width: 100%;
  gap: 12px;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.friend-avatar {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dcefe2 0%, #bdddc6 100%);
  color: #255338;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.friend-info {
  min-width: 0;
}

.friend-top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.friend-name {
  font-size: 15px;
  color: #1f2a22;
}

.friend-code {
  font-size: 12px;
  color: #7f8c81;
}

.tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.friend-status {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #68756c;
}

.friend-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.action-text {
  font-size: 13px;
  color: #2d6d4b;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
