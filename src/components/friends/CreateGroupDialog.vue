<script setup>
import { computed, ref, watch } from 'vue';
import { Button, Checkbox, CheckboxGroup, Empty, Field, Popup } from 'vant';
import { resolveLocalized, useLanguage } from '../../i18n';

const { language } = useLanguage();

const textSource = {
  title: {
    zh: '发起群聊',
    en: 'Create Group Chat',
    ja: 'グループチャットを作成',
    ko: '그룹 채팅 만들기',
  },
  desc: {
    zh: '选择好友后即可创建新的群聊',
    en: 'Choose friends to create a new group chat.',
    ja: '友だちを選ぶと新しいグループチャットを作成できます。',
    ko: '친구를 선택하면 새 그룹 채팅을 만들 수 있습니다.',
  },
  cancel: {
    zh: '取消',
    en: 'Cancel',
    ja: 'キャンセル',
    ko: '취소',
  },
  fieldLabel: {
    zh: '群聊名称',
    en: 'Group Name',
    ja: 'グループ名',
    ko: '그룹 이름',
  },
  fieldPlaceholder: {
    zh: '不填则自动生成群名称',
    en: 'Leave blank to generate a name automatically',
    ja: '空欄の場合は自動でグループ名を生成します',
    ko: '비워 두면 그룹 이름이 자동으로 생성됩니다',
  },
  memberTitle: {
    zh: '选择好友',
    en: 'Choose Friends',
    ja: '友だちを選択',
    ko: '친구 선택',
  },
  selectedPrefix: {
    zh: '已选',
    en: 'Selected',
    ja: '選択済み',
    ko: '선택',
  },
  selectedSuffix: {
    zh: '位',
    en: '',
    ja: '人',
    ko: '명',
  },
  empty: {
    zh: '当前还没有可选好友',
    en: 'There are no friends available to add.',
    ja: '選択できる友だちがいません。',
    ko: '선택할 수 있는 친구가 없습니다.',
  },
  submit: {
    zh: '创建群聊',
    en: 'Create Group',
    ja: 'グループを作成',
    ko: '그룹 만들기',
  },
};

const text = computed(() => resolveLocalized(textSource, language.value));

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  friends: {
    type: Array,
    default: () => [],
  },
  submitting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:show', 'submit']);

const groupName = ref('');
const selectedIds = ref([]);

const selectedCount = computed(() => selectedIds.value.length);

watch(
  () => props.show,
  (visible) => {
    if (!visible) {
      groupName.value = '';
      selectedIds.value = [];
    }
  },
);

function closeDialog() {
  emit('update:show', false);
}

function handleSubmit() {
  emit('submit', {
    groupName: groupName.value.trim(),
    memberIds: [...selectedIds.value],
  });
}
</script>

<template>
  <Popup
    :show="show"
    position="bottom"
    round
    class="group-popup"
    @update:show="emit('update:show', $event)"
  >
    <section class="group-dialog">
      <div class="dialog-head">
        <div>
          <h3>{{ text.title }}</h3>
          <p>{{ text.desc }}</p>
        </div>
        <button class="dialog-close" type="button" @click="closeDialog">
          {{ text.cancel }}
        </button>
      </div>

      <Field
        v-model="groupName"
        :label="text.fieldLabel"
        maxlength="20"
        :placeholder="text.fieldPlaceholder"
      />

      <div class="member-head">
        <strong>{{ text.memberTitle }}</strong>
        <span>{{ text.selectedPrefix }} {{ selectedCount }} {{ text.selectedSuffix }}</span>
      </div>

      <Empty
        v-if="!friends.length"
        image="search"
        :description="text.empty"
      />

      <CheckboxGroup v-else v-model="selectedIds" class="member-list">
        <label
          v-for="friend in friends"
          :key="friend.id"
          class="member-item"
        >
          <div class="member-main">
            <div class="member-avatar">{{ friend.username.slice(0, 1) }}</div>
            <div class="member-copy">
              <strong>{{ friend.username }}</strong>
              <span>{{ friend.friendCode }}</span>
            </div>
          </div>
          <Checkbox :name="friend.id" />
        </label>
      </CheckboxGroup>

      <Button
        block
        round
        type="primary"
        :loading="submitting"
        :disabled="!selectedCount"
        @click="handleSubmit"
      >
        {{ text.submit }}
      </Button>
    </section>
  </Popup>
</template>

<style scoped>
.group-popup {
  overflow: hidden;
}

.group-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 16px calc(24px + env(safe-area-inset-bottom));
  max-height: min(78vh, 720px);
}

.dialog-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.dialog-head h3 {
  margin: 0 0 6px;
  font-size: 18px;
  color: #1f2a22;
}

.dialog-head p {
  margin: 0;
  font-size: 13px;
  color: #6f7a71;
}

.dialog-close {
  padding: 0;
  border: none;
  background: transparent;
  color: #2d6d4b;
  font-size: 14px;
  cursor: pointer;
}

.member-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: #647268;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
  padding-right: 4px;
}

.member-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #f7faf8;
}

.member-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.member-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dcefe2 0%, #bdddc6 100%);
  color: #255338;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.member-copy strong {
  font-size: 14px;
  color: #1f2a22;
}

.member-copy span {
  font-size: 12px;
  color: #7f8c81;
}
</style>
