<script setup>
import { ref } from 'vue';
import { NavBar, Field, Button, CellGroup } from 'vant';

const userInput = ref('');
const messages = ref([
  { role: 'agent', content: '你好！我是苏小游，平江路智能导览助手。你可以问我关于苏州的历史、景点或隐藏打卡点哦～' }
]);
const isLoading = ref(false);

const sendMessage = async () => {
  if (!userInput.value.trim()) return;
  
  const prompt = userInput.value;
  messages.value.push({ role: 'user', content: prompt });
  userInput.value = '';
  isLoading.value = true;

  try {
    // 所有请求直连 AI
    const aiResponse = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CEREBRAS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3.1-8b",
        messages: [
          { 
            role: "system", 
            content: `你是一个苏州平江路旅游助手。用户当前坐标: 31.3155,120.6322。请提供景点导览和解说。保持回答简洁友好，富有文化底蕴，字数150字以内。` 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.json();
      throw new Error(err.error?.message || `状态码: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    messages.value.push({ 
      role: 'agent', 
      content: data.choices[0].message.content 
    });
    
  } catch (error) {
    // 友好错误提示
    messages.value.push({ 
      role: 'agent', 
      content: `⚠️ 服务暂时不可用: ${error.message}` 
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="app-container">
    <NavBar title="苏小游 - 平江路导览助手" fixed placeholder />

    <div class="chat-window">
      <div 
        v-for="(msg, index) in messages" 
        :key="index" 
        :class="['message-wrapper', msg.role === 'user' ? 'is-user' : 'is-agent']"
      >
        <div class="bubble">{{ msg.content }}</div>
      </div>
      <div v-if="isLoading" class="message-wrapper is-agent">
        <div class="bubble typing">正在生成回复，请稍候...</div>
      </div>
    </div>

    <div class="input-area">
      <CellGroup inset>
        <Field
          v-model="userInput"
          center
          clearable
          placeholder="输入你的问题，例如：平江路有哪些老宅？"
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