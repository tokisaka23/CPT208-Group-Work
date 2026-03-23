<script setup>
import { Button, Empty, Tag } from 'vant';

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

const emit = defineEmits(['select-friend', 'remove-friend', 'block-friend']);

function getStatusText(friend) {
  if (!friend.isOnline) {
    return '当前离线，暂时无法查看定位';
  }

  if (!friend.isLocationSharingEnabled) {
    return '当前在线，但暂未开放位置共享';
  }

  return '当前在线，可以点击查看实时定位';
}

function isActionLoading(friendId, action) {
  return props.processingId === friendId && props.processingAction === action;
}

function isActionDisabled(friendId, action) {
  return Boolean(props.processingId) && !isActionLoading(friendId, action);
}
</script>

<template>
  <section class="panel-card">
    <div class="section-head">
      <div>
        <h2 class="section-title">我的好友</h2>
        <p class="section-desc">点击好友可查看状态或定位，也可以直接删除或拉黑</p>
      </div>
      <span class="count-badge">{{ friends.length }}</span>
    </div>

    <Empty
      v-if="!friends.length"
      image="search"
      description="暂时还没有好友，先去交换好友码吧"
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
                {{ friend.isOnline ? '在线' : '离线' }}
              </Tag>
              <Tag :type="friend.isLocationSharingEnabled ? 'primary' : 'warning'" plain>
                {{ friend.isLocationSharingEnabled ? '已开放位置共享' : '未开放位置共享' }}
              </Tag>
            </div>

            <p class="friend-status">
              {{ getStatusText(friend) }}
            </p>
          </div>
        </button>

        <div class="friend-actions">
          <span class="action-text">
            {{ friend.isOnline && friend.isLocationSharingEnabled ? '查看定位' : '查看状态' }}
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
              删除好友
            </Button>
            <Button
              plain
              size="small"
              type="danger"
              :disabled="isActionDisabled(friend.id, 'block')"
              :loading="isActionLoading(friend.id, 'block')"
              @click.stop="emit('block-friend', friend)"
            >
              拉黑
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

.count-badge {
  min-width: 32px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef5f0;
  color: #2f5d44;
  font-size: 13px;
  text-align: center;
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
