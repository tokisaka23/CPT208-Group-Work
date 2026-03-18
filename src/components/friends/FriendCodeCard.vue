<script setup>
import { Button } from 'vant';

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['copy']);
</script>

<template>
  <section class="panel-card friend-code-card">
    <div class="card-head">
      <div>
        <p class="card-eyebrow">我的好友码</p>
        <h2 class="card-title">让好友通过这个编码添加你</h2>
      </div>
      <Button size="small" plain type="primary" @click="emit('copy')">
        复制
      </Button>
    </div>

    <div class="code-box">
      <span class="code-label">friend_code</span>
      <strong class="code-value">{{ props.user.friendCode || '暂未生成好友码' }}</strong>
    </div>

    <div class="meta-row">
      <span class="user-name">{{ props.user.username || '未命名用户' }}</span>
      <span class="meta-text">每个注册用户都对应唯一的好友码</span>
    </div>
  </section>
</template>

<style scoped>
.panel-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 18px 16px;
  box-shadow: 0 10px 28px rgba(31, 58, 44, 0.08);
}

.friend-code-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.card-eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  color: #7f8c81;
}

.card-title {
  margin: 0;
  font-size: 18px;
  line-height: 1.4;
  color: #1f2a22;
}

.code-box {
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #eaf4ed 0%, #f8fbf9 100%);
}

.code-label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  color: #6f7a71;
  text-transform: uppercase;
}

.code-value {
  display: block;
  font-size: 26px;
  line-height: 1.2;
  letter-spacing: 1px;
  color: #183f2e;
  word-break: break-all;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #244834;
}

.meta-text {
  font-size: 12px;
  color: #7f8c81;
}
</style>
