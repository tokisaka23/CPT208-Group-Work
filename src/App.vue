<script setup>
import { NavBar } from 'vant';
import UgcSubmit from './components/UgcSubmit.vue';
import QwenChat from './components/QwenChat.vue';
</script>

<template>
  <div class="app-container">
    <NavBar title="苏小游 · 苏州AI导览助手" fixed placeholder />

    <main class="main-content">
      <section class="ugc-panel">
        <UgcSubmit />
      </section>

      <section class="chat-window">
        <QwenChat />
      </section>
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  background-color: #f7f8fa;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.ugc-panel {
  width: 100%;
}

.chat-window {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
