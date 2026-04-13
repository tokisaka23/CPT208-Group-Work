<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { Button, Popup, Tag } from 'vant';
import { resolveLocalized, useLanguage } from '../../i18n';
import { hasAmapCredentials, loadAmapSdk } from '../../services/maps/amapLoader';
import {
  formatFriendCoordinate,
  getFriendLocationFallbackMessage,
  hasRenderableFriendLocation,
} from '../../shared/friendLocation';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  friend: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:show']);
const { language } = useLanguage();

const textSource = {
  noUpdate: {
    zh: '暂无更新时间',
    en: 'No update time yet',
  },
  eyebrow: {
    zh: '好友定位详情',
    en: 'Friend Location Details',
  },
  online: {
    zh: '在线',
    en: 'Online',
  },
  offline: {
    zh: '离线',
    en: 'Offline',
  },
  sharingOn: {
    zh: '位置共享已开启',
    en: 'Location sharing on',
  },
  sharingOff: {
    zh: '位置共享未开启',
    en: 'Location sharing off',
  },
  loadingMap: {
    zh: '正在加载好友位置...',
    en: 'Loading friend location...',
  },
  mapHint: {
    zh: '高德地图会在这里显示好友最近一次共享位置。',
    en: 'Amap will show the friend’s latest shared location here.',
  },
  mapUnavailable: {
    zh: '当前无法显示地图',
    en: 'Map is currently unavailable',
  },
  latitude: {
    zh: '纬度',
    en: 'Latitude',
  },
  longitude: {
    zh: '经度',
    en: 'Longitude',
  },
  accuracy: {
    zh: '精度',
    en: 'Accuracy',
  },
  updatedAt: {
    zh: '最近更新',
    en: 'Last Update',
  },
  close: {
    zh: '关闭',
    en: 'Close',
  },
};

const text = computed(() => resolveLocalized(textSource, language.value));
const locale = computed(() => (language.value === 'zh' ? 'zh-CN' : language.value));
const mapRoot = ref(null);
const mapError = ref('');

let mapInstance = null;
let locationMarker = null;

const canRenderMap = computed(() => (
  !props.loading
  && hasAmapCredentials()
  && hasRenderableFriendLocation(props.friend)
));

const fallbackMessage = computed(() => (
  props.errorMessage
  || getFriendLocationFallbackMessage(props.friend)
  || text.value.mapUnavailable
));

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

const formattedLatitude = computed(() => formatFriendCoordinate(props.friend?.latitude));
const formattedLongitude = computed(() => formatFriendCoordinate(props.friend?.longitude));
const formattedAccuracy = computed(() => {
  const accuracy = Number(props.friend?.accuracyMeters);
  return Number.isFinite(accuracy) ? `${Math.round(accuracy)} m` : '--';
});

function destroyMap() {
  if (mapInstance && locationMarker) {
    mapInstance.remove(locationMarker);
  }

  locationMarker = null;
  mapInstance?.destroy?.();
  mapInstance = null;
}

async function renderFriendMap() {
  if (!canRenderMap.value || !props.friend) {
    destroyMap();
    return;
  }

  mapError.value = '';

  try {
    await nextTick();
    const AMap = await loadAmapSdk();

    if (!mapRoot.value) {
      return;
    }

    destroyMap();
    mapInstance = new AMap.Map(mapRoot.value, {
      viewMode: '3D',
      zoom: 16,
      center: [Number(props.friend.longitude), Number(props.friend.latitude)],
      mapStyle: 'amap://styles/normal',
    });

    locationMarker = new AMap.Marker({
      position: [Number(props.friend.longitude), Number(props.friend.latitude)],
      title: props.friend.username || '好友位置',
      label: {
        content: `<div class="friend-map-label">${props.friend.username || '好友位置'}</div>`,
        direction: 'top',
      },
    });

    mapInstance.add(locationMarker);
    mapInstance.setFitView([locationMarker], false, [72, 72, 72, 72]);
  } catch (error) {
    mapError.value = error.message || text.value.mapUnavailable;
  }
}

watch(
  () => [props.show, props.friend, props.loading],
  async ([nextVisible]) => {
    if (!nextVisible) {
      destroyMap();
      return;
    }

    await renderFriendMap();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  destroyMap();
});
</script>

<template>
  <Popup
    :show="show"
    round
    position="bottom"
    teleport="body"
    class="location-popup"
    @update:show="emit('update:show', $event)"
  >
    <div v-if="friend" class="popup-content">
      <div class="popup-head">
        <div>
          <p class="popup-eyebrow">{{ text.eyebrow }}</p>
          <h3 class="popup-title">{{ friend.username }}</h3>
        </div>

        <div class="popup-tags">
          <Tag :type="friend.isOnline ? 'success' : 'default'" plain>
            {{ friend.isOnline ? text.online : text.offline }}
          </Tag>
          <Tag :type="friend.isLocationSharingEnabled ? 'primary' : 'warning'" plain>
            {{ friend.isLocationSharingEnabled ? text.sharingOn : text.sharingOff }}
          </Tag>
        </div>
      </div>

      <div class="map-card">
        <div
          ref="mapRoot"
          class="map-root"
          :class="{ 'is-hidden': !canRenderMap }"
        />

        <div v-if="loading" class="map-placeholder">
          <strong>{{ text.loadingMap }}</strong>
          <p>{{ text.mapHint }}</p>
        </div>

        <div v-else-if="mapError || !canRenderMap" class="map-placeholder">
          <strong>{{ text.mapUnavailable }}</strong>
          <p>{{ mapError || fallbackMessage }}</p>
        </div>
      </div>

      <div class="detail-list">
        <div class="detail-row">
          <span class="detail-label">{{ text.latitude }}</span>
          <strong class="detail-value">{{ formattedLatitude }}</strong>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ text.longitude }}</span>
          <strong class="detail-value">{{ formattedLongitude }}</strong>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ text.accuracy }}</span>
          <strong class="detail-value">{{ formattedAccuracy }}</strong>
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
  min-height: 48vh;
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

.popup-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.map-card {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  background:
    radial-gradient(circle at 20% 20%, rgba(46, 117, 83, 0.18), transparent 22%),
    linear-gradient(180deg, #edf6f0 0%, #f8fbf9 100%);
  min-height: 260px;
  border: 1px solid rgba(47, 106, 77, 0.12);
}

.map-root {
  min-height: 260px;
}

.map-root.is-hidden {
  display: none;
}

.map-placeholder {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 24px 18px;
  text-align: center;
  color: #2f5d44;
}

.map-placeholder strong {
  font-size: 16px;
}

.map-placeholder p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #5e6c63;
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

:deep(.friend-map-label) {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: #236847;
  font-size: 12px;
  box-shadow: 0 8px 18px rgba(31, 58, 44, 0.12);
}
</style>
