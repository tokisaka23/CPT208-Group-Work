<script setup>
import { computed, reactive, ref } from 'vue';
import {
  continueAsGuestSession,
  loginWithDatabase,
  registerWithDatabase,
} from '../services/auth/databaseAuth';

const emit = defineEmits(['enter-chat']);

const currentStep = ref('entry');
const isSubmitting = ref(false);
const message = ref('');
const messageType = ref('info');

const loginForm = reactive({
  userId: '',
  password: '',
});

const registerForm = reactive({
  userId: '',
  password: '',
});

const submitLabel = computed(() =>
  currentStep.value === 'register' ? '完成注册' : '登录'
);

const firstPlaceholder = computed(() =>
  currentStep.value === 'register' ? '输入需要注册的用户ID' : '输入已注册的用户ID'
);

function setMessage(text, type = 'info') {
  message.value = text;
  messageType.value = type;
}

function goToStep(step) {
  currentStep.value = step;
  setMessage('');
}

function validateForm(formState) {
  if (!String(formState.userId || '').trim()) {
    return '请输入用户ID。';
  }

  if (!String(formState.password || '').trim()) {
    return '请输入密码。';
  }

  if (String(formState.password).length < 4) {
    return '密码至少需要 4 位。';
  }

  return '';
}

async function handleRegister() {
  const errorMessage = validateForm(registerForm);

  if (errorMessage) {
    setMessage(errorMessage, 'error');
    return;
  }

  isSubmitting.value = true;
  setMessage('');

  try {
    const session = await registerWithDatabase({
      userId: registerForm.userId,
      password: registerForm.password,
    });

    setMessage('恭喜你注册完成，正在进入 Qwen 问答页面。', 'success');
    setTimeout(() => emit('enter-chat', session), 500);
  } catch (error) {
    setMessage(error.message || '注册失败，请稍后再试。', 'error');
  } finally {
    isSubmitting.value = false;
  }
}

async function handleLogin() {
  const errorMessage = validateForm(loginForm);

  if (errorMessage) {
    setMessage(errorMessage, 'error');
    return;
  }

  isSubmitting.value = true;
  setMessage('');

  try {
    const session = await loginWithDatabase({
      userId: loginForm.userId,
      password: loginForm.password,
    });

    setMessage('登录成功，正在进入 Qwen 问答页面。', 'success');
    setTimeout(() => emit('enter-chat', session), 500);
  } catch (error) {
    setMessage(error.message || '登录失败，请稍后再试。', 'error');
  } finally {
    isSubmitting.value = false;
  }
}

function handleSubmit() {
  if (currentStep.value === 'register') {
    handleRegister();
    return;
  }

  handleLogin();
}

function handleGuestEntry() {
  emit('enter-chat', continueAsGuestSession());
}
</script>

<template>
  <section class="auth-shell">
    <template v-if="currentStep === 'entry'">
      <div class="entry-card">
        <h1>苏小游</h1>
        <p>选择你的进入方式</p>
        <div class="entry-actions">
          <button class="entry-btn primary" type="button" @click="goToStep('login')">登录</button>
          <button class="entry-btn" type="button" @click="goToStep('register')">注册</button>
          <button class="entry-btn" type="button" @click="handleGuestEntry">游客进入</button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="step-card">
        <div class="field-box">
          <input
            v-if="currentStep === 'register'"
            v-model="registerForm.userId"
            class="auth-input"
            type="text"
            :placeholder="firstPlaceholder"
          />
          <input
            v-else
            v-model="loginForm.userId"
            class="auth-input"
            type="text"
            :placeholder="firstPlaceholder"
          />
        </div>

        <div class="field-box">
          <input
            v-if="currentStep === 'register'"
            v-model="registerForm.password"
            class="auth-input"
            type="password"
            placeholder="输入注册密码"
          />
          <input
            v-else
            v-model="loginForm.password"
            class="auth-input"
            type="password"
            placeholder="输入登录密码"
          />
        </div>

        <button class="submit-btn" type="button" :disabled="isSubmitting" @click="handleSubmit">
          {{ isSubmitting ? '处理中...' : submitLabel }}
        </button>
        <button class="back-btn" type="button" :disabled="isSubmitting" @click="goToStep('entry')">
          返回
        </button>
      </div>
    </template>

    <p v-if="message" class="message-box" :class="`message-${messageType}`">{{ message }}</p>
  </section>
</template>

<style scoped>
.auth-shell {
  width: min(100%, 420px);
}

.entry-card,
.step-card {
  padding: 28px 22px;
  border-radius: 28px;
  background: linear-gradient(180deg, #edf6fb 0%, #dceefa 100%);
  box-shadow: 0 20px 40px rgba(71, 112, 148, 0.12);
}

.entry-card h1 {
  margin: 0;
  font-size: 34px;
  text-align: center;
  color: #2d4458;
}

.entry-card p {
  margin: 10px 0 22px;
  text-align: center;
  color: #6b7f91;
  font-size: 14px;
}

.entry-actions {
  display: grid;
  gap: 12px;
}

.entry-btn,
.submit-btn,
.back-btn {
  width: 100%;
  height: 50px;
  border: 0;
  border-radius: 16px;
  font-size: 18px;
  cursor: pointer;
}

.entry-btn {
  background: rgba(255, 255, 255, 0.92);
  color: #607789;
}

.entry-btn.primary,
.submit-btn {
  background: linear-gradient(180deg, #8ecdf5 0%, #7dbde8 100%);
  color: #ffffff;
}

.step-card {
  display: grid;
  gap: 16px;
}

.field-box {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.95);
  overflow: hidden;
}

.auth-input {
  width: 100%;
  height: 56px;
  border: 0;
  outline: none;
  background: transparent;
  padding: 0 18px;
  text-align: center;
  font-size: 18px;
  color: #607789;
}

.auth-input::placeholder {
  color: #9aa8b5;
}

.back-btn {
  background: transparent;
  color: #6b7f91;
  height: 38px;
}

.message-box {
  margin: 14px 0 0;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.6;
}

.message-info {
  background: #eef5fb;
  color: #4d6478;
}

.message-success {
  background: #ebf8ef;
  color: #1b6a41;
}

.message-error {
  background: #fff0f0;
  color: #b42318;
}

@media (max-width: 640px) {
  .entry-card,
  .step-card {
    padding: 24px 16px;
    border-radius: 22px;
  }
}
</style>
