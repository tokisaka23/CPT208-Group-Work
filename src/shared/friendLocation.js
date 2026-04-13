import { currentLanguage, resolveLocalized } from '../i18n/index.js';

const DEFAULT_LOCATION_STALE_MS = 5 * 60 * 1000;

const friendLocationTextSource = {
  offline: {
    zh: '好友当前离线，暂时没有实时定位。',
    en: 'This friend is currently offline, so no live location is available.',
    ja: '現在この友だちはオフラインのため、リアルタイム位置は表示できません。',
    ko: '이 친구는 현재 오프라인이어서 실시간 위치를 볼 수 없습니다.',
  },
  sharingOff: {
    zh: '对方暂未开放位置共享。',
    en: 'This friend has not enabled location sharing yet.',
    ja: '相手はまだ位置共有を有効にしていません。',
    ko: '상대방이 아직 위치 공유를 켜지 않았습니다.',
  },
  noLocationData: {
    zh: '暂时没有可展示的定位数据。',
    en: 'There is no location data to display right now.',
    ja: '現在表示できる位置データがありません。',
    ko: '지금은 표시할 수 있는 위치 데이터가 없습니다.',
  },
  walking: {
    zh: '步行',
    en: 'Walking',
    ja: '徒歩',
    ko: '도보',
  },
  driving: {
    zh: '驾车',
    en: 'Driving',
    ja: '車',
    ko: '차량',
  },
  routeReady: {
    zh: '路线已生成',
    en: 'route ready',
    ja: 'ルートを生成しました',
    ko: '경로가 준비되었습니다',
  },
  approximately: {
    zh: '约',
    en: '',
    ja: '約',
    ko: '약',
  },
};

function getFriendLocationText(language = currentLanguage.value) {
  return resolveLocalized(friendLocationTextSource, language);
}

function joinModeAndDetail(modeLabel, detailText, text) {
  if (!detailText) {
    return modeLabel;
  }

  if (text.approximately) {
    return `${modeLabel}${detailText}`;
  }

  return `${modeLabel} ${detailText}`.trim();
}

export function isFiniteCoordinate(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }

  return Number.isFinite(Number(value));
}

export function hasRenderableFriendLocation(friend) {
  return Boolean(
    friend?.isLocationSharingEnabled
    && isFiniteCoordinate(friend?.latitude)
    && isFiniteCoordinate(friend?.longitude),
  );
}

export function getFriendLocationFallbackMessage(friend, language = currentLanguage.value) {
  const text = getFriendLocationText(language);

  if (!friend?.isOnline) {
    return text.offline;
  }

  if (!friend?.isLocationSharingEnabled) {
    return text.sharingOff;
  }

  if (!hasRenderableFriendLocation(friend)) {
    return text.noLocationData;
  }

  return '';
}

export function formatFriendCoordinate(value) {
  if (!isFiniteCoordinate(value)) {
    return '--';
  }

  return Number(value).toFixed(6);
}

export function formatFriendRouteDistance(distanceMeters) {
  if (distanceMeters === null || distanceMeters === undefined || distanceMeters === '') {
    return '--';
  }

  const normalizedDistance = Number(distanceMeters);

  if (!Number.isFinite(normalizedDistance) || normalizedDistance < 0) {
    return '--';
  }

  if (normalizedDistance >= 1000) {
    return `${(normalizedDistance / 1000).toFixed(normalizedDistance >= 10000 ? 0 : 1)} km`;
  }

  return `${Math.round(normalizedDistance)} m`;
}

export function formatFriendRouteDuration(durationSeconds) {
  if (durationSeconds === null || durationSeconds === undefined || durationSeconds === '') {
    return '--';
  }

  const normalizedDuration = Number(durationSeconds);

  if (!Number.isFinite(normalizedDuration) || normalizedDuration < 0) {
    return '--';
  }

  const totalMinutes = Math.max(1, Math.round(normalizedDuration / 60));

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!minutes) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}

export function summarizeFriendRoute({
  mode = 'walking',
  distanceMeters = null,
  durationSeconds = null,
} = {}, language = currentLanguage.value) {
  const text = getFriendLocationText(language);
  const modeLabel = mode === 'driving' ? text.driving : text.walking;
  const approximatelyPrefix = text.approximately ? `${text.approximately} ` : '';
  const distanceText = formatFriendRouteDistance(distanceMeters);
  const durationText = formatFriendRouteDuration(durationSeconds);

  if (distanceText === '--' && durationText === '--') {
    return joinModeAndDetail(modeLabel, text.routeReady, text);
  }

  if (distanceText === '--') {
    return joinModeAndDetail(modeLabel, `${approximatelyPrefix}${durationText}`.trim(), text);
  }

  if (durationText === '--') {
    return joinModeAndDetail(modeLabel, `${approximatelyPrefix}${distanceText}`.trim(), text);
  }

  return joinModeAndDetail(modeLabel, `${approximatelyPrefix}${distanceText} · ${durationText}`.trim(), text);
}

export function extractAmapRouteSummary(result) {
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
  const normalizedDistance = Number(primaryRoute?.distance);
  const normalizedDuration = Number(primaryRoute?.time ?? primaryRoute?.duration);

  return {
    distanceMeters: Number.isFinite(normalizedDistance) ? normalizedDistance : null,
    durationSeconds: Number.isFinite(normalizedDuration) ? normalizedDuration : null,
    steps: stepList
      .map((step) => String(step?.instruction || step?.action || '').trim())
      .filter(Boolean),
  };
}

export function isRecentLocationUpdate(updatedAt, maxAgeMs = DEFAULT_LOCATION_STALE_MS, now = new Date()) {
  const updatedTime = new Date(updatedAt);

  if (Number.isNaN(updatedTime.getTime())) {
    return false;
  }

  return now.getTime() - updatedTime.getTime() <= maxAgeMs;
}

export { DEFAULT_LOCATION_STALE_MS };
