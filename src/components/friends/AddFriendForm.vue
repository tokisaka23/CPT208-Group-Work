<script setup>
import { computed } from 'vue';
import { Button, CellGroup, Field, Icon } from 'vant';

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
        <h2 class="section-title">添加好友</h2>
        <p class="section-desc">输入对方的 friend_code 后发起好友申请</p>
      </div>
    </div>

    <CellGroup inset class="input-group">
      <Field
        v-model="friendCodeValue"
        label="好友码"
        maxlength="20"
        placeholder="例如 FIND-8842"
        @keyup.enter="emit('submit')"
      >
        <template v-if="friendCodeValue" #right-icon>
          <button
            type="button"
            class="field-clear-button"
            aria-label="清空好友码"
            @click="clearFriendCode"
          >
            <Icon name="clear" />
          </button>
        </template>
      </Field>
    </CellGroup>

    <Button block round type="primary" native-type="submit" :loading="submitting">
      发送好友申请
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
