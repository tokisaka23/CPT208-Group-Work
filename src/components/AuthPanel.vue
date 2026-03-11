<script setup>
import { computed, reactive, ref } from 'vue';

const emit = defineEmits(['login', 'register', 'guest-login', 'wechat-login']);

const currentMode = ref('login');
const feedback = ref('');
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

const primaryButtonText = computed(() =>
  currentMode.value === 'login' ? '邮箱登录' : '创建账号'
);

function setMode(mode) {
  currentMode.value = mode;
  feedback.value = '';
}

function validateLoginForm() {
  if (!loginForm.email.trim()) {
    return '请输入邮箱';
  }

  if (!loginForm.password.trim()) {
    return '请输入密码';
  }

  return '';
}

function validateRegisterForm() {
  if (!registerForm.displayName.trim()) {
    return '请输入昵称';
  }

  if (!registerForm.email.trim()) {
    return '请输入邮箱';
  }

  if (!registerForm.password.trim()) {
    return '请输入密码';
  }

  if (registerForm.password.length < 6) {
    return '密码长度至少为 6 位';
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    return '两次输入的密码不一致';
  }

  return '';
}

async function handlePrimaryAction() {
  const errorMessage =
    currentMode.value === 'login' ? validateLoginForm() : validateRegisterForm();

  if (errorMessage) {
    feedback.value = errorMessage;
    return;
  }

  isSubmitting.value = true;
  feedback.value = '';

  try {
    if (currentMode.value === 'login') {
      emit('login', {
        email: loginForm.email.trim(),
        password: loginForm.password,
      });
      feedback.value = '已触发邮箱登录事件，后续接入 Supabase 即可联通真实登录。';
      return;
    }

    emit('register', {
      displayName: registerForm.displayName.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password,
    });
    feedback.value = '已触发注册事件，后续可在这里串联资料表写入逻辑。';
  } finally {
    isSubmitting.value = false;
  }
}

function handleGuestLogin() {
  feedback.value = '已进入游客模式预览，后续可以在这里生成游客 ID。';
  emit('guest-login');
}

function handleWechatLogin() {
  feedback.value = '微信登录入口已预留，后续建议接入 Supabase OAuth 或微信开放平台。';
  emit('wechat-login');
}
</script>

<template>
  <section class="auth-panel">
    <header class="auth-header">
      <p class="eyebrow">身份认证</p>
      <h1>{{ currentMode === 'login' ? '欢迎回来' : '创建新账号' }}</h1>
      <p class="subtitle">
        支持邮箱登录、注册、游客进入，并预留微信登录入口，方便后续做分享链路。
      </p>
    </header>

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
        v-model="currentMode === 'login' ? loginForm.email : registerForm.email"
        label="邮箱"
        type="email"
        placeholder="请输入邮箱"
        clearable
      />

      <Field
        v-model="currentMode === 'login' ? loginForm.password : registerForm.password"
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

      <Button block round plain type="success" class="wechat-button" @click="handleWechatLogin">
        微信登录
      </Button>

      <Button block round plain class="guest-button" @click="handleGuestLogin">
        游客进入
      </Button>
    </div>

    <p class="helper-text">
      {{
        currentMode === 'login'
          ? '没有账号？点击上方“注册”即可创建新用户。'
          : '已有账号？点击上方“登录”即可返回邮箱登录。'
      }}
    </p>

    <p v-if="feedback" class="feedback">{{ feedback }}</p>
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
  background: #eef7f0;
  font-size: 13px;
  line-height: 1.5;
  color: #24573d;
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
