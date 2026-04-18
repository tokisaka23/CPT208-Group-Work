import { normalizeChatLanguage } from './chatLanguage.js';

const ROUTE_REQUEST_PATTERN = /(路线|路程|导航|怎么走|怎么去|如何去|带我去|去往|前往|到达|从.+到.+|route|directions|navigate|how do i get|walk to|drive to|歩いて|行き方|どう行く|경로|길안내|어떻게 가|가는 길)/i;
const SUZHOU_CITY_PATTERN = /(苏州|蘇州|Suzhou)/i;
const MAX_SUZHOU_STRAIGHT_DISTANCE_METERS = 500000;
const DEFAULT_ROUTE_MODE = 'walking';
const NON_DESTINATION_PATTERN = /(历史|介绍|推荐|攻略|美食|好玩吗|值得|是什么|在哪看|什么时候|门票|开放|文化|怎么玩|拍照|故事|为什么|怎么安排|有哪些|history|intro|recommend|guide|ticket|open|when|what|why|おすすめ|紹介|チケット|歴史|추천|소개|입장료|역사)/i;

const NARROW_ROUTE_REQUEST_PATTERN = /(导航|怎么走|如何去|怎么去|带我去|去往|前往|到达|步行路线|驾车路线|公交路线|交通路线|步行去|开车去|坐车去|从.+到.+|route|directions|navigate|how do i get|walk to|drive to|歩いて|行き方|どう行く|경로|길안내|어떻게 가|가는 길)/i;
const ITINERARY_REQUEST_PATTERN = /(游玩路线|游玩线路|路线规划|线路规划|行程规划|游玩安排|路线安排|行程安排|一日游|半日游|先去哪里|先去哪|应该先去哪里|第一次来苏州|第一次来|初次来苏州|怎么玩|怎么逛|怎么安排|逛哪些|玩哪些|顺序怎么排)/i;

export function isItineraryPlanningRequest(message) {
  const normalized = String(message || '').trim();
  return Boolean(normalized) && ITINERARY_REQUEST_PATTERN.test(normalized);
}

export function isRoutePlanningRequest(message) {
  const normalized = String(message || '').trim();

  if (!normalized || isItineraryPlanningRequest(normalized)) {
    return false;
  }

  return NARROW_ROUTE_REQUEST_PATTERN.test(normalized);
}

export function looksLikeDirectDestination(message) {
  const normalized = String(message || '').trim();

  if (!normalized || normalized.length > 24) {
    return false;
  }

  if (
    isItineraryPlanningRequest(normalized)
    || isRoutePlanningRequest(normalized)
    || NON_DESTINATION_PATTERN.test(normalized)
  ) {
    return false;
  }

  return true;
}

export function extractJsonObject(rawText) {
  const text = String(rawText || '').trim();

  if (!text) {
    throw new Error('Qwen did not return route JSON');
  }

  try {
    return JSON.parse(text);
  } catch {}

  const matched = text.match(/\{[\s\S]*\}/);

  if (!matched) {
    throw new Error('Qwen route response does not contain valid JSON');
  }

  return JSON.parse(matched[0]);
}

export function normalizeRouteMode(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'driving' ? 'driving' : DEFAULT_ROUTE_MODE;
}

export function isWithinSuzhouCity(value) {
  return SUZHOU_CITY_PATTERN.test(String(value || '').trim());
}

export function haversineDistanceMeters(start, end) {
  const startLng = Number(start?.lng);
  const startLat = Number(start?.lat);
  const endLng = Number(end?.lng);
  const endLat = Number(end?.lat);

  if (![startLng, startLat, endLng, endLat].every(Number.isFinite)) {
    return Number.NaN;
  }

  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusMeters = 6371000;
  const deltaLat = toRadians(endLat - startLat);
  const deltaLng = toRadians(endLng - startLng);
  const lat1 = toRadians(startLat);
  const lat2 = toRadians(endLat);

  const sinDeltaLat = Math.sin(deltaLat / 2);
  const sinDeltaLng = Math.sin(deltaLng / 2);
  const a = sinDeltaLat * sinDeltaLat
    + Math.cos(lat1) * Math.cos(lat2) * sinDeltaLng * sinDeltaLng;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function assertReasonableSuzhouRoute(start, end) {
  const distance = haversineDistanceMeters(start, end);

  if (!Number.isFinite(distance)) {
    const error = new Error('路线坐标无效，请重新输入更明确的起点和终点。');
    error.statusCode = 400;
    throw error;
  }

  if (distance > MAX_SUZHOU_STRAIGHT_DISTANCE_METERS) {
    const error = new Error('检测到路线跨度异常，疑似超出苏州市范围，请重新输入苏州市内地点。');
    error.statusCode = 400;
    throw error;
  }

  return distance;
}

export function parseAmapPolyline(polyline) {
  return String(polyline || '')
    .split(';')
    .map((item) => item.split(',').map((segment) => Number(segment)))
    .filter((item) => item.length === 2 && item.every(Number.isFinite))
    .map(([lng, lat]) => ({ lng, lat }));
}

export function mergeRoutePolylines(stepList = []) {
  const merged = [];

  stepList.forEach((step) => {
    parseAmapPolyline(step?.polyline).forEach((point) => {
      const lastPoint = merged[merged.length - 1];

      if (!lastPoint || lastPoint.lng !== point.lng || lastPoint.lat !== point.lat) {
        merged.push(point);
      }
    });
  });

  return merged;
}

export function buildLbsRoutePrompt({ currentCity = '苏州市', currentPage = '', poiCatalog = [] } = {}) {
  const normalizedPage = String(currentPage || '').trim() || '苏州文化导览';
  const poiListText = poiCatalog.length ? poiCatalog.join('、') : '拙政园、留园、网师园、天平山、平江路、苏州博物馆';

  return [
    '你是苏州文旅 LBS 路线智能体。',
    `地理围栏：仅允许识别和规划中国江苏省苏州市范围内的地点。当前用户城市锁定为：${currentCity}。`,
    `当前页面上下文：${normalizedPage}。`,
    `优先识别这些苏州 POI：${poiListText}。`,
    '你必须只输出一个 JSON 对象，禁止输出 Markdown、解释、代码块。',
    'JSON schema:',
    '{"intent":"route|chat","start":"地点","end":"地点","mode":"walking|driving","needsClarification":false,"clarification":"","reason":""}',
    '规则：',
    '1. 如果用户明确在问路线、导航、从哪到哪怎么走，则 intent 必须为 "route"。',
    '2. 如果缺少起点但用户已有当前定位语义，可把 start 写成 "当前位置"。',
    '3. 如果地点不在苏州市，必须把 needsClarification 设为 true，并在 clarification 中要求用户改成苏州市内地点。',
    '4. 如果终点不明确，needsClarification 设为 true。',
    '5. mode 只能是 walking 或 driving，默认 walking。',
    '6. 如果用户在问第一次来苏州先去哪里、怎么玩、行程怎么安排、游玩路线怎么排，这属于游玩规划，不是导航，intent 必须是 "chat"。',
  ].join('\n');
}

export function formatDistance(distanceMeters, language = 'zh') {
  const meters = Number(distanceMeters);
  const replyLanguage = normalizeChatLanguage(language);

  if (!Number.isFinite(meters) || meters <= 0) {
    return replyLanguage === 'zh' ? '0 米' : replyLanguage === 'ko' ? '0m' : '0 m';
  }

  if (meters < 1000) {
    return replyLanguage === 'zh' ? `${Math.round(meters)} 米` : replyLanguage === 'ko' ? `${Math.round(meters)}m` : `${Math.round(meters)} m`;
  }

  if (replyLanguage === 'zh') {
    return `${(meters / 1000).toFixed(meters >= 10000 ? 0 : 1)} 公里`;
  }

  return `${(meters / 1000).toFixed(meters >= 10000 ? 0 : 1)} km`;
}

export function formatDuration(durationSeconds, language = 'zh') {
  const seconds = Number(durationSeconds);
  const replyLanguage = normalizeChatLanguage(language);

  if (!Number.isFinite(seconds) || seconds <= 0) {
    if (replyLanguage === 'en') {
      return 'about 0 min';
    }

    if (replyLanguage === 'ja') {
      return '約 0 分';
    }

    if (replyLanguage === 'ko') {
      return '약 0분';
    }

    return '约 0 分钟';
  }

  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    if (replyLanguage === 'en') {
      return `about ${minutes} min`;
    }

    if (replyLanguage === 'ja') {
      return `約 ${minutes} 分`;
    }

    if (replyLanguage === 'ko') {
      return `약 ${minutes}분`;
    }

    return `约 ${minutes} 分钟`;
  }

  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;

  if (!remainMinutes) {
    if (replyLanguage === 'en') {
      return `about ${hours} hr`;
    }

    if (replyLanguage === 'ja') {
      return `約 ${hours} 時間`;
    }

    if (replyLanguage === 'ko') {
      return `약 ${hours}시간`;
    }

    return `约 ${hours} 小时`;
  }

  if (replyLanguage === 'en') {
    return `about ${hours} hr ${remainMinutes} min`;
  }

  if (replyLanguage === 'ja') {
    return `約 ${hours} 時間 ${remainMinutes} 分`;
  }

  if (replyLanguage === 'ko') {
    return `약 ${hours}시간 ${remainMinutes}분`;
  }

  return `约 ${hours} 小时 ${remainMinutes} 分钟`;
}

export {
  DEFAULT_ROUTE_MODE,
  MAX_SUZHOU_STRAIGHT_DISTANCE_METERS,
};
