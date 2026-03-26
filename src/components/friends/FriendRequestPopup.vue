<script setup>
import FriendRequestDialog from './FriendRequestDialog.vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  requests: {
    type: Array,
    default: () => [],
  },
  processingId: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:show', 'accept', 'reject']);
</script>

<template>
  <FriendRequestDialog
    v-bind="props"
    @update:show="emit('update:show', $event)"
    @accept="emit('accept', $event)"
    @reject="emit('reject', $event)"
  />
</template>

