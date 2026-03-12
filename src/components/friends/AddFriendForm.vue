<script setup>
import { Button, CellGroup, Field } from 'vant';

defineProps({
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
        :model-value="modelValue"
        clearable
        label="好友码"
        maxlength="20"
        placeholder="例如 FIND-8842"
        @update:model-value="emit('update:modelValue', $event)"
      />
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
