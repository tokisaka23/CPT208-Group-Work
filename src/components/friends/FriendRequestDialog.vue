<script setup>
import { computed } from 'vue';
import { Button, Empty, Popup, Tag } from 'vant';
import { resolveLocalized, useLanguage } from '../../i18n';

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
const { language } = useLanguage();

const textSource = {
  eyebrow: {
    zh: '好友请求',
    en: 'Friend Requests',
    ja: '友だち申請',
    ko: '친구 요청',
  },
  title: {
    zh: '待你处理的申请',
    en: 'Requests Waiting for You',
    ja: 'あなたの対応待ち',
    ko: '처리 대기 중인 요청',
  },
  desc: {
    zh: '同意后才会进入好友列表，拒绝后本次申请不会生效。',
    en: 'A request enters your friend list only after acceptance. Rejecting it cancels this attempt.',
    ja: '承認すると友だち一覧に入り、拒否すると今回の申請は無効になります。',
    ko: '수락해야 친구 목록에 들어가며, 거절하면 이번 요청은 무효가 됩니다.',
  },
  empty: {
    zh: '当前没有待处理的好友请求',
    en: 'There are no pending friend requests.',
    ja: '保留中の友だち申請はありません。',
    ko: '대기 중인 친구 요청이 없습니다.',
  },
  friendCode: {
    zh: '好友码',
    en: 'Friend Code',
    ja: 'フレンドコード',
    ko: '친구 코드',
  },
  reject: {
    zh: '拒绝',
    en: 'Reject',
    ja: '拒否',
    ko: '거절',
  },
  accept: {
    zh: '接受',
    en: 'Accept',
    ja: '承認',
    ko: '수락',
  },
};

const text = computed(() => resolveLocalized(textSource, language.value));

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
          <p class="dialog-eyebrow">{{ text.eyebrow }}</p>
          <h2 class="dialog-title">{{ text.title }}</h2>
          <p class="dialog-desc">{{ text.desc }}</p>
        </div>
        <Tag type="primary" plain>{{ requests.length }}</Tag>
      </div>

      <Empty
        v-if="!requests.length"
        image="search"
        :description="text.empty"
      />

      <div v-else class="dialog-list">
        <article v-for="request in requests" :key="request.id" class="dialog-card">
          <div class="dialog-main">
            <div class="dialog-avatar">{{ request.username.slice(0, 1) }}</div>

            <div class="dialog-info">
              <strong class="dialog-name">{{ request.username }}</strong>
              <span class="dialog-code">{{ text.friendCode }}: {{ request.friendCode }}</span>
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
              {{ text.reject }}
            </Button>

            <Button
              size="small"
              type="primary"
              :loading="processingId === request.id"
              :disabled="Boolean(processingId)"
              @click="emit('accept', request)"
            >
              {{ text.accept }}
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
