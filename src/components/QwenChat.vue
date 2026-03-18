<script setup>
import { ref } from 'vue';
import { Field, Button, CellGroup } from 'vant';

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
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        gpsLocation: '31.3155, 120.6322'
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
  <section class="chat-panel">
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
  </section>
</template>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
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
  color: #ffffff;
  border-bottom-right-radius: 2px;
}

.is-agent .bubble {
  background-color: #ffffff;
  color: #323233;
  border-bottom-left-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.typing {
  color: #969799;
  font-style: italic;
}

.input-area {
  margin-top: 6px;
  padding: 10px 0;
  background-color: #ffffff;
  border-top: 1px solid #ebedf0;
}
</style>
