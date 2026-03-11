<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { Button, CellGroup, Field, NavBar } from 'vant';
import UsernameSupabaseAuthPanel from './components/UsernameSupabaseAuthPanel.vue';
import FriendsPage from './pages/friends/FriendsPage.vue';
import {
  getCurrentSession,
  onAuthStateChange,
  signOut,
} from './services/supabase/authRuntime';
import { isSupabaseConfigured } from './services/supabase/clientRuntime';
import { clearGuestSession } from './utils/guestSession';

const defaultAgentMessage = '你好，我是苏州本地向导，随时帮你规划路线、推荐景点。';

const userInput = ref('');
const messages = ref([{ role: 'agent', content: defaultAgentMessage }]);
const isLoading = ref(false);
const isBooting = ref(true);
const currentSession = ref(null);
const activeView = ref('chat');

let authSubscription = null;

function getRegisteredUsername(user) {
  return user?.user_metadata?.display_name || user?.user_metadata?.username || '已登录用户';
}

function buildWelcomeMessage(session) {
  if (!session) {
    return '欢迎来到苏小游。';
  }

  if (session.mode === 'guest') {
    return '游客你好，欢迎进入苏州 AI 导览助手。';
  }

  return `${session.user.username}，欢迎回来，现在可以开始提问了。`;
}

function resetMessages(session = null) {
  messages.value = [
    { role: 'agent', content: session ? buildWelcomeMessage(session) : defaultAgentMessage },
  ];
}

function applySupabaseSession(session, user) {
  if (!session || !user) {
    currentSession.value = null;
    activeView.value = 'chat';
    return;
  }

  clearGuestSession();
  currentSession.value = {
    mode: 'registered',
    session,
    user: {
      id: user.id,
      username: getRegisteredUsername(user),
      friendCode: user?.user_metadata?.friend_code || '',
    },
  };
  activeView.value = 'chat';
  resetMessages(currentSession.value);
}

function enterChat(session) {
  if (session.mode === 'guest') {
    currentSession.value = {
      mode: 'guest',
      id: session.id,
      session: null,
      user: {
        id: session.id,
        username: '游客',
      },
    };
    activeView.value = 'chat';
    resetMessages(currentSession.value);
    return;
  }

  currentSession.value = {
    mode: 'registered',
    session: session.session ?? null,
    user: {
      id: session.user.id,
      username: session.user.displayName || session.user.username,
      friendCode: session.user.friendCode || '',
    },
  };
  activeView.value = 'chat';
  resetMessages(currentSession.value);
}

async function exitChat() {
  if (currentSession.value?.mode === 'registered' && isSupabaseConfigured()) {
    try {
      await signOut();
    } catch (error) {
      messages.value.push({ role: 'agent', content: `退出登录失败：${error.message}` });
      return;
    }
  }

  clearGuestSession();
  currentSession.value = null;
  activeView.value = 'chat';
  userInput.value = '';
  isLoading.value = false;
  resetMessages();
}

async function restoreRegisteredSession() {
  if (!isSupabaseConfigured()) {
    return;
  }

  const session = await getCurrentSession();
  if (!session) {
    return;
  }

  applySupabaseSession(session, session.user);
}

function openFriendsPage() {
  activeView.value = 'friends';
}

function openChatPage() {
  activeView.value = 'chat';
}

onMounted(async () => {
  try {
    await restoreRegisteredSession();
  } catch (error) {
    messages.value = [{ role: 'agent', content: `登录状态恢复失败：${error.message}` }];
  } finally {
    isBooting.value = false;
  }

  if (isSupabaseConfigured()) {
    const { data } = onAuthStateChange(async (_event, session) => {
      if (!session) {
        if (currentSession.value?.mode === 'registered') {
          currentSession.value = null;
          activeView.value = 'chat';
          resetMessages();
        }
        return;
      }

      try {
        applySupabaseSession(session, session.user);
      } catch (error) {
        messages.value.push({ role: 'agent', content: `同步登录状态失败：${error.message}` });
      }
    });

    authSubscription = data.subscription;
  }
});

onUnmounted(() => {
  authSubscription?.unsubscribe();
});

async function sendMessage() {
  if (!userInput.value.trim()) {
    return;
  }

  const prompt = userInput.value;
  messages.value.push({ role: 'user', content: prompt });
  userInput.value = '';
  isLoading.value = true;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        gpsLocation: '31.3155, 120.6322',
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `请求失败，状态码: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '返回数据格式异常');
    }

    messages.value.push({ role: 'agent', content: data.response });
  } catch (error) {
    messages.value.push({ role: 'agent', content: `出现问题：${error.message}` });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="app-container">
    <template v-if="isBooting">
      <NavBar title="苏小游 · 苏州AI导览助手" fixed placeholder />

      <main class="entry-page">
        <div class="boot-card">正在恢复登录状态...</div>
      </main>
    </template>

    <template v-else-if="!currentSession">
      <NavBar title="苏小游 · 苏州AI导览助手" fixed placeholder />

      <main class="entry-page">
        <UsernameSupabaseAuthPanel @enter-chat="enterChat" />
      </main>
    </template>

    <template v-else>
      <NavBar
        :title="activeView === 'friends' ? '好友与定位' : '苏小游 · 苏州AI导览助手'"
        fixed
        placeholder
      />

      <section class="chat-status-bar">
        <span>
          {{
            currentSession.mode === 'guest'
              ? `当前身份：游客（${currentSession.id}）`
              : `当前身份：${currentSession.user.username}`
          }}
        </span>

        <div class="action-stack">
          <Button size="small" plain type="danger" @click="exitChat">
            {{ currentSession.mode === 'guest' ? '退出游客模式' : '退出登录' }}
          </Button>

          <Button
            v-if="currentSession.mode === 'registered' && activeView === 'friends'"
            size="small"
            plain
            type="success"
            @click="openChatPage"
          >
            返回对话
          </Button>

          <Button
            v-else-if="currentSession.mode === 'registered'"
            size="small"
            plain
            type="primary"
            @click="openFriendsPage"
          >
            好友
          </Button>
        </div>
      </section>

      <template v-if="activeView === 'friends'">
        <FriendsPage :show-nav-bar="false" />
      </template>

      <template v-else>
        <div class="chat-window">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message-wrapper', msg.role === 'user' ? 'is-user' : 'is-agent']"
          >
            <div class="bubble">{{ msg.content }}</div>
          </div>

          <div v-if="isLoading" class="message-wrapper is-agent">
            <div class="bubble typing">正在生成回复，请稍等...</div>
          </div>
        </div>

        <div class="input-area">
          <CellGroup inset>
            <Field
              v-model="userInput"
              center
              clearable
              placeholder="请输入你的问题，例如“推荐苏州园林”"
              @keyup.enter="sendMessage"
            >
              <template #button>
                <Button size="small" type="primary" :loading="isLoading" @click="sendMessage">
                  发送
                </Button>
              </template>
            </Field>
          </CellGroup>
        </div>
      </template>
    </template>
  </div>
</template>

<style>
body {
  margin: 0;
  background:
    radial-gradient(circle at top, rgba(167, 190, 176, 0.24), transparent 28%),
    linear-gradient(180deg, #eef2ef 0%, #f6f7f6 100%);
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.entry-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 40px;
}

.boot-card {
  padding: 18px 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  color: #466173;
  font-size: 15px;
}

.chat-status-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: #f2f7f3;
  color: #24573d;
  font-size: 14px;
}

.action-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-window {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.is-user {
  justify-content: flex-end;
}

.is-agent {
  justify-content: flex-start;
}

.bubble {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.is-user .bubble {
  background-color: #1989fa;
  color: white;
  border-bottom-right-radius: 2px;
}

.is-agent .bubble {
  background-color: white;
  color: #323233;
  border-bottom-left-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.typing {
  color: #969799;
  font-style: italic;
}

.input-area {
  padding: 10px 0;
  background-color: #fff;
  border-top: 1px solid #ebedf0;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
