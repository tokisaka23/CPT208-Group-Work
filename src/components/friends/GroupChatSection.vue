<script setup>
import { Empty, Tag } from 'vant';

const text = {
  title: '\u6211\u521b\u5efa\u7684\u7fa4\u804a',
  desc: '\u8fd9\u91cc\u4f1a\u4fdd\u7559\u4f60\u5728\u5f53\u524d\u6d4f\u89c8\u5668\u91cc\u521b\u5efa\u8fc7\u7684\u7fa4\u804a',
  empty: '\u8fd8\u6ca1\u6709\u7fa4\u804a\uff0c\u70b9\u51fb\u597d\u53cb\u5217\u8868\u53f3\u4e0a\u89d2\u7684\u52a0\u53f7\u8bd5\u8bd5',
  peopleSuffix: '\u4eba',
  createdAt: '\u521b\u5efa\u65f6\u95f4',
  openHint: '\u70b9\u51fb\u5373\u53ef\u8fdb\u5165\u7fa4\u804a',
};

defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['open-group']);

function countUnreadGroups(groups) {
  return (groups || []).filter((group) => group?.hasUnread).length;
}

function formatMembers(group) {
  return (group.members || []).map((member) => member.username).join('\u3001');
}

function formatTime(group) {
  if (!group?.createdAt) {
    return '';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(group.createdAt));
}
</script>

<template>
  <section class="panel-card">
    <div class="section-head">
      <div>
        <div class="section-title-row">
          <h2 class="section-title">{{ text.title }}</h2>
          <span v-if="countUnreadGroups(groups)" class="section-unread-dot" aria-label="存在未读群消息" />
        </div>
        <p class="section-desc">{{ text.desc }}</p>
      </div>
      <span class="count-badge">{{ groups.length }}</span>
    </div>

    <Empty
      v-if="!groups.length"
      image="search"
      :description="text.empty"
    />

    <div v-else class="group-list">
      <button
        v-for="group in groups"
        :key="group.id"
        class="group-item"
        :class="{ 'group-item--unread': group.hasUnread }"
        type="button"
        @click="emit('open-group', group)"
      >
        <div class="group-top">
          <div class="group-avatar-wrap">
            <div class="group-avatar">{{ group.name.slice(0, 1) }}</div>
            <span v-if="group.hasUnread" class="group-unread-dot" aria-label="该群聊有未读消息" />
          </div>
          <div class="group-copy">
            <div class="group-title-row">
              <strong class="group-name">{{ group.name }}</strong>
              <Tag plain type="primary">{{ group.members.length }} {{ text.peopleSuffix }}</Tag>
            </div>
            <p class="group-members">{{ formatMembers(group) }}</p>
          </div>
        </div>

        <div class="group-meta">
          <span>{{ text.createdAt }} {{ formatTime(group) }}</span>
          <span>{{ text.openHint }}</span>
        </div>
      </button>
    </div>
  </section>
</template>

<style scoped>
.panel-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 16px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(31, 58, 44, 0.08);
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title {
  margin: 0 0 6px;
  font-size: 18px;
  color: #1f2a22;
}

.section-unread-dot {
  width: 10px;
  height: 10px;
  flex: 0 0 10px;
  border-radius: 999px;
  background: #ee4f44;
  box-shadow: 0 0 0 3px rgba(238, 79, 68, 0.14);
}

.section-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #6f7a71;
}

.count-badge {
  min-width: 32px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef5f0;
  color: #2f5d44;
  font-size: 13px;
  text-align: center;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border: none;
  border-radius: 18px;
  background:
    radial-gradient(circle at top right, rgba(92, 143, 112, 0.12), transparent 28%),
    #f7faf8;
  text-align: left;
  cursor: pointer;
}

.group-item--unread {
  box-shadow: inset 0 0 0 1px rgba(238, 79, 68, 0.14);
}

.group-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.group-avatar-wrap {
  position: relative;
  flex: 0 0 42px;
}

.group-avatar {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2f8a5c 0%, #87c39f 100%);
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-unread-dot {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #ee4f44;
  border: 2px solid #f7faf8;
}

.group-copy {
  min-width: 0;
  flex: 1;
}

.group-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.group-name {
  font-size: 15px;
  color: #1f2a22;
}

.group-members {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #5e6d63;
}

.group-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #78867d;
}
</style>
