<script setup>
import { Button, Empty, Popup, Tag } from 'vant';

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  requests: {
    type: Array,
    default: () => [],
  },
  processingId: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:show', 'accept', 'reject']);

function closeDialog() {
  emit('update:show', false);
}
</script>

<template>
  <Popup
    :show="show"
    round
    position="bottom"
    closeable
    close-icon-position="top-right"
    @update:show="emit('update:show', $event)"
    @click-close-icon="closeDialog"
  >
    <section class="dialog-shell">
      <div class="dialog-head">
        <div>
          <p class="dialog-eyebrow">好友请求</p>
          <h2 class="dialog-title">待你处理的申请</h2>
          <p class="dialog-desc">同意后才会进入好友列表，拒绝后本次申请不会生效。</p>
        </div>
        <Tag type="primary" plain>{{ requests.length }}</Tag>
      </div>

      <Empty
        v-if="!requests.length"
        image="search"
        description="当前没有待处理的好友请求"
      />

      <div v-else class="dialog-list">
        <article v-for="request in requests" :key="request.id" class="dialog-card">
          <div class="dialog-main">
            <div class="dialog-avatar">{{ request.username.slice(0, 1) }}</div>

            <div class="dialog-info">
              <strong class="dialog-name">{{ request.username }}</strong>
              <span class="dialog-code">好友码：{{ request.friendCode }}</span>
            </div>
          </div>

          <div class="dialog-actions">
            <Button
              size="small"
              plain
              type="default"
              :loading="processingId === request.id"
              :disabled="Boolean(processingId)"
              @click="emit('reject', request)"
            >
              拒绝
            </Button>

            <Button
              size="small"
              type="primary"
              :loading="processingId === request.id"
              :disabled="Boolean(processingId)"
              @click="emit('accept', request)"
            >
              接受
            </Button>
          </div>
        </article>
      </div>
    </section>
  </Popup>
</template>

<style scoped>
.dialog-shell {
  padding: 28px 16px calc(20px + env(safe-area-inset-bottom));
  background:
    radial-gradient(circle at top, rgba(84, 133, 106, 0.12), transparent 32%),
    linear-gradient(180deg, #ffffff 0%, #f7faf8 100%);
}

.dialog-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.dialog-eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  color: #5d7667;
}

.dialog-title {
  margin: 0 0 6px;
  font-size: 20px;
  color: #1f2a22;
}

.dialog-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #66756c;
}

.dialog-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dialog-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(31, 58, 44, 0.08);
}

.dialog-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dcefe2 0%, #bdddc6 100%);
  color: #255338;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.dialog-name {
  font-size: 15px;
  color: #1f2a22;
}

.dialog-code {
  font-size: 12px;
  color: #78867e;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
