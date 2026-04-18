import fetch from 'node-fetch';
import { buildJsonResponse, getAuthenticatedUser, readJsonBody } from './supabase.js';
import { listSuzhouPois, resolveSuzhouPoi } from '../src/data/poiMapData.js';
import {
  assertReasonableSuzhouRoute,
  buildLbsRoutePrompt,
  extractJsonObject,
  formatDistance,
  formatDuration,
  isItineraryPlanningRequest,
  isRoutePlanningRequest,
  isWithinSuzhouCity,
  looksLikeDirectDestination,
  mergeRoutePolylines,
  normalizeRouteMode,
} from '../src/shared/lbsRouteAgent.js';
import {
  buildReplyLanguageInstruction,
  detectMessageLanguage,
  inferChatLanguage,
  normalizeChatLanguage,
} from '../src/shared/chatLanguage.js';

const CHAT_HISTORY_TABLE = 'chat_history';
const CONVERSATIONS_TABLE = 'conversations';
const MAX_CHAT_HISTORY_ROUNDS = 30;
const MAX_FETCHED_CONVERSATIONS = 200;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SUZHOU_CITY_NAME = '苏州市';
const AMAP_BASE_URL = 'https://restapi.amap.com/v3';

function readAuthorizationHeader(req) {
  return req.headers?.authorization || req.headers?.Authorization || '';
}

function normalizeChatMessages(messages = []) {
  return messages
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant'))
    .map((item) => ({
      role: item.role,
      content: String(item.content || '').trim(),
    }))
    .filter((item) => item.content);
}

function normalizeConversationName(value, fallback = '新对话') {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  return normalized || fallback;
}

function assertConversationId(conversationId) {
  if (!conversationId) {
    throw new Error('Missing conversationId');
  }

  if (!UUID_PATTERN.test(conversationId)) {
    const error = new Error('conversationId 必须是合法 UUID');
    error.statusCode = 400;
    throw error;
  }
}

async function resolveAuthenticatedChatUser(req, { required = false } = {}) {
  if (!readAuthorizationHeader(req)) {
    if (required) {
      const error = new Error('当前请求缺少登录凭证，请重新登录后再试。');
      error.statusCode = 401;
      throw error;
    }

    return null;
  }

  return getAuthenticatedUser(req);
}

async function getConversation(adminClient, userId, conversationId) {
  const { data, error } = await adminClient
    .from(CONVERSATIONS_TABLE)
    .select('id, user_id, conversation_name, created_at, updated_at')
    .eq('user_id', userId)
    .eq('id', conversationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load conversation: ${error.message}`);
  }

  return data || null;
}

async function ensureConversation(adminClient, userId, conversationId, conversationName = '新对话') {
  const existingConversation = await getConversation(adminClient, userId, conversationId);

  if (existingConversation) {
    return existingConversation;
  }

  const payload = {
    id: conversationId,
    user_id: userId,
    conversation_name: normalizeConversationName(conversationName),
  };

  const { data, error } = await adminClient
    .from(CONVERSATIONS_TABLE)
    .insert(payload)
    .select('id, user_id, conversation_name, created_at, updated_at')
    .single();

  if (error) {
    throw new Error(`Failed to create conversation: ${error.message}`);
  }

  return data;
}

async function updateConversationTitle(adminClient, userId, conversationId, conversationName) {
  const normalizedName = normalizeConversationName(conversationName);
  await ensureConversation(adminClient, userId, conversationId, normalizedName);

  const { data, error } = await adminClient
    .from(CONVERSATIONS_TABLE)
    .update({
      conversation_name: normalizedName,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('id', conversationId)
    .select('id, conversation_name, updated_at')
    .single();

  if (error) {
    throw new Error(`Failed to update conversation title: ${error.message}`);
  }

  return data;
}

async function loadPersistedHistory(adminClient, conversationId) {
  const { data, error } = await adminClient
    .from(CHAT_HISTORY_TABLE)
    .select('id, conversation_id, user_input, ai_output, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(MAX_CHAT_HISTORY_ROUNDS);

  if (error) {
    throw new Error(`Failed to load chat history: ${error.message}`);
  }

  return data || [];
}

async function persistChatRound(adminClient, userId, conversationId, userInput, aiOutput) {
  const { error } = await adminClient.from(CHAT_HISTORY_TABLE).insert({
    user_id: userId,
    conversation_id: conversationId,
    user_input: userInput,
    ai_output: aiOutput,
  });

  if (error) {
    throw new Error(`Failed to insert chat history: ${error.message}`);
  }
}

function buildModelMessages({ systemPrompt, persistedHistory, fallbackMessages, currentMessage, usePersistedHistory }) {
  const messages = [{ role: 'system', content: systemPrompt }];

  if (usePersistedHistory) {
    persistedHistory.forEach((item) => {
      const userInput = String(item.user_input || '').trim();
      const aiOutput = String(item.ai_output || '').trim();

      if (userInput) {
        messages.push({ role: 'user', content: userInput });
      }

      if (aiOutput) {
        messages.push({ role: 'assistant', content: aiOutput });
      }
    });

    messages.push({ role: 'user', content: currentMessage });
    return messages;
  }

  const normalizedFallbackMessages = normalizeChatMessages(fallbackMessages);
  return messages.concat(
    normalizedFallbackMessages.length ? normalizedFallbackMessages : [{ role: 'user', content: currentMessage }],
  );
}

function createMessage(id, role, content, createdAt) {
  return {
    id,
    role,
    content,
    createdAt,
  };
}

function truncateText(value, maxLength = 28) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return '';
  }

  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}...` : normalized;
}

function buildConversationSummary(conversation, rows = []) {
  const messages = [];

  rows.forEach((row) => {
    const userInput = String(row.user_input || '').trim();
    const aiOutput = String(row.ai_output || '').trim();

    if (userInput) {
      messages.push(createMessage(`${row.id}-user`, 'user', userInput, row.created_at));
    }

    if (aiOutput) {
      messages.push(createMessage(`${row.id}-assistant`, 'assistant', aiOutput, row.created_at));
    }
  });

  const lastMessage = [...messages].reverse().find((item) => item.role === 'assistant' || item.role === 'user');

  return {
    id: conversation.id,
    title: normalizeConversationName(conversation.conversation_name),
    preview: truncateText(lastMessage?.content, 28) || '还没有对话内容',
    updatedAt: conversation.updated_at || rows.at(-1)?.created_at || conversation.created_at || null,
    messageCount: rows.length,
    messages,
  };
}

function getAmapWebServiceKey() {
  return String(
    process.env.AMAP_WEB_SERVICE_KEY
      || process.env.AMAP_SERVER_KEY
      || '',
  ).trim();
}

function getRouteCopy(language = 'zh') {
  const replyLanguage = normalizeChatLanguage(language);

  if (replyLanguage === 'en') {
    return {
      clarification: 'Please tell me a clearer start and destination within Suzhou.',
      serviceUnavailable: 'Route planning is unavailable right now. Please try again in a moment.',
      keyMismatch: 'The AMap Web Service Key does not match the calling platform. Configure a server-side `AMAP_WEB_SERVICE_KEY` in `.env.local` instead of reusing `VITE_AMAP_KEY`.',
      invalidKey: 'The AMap Web Service Key is invalid. Please check `AMAP_WEB_SERVICE_KEY` in `.env.local`.',
      missingKey: 'The server-side AMap route key is missing. Add `AMAP_WEB_SERVICE_KEY=your AMap Web Service Key` to `.env.local`.',
      walkingUnavailable: 'Walking directions are unavailable right now',
      drivingUnavailable: 'Driving directions are unavailable right now',
      transitUnavailable: 'Transit directions are unavailable right now',
      preferWalking: 'I prioritized walking.',
      preferDriving: 'I prioritized driving.',
      routeSummary: (startName, endName) => `I mapped a route from ${startName} to ${endName}.`,
      walkingSummary: (distanceText, durationText) => `Walking about ${distanceText}, ${durationText}`,
      drivingSummary: (distanceText, durationText) => `Driving about ${distanceText}, ${durationText}`,
      transitSummary: (durationText, walkingText, costText) => `Transit ${durationText}, walk ${walkingText}, ${costText}.`,
      fareFallback: 'fare depends on the line',
      currencyUnit: 'CNY',
      noPrimaryRoute: 'AMap did not return a usable route. Please try again shortly.',
      noWalkingOrDriving: 'Walking and driving directions are both unavailable right now. Please try again in a moment.',
      walkLabel: 'Walk',
      busLabel: 'Bus',
      railLabel: 'Metro',
      from: 'from',
      to: 'to',
      viaStops: (count) => `about ${count} stops`,
    };
  }

  if (replyLanguage === 'ja') {
    return {
      clarification: '蘇州市内の出発地と目的地をもう少し具体的に教えてください。',
      serviceUnavailable: '経路案内を一時的に利用できません。しばらくしてからもう一度お試しください。',
      keyMismatch: 'AMap Web Service Key と呼び出し元のプラットフォームが一致していません。`.env.local` の `AMAP_WEB_SERVICE_KEY` にサーバー専用キーを設定してください。',
      invalidKey: 'AMap Web Service Key が無効です。`.env.local` の `AMAP_WEB_SERVICE_KEY` を確認してください。',
      missingKey: 'サーバー側の AMap ルートキーがありません。`.env.local` に `AMAP_WEB_SERVICE_KEY=あなたの AMap Web Service Key` を追加してください。',
      walkingUnavailable: '徒歩ルートは現在利用できません',
      drivingUnavailable: '車ルートは現在利用できません',
      transitUnavailable: '公共交通ルートは現在利用できません',
      preferWalking: '徒歩を優先して整理しました。',
      preferDriving: '車移動を優先して整理しました。',
      routeSummary: (startName, endName) => `${startName} から ${endName} までのルートをまとめました。`,
      walkingSummary: (distanceText, durationText) => `徒歩 約 ${distanceText}、${durationText}`,
      drivingSummary: (distanceText, durationText) => `車で 約 ${distanceText}、${durationText}`,
      transitSummary: (durationText, walkingText, costText) => `公共交通は ${durationText}、徒歩 ${walkingText}、${costText}。`,
      fareFallback: '運賃は現地案内をご確認ください',
      currencyUnit: '元',
      noPrimaryRoute: 'AMap から利用可能なルートが返されませんでした。しばらくしてからもう一度お試しください。',
      noWalkingOrDriving: '徒歩と車のルートがどちらも現在利用できません。しばらくしてからもう一度お試しください。',
      walkLabel: '徒歩',
      busLabel: 'バス',
      railLabel: '軌道交通',
      from: 'から',
      to: 'まで',
      viaStops: (count) => `約 ${count} 停留所`,
    };
  }

  if (replyLanguage === 'ko') {
    return {
      clarification: '쑤저우 시내 기준으로 출발지와 목적지를 조금 더 구체적으로 알려 주세요.',
      serviceUnavailable: '경로 안내를 지금은 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.',
      keyMismatch: 'AMap Web Service Key 와 호출 플랫폼이 일치하지 않습니다. `.env.local` 에 서버 전용 `AMAP_WEB_SERVICE_KEY` 를 설정해 주세요.',
      invalidKey: 'AMap Web Service Key 가 유효하지 않습니다. `.env.local` 의 `AMAP_WEB_SERVICE_KEY` 를 확인해 주세요.',
      missingKey: '서버 측 AMap 경로 키가 없습니다. `.env.local` 에 `AMAP_WEB_SERVICE_KEY=당신의 AMap Web Service Key` 를 추가해 주세요.',
      walkingUnavailable: '도보 경로를 지금은 사용할 수 없습니다',
      drivingUnavailable: '차량 경로를 지금은 사용할 수 없습니다',
      transitUnavailable: '대중교통 경로를 지금은 사용할 수 없습니다',
      preferWalking: '도보 기준으로 우선 정리했습니다.',
      preferDriving: '차량 이동 기준으로 우선 정리했습니다.',
      routeSummary: (startName, endName) => `${startName}에서 ${endName}까지의 경로를 정리했어요.`,
      walkingSummary: (distanceText, durationText) => `도보 약 ${distanceText}, ${durationText}`,
      drivingSummary: (distanceText, durationText) => `차량 약 ${distanceText}, ${durationText}`,
      transitSummary: (durationText, walkingText, costText) => `대중교통은 ${durationText}, 도보 ${walkingText}, ${costText}.`,
      fareFallback: '요금은 현장 안내를 참고해 주세요',
      currencyUnit: '元',
      noPrimaryRoute: 'AMap 에서 사용 가능한 경로를 돌려주지 않았습니다. 잠시 후 다시 시도해 주세요.',
      noWalkingOrDriving: '도보와 차량 경로를 모두 지금은 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.',
      walkLabel: '도보',
      busLabel: '버스',
      railLabel: '도시철도',
      from: '에서',
      to: '까지',
      viaStops: (count) => `약 ${count}정거장`,
    };
  }

  return {
    clarification: '请补充更明确的苏州市内起点和终点。',
    serviceUnavailable: '路线服务暂时不可用，请稍后重试。',
    keyMismatch: '高德 Web Service Key 与调用平台不匹配。请在 `.env.local` 中配置服务端专用的 `AMAP_WEB_SERVICE_KEY`，不要复用前端 `VITE_AMAP_KEY`。',
    invalidKey: '高德 Web Service Key 无效，请检查 `.env.local` 中的 `AMAP_WEB_SERVICE_KEY`。',
    missingKey: '缺少高德服务端路线 Key。请在 `.env.local` 中新增 `AMAP_WEB_SERVICE_KEY=你的高德 Web Service Key`。',
    walkingUnavailable: '步行路线暂不可用',
    drivingUnavailable: '车行路线暂不可用',
    transitUnavailable: '公共交通方案暂不可用',
    preferWalking: '已优先按步行理解你的意图。',
    preferDriving: '已优先按车行理解你的意图。',
    routeSummary: (startName, endName) => `已为你规划从${startName}到${endName}的路线。`,
    walkingSummary: (distanceText, durationText) => `步行约${distanceText}，${durationText}`,
    drivingSummary: (distanceText, durationText) => `车行约${distanceText}，${durationText}`,
    transitSummary: (durationText, walkingText, costText) => `公共交通${durationText}，步行 ${walkingText}，${costText}。`,
    fareFallback: '票价以现场为准',
    currencyUnit: '元',
    noPrimaryRoute: '高德未返回可用路线，请稍后重试。',
    noWalkingOrDriving: '步行和车行路线都暂时不可用，请稍后重试。',
    walkLabel: '步行',
    busLabel: '公交',
    railLabel: '轨道交通',
    from: '从',
    to: '到',
    viaStops: (count) => `约 ${count} 站`,
  };
}

function normalizeAmapErrorMessage(error, language = 'zh') {
  const message = String(error?.message || '').trim();
  const routeCopy = getRouteCopy(language);

  if (!message) {
    return routeCopy.serviceUnavailable;
  }

  if (/USERKEY_PLAT_NOMATCH|USERKEY_PLAT_NOMATC0H/i.test(message)) {
    return routeCopy.keyMismatch;
  }

  if (/INVALID_USER_KEY/i.test(message)) {
    return routeCopy.invalidKey;
  }

  if (/Missing AMAP_WEB_SERVICE_KEY environment variable/i.test(message)) {
    return routeCopy.missingKey;
  }

  const detectedLanguage = detectMessageLanguage(message);
  const replyLanguage = normalizeChatLanguage(language);
  return !detectedLanguage || detectedLanguage === replyLanguage || replyLanguage === 'zh'
    ? message
    : routeCopy.serviceUnavailable;
}

function normalizeUserLocation(value) {
  const lng = Number(value?.lng);
  const lat = Number(value?.lat);

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return null;
  }

  return { lng, lat };
}

async function requestAmap(pathname, params) {
  const key = getAmapWebServiceKey();

  if (!key) {
    const error = new Error('Missing AMAP_WEB_SERVICE_KEY environment variable');
    error.statusCode = 500;
    throw error;
  }

  const url = new URL(`${AMAP_BASE_URL}${pathname}`);
  const searchParams = new URLSearchParams({ key });

  Object.entries(params || {}).forEach(([name, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(name, String(value));
    }
  });

  url.search = searchParams.toString();

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`AMap request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (String(data?.status) !== '1') {
    throw new Error(data?.info || data?.infocode || 'AMap request failed');
  }

  return data;
}

function assertAmapLocationWithinSuzhou(location, label = '地点') {
  const city = String(location?.city || location?.addressComponent?.city || '').trim();
  const province = String(location?.province || location?.addressComponent?.province || '').trim();
  const formattedAddress = String(location?.formattedAddress || location?.formatted_address || '').trim();

  if (
    !isWithinSuzhouCity(city)
    && !isWithinSuzhouCity(formattedAddress)
    && !(province.includes('江苏') && formattedAddress.includes('苏州'))
  ) {
    const error = new Error(`${label}不在当前地理围栏内。当前定位城市锁定为苏州市，请重新输入苏州市内地点。`);
    error.statusCode = 400;
    throw error;
  }
}

function buildPoiRouteEndpoint(poi, originalName) {
  return {
    name: String(originalName || poi?.name || '').trim() || poi.name,
    address: poi.address || '',
    city: SUZHOU_CITY_NAME,
    province: '江苏省',
    lng: Number(poi.lng),
    lat: Number(poi.lat),
    poiId: poi.id,
  };
}

async function reverseGeocodeUserLocation(userLocation) {
  if (!userLocation) {
    return null;
  }

  const data = await requestAmap('/geocode/regeo', {
    location: `${userLocation.lng},${userLocation.lat}`,
    extensions: 'base',
  });

  const regeocode = data?.regeocode || {};
  const addressComponent = regeocode.addressComponent || {};
  const normalized = {
    ...userLocation,
    city: Array.isArray(addressComponent.city) ? addressComponent.city[0] : addressComponent.city || '',
    district: addressComponent.district || '',
    province: addressComponent.province || '',
    address: regeocode.formatted_address || '',
  };

  assertAmapLocationWithinSuzhou({
    city: normalized.city,
    province: normalized.province,
    formattedAddress: normalized.address,
  }, '当前位置');

  return normalized;
}

async function geocodePlaceInSuzhou(placeName) {
  const keyword = String(placeName || '').trim();

  if (!keyword) {
    const error = new Error('缺少路线地点，请重新输入。');
    error.statusCode = 400;
    throw error;
  }

  const poiCandidate = resolveSuzhouPoi(keyword);

  if (poiCandidate) {
    return buildPoiRouteEndpoint(poiCandidate, keyword);
  }

  const data = await requestAmap('/geocode/geo', {
    address: keyword,
    city: SUZHOU_CITY_NAME,
  });
  const geocode = Array.isArray(data?.geocodes) ? data.geocodes[0] : null;

  if (!geocode?.location) {
    const error = new Error(`未能识别“${keyword}”对应的苏州地点，请换个更具体的说法。`);
    error.statusCode = 400;
    throw error;
  }

  assertAmapLocationWithinSuzhou(geocode, `地点“${keyword}”`);

  const [lng, lat] = String(geocode.location).split(',').map((value) => Number(value));

  return {
    name: keyword,
    address: geocode.formatted_address || keyword,
    city: geocode.city || SUZHOU_CITY_NAME,
    province: geocode.province || '江苏省',
    lng,
    lat,
    poiId: resolveSuzhouPoi(geocode.formatted_address || '')?.id || '',
  };
}

async function resolveRouteEndpoint(placeName, userLocation) {
  const normalizedName = String(placeName || '').trim();

  if (!normalizedName || normalizedName === '当前位置') {
    if (!userLocation) {
      const error = new Error('需要当前位置才能规划这条路线，请允许定位或明确写出起点。');
      error.statusCode = 400;
      throw error;
    }

    return {
      name: '当前位置',
      address: userLocation.address || '',
      city: userLocation.city || SUZHOU_CITY_NAME,
      province: userLocation.province || '江苏省',
      lng: userLocation.lng,
      lat: userLocation.lat,
      poiId: '',
    };
  }

  return geocodePlaceInSuzhou(normalizedName);
}

async function extractRouteIntent({ apiKey, message, currentCity, currentPage }) {
  const prompt = buildLbsRoutePrompt({
    currentCity: currentCity || SUZHOU_CITY_NAME,
    currentPage,
    poiCatalog: listSuzhouPois().map((item) => item.name),
  });

  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen-turbo',
      input: {
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: String(message || '').trim() },
        ],
      },
      parameters: { result_format: 'message' },
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || `DashScope returned status ${response.status}`);
  }

  const data = await response.json();
  const content = data.output?.choices?.[0]?.message?.content || '';
  const parsed = extractJsonObject(content);

  return {
    intent: String(parsed?.intent || 'chat').trim().toLowerCase(),
    start: String(parsed?.start || '').trim(),
    end: String(parsed?.end || '').trim(),
    mode: normalizeRouteMode(parsed?.mode),
    needsClarification: Boolean(parsed?.needsClarification),
    clarification: String(parsed?.clarification || '').trim(),
    reason: String(parsed?.reason || '').trim(),
  };
}

async function planRouteByAmap({ start, end, mode }) {
  const pathname = mode === 'driving' ? '/direction/driving' : '/direction/walking';
  const payload = await requestAmap(pathname, {
    origin: `${start.lng},${start.lat}`,
    destination: `${end.lng},${end.lat}`,
    extensions: 'all',
    strategy: mode === 'driving' ? '0' : undefined,
  });
  const route = payload?.route || {};
  const paths = Array.isArray(route.paths) ? route.paths : [];
  const primaryPath = paths[0];

  if (!primaryPath) {
    const error = new Error('高德未返回可用路线，请稍后重试。');
    error.statusCode = 502;
    throw error;
  }

  const steps = Array.isArray(primaryPath.steps) ? primaryPath.steps : [];

  return {
    distance: Number(primaryPath.distance || route.distance || 0),
    duration: Number(primaryPath.duration || route.duration || 0),
    steps: steps.map((item) => ({
      instruction: String(item.instruction || item.action || '').trim(),
      distance: Number(item.distance || 0),
      duration: Number(item.duration || 0),
      polyline: String(item.polyline || '').trim(),
    })),
    path: mergeRoutePolylines(steps),
  };
}

export function buildRouteAssistantReply({
  start,
  end,
  preferredMode,
  walkingPlan,
  drivingPlan,
  transitPlan,
  language = 'zh',
}) {
  const routeCopy = getRouteCopy(language);
  const walkingText = walkingPlan
    ? routeCopy.walkingSummary(
      formatDistance(walkingPlan.distance, language),
      formatDuration(walkingPlan.duration, language),
    )
    : routeCopy.walkingUnavailable;
  const drivingText = drivingPlan
    ? routeCopy.drivingSummary(
      formatDistance(drivingPlan.distance, language),
      formatDuration(drivingPlan.duration, language),
    )
    : routeCopy.drivingUnavailable;
  const transitText = transitPlan?.summary || routeCopy.transitUnavailable;
  const preferredLabel = preferredMode === 'driving' ? routeCopy.preferDriving : routeCopy.preferWalking;

  return `${routeCopy.routeSummary(start.name, end.name)} ${preferredLabel} ${walkingText}; ${drivingText}; ${transitText}`.replace(/\s+/g, ' ').trim();
}

function formatTransitSummary(transit, language = 'zh') {
  const routeCopy = getRouteCopy(language);
  const durationText = formatDuration(transit.duration || 0, language);
  const walkingText = formatDistance(transit.walkingDistance || 0, language);
  const cost = Number(transit.cost || 0);
  const costText = cost > 0 ? `${cost.toFixed(cost >= 10 ? 0 : 1)} ${routeCopy.currencyUnit}` : routeCopy.fareFallback;
  return routeCopy.transitSummary(durationText, walkingText, costText);
}

function extractTransitLines(segments = [], language = 'zh') {
  const routeCopy = getRouteCopy(language);
  return segments.flatMap((segment) => {
    const lines = [];
    const walkingSteps = Array.isArray(segment?.walking?.steps) ? segment.walking.steps : [];
    walkingSteps.forEach((step) => {
      const instruction = String(step?.instruction || '').trim();
      if (instruction) {
        lines.push(`${routeCopy.walkLabel}: ${instruction}`);
      }
    });

    const busLines = Array.isArray(segment?.bus?.buslines) ? segment.bus.buslines : [];
    busLines.forEach((line) => {
      const name = String(line?.name || '').trim();
      const departure = String(line?.departure_stop?.name || '').trim();
      const arrival = String(line?.arrival_stop?.name || '').trim();
      const viaCount = Number(line?.via_num || 0);

      if (name) {
        const detailParts = [];

        if (departure) {
          detailParts.push(`${routeCopy.from} ${departure}`);
        }

        if (arrival) {
          detailParts.push(`${routeCopy.to} ${arrival}`);
        }

        if (viaCount > 0) {
          detailParts.push(routeCopy.viaStops(viaCount));
        }

        lines.push(`${routeCopy.busLabel}: ${name}${detailParts.length ? `, ${detailParts.join(', ')}` : ''}`);
      }
    });

    const railwayLines = Array.isArray(segment?.railway?.trip) ? segment.railway.trip : [];
    railwayLines.forEach((line) => {
      const name = String(line?.name || '').trim();
      if (name) {
        lines.push(`${routeCopy.railLabel}: ${name}`);
      }
    });

    return lines;
  });
}

async function planTransitByAmap({ start, end, city, language = 'zh' }) {
  const payload = await requestAmap('/direction/transit/integrated', {
    origin: `${start.lng},${start.lat}`,
    destination: `${end.lng},${end.lat}`,
    city: city || SUZHOU_CITY_NAME,
    cityd: city || SUZHOU_CITY_NAME,
    extensions: 'all',
    strategy: '0',
  });

  const route = payload?.route || {};
  const transits = Array.isArray(route.transits) ? route.transits : [];
  const primaryTransit = transits[0];

  if (!primaryTransit) {
    return null;
  }

  const segments = Array.isArray(primaryTransit.segments) ? primaryTransit.segments : [];
  const lines = extractTransitLines(segments, language);

  return {
    distance: Number(primaryTransit.distance || 0),
    duration: Number(primaryTransit.duration || 0),
    walkingDistance: Number(primaryTransit.walking_distance || 0),
    cost: Number(primaryTransit.cost || 0),
    lines,
    summary: formatTransitSummary({
      duration: primaryTransit.duration,
      walkingDistance: primaryTransit.walking_distance,
      cost: primaryTransit.cost,
    }, language),
    text: lines.join('\n'),
  };
}

async function loadTransitPlanOptional({ start, end, city, language = 'zh' }) {
  try {
    return await planTransitByAmap({ start, end, city, language });
  } catch (error) {
    console.warn('[api/chat] transit plan failed', error?.message || error);
    return null;
  }
}

async function loadModeRouteOptional({ start, end, mode }) {
  try {
    return await planRouteByAmap({ start, end, mode });
  } catch (error) {
    console.warn(`[api/chat] ${mode} route failed`, error?.message || error);
    return null;
  }
}

function buildRouteClarificationReply(language = 'zh', clarification = '') {
  const routeCopy = getRouteCopy(language);
  const normalizedClarification = String(clarification || '').trim();

  if (normalizedClarification && detectMessageLanguage(normalizedClarification) === normalizeChatLanguage(language)) {
    return normalizedClarification;
  }

  return routeCopy.clarification;
}

export function buildGuideSystemPrompt({ gpsLocation, itineraryRequested, replyLanguage }) {
  const location = String(gpsLocation || 'Unknown').trim() || 'Unknown';
  const normalizedLanguage = normalizeChatLanguage(replyLanguage);
  const itineraryInstruction = itineraryRequested
    ? 'The user is asking for a visiting plan, not turn-by-turn navigation. Suggest a practical Suzhou itinerary or first stop based on the current page context.'
    : 'If the user asks where to start or how to explore, give practical visiting advice instead of navigation unless they explicitly ask for directions.';
  const brevityInstruction = normalizedLanguage === 'zh'
    ? 'Keep it within 150 Chinese characters.'
    : 'Keep it within 150 words.';

  return [
    'You are a senior local Suzhou guide with deep knowledge of Wu culture.',
    `Current page context: ${location}.`,
    itineraryInstruction,
    buildReplyLanguageInstruction(normalizedLanguage),
    'Include one historical detail or one practical tip when it helps.',
    brevityInstruction,
  ].join(' ');
}

async function handleAsk(bodyData, req) {
  const message = String(bodyData?.message || '').trim() || 'Hello';
  const gpsLocation = String(bodyData?.gpsLocation || 'Unknown').trim() || 'Unknown';
  const conversationId = String(bodyData?.conversationId || '').trim();
  const conversationName = normalizeConversationName(bodyData?.conversationName);
  const apiKey = process.env.QWEN_API_KEY;
  const itineraryRequested = isItineraryPlanningRequest(message);
  const routeRequested = isRoutePlanningRequest(message);
  const directDestinationRequested = looksLikeDirectDestination(message);
  const rawUserLocation = normalizeUserLocation(bodyData?.userLocation);
  const replyLanguage = inferChatLanguage({
    message,
    messages: bodyData?.messages,
    fallbackLanguage: 'zh',
  });

  if (!apiKey) {
    throw new Error('Missing QWEN_API_KEY environment variable');
  }

  assertConversationId(conversationId);

  const authenticatedContext = await resolveAuthenticatedChatUser(req);

  if (authenticatedContext?.user?.id) {
    await ensureConversation(
      authenticatedContext.adminClient,
      authenticatedContext.user.id,
      conversationId,
      conversationName,
    );
  }

  const persistedHistory = authenticatedContext
    ? await loadPersistedHistory(authenticatedContext.adminClient, conversationId)
    : [];

  if (routeRequested || directDestinationRequested) {
    try {
      const userLocation = rawUserLocation ? await reverseGeocodeUserLocation(rawUserLocation) : null;
      const currentCity = userLocation?.city || SUZHOU_CITY_NAME;
      const routeIntent = directDestinationRequested
        ? {
          intent: 'route',
          start: '当前位置',
          end: message,
          mode: 'walking',
          needsClarification: false,
          clarification: '',
          reason: 'direct-destination',
        }
        : await extractRouteIntent({
          apiKey,
          message,
          currentCity,
          currentPage: gpsLocation,
        });

      if (routeIntent.intent === 'route') {
        if (routeIntent.needsClarification) {
          return {
            success: true,
            response: buildRouteClarificationReply(replyLanguage, routeIntent.clarification),
          };
        }

        const start = await resolveRouteEndpoint(routeIntent.start || '当前位置', userLocation);
        const end = await resolveRouteEndpoint(routeIntent.end, userLocation);
        assertReasonableSuzhouRoute(start, end);

        const [walkingPlan, drivingPlan, transitPlan] = await Promise.all([
          loadModeRouteOptional({ start, end, mode: 'walking' }),
          loadModeRouteOptional({ start, end, mode: 'driving' }),
          loadTransitPlanOptional({
            start,
            end,
            city: currentCity,
            language: replyLanguage,
          }),
        ]);

        if (!walkingPlan && !drivingPlan) {
          const unavailableError = new Error(getRouteCopy(replyLanguage).noWalkingOrDriving);
          unavailableError.statusCode = 502;
          throw unavailableError;
        }

        const preferredRoute = routeIntent.mode === 'driving'
          ? drivingPlan || walkingPlan
          : walkingPlan || drivingPlan;

        const responseText = buildRouteAssistantReply({
          start,
          end,
          preferredMode: routeIntent.mode,
          walkingPlan,
          drivingPlan,
          transitPlan,
          language: replyLanguage,
        });

        if (authenticatedContext?.user?.id) {
          await persistChatRound(
            authenticatedContext.adminClient,
            authenticatedContext.user.id,
            conversationId,
            message,
            responseText,
          );
        }

        return {
          success: true,
          response: responseText,
          routePlan: {
            mode: routeIntent.mode,
            city: currentCity,
            start,
            end,
            distanceMeters: preferredRoute?.distance || 0,
            durationSeconds: preferredRoute?.duration || 0,
            steps: preferredRoute?.steps || [],
            path: preferredRoute?.path || [],
            routes: {
              walking: walkingPlan,
              driving: drivingPlan,
            },
            transitPlan,
            provider: 'amap-web-service',
            guardrail: 'suzhou-geofence',
          },
        };
      }
    } catch (routeError) {
      const normalizedMessage = normalizeAmapErrorMessage(routeError, replyLanguage);
      const error = new Error(normalizedMessage);
      error.statusCode = routeError?.statusCode || 400;
      throw error;
    }
  }

  const systemPrompt = buildGuideSystemPrompt({
    gpsLocation,
    itineraryRequested,
    replyLanguage,
  });
  const modelMessages = buildModelMessages({
    systemPrompt,
    persistedHistory,
    fallbackMessages: bodyData?.messages,
    currentMessage: message,
    usePersistedHistory: Boolean(authenticatedContext?.user?.id),
  });

  const aiResponse = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen-turbo',
      input: {
        messages: modelMessages,
      },
      parameters: { result_format: 'message' },
    }),
  });

  if (!aiResponse.ok) {
    const err = await aiResponse.json().catch(() => ({}));
    throw new Error(err.message || `DashScope returned status ${aiResponse.status}`);
  }

  const data = await aiResponse.json();
  const content = data.output?.choices?.[0]?.message?.content?.trim() || 'No content returned';

  if (authenticatedContext?.user?.id) {
    await persistChatRound(
      authenticatedContext.adminClient,
      authenticatedContext.user.id,
      conversationId,
      message,
      content,
    );
  }

  return { success: true, response: content };
}

async function handleHistory(req) {
  const { user, adminClient } = await resolveAuthenticatedChatUser(req, { required: true });

  const { data: conversations, error: conversationError } = await adminClient
    .from(CONVERSATIONS_TABLE)
    .select('id, conversation_name, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(MAX_FETCHED_CONVERSATIONS);

  if (conversationError) {
    throw new Error(`Failed to load conversations: ${conversationError.message}`);
  }

  const conversationIds = (conversations || []).map((item) => item.id);

  if (!conversationIds.length) {
    return { success: true, conversations: [] };
  }

  const { data: rows, error: historyError } = await adminClient
    .from(CHAT_HISTORY_TABLE)
    .select('id, conversation_id, user_input, ai_output, created_at')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: true })
    .limit(MAX_CHAT_HISTORY_ROUNDS * MAX_FETCHED_CONVERSATIONS);

  if (historyError) {
    throw new Error(`Failed to load chat history: ${historyError.message}`);
  }

  const groupedRows = new Map();

  (rows || []).forEach((row) => {
    const conversationId = String(row.conversation_id || '').trim();

    if (!conversationId) {
      return;
    }

    if (!groupedRows.has(conversationId)) {
      groupedRows.set(conversationId, []);
    }

    groupedRows.get(conversationId).push(row);
  });

  const payload = (conversations || []).map((conversation) =>
    buildConversationSummary(conversation, groupedRows.get(conversation.id) || []),
  );

  return { success: true, conversations: payload };
}

async function handleDelete(bodyData, req) {
  const { user, adminClient } = await resolveAuthenticatedChatUser(req, { required: true });
  const conversationId = String(bodyData?.conversationId || '').trim();

  assertConversationId(conversationId);

  const { error } = await adminClient
    .from(CONVERSATIONS_TABLE)
    .delete()
    .eq('user_id', user.id)
    .eq('id', conversationId);

  if (error) {
    throw new Error(`Failed to delete conversation: ${error.message}`);
  }

  return {
    success: true,
    conversationId,
  };
}

async function handleRename(bodyData, req) {
  const { user, adminClient } = await resolveAuthenticatedChatUser(req, { required: true });
  const conversationId = String(bodyData?.conversationId || '').trim();
  const conversationName = normalizeConversationName(bodyData?.conversationName);

  assertConversationId(conversationId);

  const conversation = await updateConversationTitle(adminClient, user.id, conversationId, conversationName);

  return {
    success: true,
    conversation: {
      id: conversation.id,
      title: conversation.conversation_name,
      updatedAt: conversation.updated_at,
    },
  };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return buildJsonResponse(res, 200, { success: true });
  }

  if (req.method !== 'POST') {
    return buildJsonResponse(res, 405, { success: false, error: 'Method Not Allowed' });
  }

  try {
    const bodyData = readJsonBody(req);
    const action = String(bodyData?.action || 'ask').trim();

    if (action === 'ask') {
      return buildJsonResponse(res, 200, await handleAsk(bodyData, req));
    }

    if (action === 'history') {
      return buildJsonResponse(res, 200, await handleHistory(req));
    }

    if (action === 'delete') {
      return buildJsonResponse(res, 200, await handleDelete(bodyData, req));
    }

    if (action === 'rename') {
      return buildJsonResponse(res, 200, await handleRename(bodyData, req));
    }

    return buildJsonResponse(res, 400, {
      success: false,
      error: `Unsupported action: ${action}`,
    });
  } catch (error) {
    console.error('[api/chat] request failed', error);
    return buildJsonResponse(res, error.statusCode || 500, {
      success: false,
      error: error.message || 'Chat request failed',
    });
  }
}
