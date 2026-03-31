<script setup>
import { computed } from 'vue';
import { Empty, Tag } from 'vant';
import { resolveLocalized, useLanguage } from '../../i18n';

const { language } = useLanguage();

const textSource = {
  title: {
    zh: '我创建的群聊',
    en: 'My Group Chats',
    ja: '自分のグループチャット',
    ko: '내 그룹 채팅',
  },
  desc: {
    zh: '这里会保留你在当前浏览器里创建过的群聊',
    en: 'Group chats created in this browser are kept here.',
    ja: 'このブラウザで作成したグループチャットがここに残ります。',
    ko: '이 브라우저에서 만든 그룹 채팅이 여기에 보관됩니다.',
  },
  empty: {
    zh: '还没有群聊，点击好友列表右上角的加号试试',
    en: 'No group chats yet. Try the plus button in the top-right of the friend list.',
    ja: 'まだグループチャットがありません。友だち一覧右上のプラスを試してください。',
    ko: '아직 그룹 채팅이 없습니다. 친구 목록 오른쪽 위의 플러스를 눌러 보세요.',
  },
  peopleSuffix: {
    zh: '人',
    en: 'people',
    ja: '人',
    ko: '명',
  },
  createdAt: {
    zh: '创建时间',
    en: 'Created',
    ja: '作成日時',
    ko: '생성 시간',
  },
  openHint: {
    zh: '点击即可进入群聊',
    en: 'Tap to enter the chat',
    ja: 'タップでチャットを開く',
    ko: '눌러서 채팅 열기',
  },
  unreadSection: {
    zh: '存在未读群消息',
    en: 'There are unread group messages',
    ja: '未読のグループメッセージがあります',
    ko: '읽지 않은 그룹 메시지가 있습니다',
  },
  unreadGroup: {
    zh: '该群聊有未读消息',
    en: 'This group has unread messages',
    ja: 'このグループに未読メッセージがあります',
    ko: '이 그룹에 읽지 않은 메시지가 있습니다',
  },
};

const text = computed(() => resolveLocalized(textSource, language.value));
const locale = computed(() => (language.value === 'zh' ? 'zh-CN' : language.value));

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
  return (group.members || []).map((member) => member.username).join(', ');
}

function formatTime(group) {
  if (!group?.createdAt) {
    return '';
  }

  return new Intl.DateTimeFormat(locale.value, {
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
          <span v-if="countUnreadGroups(groups)" class="section-unread-dot" :aria-label="text.unreadSection" />
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
            <span v-if="group.hasUnread" class="group-unread-dot" :aria-label="text.unreadGroup" />
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
