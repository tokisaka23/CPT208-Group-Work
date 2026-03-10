<script setup>
import { ref } from 'vue';
import { NavBar, Field, Button, CellGroup } from 'vant';

const userInput = ref('');
const messages = ref([
  { role: 'agent', content: '你好，我是苏州本地向导，随时帮你规划路线、推荐景点。' }
]);
const isLoading = ref(false);

const sendMessage = async () => {
  if (!userInput.value.trim()) return;
  const prompt = userInput.value;
  messages.value.push({ role: 'user', content: prompt });
  userInput.value = '';
  isLoading.value = true;

  try {
    const API_BASE = import.meta.env.DEV 
      ? 'http://localhost:3000' 
      : 'https://cpt208-group-work.vercel.app';
    
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        gpsLocation: '31.3155, 120.6322' // 模拟定位坐标
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `请求失败，状态码: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      messages.value.push({ role: 'agent', content: data.response });
    } else {
      throw new Error(data.error || '返回数据格式异常');
    }
  } catch (error) {
    messages.value.push({ role: 'agent', content: `⚠️ 出现问题：${error.message}` });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="app-container">
    <NavBar title="苏小游 · 苏州AI导览助手" fixed placeholder />

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
          placeholder="请输入你的问题，例如‘推荐苏州园林’"
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
  </div>
</template>

<style>
body { margin: 0; background-color: #f7f8fa; }
.app-container { height: 100vh; display: flex; flex-direction: column; }
.chat-window { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.message-wrapper { display: flex; width: 100%; }
.is-user { justify-content: flex-end; }
.is-agent { justify-content: flex-start; }
.bubble { max-width: 75%; padding: 10px 14px; border-radius: 8px; font-size: 14px; line-height: 1.5; word-wrap: break-word; }
.is-user .bubble { background-color: #1989fa; color: white; border-bottom-right-radius: 2px; }
.is-agent .bubble { background-color: white; color: #323233; border-bottom-left-radius: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.typing { color: #969799; font-style: italic; }
.input-area { padding: 10px 0; background-color: #fff; border-top: 1px solid #ebedf0; padding-bottom: env(safe-area-inset-bottom); }
</style>
