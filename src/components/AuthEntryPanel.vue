<script setup>
import { computed, reactive, ref } from 'vue';
import {
  continueAsGuestUser,
  loginLocalUser,
  registerLocalUser,
} from '../services/auth/localAuth';

const emit = defineEmits(['enter-chat']);

const currentStep = ref('entry');
const isSubmitting = ref(false);
const message = ref('');
const messageType = ref('info');

const loginForm = reactive({
  account: '',
  password: '',
});

const registerForm = reactive({
  username: '',
  password: '',
});

const panelTitle = computed(() => {
  if (currentStep.value === 'login') {
    return '登录账号';
  }

  if (currentStep.value === 'register') {
    return '注册账号';
  }

  return '进入苏小游';
});

const panelDescription = computed(() => {
  if (currentStep.value === 'login') {
    return '请输入你之前保存的账号和密码，验证成功后会直接进入 Qwen 问答页面。';
  }

  if (currentStep.value === 'register') {
    return '先创建一个简单账号，注册完成后系统会提示成功，并自动进入 Qwen 问答页面。';
  }

  return '先选择你的进入方式。登录、注册和游客进入都从这里开始。';
});

function setMessage(text, type = 'info') {
  message.value = text;
  messageType.value = type;
}

function goToStep(step) {
  currentStep.value = step;
  setMessage('');
}

function validateRegisterForm() {
  if (!registerForm.username.trim()) {
    return '请输入注册用户名。';
  }

  if (!registerForm.password.trim()) {
    return '请输入注册密码。';
  }

  if (registerForm.password.length < 4) {
    return '为了方便测试，密码至少输入 4 位。';
  }

  return '';
}

function validateLoginForm() {
  if (!loginForm.account.trim()) {
    return '请输入手机号或用户名。';
  }

  if (!loginForm.password.trim()) {
    return '请输入密码。';
  }

  return '';
}

async function handleRegister() {
  const errorMessage = validateRegisterForm();

  if (errorMessage) {
    setMessage(errorMessage, 'error');
    return;
  }

  isSubmitting.value = true;
  setMessage('');

  try {
    const session = registerLocalUser({
      username: registerForm.username,
      password: registerForm.password,
    });

    setMessage('恭喜你注册完成，正在进入 Qwen 问答页面。', 'success');

    setTimeout(() => {
      emit('enter-chat', session);
    }, 600);
  } catch (error) {
    setMessage(error.message || '注册失败，请稍后再试。', 'error');
  } finally {
    isSubmitting.value = false;
  }
}

async function handleLogin() {
  const errorMessage = validateLoginForm();

  if (errorMessage) {
    setMessage(errorMessage, 'error');
    return;
  }

  isSubmitting.value = true;
  setMessage('');

  try {
    const session = loginLocalUser({
      account: loginForm.account,
      password: loginForm.password,
    });

    setMessage('登录成功，正在进入 Qwen 问答页面。', 'success');

    setTimeout(() => {
      emit('enter-chat', session);
    }, 600);
  } catch (error) {
    setMessage(error.message || '登录失败，请稍后再试。', 'error');
  } finally {
    isSubmitting.value = false;
  }
}

function handleGuestEntry() {
  const session = continueAsGuestUser();
  emit('enter-chat', session);
}
</script>

<template>
  <section class="entry-panel">
    <header class="panel-header">
      <p class="panel-tag">身份入口</p>
      <h1>{{ panelTitle }}</h1>
      <p class="panel-desc">{{ panelDescription }}</p>
    </header>

    <div v-if="currentStep === 'entry'" class="entry-actions">
      <Button block round type="primary" class="entry-button" @click="goToStep('login')">
        登录
      </Button>
      <Button block round plain class="entry-button outline" @click="goToStep('register')">
        注册
      </Button>
      <Button block round plain class="entry-button outline guest" @click="handleGuestEntry">
        游客进入
      </Button>
    </div>

    <div v-else class="form-area">
      <CellGroup inset class="form-card">
        <template v-if="currentStep === 'register'">
          <Field
            v-model="registerForm.username"
            label="用户名"
            placeholder="输入注册用户名"
            clearable
          />
          <Field
            v-model="registerForm.password"
            label="密码"
            type="password"
            placeholder="输入注册密码"
            clearable
          />
        </template>

        <template v-else>
          <Field
            v-model="loginForm.account"
            label="账号"
            placeholder="输入手机号或用户名"
            clearable
          />
          <Field
            v-model="loginForm.password"
            label="密码"
            type="password"
            placeholder="输入登录密码"
            clearable
          />
        </template>
      </CellGroup>

      <div class="form-actions">
        <Button
          block
          round
          type="primary"
          class="submit-button"
          :loading="isSubmitting"
          @click="currentStep === 'register' ? handleRegister() : handleLogin()"
        >
          {{ currentStep === 'register' ? '完成注册' : '立即登录' }}
        </Button>
        <Button block round plain class="back-button" :disabled="isSubmitting" @click="goToStep('entry')">
          返回
        </Button>
      </div>
    </div>

    <p v-if="message" class="message-box" :class="`message-${messageType}`">
      {{ message }}
    </p>
  </section>
</template>

<style scoped>
.entry-panel {
  width: min(100%, 420px);
  padding: 26px 22px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 24px 60px rgba(42, 83, 66, 0.12);
}

.panel-header {
  margin-bottom: 22px;
}

.panel-tag {
  margin: 0 0 10px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #5b8b74;
}

.panel-header h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.15;
  color: #1f4535;
}

.panel-desc {
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: #587062;
}

.entry-actions,
.form-actions {
  display: grid;
  gap: 12px;
}

.entry-button,
.submit-button,
.back-button {
  height: 46px;
}

.entry-button {
  --van-button-primary-background: #2d8f5a;
  --van-button-primary-border-color: #2d8f5a;
}

.outline {
  color: #2d5a47;
  border-color: rgba(45, 90, 71, 0.18);
  background: #f4f7f4;
}

.guest {
  color: #23704d;
}

.form-area {
  display: grid;
  gap: 14px;
}

.form-card {
  overflow: hidden;
  border-radius: 20px;
}

.back-button {
  color: #476253;
  border-color: rgba(71, 98, 83, 0.18);
}

.message-box {
  margin: 18px 0 0;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.6;
}

.message-info {
  background: #eef7f0;
  color: #24573d;
}

.message-success {
  background: #e8f8ee;
  color: #19633d;
}

.message-error {
  background: #fff0f0;
  color: #b42318;
}

@media (max-width: 640px) {
  .entry-panel {
    width: 100%;
    padding: 24px 18px;
    border-radius: 24px;
  }

  .panel-header h1 {
    font-size: 28px;
  }
}
</style>
