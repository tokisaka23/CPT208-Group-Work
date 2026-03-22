<script setup>
import { computed, ref, watch } from 'vue';
import { Button, Checkbox, CheckboxGroup, Empty, Field, Icon, Loading, Popup, Tag } from 'vant';

/* const text = {
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
}; */

const text = {
  close: '\u5173\u95ed',
  back: '\u8fd4\u56de',
  details: '\u804a\u5929\u4fe1\u606f',
  placeholder: '\u8f93\u5165\u7fa4\u6d88\u606f',
  send: '\u53d1\u9001',
  loading: '\u6b63\u5728\u52a0\u8f7d\u6d88\u606f...',
  empty: '\u8fd8\u6ca1\u6709\u7fa4\u6d88\u606f\uff0c\u5148\u53d1\u4e00\u6761\u5427',
  me: '\u6211',
  owner: '\u7fa4\u4e3b',
  members: '\u7fa4\u6210\u5458',
  inviteTitle: '\u9009\u62e9\u8981\u62c9\u5165\u7fa4\u7684\u597d\u53cb',
  inviteConfirm: '\u786e\u8ba4\u62c9\u5165',
  inviteEmpty: '\u6682\u65f6\u6ca1\u6709\u53ef\u4ee5\u518d\u9080\u8bf7\u7684\u597d\u53cb',
  removeMode: '\u70b9\u51fb\u6210\u5458\u53ef\u79fb\u51fa\u7fa4\u804a',
  groupName: '\u7fa4\u804a\u540d\u79f0',
  ownerLabel: '\u7fa4\u4e3b',
  countLabel: '\u7fa4\u4eba\u6570',
  exit: '\u9000\u51fa\u7fa4\u804a',
  addAction: '\u6dfb\u52a0',
  removeAction: '\u79fb\u9664',
  noCode: '\u672a\u8bbe\u7f6e\u597d\u53cb\u7801',
  saveGroupName: '\u4fdd\u5b58\u7fa4\u540d',
  renamePlaceholder: '\u8bf7\u8f93\u5165\u7fa4\u804a\u540d\u79f0',
  renameReadonly: '\u4ec5\u7fa4\u4e3b\u53ef\u4fee\u6539\u7fa4\u540d',
  memberProfile: '\u6210\u5458\u8d44\u6599',
  memberEmail: '\u90ae\u7bb1',
  addFriend: '\u52a0\u597d\u53cb',
  alreadyFriend: '\u5df2\u662f\u597d\u53cb',
  myself: '\u8fd9\u662f\u4f60',
  noEmail: '\u6682\u672a\u516c\u5f00',
  noFriendCode: '\u65e0\u6cd5\u53d1\u8d77\u597d\u53cb\u7533\u8bf7',
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
  friendSubmitting: {
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
  'add-friend',
]);

const draft = ref('');
const detailsVisible = ref(false);
const invitePanelVisible = ref(false);
const removeModeVisible = ref(false);
const selectedInviteIds = ref([]);
const groupNameDraft = ref('');
const memberProfileVisible = ref(false);
const selectedMember = ref(null);

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
const friendIds = computed(() => new Set((props.friends || []).map((friend) => friend.id)));

const normalizedGroupNameDraft = computed(() => String(groupNameDraft.value || '').trim());
const hasGroupNameChanged = computed(() => {
  return normalizedGroupNameDraft.value && normalizedGroupNameDraft.value !== String(props.group?.name || '').trim();
});
const selectedMemberIsSelf = computed(() => selectedMember.value?.id === props.currentUserId);
const selectedMemberIsFriend = computed(() => friendIds.value.has(selectedMember.value?.id));
const canAddSelectedMemberAsFriend = computed(() => {
  return Boolean(
    selectedMember.value?.id
    && !selectedMemberIsSelf.value
    && !selectedMemberIsFriend.value
    && String(selectedMember.value?.friendCode || '').trim(),
  );
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
    memberProfileVisible.value = false;
    selectedMember.value = null;
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
    memberProfileVisible.value = false;
    selectedMember.value = null;
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
  if (removeModeVisible.value && !member.isCreator) {
    emit('remove-member', member);
    return;
  }

  selectedMember.value = member;
  memberProfileVisible.value = true;
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

function addSelectedMemberAsFriend() {
  if (!canAddSelectedMemberAsFriend.value) {
    return;
  }

  emit('add-friend', selectedMember.value);
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
        <button class="wechat-head__action" type="button" @click="detailsVisible ? backToChat() : closeDialog()">
          <Icon v-if="detailsVisible" name="arrow-left" size="18" />
          <span>{{ detailsVisible ? text.back : text.close }}</span>
        </button>

        <div class="wechat-head__title">
          <h3>{{ detailsVisible ? text.details : group?.name }}</h3>
          <span>{{ detailsVisible ? buildMetaRowValue(group?.name) : `${groupMembers.length} \u4eba` }}</span>
        </div>

        <button
          v-if="!detailsVisible"
          class="wechat-head__action wechat-head__action--right"
          type="button"
          @click="openDetails"
        >
          <Icon name="ellipsis" size="18" />
        </button>
        <button
          v-else
          class="wechat-head__action wechat-head__action--right"
          type="button"
          @click="closeDialog"
        >
          <span>{{ text.close }}</span>
        </button>
      </header>

      <template v-if="!detailsVisible">
        <div class="wechat-scroll wechat-scroll--chat">
          <section class="chat-panel">
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
      </template>

      <template v-else>
        <div class="wechat-scroll">
          <section class="wechat-card meta-card">
            <div class="meta-row">
              <span>{{ text.ownerLabel }}</span>
              <strong>{{ buildMetaRowValue(ownerMember?.username) }}</strong>
            </div>
            <div class="meta-row">
              <span>{{ text.countLabel }}</span>
              <strong>{{ groupMembers.length }}</strong>
            </div>
          </section>

          <section class="wechat-card rename-card">
            <div class="section-head">
              <strong>{{ text.groupName }}</strong>
              <span>{{ isOwner ? '\u6700\u591a 50 \u4e2a\u5b57' : text.renameReadonly }}</span>
            </div>

            <Field
              v-model="groupNameDraft"
              class="rename-card__field"
              maxlength="50"
              show-word-limit
              :readonly="!isOwner"
              :placeholder="text.renamePlaceholder"
            />

            <Button
              v-if="isOwner"
              block
              round
              color="#07c160"
              :loading="renaming"
              :disabled="!hasGroupNameChanged"
              @click="saveGroupName"
            >
              {{ text.saveGroupName }}
            </Button>
          </section>

          <section class="wechat-card">
            <div class="section-head">
              <strong>{{ text.members }}</strong>
              <Tag plain type="success">{{ `${groupMembers.length} \u4eba` }}</Tag>
            </div>

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
                <div class="member-grid__avatar">{{ getMemberInitial(member.username) }}</div>
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
            <div class="section-head">
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
                  <div class="member-grid__avatar">{{ getMemberInitial(friend.username) }}</div>
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
        </div>
      </template>
    </section>
  </Popup>

  <Popup
    :show="memberProfileVisible"
    round
    closeable
    position="bottom"
    class="member-profile-popup"
    @update:show="memberProfileVisible = $event"
  >
    <section class="member-profile-sheet">
      <div class="member-profile-sheet__hero">
        <div class="member-profile-sheet__avatar">{{ getMemberInitial(selectedMember?.username) }}</div>
        <div class="member-profile-sheet__copy">
          <strong>{{ buildMetaRowValue(selectedMember?.username) }}</strong>
          <span>{{ selectedMember?.isCreator ? text.owner : text.memberProfile }}</span>
        </div>
      </div>

      <div class="member-profile-sheet__meta">
        <div class="member-profile-row">
          <span>{{ text.memberEmail }}</span>
          <strong>{{ buildMetaRowValue(selectedMember?.email, text.noEmail) }}</strong>
        </div>
      </div>

      <Button
        block
        round
        color="#07c160"
        :loading="friendSubmitting"
        :disabled="!canAddSelectedMemberAsFriend"
        @click="addSelectedMemberAsFriend"
      >
        {{
          selectedMemberIsSelf
            ? text.myself
            : selectedMemberIsFriend
              ? text.alreadyFriend
              : canAddSelectedMemberAsFriend
                ? text.addFriend
                : text.noFriendCode
        }}
      </Button>
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
  grid-template-columns: 84px minmax(0, 1fr) 84px;
  align-items: center;
  padding: 0 12px;
}

.wechat-head__action {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: transparent;
  color: #191919;
  font-size: 14px;
}

.wechat-head__action--right {
  justify-self: end;
  justify-content: flex-end;
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

.wechat-scroll--chat {
  padding-top: 2px;
}

.chat-panel {
  flex: 1;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.wechat-card {
  padding: 16px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.section-head strong {
  font-size: 15px;
  color: #111111;
}

.section-head span {
  font-size: 12px;
  color: #7f7f7f;
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

.rename-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rename-card__field {
  overflow: hidden;
  border-radius: 16px;
}

:deep(.rename-card__field .van-cell) {
  padding: 12px 14px;
  background: #f7f7f7;
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
  margin: 14px 0 0;
  font-size: 12px;
  color: #fa5151;
  text-align: center;
}

.invite-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.chat-state {
  flex: 1;
  min-height: 240px;
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
  padding: 6px 0 2px;
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
  padding-bottom: 2px;
}

.member-profile-popup {
  background: transparent;
}

.member-profile-sheet {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 16px calc(20px + env(safe-area-inset-bottom));
  background: #f7f7f7;
}

.member-profile-sheet__hero {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 18px;
  background: #ffffff;
}

.member-profile-sheet__avatar {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e7f3ed 0%, #d2e8db 100%);
  color: #1e6d46;
  font-size: 22px;
  font-weight: 700;
}

.member-profile-sheet__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.member-profile-sheet__copy strong {
  font-size: 17px;
  color: #111111;
}

.member-profile-sheet__copy span {
  font-size: 12px;
  color: #7f7f7f;
}

.member-profile-sheet__meta {
  overflow: hidden;
  border-radius: 18px;
  background: #ffffff;
}

.member-profile-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-height: 56px;
  padding: 16px;
  border-bottom: 1px solid #f1f1f1;
}

.member-profile-row:last-child {
  border-bottom: none;
}

.member-profile-row span {
  font-size: 14px;
  color: #191919;
}

.member-profile-row strong {
  max-width: 70%;
  font-size: 13px;
  font-weight: 500;
  color: #7f7f7f;
  text-align: right;
  white-space: normal;
  word-break: break-word;
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
