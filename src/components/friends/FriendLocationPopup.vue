<script setup>
import { Button, Popup, Tag } from 'vant';
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  friend: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:show']);

const formattedTime = computed(() => {
  if (!props.friend?.updatedAt) {
    return '暂无更新时间';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    hour12: false,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(props.friend.updatedAt));
});
</script>

<template>
  <Popup
    :show="show"
    round
    position="bottom"
    class="location-popup"
    @update:show="emit('update:show', $event)"
  >
    <div v-if="friend" class="popup-content">
      <div class="popup-head">
        <div>
          <p class="popup-eyebrow">好友定位详情</p>
          <h3 class="popup-title">{{ friend.username }}</h3>
        </div>
        <Tag type="success" plain>在线</Tag>
      </div>

      <div class="map-placeholder">
        <div class="map-pin"></div>
        <strong>定位原型展示区</strong>
        <p>后续接入地图 SDK 后，可在这里展示地图、轨迹和更新时间。</p>
      </div>

      <div class="detail-list">
        <div class="detail-row">
          <span class="detail-label">纬度</span>
          <strong class="detail-value">{{ friend.latitude }}</strong>
        </div>
        <div class="detail-row">
          <span class="detail-label">经度</span>
          <strong class="detail-value">{{ friend.longitude }}</strong>
        </div>
        <div class="detail-row">
          <span class="detail-label">最近更新</span>
          <strong class="detail-value">{{ formattedTime }}</strong>
        </div>
      </div>

      <Button block round type="primary" @click="emit('update:show', false)">
        关闭
      </Button>
    </div>
  </Popup>
</template>

<style scoped>
.location-popup {
  min-height: 44vh;
  background: #ffffff;
}

.popup-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px 16px calc(20px + env(safe-area-inset-bottom));
}

.popup-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.popup-eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  color: #7f8c81;
}

.popup-title {
  margin: 0;
  font-size: 20px;
  color: #1f2a22;
}

.map-placeholder {
  position: relative;
  padding: 24px 16px 18px;
  border-radius: 20px;
  background:
    radial-gradient(circle at 20% 20%, rgba(46, 117, 83, 0.18), transparent 22%),
    linear-gradient(180deg, #edf6f0 0%, #f8fbf9 100%);
  text-align: center;
  color: #2f5d44;
}

.map-placeholder strong {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
}

.map-placeholder p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #5e6c63;
}

.map-pin {
  width: 16px;
  height: 16px;
  margin: 0 auto 14px;
  border-radius: 50% 50% 50% 0;
  background: #2f8a5c;
  transform: rotate(-45deg);
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f7faf8;
}

.detail-label {
  font-size: 13px;
  color: #6f7a71;
}

.detail-value {
  font-size: 14px;
  color: #1f2a22;
}
</style>
