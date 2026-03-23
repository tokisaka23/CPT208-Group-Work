<script setup>
import { computed, ref, watch } from 'vue';
import { Button, Checkbox, CheckboxGroup, Empty, Field, Popup } from 'vant';

const text = {
  title: '\u53d1\u8d77\u7fa4\u804a',
  desc: '\u9009\u62e9\u597d\u53cb\u540e\u5373\u53ef\u521b\u5efa\u65b0\u7684\u7fa4\u804a',
  cancel: '\u53d6\u6d88',
  fieldLabel: '\u7fa4\u540d\u79f0',
  fieldPlaceholder: '\u4e0d\u586b\u5219\u81ea\u52a8\u751f\u6210\u7fa4\u540d\u79f0',
  memberTitle: '\u9009\u62e9\u597d\u53cb',
  selectedPrefix: '\u5df2\u9009',
  selectedSuffix: '\u4f4d',
  empty: '\u5f53\u524d\u8fd8\u6ca1\u6709\u53ef\u9009\u597d\u53cb',
  submit: '\u521b\u5efa\u7fa4\u804a',
};

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
