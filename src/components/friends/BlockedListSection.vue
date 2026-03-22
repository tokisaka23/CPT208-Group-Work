<script setup>
import { Button, Empty } from 'vant';

const props = defineProps({
  blockedUsers: {
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

const emit = defineEmits(['unblock-friend']);

function isActionLoading(friendId) {
  return props.processingId === friendId && props.processingAction === 'unblock';
}

function isActionDisabled(friendId) {
  return Boolean(props.processingId) && !isActionLoading(friendId);
}
</script>

<template>
  <section class="panel-card blocked-card">
    <div class="section-head">
      <div>
        <h2 class="section-title">黑名单</h2>
        <p class="section-desc">被拉黑的用户不会出现在好友列表，也无法继续发起好友关系</p>
      </div>
      <span class="count-badge">{{ blockedUsers.length }}</span>
    </div>

    <Empty
      v-if="!blockedUsers.length"
      image="search"
      description="当前黑名单为空"
    />

    <div v-else class="blocked-list">
      <article
        v-for="user in blockedUsers"
        :key="user.id"
        class="blocked-item"
      >
        <div class="blocked-main">
          <div class="blocked-avatar">
            {{ user.username.slice(0, 1) }}
          </div>

          <div class="blocked-info">
            <strong class="blocked-name">{{ user.username }}</strong>
            <span class="blocked-code">{{ user.friendCode }}</span>
          </div>
        </div>

        <Button
          plain
          size="small"
          type="primary"
          :disabled="isActionDisabled(user.id)"
          :loading="isActionLoading(user.id)"
          @click="emit('unblock-friend', user)"
        >
          移出黑名单
        </Button>
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

.blocked-card {
  border: 1px solid rgba(196, 66, 66, 0.12);
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
  background: #fff1f1;
  color: #b64141;
  font-size: 13px;
  text-align: center;
}

.blocked-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.blocked-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fff6f4 0%, #fffafa 100%);
}

.blocked-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.blocked-avatar {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd8d2 0%, #ffc2b6 100%);
  color: #97312d;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.blocked-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.blocked-name {
  font-size: 15px;
  color: #1f2a22;
}

.blocked-code {
  font-size: 12px;
  color: #7f8c81;
}
</style>
