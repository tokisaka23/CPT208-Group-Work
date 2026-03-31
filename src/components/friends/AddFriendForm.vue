<script setup>
import { computed } from 'vue';
import { Button, CellGroup, Field, Icon } from 'vant';
import { resolveLocalized, useLanguage } from '../../i18n';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  submitting: {
    type: Boolean,
    default: false,
  },
  feedbackText: {
    type: String,
    default: '',
  },
  feedbackType: {
    type: String,
    default: 'info',
  },
});

const emit = defineEmits(['update:modelValue', 'submit']);
const { language } = useLanguage();

const textSource = {
  title: {
    zh: '添加好友',
    en: 'Add a Friend',
    ja: '友だちを追加',
    ko: '친구 추가',
  },
  desc: {
    zh: '输入对方的 friend_code 后发起好友申请',
    en: 'Enter the other person\'s friend code to send a friend request.',
    ja: '相手の friend_code を入力して友だち申請を送ります。',
    ko: '상대방의 friend_code 를 입력해 친구 요청을 보냅니다.',
  },
  codeLabel: {
    zh: '好友码',
    en: 'Friend Code',
    ja: 'フレンドコード',
    ko: '친구 코드',
  },
  codePlaceholder: {
    zh: '例如 FIND-8842',
    en: 'For example FIND-8842',
    ja: '例: FIND-8842',
    ko: '예: FIND-8842',
  },
  clearCode: {
    zh: '清空好友码',
    en: 'Clear friend code',
    ja: 'フレンドコードをクリア',
    ko: '친구 코드 지우기',
  },
  submit: {
    zh: '发送好友申请',
    en: 'Send Friend Request',
    ja: '友だち申請を送信',
    ko: '친구 요청 보내기',
  },
};

const text = computed(() => resolveLocalized(textSource, language.value));

const friendCodeValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

function clearFriendCode() {
  emit('update:modelValue', '');
}
</script>

<template>
  <form class="panel-card" @submit.prevent="emit('submit')">
    <div class="section-head">
      <div>
        <h2 class="section-title">{{ text.title }}</h2>
        <p class="section-desc">{{ text.desc }}</p>
      </div>
    </div>

    <CellGroup inset class="input-group">
      <Field
        v-model="friendCodeValue"
        :label="text.codeLabel"
        maxlength="20"
        :placeholder="text.codePlaceholder"
        @keyup.enter="emit('submit')"
      >
        <template v-if="friendCodeValue" #right-icon>
          <button
            type="button"
            class="field-clear-button"
            :aria-label="text.clearCode"
            @click="clearFriendCode"
          >
            <Icon name="clear" />
          </button>
        </template>
      </Field>
    </CellGroup>

    <Button block round type="primary" native-type="submit" :loading="submitting">
      {{ text.submit }}
    </Button>

    <p :class="['feedback-text', `is-${feedbackType}`]">
      {{ feedbackText }}
    </p>
  </form>
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

.input-group {
  margin: 0 -4px;
}

.field-clear-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--van-gray-5, #c8c9cc);
  cursor: pointer;
}

.feedback-text {
  margin: 0;
  min-height: 20px;
  font-size: 12px;
  line-height: 1.6;
}

.is-info {
  color: #7f8c81;
}

.is-success {
  color: #18794e;
}

.is-error {
  color: #c65a34;
}
</style>
