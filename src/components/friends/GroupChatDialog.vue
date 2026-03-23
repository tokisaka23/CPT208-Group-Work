<script setup>
import { computed, ref, watch } from 'vue';
import { Button, Checkbox, CheckboxGroup, Empty, Field, Icon, Loading, Popup, Tag } from 'vant';

const text = {
  close: '关闭',
  back: '返回',
  details: '聊天信息',
  placeholder: '输入群消息',
  send: '发送',
  loading: '正在加载消息...',
  empty: '还没有群消息，先发一条吧',
  me: '我',
  owner: '群主',
  members: '群成员',
  inviteTitle: '选择要拉入群的好友',
  inviteConfirm: '确认拉入',
  inviteEmpty: '暂时没有可以再邀请的好友',
  removeMode: '点击成员可移出群聊',
  groupName: '群聊名称',
  ownerLabel: '群主',
  countLabel: '群人数',
  exit: '退出群聊',
  addAction: '添加',
  removeAction: '移除',
  noCode: '未设置好友码',
  saveGroupName: '保存群名',
  renamePlaceholder: '请输入群聊名称',
  renameReadonly: '仅群主可修改群名',
};

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  group: {
    type: Object,
    default: null,
  },
  currentUserId: {
    type: String,
    default: '',
  },
  friends: {
    type: Array,
    default: () => [],
  },
  messages: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  sending: {
    type: Boolean,
    default: false,
  },
  memberSubmitting: {
    type: Boolean,
    default: false,
  },
  renaming: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'update:show',
  'send',
  'invite-members',
  'remove-member',
  'exit-group',
  'rename-group',
]);

const draft = ref('');
const detailsVisible = ref(false);
const invitePanelVisible = ref(false);
const removeModeVisible = ref(false);
const selectedInviteIds = ref([]);
const groupNameDraft = ref('');

const groupMembers = computed(() => props.group?.members || []);
const ownerMember = computed(() => groupMembers.value.find((member) => member.isCreator) || null);

const isOwner = computed(() => {
  if (!props.currentUserId) {
    return false;
  }

  if (props.group?.creatorUserId) {
    return props.group.creatorUserId === props.currentUserId;
  }

  return groupMembers.value.some((member) => member.id === props.currentUserId && member.isCreator);
});

const canExitGroup = computed(() => Boolean(props.group?.id) && Boolean(props.currentUserId) && !isOwner.value);
const canInviteMembers = computed(() => Boolean(props.group?.id) && Boolean(props.currentUserId));
const removableMembers = computed(() => groupMembers.value.filter((member) => !member.isCreator));
const inviteCandidates = computed(() => {
  const memberIds = new Set(groupMembers.value.map((member) => member.id));
  return (props.friends || []).filter((friend) => !memberIds.has(friend.id));
});

const normalizedGroupNameDraft = computed(() => String(groupNameDraft.value || '').trim());
const hasGroupNameChanged = computed(() => {
  return normalizedGroupNameDraft.value && normalizedGroupNameDraft.value !== String(props.group?.name || '').trim();
});

watch(
  () => props.show,
  (visible) => {
    if (!visible) {
      draft.value = '';
      detailsVisible.value = false;
    }

    invitePanelVisible.value = false;
    removeModeVisible.value = false;
    selectedInviteIds.value = [];
  },
);

watch(
  () => props.group?.id,
  () => {
    detailsVisible.value = false;
    invitePanelVisible.value = false;
    removeModeVisible.value = false;
    selectedInviteIds.value = [];
    groupNameDraft.value = String(props.group?.name || '');
  },
);

watch(
  () => props.group?.name,
  (nextName) => {
    groupNameDraft.value = String(nextName || '');
  },
  { immediate: true },
);

function closeDialog() {
  emit('update:show', false);
}

function openDetails() {
  detailsVisible.value = true;
}

function backToChat() {
  detailsVisible.value = false;
  invitePanelVisible.value = false;
  removeModeVisible.value = false;
  selectedInviteIds.value = [];
}

function formatTime(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function isSelfMessage(message) {
  return message.senderUserId === props.currentUserId;
}

function toggleInvitePanel() {
  invitePanelVisible.value = !invitePanelVisible.value;

  if (invitePanelVisible.value) {
    removeModeVisible.value = false;
  } else {
    selectedInviteIds.value = [];
  }
}

function toggleRemoveMode() {
  removeModeVisible.value = !removeModeVisible.value;

  if (removeModeVisible.value) {
    invitePanelVisible.value = false;
    selectedInviteIds.value = [];
  }
}

function sendMessage() {
  const content = String(draft.value || '').trim();

  if (!content) {
    return;
  }

  emit('send', content);
  draft.value = '';
}

function inviteMembers() {
  if (!selectedInviteIds.value.length) {
    return;
  }

  emit('invite-members', [...selectedInviteIds.value]);
}

function handleMemberPress(member) {
  if (!removeModeVisible.value || member.isCreator) {
    return;
  }

  emit('remove-member', member);
}

function exitGroup() {
  emit('exit-group');
}

function saveGroupName() {
  if (!isOwner.value || !hasGroupNameChanged.value) {
    return;
  }

  emit('rename-group', normalizedGroupNameDraft.value);
}

function buildMetaRowValue(value, fallback = '--') {
  return String(value || '').trim() || fallback;
}

function getMemberInitial(name) {
  return String(name || '?').slice(0, 1).toUpperCase();
}
</script>

<template>
  <Popup
    :show="show"
    position="bottom"
    round
    class="wechat-popup"
    @update:show="emit('update:show', $event)"
  >
    <section class="wechat-dialog">
      <header class="wechat-head">
        <button class="wechat-head__action" type="button" @click="closeDialog">
          {{ text.close }}
        </button>
        <div class="wechat-head__title">
          <h3>{{ group?.name }}</h3>
          <span>{{ groupMembers.length }} 人</span>
        </div>
        <div class="wechat-head__spacer" />
      </header>

      <div class="wechat-scroll">
        <section class="wechat-card">
          <div class="member-grid">
            <button
              v-for="member in groupMembers"
              :key="member.id"
              class="member-grid__item"
              type="button"
              :class="{ 'is-removable': removeModeVisible && !member.isCreator }"
              :disabled="memberSubmitting"
              @click="handleMemberPress(member)"
            >
              <span v-if="removeModeVisible && !member.isCreator" class="member-grid__badge">
                <Icon name="cross" size="10" />
              </span>
              <div class="member-grid__avatar">{{ member.username.slice(0, 1) }}</div>
              <strong>{{ member.username }}</strong>
              <span>{{ member.isCreator ? text.owner : '' }}</span>
            </button>

            <button
              v-if="canInviteMembers"
              class="member-grid__item member-grid__item--action"
              type="button"
              :disabled="memberSubmitting || !inviteCandidates.length"
              @click="toggleInvitePanel"
            >
              <div class="member-grid__action-box">
                <Icon name="plus" size="24" />
              </div>
              <strong>{{ text.addAction }}</strong>
              <span />
            </button>

            <button
              v-if="isOwner && removableMembers.length"
              class="member-grid__item member-grid__item--action"
              type="button"
              :disabled="memberSubmitting"
              @click="toggleRemoveMode"
            >
              <div class="member-grid__action-box">
                <Icon name="minus" size="24" />
              </div>
              <strong>{{ text.removeAction }}</strong>
              <span />
            </button>
          </div>

          <p v-if="removeModeVisible" class="member-grid__hint">
            {{ text.removeMode }}
          </p>
        </section>

        <section v-if="canInviteMembers && invitePanelVisible" class="wechat-card invite-card">
          <div class="invite-card__head">
            <strong>{{ text.inviteTitle }}</strong>
            <span>{{ selectedInviteIds.length }} / {{ inviteCandidates.length }}</span>
          </div>

          <Empty
            v-if="!inviteCandidates.length"
            image="search"
            :description="text.inviteEmpty"
          />

          <CheckboxGroup v-else v-model="selectedInviteIds" class="invite-card__list">
            <label
              v-for="friend in inviteCandidates"
              :key="friend.id"
              class="invite-card__item"
            >
              <div class="invite-card__meta">
                <div class="member-grid__avatar">{{ friend.username.slice(0, 1) }}</div>
                <div class="invite-card__copy">
                  <strong>{{ friend.username }}</strong>
                  <span>{{ friend.friendCode || text.noCode }}</span>
                </div>
              </div>
              <Checkbox :name="friend.id" />
            </label>
          </CheckboxGroup>

          <Button
            block
            round
            type="primary"
            color="#07c160"
            :loading="memberSubmitting"
            :disabled="!selectedInviteIds.length"
            @click="inviteMembers"
          >
            {{ text.inviteConfirm }}
          </Button>
        </section>

        <section class="wechat-card meta-card">
          <div class="meta-row">
            <span>{{ text.groupName }}</span>
            <strong>{{ buildMetaRowValue(group?.name) }}</strong>
          </div>
          <div class="meta-row">
            <span>{{ text.ownerLabel }}</span>
            <strong>{{ buildMetaRowValue(ownerMember?.username) }}</strong>
          </div>
          <div class="meta-row">
            <span>{{ text.countLabel }}</span>
            <strong>{{ groupMembers.length }}</strong>
          </div>
        </section>

        <section class="wechat-card chat-card">
          <div class="chat-card__head">
            <strong>{{ text.members }}</strong>
            <Tag plain type="success">{{ groupMembers.length }} 人</Tag>
          </div>

          <div class="chat-body">
            <div v-if="loading" class="chat-state">
              <Loading size="22px" color="#07c160" />
              <p>{{ text.loading }}</p>
            </div>

            <Empty
              v-else-if="!messages.length"
              image="search"
              :description="text.empty"
            />

            <div v-else class="message-list">
              <article
                v-for="message in messages"
                :key="message.id"
                :class="['message-item', { 'is-self': isSelfMessage(message) }]"
              >
                <div class="message-meta">
                  <strong>{{ isSelfMessage(message) ? text.me : message.senderName }}</strong>
                  <span>{{ formatTime(message.createdAt) }}</span>
                </div>
                <p class="message-content">{{ message.content }}</p>
              </article>
            </div>
          </div>
        </section>
      </div>

      <footer class="wechat-composer">
        <Field
          v-model="draft"
          type="textarea"
          rows="1"
          autosize
          class="wechat-composer__field"
          :placeholder="text.placeholder"
          @keyup.enter.stop
        />
        <Button
          round
          color="#07c160"
          class="wechat-composer__send"
          :loading="sending"
          :disabled="!draft.trim()"
          @click="sendMessage"
        >
          {{ text.send }}
        </Button>
      </footer>

      <div v-if="canExitGroup" class="wechat-exit">
        <Button
          block
          round
          plain
          type="danger"
          :loading="memberSubmitting"
          @click="exitGroup"
        >
          {{ text.exit }}
        </Button>
      </div>
    </section>
  </Popup>
</template>

<style scoped>
.wechat-popup {
  overflow: hidden;
  background: #ededed;
}

.wechat-dialog {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: min(88vh, 820px);
  padding: 10px 0 calc(18px + env(safe-area-inset-bottom));
  background: #ededed;
}

.wechat-head {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) 64px;
  align-items: center;
  padding: 0 16px;
}

.wechat-head__action,
.wechat-head__spacer {
  min-height: 32px;
}

.wechat-head__action {
  padding: 0;
  border: none;
  background: transparent;
  color: #191919;
  font-size: 14px;
  text-align: left;
}

.wechat-head__title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;
}

.wechat-head__title h3 {
  margin: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 17px;
  font-weight: 600;
  color: #111111;
}

.wechat-head__title span {
  font-size: 12px;
  color: #7f7f7f;
}

.wechat-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 12px;
}

.wechat-card {
  padding: 16px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px 10px;
}

.member-grid__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: #111111;
}

.member-grid__item strong,
.member-grid__item span {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-grid__item strong {
  font-size: 12px;
  font-weight: 500;
}

.member-grid__item span {
  min-height: 16px;
  font-size: 10px;
  color: #8b8b8b;
}

.member-grid__avatar,
.member-grid__action-box {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-grid__avatar {
  background: linear-gradient(135deg, #e7f3ed 0%, #d2e8db 100%);
  color: #1e6d46;
  font-size: 20px;
  font-weight: 700;
}

.member-grid__action-box {
  border: 1px dashed #d8d8d8;
  background: #fafafa;
  color: #5f5f5f;
}

.member-grid__item--action:disabled .member-grid__action-box {
  opacity: 0.45;
}

.member-grid__badge {
  position: absolute;
  top: -2px;
  right: calc(50% - 26px);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fa5151;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 12px rgba(250, 81, 81, 0.28);
}

.member-grid__item.is-removable .member-grid__avatar {
  box-shadow: 0 0 0 2px rgba(250, 81, 81, 0.18);
}

.member-grid__hint {
  margin-top: 14px;
  font-size: 12px;
  color: #fa5151;
  text-align: center;
}

.invite-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.invite-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: #666666;
}

.invite-card__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 220px;
  overflow: auto;
}

.invite-card__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  background: #f7f7f7;
}

.invite-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.invite-card__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.invite-card__copy strong {
  font-size: 14px;
  color: #111111;
}

.invite-card__copy span {
  font-size: 12px;
  color: #888888;
}

.meta-card {
  padding: 0 16px;
  overflow: hidden;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 52px;
  border-bottom: 1px solid #f1f1f1;
}

.meta-row:last-child {
  border-bottom: none;
}

.meta-row span {
  font-size: 14px;
  color: #191919;
}

.meta-row strong {
  font-size: 14px;
  font-weight: 500;
  color: #7f7f7f;
  text-align: right;
}

.chat-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 260px;
}

.chat-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.chat-card__head strong {
  font-size: 15px;
  color: #111111;
}

.chat-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.chat-state {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #7f7f7f;
}

.chat-state p {
  margin: 0;
  font-size: 13px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  align-self: flex-start;
  max-width: 86%;
  padding: 10px 12px;
  border-radius: 6px 16px 16px 16px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.message-item.is-self {
  align-self: flex-end;
  border-radius: 16px 6px 16px 16px;
  background: #95ec69;
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.45);
}

.message-meta strong {
  font-size: 12px;
  color: #1f1f1f;
}

.message-content {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #111111;
  white-space: pre-wrap;
  word-break: break-word;
}

.wechat-composer {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 0 12px;
}

.wechat-composer__field {
  flex: 1;
  border-radius: 16px;
  overflow: hidden;
}

:deep(.wechat-composer__field .van-cell) {
  padding: 10px 12px;
  border-radius: 16px;
  background: #ffffff;
}

.wechat-composer__send {
  min-width: 82px;
}

.wechat-exit {
  padding: 0 12px;
}

@media (max-width: 540px) {
  .member-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .member-grid__avatar,
  .member-grid__action-box {
    width: 48px;
    height: 48px;
  }
}
</style>
