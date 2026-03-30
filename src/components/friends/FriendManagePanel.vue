<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Button, Empty, Icon, Tag } from 'vant';

const text = {
  title: '\u6211\u7684\u597d\u53cb',
  desc: '\u70b9\u51fb\u597d\u53cb\u53ef\u67e5\u770b\u72b6\u6001\u6216\u5b9a\u4f4d\uff0c\u4e5f\u53ef\u4ee5\u76f4\u63a5\u5220\u9664\u6216\u62c9\u9ed1',
  createLabel: '\u65b0\u5efa',
  createGroup: '\u53d1\u8d77\u7fa4\u804a',
  empty: '\u6682\u65f6\u8fd8\u6ca1\u6709\u597d\u53cb\uff0c\u5148\u53bb\u4ea4\u6362\u597d\u53cb\u7801\u5427',
  online: '\u5728\u7ebf',
  offline: '\u79bb\u7ebf',
  sharingOn: '\u5df2\u5f00\u653e\u4f4d\u7f6e\u5171\u4eab',
  sharingOff: '\u672a\u5f00\u653e\u4f4d\u7f6e\u5171\u4eab',
  statusOnline: '\u5f53\u524d\u5728\u7ebf\uff0c\u53ef\u4ee5\u70b9\u51fb\u67e5\u770b\u5b9e\u65f6\u5b9a\u4f4d',
  statusSharingOff: '\u5f53\u524d\u5728\u7ebf\uff0c\u4f46\u6682\u672a\u5f00\u653e\u4f4d\u7f6e\u5171\u4eab',
  statusOffline: '\u5f53\u524d\u79bb\u7ebf\uff0c\u6682\u65f6\u65e0\u6cd5\u67e5\u770b\u5b9a\u4f4d',
  viewLocation: '\u67e5\u770b\u5b9a\u4f4d',
  viewStatus: '\u67e5\u770b\u72b6\u6001',
  viewFavorites: '\u67e5\u770b\u6536\u85cf\u5939',
  remove: '\u5220\u9664\u597d\u53cb',
  block: '\u62c9\u9ed1',
};

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

const emit = defineEmits(['select-friend', 'remove-friend', 'block-friend', 'open-create-group', 'view-favorites']);

const menuVisible = ref(false);
const menuRef = ref(null);

function getStatusText(friend) {
  if (!friend.isOnline) {
    return text.statusOffline;
  }

  if (!friend.isLocationSharingEnabled) {
    return text.statusSharingOff;
  }

  return text.statusOnline;
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
            {{ friend.isOnline && friend.isLocationSharingEnabled ? text.viewLocation : text.viewStatus }}
          </span>

          <div class="action-buttons">
            <Button
              plain
              size="small"
              type="primary"
              :disabled="Boolean(props.processingId)"
              @click.stop="emit('view-favorites', friend)"
            >
              {{ text.viewFavorites }}
            </Button>
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
