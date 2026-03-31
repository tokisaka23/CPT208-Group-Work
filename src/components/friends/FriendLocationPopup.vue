<script setup>
import { computed } from 'vue';
import { Button, Popup, Tag } from 'vant';
import { resolveLocalized, useLanguage } from '../../i18n';

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
const { language } = useLanguage();

const textSource = {
  noUpdate: {
    zh: '暂无更新时间',
    en: 'No update time yet',
    ja: '更新時刻はまだありません',
    ko: '업데이트 시간이 아직 없습니다',
  },
  eyebrow: {
    zh: '好友定位详情',
    en: 'Friend Location Details',
    ja: '友だちの位置詳細',
    ko: '친구 위치 상세',
  },
  online: {
    zh: '在线',
    en: 'Online',
    ja: 'オンライン',
    ko: '온라인',
  },
  mapTitle: {
    zh: '定位原型展示区',
    en: 'Location Prototype Area',
    ja: '位置プロトタイプ表示エリア',
    ko: '위치 프로토타입 표시 영역',
  },
  mapDesc: {
    zh: '后续接入地图 SDK 后，可在这里展示地图、轨迹和更新时间。',
    en: 'After a map SDK is connected, this area can show the map, route, and update time.',
    ja: '今後マップ SDK を接続すると、ここに地図、軌跡、更新時刻を表示できます。',
    ko: '추후 지도 SDK 를 연결하면 이곳에 지도, 이동 경로, 업데이트 시간을 표시할 수 있습니다.',
  },
  latitude: {
    zh: '纬度',
    en: 'Latitude',
    ja: '緯度',
    ko: '위도',
  },
  longitude: {
    zh: '经度',
    en: 'Longitude',
    ja: '経度',
    ko: '경도',
  },
  updatedAt: {
    zh: '最近更新',
    en: 'Last Update',
    ja: '最終更新',
    ko: '최근 업데이트',
  },
  close: {
    zh: '关闭',
    en: 'Close',
    ja: '閉じる',
    ko: '닫기',
  },
};

const text = computed(() => resolveLocalized(textSource, language.value));
const locale = computed(() => (language.value === 'zh' ? 'zh-CN' : language.value));

const formattedTime = computed(() => {
  if (!props.friend?.updatedAt) {
    return text.value.noUpdate;
  }

  return new Intl.DateTimeFormat(locale.value, {
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
          <p class="popup-eyebrow">{{ text.eyebrow }}</p>
          <h3 class="popup-title">{{ friend.username }}</h3>
        </div>
        <Tag type="success" plain>{{ text.online }}</Tag>
      </div>

      <div class="map-placeholder">
        <div class="map-pin"></div>
        <strong>{{ text.mapTitle }}</strong>
        <p>{{ text.mapDesc }}</p>
      </div>

      <div class="detail-list">
        <div class="detail-row">
          <span class="detail-label">{{ text.latitude }}</span>
          <strong class="detail-value">{{ friend.latitude }}</strong>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ text.longitude }}</span>
          <strong class="detail-value">{{ friend.longitude }}</strong>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ text.updatedAt }}</span>
          <strong class="detail-value">{{ formattedTime }}</strong>
        </div>
      </div>

      <Button block round type="primary" @click="emit('update:show', false)">
        {{ text.close }}
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
