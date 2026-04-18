<script setup>
import { Button, Field, Popup, Slider, showFailToast, showSuccessToast } from 'vant';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useLanguage } from '../../i18n';
import { getPoiDisplayAddress, getPoiDisplayName, resolveSuzhouPoi } from '../../data/poiMapData';
import { getAmapKey, getAmapSecurityCode, hasAmapCredentials, loadAmapSdk } from '../../services/maps/amapLoader';
import { formatDistance } from '../../shared/lbsRouteAgent.js';
import {
  buildScenicAgentRouteSummary,
  buildScenicCountLabel,
  buildScenicCredentialDetails,
  buildScenicCurrentMarkerLabel,
  buildScenicDestinationMarkerLabel,
  buildScenicManualRouteSummary,
  buildScenicMaxWaypointsMessage,
  buildScenicNearbySuccessMessage,
  buildScenicSearchCapabilityFailedMessage,
  buildScenicSearchFailedMessage,
  buildScenicSearchSummary,
  buildScenicSegmentFallbackMessage,
  buildScenicWaypointMarkerLabel,
  buildScenicWaypointName,
  getScenicMapDialogText,
  getScenicSearchOptions,
} from './scenicMapDialogI18n.js';

const props = defineProps({
  show: { type: Boolean, default: false },
  poi: { type: [Object, String], default: null },
  title: { type: String, default: '' },
  routePlan: { type: Object, default: null },
});

const emit = defineEmits(['update:show']);
const { language } = useLanguage();

const MAX_WAYPOINTS = 5;
const ROUTE_COLORS = ['#2f8a5c', '#cf6a32', '#4274d6', '#8b52cc', '#b14d6f', '#2f7c68'];

const mapRoot = ref(null);
const routeMode = ref('walking');
const loading = ref(false);
const routeLoading = ref(false);
const mapError = ref('');
const searchingPlaces = ref(false);
const searchResultCount = ref(0);
const currentPosition = ref(null);
const markerNotes = ref([]);
const isFullscreen = ref(false);
const isMinimized = ref(false);
const activeSearchId = ref('food');
const searchRadius = ref(1500);

let mapInstance = null;
let destinationMarker = null;
let currentMarker = null;
let waypointMarkers = [];
let routePolylines = [];
let searchMarkers = [];
let placeSearch = null;
let mapClickHandler = null;

const text = computed(() => getScenicMapDialogText(language.value));
const searchOptions = computed(() => getScenicSearchOptions(language.value));
const agentRoutePlan = computed(() => (
  props.routePlan?.start && props.routePlan?.end ? props.routePlan : null
));
const resolvedPoi = computed(() => {
  if (agentRoutePlan.value?.end) {
    const matchedPoi = resolveSuzhouPoi(agentRoutePlan.value.end.poiId || agentRoutePlan.value.end.name || '');
    return {
      ...(matchedPoi || {}),
      id: agentRoutePlan.value.end.poiId || `ai-route-${agentRoutePlan.value.end.lng}-${agentRoutePlan.value.end.lat}`,
      name: agentRoutePlan.value.end.name || matchedPoi?.name || text.value.routeDestinationName,
      lng: Number(agentRoutePlan.value.end.lng),
      lat: Number(agentRoutePlan.value.end.lat),
      address: agentRoutePlan.value.end.address || matchedPoi?.address || '',
      localizedName: matchedPoi?.localizedName,
      localizedAddress: matchedPoi?.localizedAddress,
    };
  }

  return typeof props.poi === 'string' ? resolveSuzhouPoi(props.poi) : resolveSuzhouPoi(props.poi?.id) || props.poi;
});
const resolvedPoiName = computed(() => getPoiDisplayName(resolvedPoi.value, language.value) || resolvedPoi.value?.name || text.value.routeDestinationName);
const resolvedPoiAddress = computed(() => getPoiDisplayAddress(resolvedPoi.value, language.value) || resolvedPoi.value?.address || '');
const mapTitle = computed(() => props.title || resolvedPoiName.value || text.value.defaultTitle);
const canUseAmap = computed(() => hasAmapCredentials());
const amapKey = computed(() => getAmapKey());
const amapSecurityCode = computed(() => getAmapSecurityCode());
const mapStorageKey = computed(() => `cpt208_map_dialog_state_${resolvedPoi.value?.id || 'unknown'}`);
const uiStorageKey = computed(() => `cpt208_map_dialog_ui_solo_${resolvedPoi.value?.id || 'unknown'}`);
const minimizedLabel = computed(() => mapTitle.value || text.value.mapLabel);
const routeSummary = computed(() => buildScenicManualRouteSummary(markerNotes.value, language.value));
const activeSearchOption = computed(() => searchOptions.value.find((item) => item.id === activeSearchId.value) || searchOptions.value[0]);
const routeModeLabel = computed(() => (routeMode.value === 'driving' ? text.value.drivingShort : text.value.walkingShort));
const resolvedAgentStartName = computed(() => {
  const startName = String(agentRoutePlan.value?.start?.name || '').trim();
  return startName === '当前位置' ? text.value.currentLocationLabel : startName;
});
const displayRouteSummary = computed(() => {
  if (agentRoutePlan.value) {
    const selectedRoute = agentSelectedRoute.value;
    const distanceMeters = Number(selectedRoute?.distance || agentRoutePlan.value.distanceMeters || 0);
    const durationSeconds = Number(selectedRoute?.duration || agentRoutePlan.value.durationSeconds || 0);
    return buildScenicAgentRouteSummary({
      startName: resolvedAgentStartName.value,
      endName: resolvedPoiName.value,
      routeMode: routeMode.value,
      distanceMeters,
      durationSeconds,
      language: language.value,
    });
  }

  return routeSummary.value;
});
const agentRouteSteps = computed(() => (
  Array.isArray(agentSelectedRoute.value?.steps)
    ? agentSelectedRoute.value.steps.filter((item) => String(item?.instruction || '').trim()).slice(0, 6)
    : []
));
const agentSelectedRoute = computed(() => {
  if (!agentRoutePlan.value?.routes) {
    return agentRoutePlan.value || null;
  }

  return routeMode.value === 'driving'
    ? agentRoutePlan.value.routes.driving || agentRoutePlan.value.routes.walking || null
    : agentRoutePlan.value.routes.walking || agentRoutePlan.value.routes.driving || null;
});
const searchSummary = computed(() => buildScenicSearchSummary({
  count: searchResultCount.value,
  searchLabel: activeSearchOption.value?.label || '',
  language: language.value,
}));

function readJsonStorage(key) {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
}

function writeJsonStorage(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeMarkerNotes(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .slice(0, MAX_WAYPOINTS)
    .map((item, index) => ({
      lng: Number(item?.lng),
      lat: Number(item?.lat),
      note: String(item?.note || '').trim() || buildScenicWaypointName(index, language.value),
    }))
    .filter((item) => Number.isFinite(item.lng) && Number.isFinite(item.lat));
}

function saveUiState() {
  writeJsonStorage(uiStorageKey.value, {
    isFullscreen: isFullscreen.value,
    isMinimized: isMinimized.value,
  });
}

function restoreState() {
  const localState = readJsonStorage(mapStorageKey.value) || {};
  const uiState = readJsonStorage(uiStorageKey.value) || {};

  routeMode.value = localState.routeMode === 'driving' ? 'driving' : 'walking';
  markerNotes.value = normalizeMarkerNotes(localState.markerNotes);
  activeSearchId.value = searchOptions.value.some((item) => item.id === localState.activeSearchId) ? localState.activeSearchId : 'food';
  searchRadius.value = Number.isFinite(Number(localState.searchRadius)) ? Number(localState.searchRadius) : 1500;
  isFullscreen.value = Boolean(uiState.isFullscreen ?? localState.isFullscreen);
  isMinimized.value = Boolean(uiState.isMinimized ?? localState.isMinimized);
}

function persistState() {
  if (!resolvedPoi.value?.id) {
    return;
  }

  writeJsonStorage(mapStorageKey.value, {
    routeMode: routeMode.value,
    markerNotes: normalizeMarkerNotes(markerNotes.value),
    activeSearchId: activeSearchId.value,
    searchRadius: searchRadius.value,
    isFullscreen: isFullscreen.value,
    isMinimized: isMinimized.value,
  });
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

function buildMarkerLabel(content, tone = '') {
  return `<div class="amap-note-label ${tone}">${content}</div>`;
}

function extractRoutePath(result, startPoint, endPoint) {
  const startTuple = toLngLatTuple(startPoint);
  const endTuple = toLngLatTuple(endPoint);
  const routeList = Array.isArray(result?.routes) ? result.routes : Array.isArray(result?.route?.paths) ? result.route.paths : [];
  const primaryRoute = routeList[0] || null;
  const steps = Array.isArray(primaryRoute?.steps) ? primaryRoute.steps : Array.isArray(primaryRoute?.rides) ? primaryRoute.rides : [];
  const path = [];

  steps.forEach((step) => {
    if (Array.isArray(step?.path)) {
      step.path.map((item) => toLngLatTuple(item)).filter(Boolean).forEach((item) => path.push(item));
    }
  });

  const fallbackPath = [startTuple, endTuple].filter(Boolean);
  if (!path.length) {
    return fallbackPath;
  }

  const merged = [...(startTuple ? [startTuple] : []), ...path, ...(endTuple ? [endTuple] : [])];
  return merged.filter((point, index) => index === 0 || point[0] !== merged[index - 1][0] || point[1] !== merged[index - 1][1]);
}

function clearRoutePolylines() {
  if (!mapInstance) {
    routePolylines = [];
    return;
  }
  routePolylines.forEach((item) => mapInstance.remove(item));
  routePolylines = [];
}

function clearSearchArtifacts() {
  if (!mapInstance) {
    searchMarkers = [];
    searchResultCount.value = 0;
    return;
  }
  searchMarkers.forEach((item) => mapInstance.remove(item));
  searchMarkers = [];
  placeSearch?.clear?.();
  placeSearch = null;
  searchResultCount.value = 0;
}

function clearBaseMarkers() {
  if (!mapInstance) {
    waypointMarkers = [];
    destinationMarker = null;
    currentMarker = null;
    return;
  }
  [...waypointMarkers, destinationMarker, currentMarker].filter(Boolean).forEach((item) => mapInstance.remove(item));
  waypointMarkers = [];
  destinationMarker = null;
  currentMarker = null;
}

function destroyMap() {
  if (mapInstance && mapClickHandler) {
    mapInstance.off('click', mapClickHandler);
  }
  mapClickHandler = null;
  clearRoutePolylines();
  clearBaseMarkers();
  clearSearchArtifacts();
  mapInstance?.destroy?.();
  mapInstance = null;
}

async function detectCurrentPosition() {
  if (!navigator?.geolocation) {
    currentPosition.value = null;
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentPosition.value = {
          lng: position.coords.longitude,
          lat: position.coords.latitude,
        };
        resolve(currentPosition.value);
      },
      () => {
        currentPosition.value = null;
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  });
}

function renderDestinationMarker(AMap) {
  if (!mapInstance || !resolvedPoi.value) {
    return;
  }
  destinationMarker = new AMap.Marker({
    position: [resolvedPoi.value.lng, resolvedPoi.value.lat],
    title: resolvedPoiName.value,
    label: { content: buildMarkerLabel(buildScenicDestinationMarkerLabel(resolvedPoiName.value, language.value), 'amap-note-label--dest'), direction: 'top' },
  });
  mapInstance.add(destinationMarker);
}

function renderCurrentMarker(AMap) {
  if (!mapInstance || !currentPosition.value) {
    return;
  }
  currentMarker = new AMap.Marker({
    position: buildLngLat(AMap, currentPosition.value),
    title: text.value.currentLocationLabel,
    offset: new AMap.Pixel(-10, -24),
    label: { content: buildMarkerLabel(buildScenicCurrentMarkerLabel(language.value), 'amap-note-label--self'), direction: 'top' },
  });
  mapInstance.add(currentMarker);
}

function renderWaypointMarkers(AMap) {
  if (!mapInstance) {
    return;
  }
  waypointMarkers = markerNotes.value.map((item, index) => new AMap.Marker({
    position: buildLngLat(AMap, item),
    title: item.note || buildScenicWaypointName(index, language.value),
    offset: new AMap.Pixel(-10, -24),
    label: { content: buildMarkerLabel(buildScenicWaypointMarkerLabel(index, item.note, language.value), 'amap-note-label--waypoint'), direction: 'top' },
  }));
  mapInstance.add(waypointMarkers);
}

function fitMapView() {
  if (!mapInstance) {
    return;
  }
  const overlays = [destinationMarker, currentMarker, ...waypointMarkers, ...routePolylines, ...searchMarkers].filter(Boolean);
  if (overlays.length) {
    mapInstance.setFitView(overlays, false, [72, 72, 72, 72]);
  }
}

async function planSegment(AMap, startPoint, endPoint) {
  const planner = routeMode.value === 'driving' ? new AMap.Driving({ hideMarkers: true, map: null }) : new AMap.Walking({ hideMarkers: true, map: null });
  return new Promise((resolve, reject) => {
    planner.search(buildLngLat(AMap, startPoint), buildLngLat(AMap, endPoint), (status, result) => {
      planner.clear?.();
      if (status !== 'complete') {
        reject(new Error(text.value.routePlanningFailed));
        return;
      }
      resolve(extractRoutePath(result, startPoint, endPoint));
    });
  });
}

async function renderRoute() {
  if (!mapInstance || !resolvedPoi.value || !canUseAmap.value) {
    return;
  }

  const AMap = await loadAmapSdk();
  routeLoading.value = true;
  mapError.value = '';

  try {
    clearRoutePolylines();
    clearBaseMarkers();

    if (agentRoutePlan.value) {
      currentPosition.value = {
        lng: Number(agentRoutePlan.value.start.lng),
        lat: Number(agentRoutePlan.value.start.lat),
      };
      renderDestinationMarker(AMap);
      renderCurrentMarker(AMap);

      const path = Array.isArray(agentSelectedRoute.value?.path)
        ? agentSelectedRoute.value.path.map((item) => [Number(item.lng), Number(item.lat)]).filter((item) => item.every(Number.isFinite))
        : [];

      if (path.length >= 2) {
        const polyline = new AMap.Polyline({
          path,
          strokeColor: ROUTE_COLORS[0],
          strokeOpacity: 0.94,
          strokeWeight: routeMode.value === 'driving' ? 7 : 6,
          lineJoin: 'round',
          lineCap: 'round',
        });
        routePolylines.push(polyline);
        mapInstance.add(polyline);
      }

      fitMapView();
      return;
    }

    renderDestinationMarker(AMap);
    renderWaypointMarkers(AMap);

    const startPoint = currentPosition.value || await detectCurrentPosition();
    if (startPoint) {
      renderCurrentMarker(AMap);
      const routeChain = [startPoint, ...normalizeMarkerNotes(markerNotes.value), resolvedPoi.value];
      const failedSegments = [];
      for (let index = 0; index < routeChain.length - 1; index += 1) {
        try {
          const path = await planSegment(AMap, routeChain[index], routeChain[index + 1]);
          const polyline = new AMap.Polyline({
            path,
            strokeColor: ROUTE_COLORS[index % ROUTE_COLORS.length],
            strokeOpacity: 0.94,
            strokeWeight: routeMode.value === 'driving' ? 7 : 6,
            lineJoin: 'round',
            lineCap: 'round',
          });
          routePolylines.push(polyline);
          mapInstance.add(polyline);
        } catch (segmentError) {
          failedSegments.push(index + 1);
          const fallbackPath = [toLngLatTuple(routeChain[index]), toLngLatTuple(routeChain[index + 1])].filter(Boolean);
          if (fallbackPath.length >= 2) {
            const fallbackPolyline = new AMap.Polyline({
              path: fallbackPath,
              strokeColor: ROUTE_COLORS[index % ROUTE_COLORS.length],
              strokeOpacity: 0.94,
              strokeWeight: routeMode.value === 'driving' ? 7 : 6,
              lineJoin: 'round',
              lineCap: 'round',
            });
            routePolylines.push(fallbackPolyline);
            mapInstance.add(fallbackPolyline);
          }
          console.error('[MapDialog] segment route failed', index, segmentError);
        }
      }
      if (failedSegments.length) {
        mapError.value = buildScenicSegmentFallbackMessage(failedSegments, language.value);
      }
    } else {
      mapError.value = text.value.locationUnavailable;
    }

    fitMapView();
  } catch (error) {
    console.error('[MapDialog] route render failed', error);
    mapError.value = error.message || text.value.routePlanningFailedLater;
  } finally {
    routeLoading.value = false;
  }
}

async function searchNearbyPlaces() {
  if (!mapInstance || !resolvedPoi.value) {
    return;
  }

  const AMap = await loadAmapSdk();
  searchingPlaces.value = true;
  mapError.value = '';
  clearSearchArtifacts();

  const pageSize = 20;
  const maxPages = Math.max(1, Math.min(6, Math.ceil(searchRadius.value / 1000) + 1));
  const targetLimit = Math.min(120, Math.max(12, Math.ceil(searchRadius.value / 120) + 8));
  const aggregatedPois = [];
  const dedupeSet = new Set();
  let totalCount = Infinity;

  const searchPage = (pageIndex) => new Promise((resolve, reject) => {
    placeSearch = new AMap.PlaceSearch({
      pageSize,
      pageIndex,
      autoFitView: false,
    });
    placeSearch.searchNearBy(
      activeSearchOption.value.keyword,
      [resolvedPoi.value.lng, resolvedPoi.value.lat],
      searchRadius.value,
      (status, result) => {
        if (status !== 'complete') {
          reject(new Error(buildScenicSearchCapabilityFailedMessage({
            searchLabel: activeSearchOption.value.label,
            language: language.value,
          })));
          return;
        }
        resolve(result);
      },
    );
  });

  try {
    for (let pageIndex = 1; pageIndex <= maxPages; pageIndex += 1) {
      const result = await searchPage(pageIndex);
      const poiList = result?.poiList?.pois || [];
      totalCount = Number(result?.poiList?.count || totalCount);

      poiList.forEach((item) => {
        const dedupeKey = `${item.id || item.name}-${item.location?.lng}-${item.location?.lat}`;
        if (!dedupeSet.has(dedupeKey)) {
          dedupeSet.add(dedupeKey);
          aggregatedPois.push(item);
        }
      });

      const pageExhausted = poiList.length < pageSize;
      const countReached = aggregatedPois.length >= Math.min(totalCount, targetLimit);

      if (pageExhausted || countReached) {
        break;
      }
    }

    searchMarkers = aggregatedPois.map((item) => new AMap.Marker({
      position: [item.location.lng, item.location.lat],
      title: item.name,
      label: { content: buildMarkerLabel(item.name, 'amap-note-label--food'), direction: 'top' },
    }));
    searchResultCount.value = aggregatedPois.length;
    mapInstance.add(searchMarkers);
    fitMapView();
    showSuccessToast(buildScenicNearbySuccessMessage({
      count: aggregatedPois.length,
      searchLabel: activeSearchOption.value.label,
      language: language.value,
    }));
  } catch (error) {
    mapError.value = error.message || buildScenicSearchFailedMessage({
      searchLabel: activeSearchOption.value.label,
      language: language.value,
    });
  } finally {
    searchingPlaces.value = false;
  }
}

async function handleMapClick(event) {
  if (agentRoutePlan.value) {
    return;
  }

  if (markerNotes.value.length >= MAX_WAYPOINTS) {
    showFailToast(buildScenicMaxWaypointsMessage(MAX_WAYPOINTS, language.value));
    return;
  }

  markerNotes.value = [
    ...normalizeMarkerNotes(markerNotes.value),
    {
      lng: event.lnglat.getLng(),
      lat: event.lnglat.getLat(),
      note: buildScenicWaypointName(markerNotes.value.length, language.value),
    },
  ];
  persistState();
  await renderRoute();
}

async function initMap() {
  if (!props.show || !resolvedPoi.value) {
    return;
  }

  restoreState();
  if (agentRoutePlan.value?.mode) {
    routeMode.value = agentRoutePlan.value.mode;
  }
  mapError.value = '';

  if (!canUseAmap.value) {
    mapError.value = text.value.credentialsMissingDetail;
    return;
  }

  loading.value = true;

  try {
    await nextTick();
    const AMap = await loadAmapSdk();
    if (!mapRoot.value) {
      return;
    }

    destroyMap();
    mapInstance = new AMap.Map(mapRoot.value, {
      viewMode: '3D',
      zoom: 15,
      center: [resolvedPoi.value.lng, resolvedPoi.value.lat],
      mapStyle: 'amap://styles/normal',
    });
    mapInstance.addControl(new AMap.ToolBar());
    mapInstance.addControl(new AMap.Scale());
    if (!agentRoutePlan.value) {
      mapClickHandler = (event) => handleMapClick(event);
      mapInstance.on('click', mapClickHandler);
    }

    if (!agentRoutePlan.value) {
      await detectCurrentPosition();
    }
    await renderRoute();
  } catch (error) {
    console.error('[MapDialog] init failed', error);
    mapError.value = error.message || text.value.mapInitFailed;
  } finally {
    loading.value = false;
  }
}

async function handleRefreshRoute() {
  try {
    mapError.value = '';
    await detectCurrentPosition();
    await renderRoute();
  } catch (error) {
    mapError.value = error.message || text.value.refreshRouteFailed;
  }
}

function handleClose(nextVisible) {
  emit('update:show', nextVisible);
  if (!nextVisible && !isMinimized.value) {
    destroyMap();
  }
}

function handleDismissMap() {
  isMinimized.value = false;
  saveUiState();
  emit('update:show', false);
  destroyMap();
}

function handleMinimize() {
  isMinimized.value = true;
  saveUiState();
  persistState();
  emit('update:show', false);
}

async function handleRestoreFromMinimize() {
  isMinimized.value = false;
  saveUiState();
  emit('update:show', true);
  await nextTick();
}

async function handleToggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
  saveUiState();
  persistState();
  await nextTick();
  mapInstance?.resize?.();
  fitMapView();
}

async function handleDeleteStop(index) {
  markerNotes.value = markerNotes.value.filter((_, itemIndex) => itemIndex !== index);
  persistState();
  await renderRoute();
}

async function handleRenameStop(index, value) {
  markerNotes.value = markerNotes.value.map((item, itemIndex) => (
    itemIndex === index
      ? { ...item, note: String(value || '').trim() || buildScenicWaypointName(index, language.value) }
      : item
  ));
  persistState();
  await renderRoute();
}

watch(() => props.show, async (nextVisible) => {
  if (nextVisible) {
    isMinimized.value = false;
    saveUiState();
    await initMap();
    return;
  }
  if (!isMinimized.value) {
    destroyMap();
  }
});

watch(() => props.poi, async () => {
  if (props.show) {
    await initMap();
  }
});

watch(() => props.routePlan, async () => {
  if (props.show) {
    await initMap();
  }
});

watch(routeMode, async () => {
  persistState();
  if (props.show && mapInstance && routeMode.value) {
    await renderRoute();
  }
});

watch([activeSearchId, searchRadius], () => {
  persistState();
});

watch(() => language.value, async () => {
  if (props.show) {
    await initMap();
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
    :class="['scenic-map-popup', { 'scenic-map-popup--fullscreen': isFullscreen }]"
    @update:show="handleClose"
  >
    <div class="scenic-map-popup__shell">
      <div class="scenic-map-popup__head">
        <div>
          <p class="scenic-map-popup__eyebrow">{{ text.eyebrow }}</p>
          <h3 class="scenic-map-popup__title">{{ mapTitle }}</h3>
          <p class="scenic-map-popup__desc">{{ resolvedPoiAddress || text.noAddressConfigured }}</p>
        </div>
        <div class="scenic-map-popup__head-actions">
          <span class="scenic-map-popup__key">{{ canUseAmap ? text.amapReady : text.amapMissing }}</span>
          <Button round plain size="small" @click="handleDismissMap">{{ text.close }}</Button>
        </div>
      </div>

      <div v-if="mapError" class="scenic-map-popup__feedback">{{ mapError }}</div>
      <div v-if="!resolvedPoi" class="scenic-map-popup__placeholder">{{ text.noPoiPlaceholder }}</div>

      <template v-else>
        <div class="scenic-map-popup__workspace">
          <div class="scenic-map-popup__map-wrap">
            <div ref="mapRoot" class="scenic-map-popup__map" :class="{ 'is-disabled': !canUseAmap }">
              <div v-if="loading" class="scenic-map-popup__map-mask">{{ text.loadingMap }}</div>
              <div v-else-if="!canUseAmap" class="scenic-map-popup__placeholder scenic-map-popup__placeholder--inside">
                <strong>{{ text.mapReservedTitle }}</strong>
                <p>{{ text.credentialsHint }}</p>
                <p>{{ buildScenicCredentialDetails({ amapKey, amapSecurityCode, language }) }}</p>
              </div>
            </div>
          </div>

          <aside class="scenic-map-popup__sidebar">
            <section class="scenic-map-popup__card scenic-map-popup__card--modes">
              <button type="button" class="scenic-map-popup__mode-btn" :class="{ 'is-active': routeMode === 'walking' }" @click="routeMode = 'walking'">{{ text.walkingNavigation }}</button>
              <button type="button" class="scenic-map-popup__mode-btn" :class="{ 'is-active': routeMode === 'driving' }" @click="routeMode = 'driving'">{{ text.drivingNavigation }}</button>
            </section>

            <section class="scenic-map-popup__card scenic-map-popup__card--actions">
              <Button round plain type="primary" :loading="routeLoading" @click="handleRefreshRoute">{{ text.refreshRoute }}</Button>
              <Button round plain @click="handleToggleFullscreen">{{ isFullscreen ? text.exitFullscreen : text.fullscreen }}</Button>
              <Button round plain @click="handleMinimize">{{ text.minimize }}</Button>
            </section>

            <section class="scenic-map-popup__card">
              <div class="scenic-map-popup__card-head">
                <h4>{{ text.navigationOrder }}</h4>
                <span>{{ routeModeLabel }}</span>
              </div>
              <p class="scenic-map-popup__route-summary">{{ agentRoutePlan ? displayRouteSummary : routeSummary }}</p>
            </section>

            <section v-if="agentRoutePlan" class="scenic-map-popup__card">
              <div class="scenic-map-popup__card-head">
                <h4>{{ text.aiRouteSteps }}</h4>
                <span>{{ buildScenicCountLabel(agentRouteSteps.length, 'segment', language) }}</span>
              </div>
              <p class="scenic-map-popup__route-summary">{{ displayRouteSummary }}</p>
              <div v-if="agentRouteSteps.length" class="scenic-map-popup__list">
                <article v-for="(step, index) in agentRouteSteps" :key="`${index}-${step.instruction}`" class="scenic-map-popup__list-item">
                  <div class="scenic-map-popup__stop-head">
                    <strong>{{ index + 1 }}</strong>
                  </div>
                  <span>{{ step.instruction }}</span>
                </article>
              </div>
              <details v-if="agentRoutePlan.transitPlan" class="scenic-map-popup__transit">
                <summary>{{ text.transitPlan }}</summary>
                <p class="scenic-map-popup__route-summary">{{ agentRoutePlan.transitPlan.summary }}</p>
                <textarea
                  class="scenic-map-popup__transit-textarea"
                  :value="agentRoutePlan.transitPlan.text || text.noTransitPlan"
                  readonly
                />
              </details>
            </section>

            <section v-if="!agentRoutePlan" class="scenic-map-popup__card">
              <div class="scenic-map-popup__card-head">
                <h4>{{ text.nearbySearch }}</h4>
                <span>{{ formatDistance(searchRadius, language) }}</span>
              </div>
              <p class="scenic-map-popup__route-summary">{{ searchSummary }}</p>
              <div class="scenic-map-popup__search-types">
                <button
                  v-for="item in searchOptions"
                  :key="item.id"
                  type="button"
                  class="scenic-map-popup__search-chip"
                  :class="{ 'is-active': activeSearchId === item.id }"
                  @click="activeSearchId = item.id"
                >
                  {{ item.label }}
                </button>
              </div>
              <div class="scenic-map-popup__slider-wrap">
                <Slider v-model="searchRadius" :min="500" :max="5000" :step="100" bar-height="4px" active-color="#2f8a5c" />
                <div class="scenic-map-popup__slider-labels">
                  <span>500 m</span>
                  <strong>{{ formatDistance(searchRadius, language) }}</strong>
                  <span>5000 m</span>
                </div>
              </div>
              <Button round plain type="success" :loading="searchingPlaces" @click="searchNearbyPlaces">
                {{ text.findNearby }} {{ activeSearchOption?.label }}
              </Button>
            </section>

            <section v-if="!agentRoutePlan" class="scenic-map-popup__card">
              <div class="scenic-map-popup__card-head">
                <h4>{{ text.pointsList }}</h4>
                <span>{{ buildScenicCountLabel(markerNotes.length, 'point', language) }}</span>
              </div>
              <div v-if="markerNotes.length" class="scenic-map-popup__list">
                <article v-for="(item, index) in markerNotes" :key="`${item.lng}-${item.lat}-${index}`" class="scenic-map-popup__list-item">
                  <div class="scenic-map-popup__stop-head">
                    <strong>{{ index + 1 }}</strong>
                    <Button size="mini" round plain type="danger" @click="handleDeleteStop(index)">{{ text.delete }}</Button>
                  </div>
                  <Field
                    :model-value="item.note"
                    size="small"
                    :placeholder="text.renamePointPlaceholder"
                    @update:model-value="handleRenameStop(index, $event)"
                  />
                  <span>{{ item.lng.toFixed(6) }}, {{ item.lat.toFixed(6) }}</span>
                </article>
              </div>
              <div v-else class="scenic-map-popup__empty">{{ text.emptyPoints }}</div>
            </section>
          </aside>
        </div>
      </template>
    </div>
  </Popup>

  <teleport to="body">
    <button v-if="isMinimized && !show" type="button" class="scenic-map-floating" @click="handleRestoreFromMinimize">
      <strong>{{ text.mapLabel }}</strong>
      <span>{{ minimizedLabel }}</span>
    </button>
  </teleport>
</template>

<style scoped>
.scenic-map-popup{height:min(90vh,920px);background:#fff}.scenic-map-popup--fullscreen{height:100vh;max-height:100vh;border-radius:0}.scenic-map-popup__shell{display:grid;gap:14px;height:100%;padding:18px 16px calc(18px + env(safe-area-inset-bottom));overflow:auto}.scenic-map-popup__head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.scenic-map-popup__head-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.scenic-map-popup__eyebrow,.scenic-map-popup__desc{margin:0}.scenic-map-popup__eyebrow{font-size:12px;letter-spacing:.14em;color:#738378;text-transform:uppercase}.scenic-map-popup__title{margin:4px 0 6px;color:#1f2a22;font-size:22px}.scenic-map-popup__desc{color:#5b6a61;line-height:1.6}.scenic-map-popup__key{padding:8px 12px;border-radius:999px;background:#f3f7f4;color:#2f6a4d;font-size:12px;white-space:nowrap}.scenic-map-popup__feedback,.scenic-map-popup__placeholder,.scenic-map-popup__card{padding:12px 14px;border-radius:16px;background:#f7faf8;color:#52635a;line-height:1.6}.scenic-map-popup__workspace{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:14px}.scenic-map-popup__map{position:relative;min-height:560px;border-radius:24px;overflow:hidden;border:1px solid rgba(47,106,77,.12);background:linear-gradient(180deg,#eef6f1,#f8faf8)}.scenic-map-popup__map.is-disabled{display:grid;place-items:center}.scenic-map-popup__map-mask{position:absolute;inset:0;z-index:5;display:grid;place-items:center;background:rgba(255,255,255,.68);color:#405247;font-weight:600}.scenic-map-popup__placeholder--inside{margin:16px;text-align:center}.scenic-map-popup__sidebar{display:grid;gap:12px;align-content:start}.scenic-map-popup__card--modes,.scenic-map-popup__card--actions{display:grid;gap:10px}.scenic-map-popup__mode-btn,.scenic-map-popup__search-chip{min-height:44px;border-radius:16px;border:1px solid #d9e6dd;background:#fff;color:#1f2a22;transition:transform .2s ease,background-color .2s ease,border-color .2s ease,color .2s ease}.scenic-map-popup__mode-btn.is-active,.scenic-map-popup__search-chip.is-active{border-color:#2f8a5c;background:#eef8f1;color:#236847}.scenic-map-popup__card-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:10px}.scenic-map-popup__card-head h4{margin:0;color:#1f2a22}.scenic-map-popup__card-head span{color:#74837a;font-size:12px}.scenic-map-popup__route-summary{margin:0;color:#415147;font-weight:600}.scenic-map-popup__search-types{display:flex;flex-wrap:wrap;gap:8px}.scenic-map-popup__search-chip{min-height:36px;padding:0 12px;border-radius:999px}.scenic-map-popup__slider-wrap{display:grid;gap:10px;margin:12px 2px}.scenic-map-popup__slider-labels{display:flex;justify-content:space-between;gap:8px;color:#74837a;font-size:12px}.scenic-map-popup__slider-labels strong{color:#1f2a22}.scenic-map-popup__list{display:grid;gap:10px}.scenic-map-popup__list-item{display:grid;gap:8px;padding:10px 12px;border-radius:14px;background:#fff}.scenic-map-popup__stop-head{display:flex;justify-content:space-between;align-items:center;gap:8px}.scenic-map-popup__stop-head strong{display:inline-flex;width:28px;height:28px;border-radius:999px;background:#eef8f1;color:#236847;align-items:center;justify-content:center}.scenic-map-popup__list-item span{color:#74837a;font-size:12px}.scenic-map-popup__empty{margin-top:10px;color:#74837a}.scenic-map-floating{position:fixed;right:18px;top:50%;transform:translateY(-50%);z-index:2100;display:grid;gap:4px;align-items:center;justify-items:center;width:74px;padding:12px 8px;border-radius:18px;border:1px solid rgba(47,106,77,.16);background:rgba(255,255,255,.96);box-shadow:0 18px 36px rgba(28,25,23,.14)}.scenic-map-floating strong{display:inline-flex;width:36px;height:36px;border-radius:999px;align-items:center;justify-content:center;background:#eef8f1;color:#236847;font-size:12px}.scenic-map-floating span{font-size:12px;color:#4f6156;text-align:center;line-height:1.4}
.scenic-map-popup__transit{display:grid;gap:10px;margin-top:10px}.scenic-map-popup__transit summary{cursor:pointer;color:#236847;font-weight:600}.scenic-map-popup__transit-textarea{width:100%;min-height:140px;padding:12px 14px;border-radius:14px;border:1px solid rgba(47,106,77,.12);background:#fff;color:#1f2a22;line-height:1.6;resize:vertical}
@media (max-width:980px){.scenic-map-popup__workspace{grid-template-columns:1fr}.scenic-map-popup__map{min-height:420px}}
@media (max-width:640px){.scenic-map-popup__head{flex-direction:column}.scenic-map-popup__head-actions{width:100%;justify-content:flex-start}.scenic-map-popup__map{min-height:360px}}
</style>
