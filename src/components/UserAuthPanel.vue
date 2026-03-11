<script setup>
import { computed, reactive, ref } from 'vue';
import {
  continueAsGuest,
  signInWithEmail,
  signUpWithEmail,
  startWechatLogin,
} from '../services/supabase/auth';
import { isSupabaseConfigured } from '../services/supabase/client';

const emit = defineEmits(['login-success', 'register-success', 'guest-login', 'wechat-login']);

const currentMode = ref('login');
const feedback = ref('');
const feedbackType = ref('info');
const isSubmitting = ref(false);

const loginForm = reactive({
  email: '',
  password: '',
});

const registerForm = reactive({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const formEmail = computed({
  get: () => (currentMode.value === 'login' ? loginForm.email : registerForm.email),
  set: (value) => {
    if (currentMode.value === 'login') {
      loginForm.email = value;
      return;
    }

    registerForm.email = value;
  },
});

const formPassword = computed({
  get: () => (currentMode.value === 'login' ? loginForm.password : registerForm.password),
  set: (value) => {
    if (currentMode.value === 'login') {
      loginForm.password = value;
      return;
    }

    registerForm.password = value;
  },
});

const isReady = computed(() => isSupabaseConfigured());
const primaryButtonText = computed(() =>
  currentMode.value === 'login' ? '邮箱登录' : '创建账号'
);

function setMode(mode) {
  currentMode.value = mode;
  feedback.value = '';
  feedbackType.value = 'info';
}

function setFeedback(message, type = 'info') {
  feedback.value = message;
  feedbackType.value = type;
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateLoginForm() {
  if (!loginForm.email.trim()) {
    return '请输入邮箱。';
  }

  if (!validateEmail(loginForm.email.trim())) {
    return '邮箱格式不正确。';
  }

  if (!loginForm.password.trim()) {
    return '请输入密码。';
  }

  return '';
}

function validateRegisterForm() {
  if (!registerForm.displayName.trim()) {
    return '请输入昵称。';
  }

  if (!registerForm.email.trim()) {
    return '请输入邮箱。';
  }

  if (!validateEmail(registerForm.email.trim())) {
    return '邮箱格式不正确。';
  }

  if (!registerForm.password.trim()) {
    return '请输入密码。';
  }

  if (registerForm.password.length < 6) {
    return '密码长度至少为 6 位。';
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    return '两次输入的密码不一致。';
  }

  return '';
}

function resetRegisterForm() {
  registerForm.displayName = '';
  registerForm.email = '';
  registerForm.password = '';
  registerForm.confirmPassword = '';
}

async function handlePrimaryAction() {
  const errorMessage =
    currentMode.value === 'login' ? validateLoginForm() : validateRegisterForm();

  if (errorMessage) {
    setFeedback(errorMessage, 'error');
    return;
  }

  if (!isReady.value) {
    setFeedback(
      '还没有配置 Supabase。请先在 .env.local 中填写 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。',
      'warning'
    );
    return;
  }

  isSubmitting.value = true;
  setFeedback('');

  try {
    if (currentMode.value === 'login') {
      const payload = {
        email: loginForm.email.trim(),
        password: loginForm.password,
      };

      const data = await signInWithEmail(payload);
      emit('login-success', data);
      setFeedback('邮箱登录成功。你现在可以继续接用户主页或功能页。', 'success');
      return;
    }

    const payload = {
      displayName: registerForm.displayName.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password,
    };

    const data = await signUpWithEmail(payload);
    emit('register-success', data);
    resetRegisterForm();
    setMode('login');
    setFeedback(
      '注册请求已提交。若你的 Supabase 开启了邮箱确认，请去邮箱完成验证。',
      'success'
    );
  } catch (error) {
    setFeedback(error.message || '认证请求失败，请稍后重试。', 'error');
  } finally {
    isSubmitting.value = false;
  }
}

function handleGuestLogin() {
  const guestSession = continueAsGuest();
  emit('guest-login', guestSession);
  setFeedback(`已进入游客模式，当前游客 ID：${guestSession.id}`, 'success');
}

function handleWechatLogin() {
  try {
    startWechatLogin();
    emit('wechat-login');
  } catch (error) {
    setFeedback(
      error.message || '微信登录暂时不可用，请先完成微信登录地址配置。',
      'warning'
    );
  }
}
</script>

<template>
  <section class="auth-panel">
    <header class="auth-header">
      <p class="eyebrow">身份认证</p>
      <h1>{{ currentMode === 'login' ? '欢迎回来' : '创建新账号' }}</h1>
      <p class="subtitle">
        这个组件已经接好了邮箱登录、注册、游客模式和微信登录入口，后续只需要把它挂到页面里。
      </p>
    </header>

    <div v-if="!isReady" class="env-hint">
      尚未检测到 Supabase 配置。游客模式可以直接测试，登录和注册需要先补全 `.env.local`。
    </div>

    <div class="mode-switch">
      <button
        type="button"
        class="mode-button"
        :class="{ active: currentMode === 'login' }"
        @click="setMode('login')"
      >
        登录
      </button>
      <button
        type="button"
        class="mode-button"
        :class="{ active: currentMode === 'register' }"
        @click="setMode('register')"
      >
        注册
      </button>
    </div>

    <CellGroup inset class="form-card">
      <template v-if="currentMode === 'register'">
        <Field
          v-model="registerForm.displayName"
          label="昵称"
          placeholder="请输入昵称"
          clearable
        />
      </template>

      <Field
        v-model="formEmail"
        label="邮箱"
        type="email"
        placeholder="请输入邮箱"
        clearable
      />

      <Field
        v-model="formPassword"
        label="密码"
        type="password"
        placeholder="请输入密码"
        clearable
      />

      <template v-if="currentMode === 'register'">
        <Field
          v-model="registerForm.confirmPassword"
          label="确认密码"
          type="password"
          placeholder="请再次输入密码"
          clearable
        />
      </template>
    </CellGroup>

    <div class="actions">
      <Button
        block
        round
        type="primary"
        class="primary-button"
        :loading="isSubmitting"
        @click="handlePrimaryAction"
      >
        {{ primaryButtonText }}
      </Button>

      <Button
        block
        round
        plain
        type="success"
        class="wechat-button"
        :disabled="isSubmitting"
        @click="handleWechatLogin"
      >
        微信登录
      </Button>

      <Button
        block
        round
        plain
        class="guest-button"
        :disabled="isSubmitting"
        @click="handleGuestLogin"
      >
        游客进入
      </Button>
    </div>

    <p class="helper-text">
      {{
        currentMode === 'login'
          ? '没有账号时，切换到“注册”即可创建新用户。'
          : '已有账号时，切换到“登录”即可用邮箱和密码进入。'
      }}
    </p>

    <p v-if="feedback" class="feedback" :class="`feedback-${feedbackType}`">
      {{ feedback }}
    </p>
  </section>
</template>

<style scoped>
.auth-panel {
  width: min(100%, 420px);
  padding: 28px 22px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(246, 251, 247, 0.96));
  box-shadow: 0 24px 60px rgba(26, 71, 52, 0.14);
  backdrop-filter: blur(12px);
}

.auth-header h1 {
  margin: 8px 0 10px;
  font-size: 30px;
  line-height: 1.15;
  color: #173829;
}

.eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #5d8c72;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #5a6d63;
}

.env-hint {
  margin-top: 18px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #fff4df;
  color: #8a5a00;
  font-size: 13px;
  line-height: 1.6;
}

.mode-switch {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 24px 0 18px;
}

.mode-button {
  padding: 12px 0;
  border: 0;
  border-radius: 14px;
  background: #edf4ef;
  color: #476253;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-button.active {
  background: linear-gradient(135deg, #1f6f4b, #2d9d6c);
  color: #fff;
  box-shadow: 0 10px 24px rgba(31, 111, 75, 0.24);
}

.form-card {
  overflow: hidden;
  border-radius: 20px;
}

.actions {
  display: grid;
  gap: 12px;
  margin-top: 20px;
}

.primary-button {
  --van-button-primary-background: #1f6f4b;
  --van-button-primary-border-color: #1f6f4b;
  height: 44px;
}

.wechat-button {
  --van-button-success-color: #07c160;
  --van-button-success-border-color: #07c160;
  height: 44px;
}

.guest-button {
  color: #1f6f4b;
  border-color: rgba(31, 111, 75, 0.28);
  height: 44px;
}

.helper-text {
  margin: 16px 0 0;
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
  color: #607166;
}

.feedback {
  margin: 14px 0 0;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.5;
}

.feedback-info {
  background: #eef7f0;
  color: #24573d;
}

.feedback-success {
  background: #ebf9f0;
  color: #17683c;
}

.feedback-warning {
  background: #fff5e8;
  color: #8a5a00;
}

.feedback-error {
  background: #fff0f0;
  color: #b42318;
}

@media (max-width: 640px) {
  .auth-panel {
    width: 100%;
    padding: 24px 18px;
    border-radius: 24px;
  }

  .auth-header h1 {
    font-size: 26px;
  }
}
</style>
