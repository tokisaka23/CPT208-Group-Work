<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { Button, Popup, Tag, showFailToast } from 'vant';
import { resolveLocalized, useLanguage } from '../../i18n';
import { hasAmapCredentials, loadAmapSdk } from '../../services/maps/amapLoader';
import {
  extractAmapRouteSummary,
  formatFriendCoordinate,
  getFriendLocationFallbackMessage,
  hasRenderableFriendLocation,
  summarizeFriendRoute,
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
    zh: '这里会显示好友最近一次共享的位置。',
    en: 'The friend’s latest shared location will appear here.',
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
  walking: {
    zh: '步行',
    en: 'Walking',
  },
  driving: {
    zh: '驾车',
    en: 'Driving',
  },
  routeSummary: {
    zh: '找朋友路线',
    en: 'Route to Friend',
  },
  routePending: {
    zh: '点击下方按钮后，会根据你的当前位置规划路线。',
    en: 'Tap below to plan a route from your current location.',
  },
  routeFailed: {
    zh: '路线规划失败，请稍后再试。',
    en: 'Failed to plan the route. Please try again later.',
  },
  locationRequired: {
    zh: '需要先允许浏览器获取你的位置，才能规划去找好友的路线。',
    en: 'Allow browser location access to plan a route.',
  },
  navigate: {
    zh: '导航去找 TA',
    en: 'Navigate',
  },
  refreshRoute: {
    zh: '刷新路线',
    en: 'Refresh Route',
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
const routeMode = ref('walking');
const routeLoading = ref(false);
const routeError = ref('');
const routeSummary = ref('');
const routeSteps = ref([]);
const currentPosition = ref(null);
const hasPlannedRoute = ref(false);

let mapInstance = null;
let friendMarker = null;
let currentMarker = null;
let routePolyline = null;

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

function getFriendPoint() {
  if (!props.friend) {
    return null;
  }

  const lng = Number(props.friend.longitude);
  const lat = Number(props.friend.latitude);

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return null;
  }

  return { lng, lat };
}

function toLngLatTuple(point) {
  if (!point) {
    return null;
  }

  if (Array.isArray(point) && point.length >= 2) {
    return [Number(point[0]), Number(point[1])];
  }

  if (typeof point.getLng === 'function' && typeof point.getLat === 'function') {
    return [point.getLng(), point.getLat()];
  }

  if (Number.isFinite(Number(point.lng)) && Number.isFinite(Number(point.lat))) {
    return [Number(point.lng), Number(point.lat)];
  }

  return null;
}

function buildLngLat(AMap, point) {
  return new AMap.LngLat(point.lng, point.lat);
}

function buildLabel(content, variant = '') {
  return `<div class="friend-map-label ${variant}">${content}</div>`;
}

function extractRoutePath(result, startPoint, endPoint) {
  const startTuple = toLngLatTuple(startPoint);
  const endTuple = toLngLatTuple(endPoint);
  const routeList = Array.isArray(result?.routes)
    ? result.routes
    : Array.isArray(result?.route?.paths)
      ? result.route.paths
      : [];
  const primaryRoute = routeList[0] || null;
  const stepList = Array.isArray(primaryRoute?.steps)
    ? primaryRoute.steps
    : Array.isArray(primaryRoute?.rides)
      ? primaryRoute.rides
      : [];
  const path = [];

  stepList.forEach((step) => {
    if (!Array.isArray(step?.path)) {
      return;
    }

    step.path
      .map((item) => toLngLatTuple(item))
      .filter(Boolean)
      .forEach((item) => path.push(item));
  });

  const fallbackPath = [startTuple, endTuple].filter(Boolean);

  if (!path.length) {
    return fallbackPath;
  }

  const merged = [...(startTuple ? [startTuple] : []), ...path, ...(endTuple ? [endTuple] : [])];
  return merged.filter((point, index) => index === 0 || point[0] !== merged[index - 1][0] || point[1] !== merged[index - 1][1]);
}

function clearRouteArtifacts() {
  if (!mapInstance) {
    friendMarker = null;
    currentMarker = null;
    routePolyline = null;
    return;
  }

  [friendMarker, currentMarker, routePolyline].filter(Boolean).forEach((overlay) => mapInstance.remove(overlay));
  friendMarker = null;
  currentMarker = null;
  routePolyline = null;
}

function destroyMap() {
  clearRouteArtifacts();
  mapInstance?.destroy?.();
  mapInstance = null;
}

function resetRouteState() {
  routeLoading.value = false;
  routeError.value = '';
  routeSummary.value = '';
  routeSteps.value = [];
  currentPosition.value = null;
  hasPlannedRoute.value = false;
  routeMode.value = 'walking';
}

function fitMapView() {
  if (!mapInstance) {
    return;
  }

  const overlays = [friendMarker, currentMarker, routePolyline].filter(Boolean);

  if (overlays.length) {
    mapInstance.setFitView(overlays, false, [72, 72, 72, 72]);
  }
}

function renderFriendMarker(AMap) {
  const friendPoint = getFriendPoint();

  if (!mapInstance || !friendPoint) {
    return;
  }

  friendMarker = new AMap.Marker({
    position: [friendPoint.lng, friendPoint.lat],
    title: props.friend?.username || '好友位置',
    label: {
      content: buildLabel(props.friend?.username || '好友位置'),
      direction: 'top',
    },
  });

  mapInstance.add(friendMarker);
}

function renderCurrentMarker(AMap) {
  if (!mapInstance || !currentPosition.value) {
    return;
  }

  currentMarker = new AMap.Marker({
    position: buildLngLat(AMap, currentPosition.value),
    title: '我的位置',
    offset: new AMap.Pixel(-10, -24),
    label: {
      content: buildLabel('我的位置', 'friend-map-label--self'),
      direction: 'top',
    },
  });

  mapInstance.add(currentMarker);
}

async function detectCurrentPosition() {
  if (typeof window === 'undefined' || !navigator?.geolocation) {
    throw new Error(text.value.locationRequired);
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextPosition = {
          lng: position.coords.longitude,
          lat: position.coords.latitude,
        };
        currentPosition.value = nextPosition;
        resolve(nextPosition);
      },
      () => reject(new Error(text.value.locationRequired)),
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      },
    );
  });
}

async function initMap() {
  if (!canRenderMap.value) {
    destroyMap();
    return;
  }

  mapError.value = '';

  try {
    await nextTick();
    const AMap = await loadAmapSdk();
    const friendPoint = getFriendPoint();

    if (!mapRoot.value || !friendPoint) {
      return;
    }

    destroyMap();
    mapInstance = new AMap.Map(mapRoot.value, {
      viewMode: '3D',
      zoom: 16,
      center: [friendPoint.lng, friendPoint.lat],
      mapStyle: 'amap://styles/normal',
    });

    renderFriendMarker(AMap);
    fitMapView();

    if (hasPlannedRoute.value) {
      await renderRoute();
    }
  } catch (error) {
    mapError.value = error.message || text.value.mapUnavailable;
  }
}

async function renderRoute() {
  if (!canRenderMap.value || !mapInstance) {
    return;
  }

  const friendPoint = getFriendPoint();

  if (!friendPoint) {
    throw new Error(text.value.mapUnavailable);
  }

  routeLoading.value = true;
  routeError.value = '';

  try {
    const AMap = await loadAmapSdk();
    const startPoint = currentPosition.value || await detectCurrentPosition();

    clearRouteArtifacts();
    renderFriendMarker(AMap);
    renderCurrentMarker(AMap);

    const planner = routeMode.value === 'driving'
      ? new AMap.Driving({ hideMarkers: true, map: null })
      : new AMap.Walking({ hideMarkers: true, map: null });

    const result = await new Promise((resolve, reject) => {
      planner.search(
        buildLngLat(AMap, startPoint),
        buildLngLat(AMap, friendPoint),
        (status, routeResult) => {
          planner.clear?.();

          if (status !== 'complete') {
            reject(new Error(text.value.routeFailed));
            return;
          }

          resolve(routeResult);
        },
      );
    });

    const path = extractRoutePath(result, startPoint, friendPoint);

    if (path.length >= 2) {
      routePolyline = new AMap.Polyline({
        path,
        strokeColor: routeMode.value === 'driving' ? '#2f6fd0' : '#2f8a5c',
        strokeOpacity: 0.94,
        strokeWeight: routeMode.value === 'driving' ? 7 : 6,
        lineJoin: 'round',
        lineCap: 'round',
      });
      mapInstance.add(routePolyline);
    }

    const routeMeta = extractAmapRouteSummary(result);
    routeSummary.value = summarizeFriendRoute({
      mode: routeMode.value,
      distanceMeters: routeMeta.distanceMeters,
      durationSeconds: routeMeta.durationSeconds,
    });
    routeSteps.value = routeMeta.steps.slice(0, 6);
    hasPlannedRoute.value = true;
    fitMapView();
  } catch (error) {
    routeSummary.value = '';
    routeSteps.value = [];
    routeError.value = error.message || text.value.routeFailed;
    hasPlannedRoute.value = false;
    fitMapView();
    throw error;
  } finally {
    routeLoading.value = false;
  }
}

async function handleNavigate() {
  try {
    await renderRoute();
  } catch (error) {
    showFailToast(error.message || text.value.routeFailed);
  }
}

function handleVisibleChange(nextVisible) {
  emit('update:show', nextVisible);

  if (!nextVisible) {
    destroyMap();
    resetRouteState();
  }
}

watch(
  () => [props.show, props.friend, props.loading],
  async ([nextVisible]) => {
    if (!nextVisible) {
      destroyMap();
      resetRouteState();
      return;
    }

    await initMap();
  },
  { deep: true },
);

watch(routeMode, async () => {
  if (!props.show || !hasPlannedRoute.value || !mapInstance) {
    return;
  }

  try {
    await renderRoute();
  } catch {
    // Keep the popup usable even if replanning fails.
  }
});

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
    @update:show="handleVisibleChange"
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

      <section v-if="canRenderMap" class="route-card">
        <div class="route-card-head">
          <h4>{{ text.routeSummary }}</h4>

          <div class="route-mode-switch">
            <button
              type="button"
              class="route-mode-btn"
              :class="{ 'is-active': routeMode === 'walking' }"
              @click="routeMode = 'walking'"
            >
              {{ text.walking }}
            </button>
            <button
              type="button"
              class="route-mode-btn"
              :class="{ 'is-active': routeMode === 'driving' }"
              @click="routeMode = 'driving'"
            >
              {{ text.driving }}
            </button>
          </div>
        </div>

        <p class="route-summary-text">
          {{ routeSummary || text.routePending }}
        </p>

        <p v-if="routeError" class="route-error">{{ routeError }}</p>

        <div v-else-if="routeSteps.length" class="route-step-list">
          <article
            v-for="(step, index) in routeSteps"
            :key="`${index}-${step}`"
            class="route-step-item"
          >
            <strong>{{ index + 1 }}</strong>
            <span>{{ step }}</span>
          </article>
        </div>

        <Button block round type="primary" :loading="routeLoading" @click="handleNavigate">
          {{ hasPlannedRoute ? text.refreshRoute : text.navigate }}
        </Button>
      </section>

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

      <Button block round plain type="primary" @click="handleVisibleChange(false)">
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

.route-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border-radius: 20px;
  background: linear-gradient(180deg, #f7faf8 0%, #eef6f1 100%);
  border: 1px solid rgba(47, 106, 77, 0.12);
}

.route-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.route-card-head h4 {
  margin: 0;
  font-size: 15px;
  color: #1f2a22;
}

.route-mode-switch {
  display: inline-flex;
  gap: 8px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(47, 106, 77, 0.08);
}

.route-mode-btn {
  border: 0;
  border-radius: 999px;
  padding: 8px 12px;
  background: transparent;
  color: #5d6f63;
  font-size: 12px;
  font-weight: 600;
}

.route-mode-btn.is-active {
  background: #2f8a5c;
  color: #ffffff;
}

.route-summary-text {
  margin: 0;
  color: #2f5d44;
  font-size: 14px;
  line-height: 1.6;
}

.route-error {
  margin: 0;
  color: #c45353;
  font-size: 13px;
  line-height: 1.6;
}

.route-step-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.route-step-item {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  color: #30473a;
  font-size: 13px;
  line-height: 1.5;
}

.route-step-item strong {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(47, 138, 92, 0.14);
  color: #236847;
  font-size: 12px;
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

@media (max-width: 420px) {
  .popup-head,
  .route-card-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .popup-tags {
    justify-content: flex-start;
  }
}

:deep(.friend-map-label) {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: #236847;
  font-size: 12px;
  box-shadow: 0 8px 18px rgba(31, 58, 44, 0.12);
}

:deep(.friend-map-label--self) {
  color: #1e5ec3;
}
</style>
