import { resolveLocalized } from '../../i18n/index.js';
import { formatDistance, formatDuration } from '../../shared/lbsRouteAgent.js';

export const scenicMapDialogTextSource = {
  eyebrow: { zh: '高德导航', en: 'AMap Navigation', ja: 'Amap ナビゲーション', ko: 'Amap 내비게이션' },
  routeDestinationName: { zh: '路线终点', en: 'Route Destination', ja: 'ルートの目的地', ko: '경로 목적지' },
  defaultTitle: { zh: '地图导航', en: 'Map Navigation', ja: '地図ナビ', ko: '지도 내비게이션' },
  mapLabel: { zh: '地图', en: 'Map', ja: '地図', ko: '지도' },
  noAddressConfigured: { zh: '当前景点暂未配置地图坐标。', en: 'Map coordinates are not configured for this stop yet.', ja: 'このスポットにはまだ地図座標が設定されていません。', ko: '이 장소에는 아직 지도 좌표가 설정되어 있지 않습니다.' },
  amapReady: { zh: '已读取高德凭证', en: 'AMap credentials loaded', ja: 'Amap 認証情報を読み込み済み', ko: 'Amap 자격 증명을 읽었습니다' },
  amapMissing: { zh: '缺少高德凭证', en: 'AMap credentials missing', ja: 'Amap 認証情報がありません', ko: 'Amap 자격 증명이 없습니다' },
  close: { zh: '关闭', en: 'Close', ja: '閉じる', ko: '닫기' },
  noPoiPlaceholder: { zh: '当前景点还没有配置地图坐标，请先在 `src/data/poiMapData.js` 中补充坐标。', en: 'This stop does not have map coordinates yet. Add them in `src/data/poiMapData.js` first.', ja: 'このスポットにはまだ地図座標がありません。まず `src/data/poiMapData.js` に追加してください。', ko: '이 장소에는 아직 지도 좌표가 없습니다. 먼저 `src/data/poiMapData.js` 에 좌표를 추가해 주세요.' },
  loadingMap: { zh: '地图加载中...', en: 'Loading map...', ja: '地図を読み込み中...', ko: '지도를 불러오는 중...' },
  mapReservedTitle: { zh: '地图区域已预留', en: 'Map area reserved', ja: '地図エリアを確保しました', ko: '지도 영역이 준비되어 있습니다' },
  credentialsHint: { zh: '请确认 `.env.local` 同时配置了 `VITE_AMAP_KEY` 和 `VITE_AMAP_SECURITY_CODE`。', en: 'Make sure `.env.local` defines both `VITE_AMAP_KEY` and `VITE_AMAP_SECURITY_CODE`.', ja: '`.env.local` に `VITE_AMAP_KEY` と `VITE_AMAP_SECURITY_CODE` の両方が設定されているか確認してください。', ko: '`.env.local` 에 `VITE_AMAP_KEY` 와 `VITE_AMAP_SECURITY_CODE` 가 모두 설정되어 있는지 확인해 주세요.' },
  keyConfigured: { zh: '已配置', en: 'Configured', ja: '設定済み', ko: '설정됨' },
  keyMissing: { zh: '未配置', en: 'Missing', ja: '未設定', ko: '미설정' },
  keyLabel: { zh: 'KEY', en: 'KEY', ja: 'KEY', ko: 'KEY' },
  securityLabel: { zh: 'SECURITY', en: 'SECURITY', ja: 'SECURITY', ko: 'SECURITY' },
  walkingNavigation: { zh: '步行导航', en: 'Walking Navigation', ja: '徒歩ナビ', ko: '도보 내비게이션' },
  drivingNavigation: { zh: '车行导航', en: 'Driving Navigation', ja: '車ナビ', ko: '차량 내비게이션' },
  refreshRoute: { zh: '刷新路线', en: 'Refresh Route', ja: 'ルートを更新', ko: '경로 새로고침' },
  fullscreen: { zh: '全屏', en: 'Fullscreen', ja: '全画面', ko: '전체 화면' },
  exitFullscreen: { zh: '退出全屏', en: 'Exit Fullscreen', ja: '全画面を終了', ko: '전체 화면 종료' },
  minimize: { zh: '缩到侧边', en: 'Minimize', ja: '端にしまう', ko: '옆으로 접기' },
  navigationOrder: { zh: '导航顺序', en: 'Navigation Order', ja: '案内順序', ko: '안내 순서' },
  walkingShort: { zh: '步行', en: 'Walking', ja: '徒歩', ko: '도보' },
  drivingShort: { zh: '车行', en: 'Driving', ja: '車', ko: '차량' },
  aiRouteSteps: { zh: 'AI 路线步骤', en: 'AI Route Steps', ja: 'AI ルート手順', ko: 'AI 경로 단계' },
  segmentUnit: { zh: '段', en: 'steps', ja: '段', ko: '단계' },
  transitPlan: { zh: '公共交通方案', en: 'Transit Plan', ja: '公共交通プラン', ko: '대중교통 안내' },
  noTransitPlan: { zh: '暂无公共交通方案', en: 'No transit plan available yet', ja: '公共交通プランはまだありません', ko: '대중교통 안내가 아직 없습니다' },
  nearbySearch: { zh: '附近搜索', en: 'Nearby Search', ja: '周辺検索', ko: '주변 검색' },
  searchVerb: { zh: '搜索', en: 'Search', ja: '検索', ko: '검색' },
  findNearby: { zh: '查找附近', en: 'Find Nearby', ja: '周辺を探す', ko: '주변 찾기' },
  pointsList: { zh: '点位列表', en: 'Stops', ja: 'ポイント一覧', ko: '지점 목록' },
  pointUnit: { zh: '个', en: 'items', ja: '件', ko: '개' },
  delete: { zh: '删除', en: 'Delete', ja: '削除', ko: '삭제' },
  renamePointPlaceholder: { zh: '修改点位名称', en: 'Rename this stop', ja: 'ポイント名を変更', ko: '지점 이름 바꾸기' },
  emptyPoints: { zh: '点击地图即可添加点位。', en: 'Tap the map to add a stop.', ja: '地図をタップするとポイントを追加できます。', ko: '지도를 누르면 지점을 추가할 수 있습니다.' },
  currentLocationLabel: { zh: '我的位置', en: 'My Location', ja: '現在地', ko: '내 위치' },
  startLabel: { zh: '起点', en: 'Start', ja: '出発', ko: '출발' },
  destinationLabel: { zh: '终点', en: 'Destination', ja: '目的地', ko: '도착' },
  waypointName: { zh: '标注点', en: 'Waypoint', ja: '立ち寄り', ko: '경유지' },
  routePlanningFailed: { zh: '路线规划失败', en: 'Route planning failed', ja: 'ルート作成に失敗しました', ko: '경로 계획에 실패했습니다' },
  routePlanningFailedLater: { zh: '路线规划失败，请稍后重试。', en: 'Failed to plan the route. Please try again later.', ja: 'ルート作成に失敗しました。しばらくしてから再試行してください。', ko: '경로 계획에 실패했습니다. 잠시 후 다시 시도해 주세요.' },
  locationUnavailable: { zh: '未能获取当前位置，当前先展示终点和标注点。', en: 'Could not get your current location, so only the destination and waypoints are shown for now.', ja: '現在地を取得できなかったため、いまは目的地と立ち寄りポイントのみ表示しています。', ko: '현재 위치를 가져오지 못해 지금은 목적지와 경유지만 먼저 보여 주고 있습니다.' },
  refreshRouteFailed: { zh: '刷新路线失败。', en: 'Failed to refresh the route.', ja: 'ルートの更新に失敗しました。', ko: '경로 새로고침에 실패했습니다.' },
  maxWaypoints: { zh: '最多只能添加 {count} 个点位', en: 'You can add up to {count} stops', ja: '追加できるポイントは最大 {count} 件です', ko: '{count}개 지점까지만 추가할 수 있습니다' },
  credentialsMissingDetail: { zh: '当前尚未完整配置高德凭证，请同时填写 VITE_AMAP_KEY 和 VITE_AMAP_SECURITY_CODE。', en: 'AMap credentials are incomplete. Please set both `VITE_AMAP_KEY` and `VITE_AMAP_SECURITY_CODE`.', ja: 'Amap 認証情報が不足しています。`VITE_AMAP_KEY` と `VITE_AMAP_SECURITY_CODE` を両方設定してください。', ko: 'Amap 자격 증명이 완전하지 않습니다. `VITE_AMAP_KEY` 와 `VITE_AMAP_SECURITY_CODE` 를 모두 설정해 주세요.' },
  mapInitFailed: { zh: '高德地图初始化失败。', en: 'Failed to initialize AMap.', ja: 'Amap の初期化に失敗しました。', ko: 'Amap 초기화에 실패했습니다.' },
  searchCapabilityFailed: { zh: '附近{label}搜索失败，请确认当前 Key 已开通对应能力。', en: 'Failed to search nearby {label}. Please confirm the current key has the required capability.', ja: '周辺の {label} を検索できませんでした。現在のキーで該当機能が有効か確認してください。', ko: '주변 {label} 검색에 실패했습니다. 현재 키에 해당 기능이 열려 있는지 확인해 주세요.' },
  searchFailedLater: { zh: '附近{label}搜索失败，请稍后重试。', en: 'Failed to search nearby {label}. Please try again later.', ja: '周辺の {label} を検索できませんでした。しばらくしてから再試行してください。', ko: '주변 {label} 검색에 실패했습니다. 잠시 후 다시 시도해 주세요.' },
  foundNearby: { zh: '找到 {count} 个附近{label}', en: 'Found {count} nearby {label}', ja: '周辺の {label} を {count} 件見つけました', ko: '주변 {label} {count}곳을 찾았습니다' },
  displayedNearby: { zh: '已显示 {count} 个{label}', en: 'Showing {count} {label}', ja: '{label} を {count} 件表示中', ko: '{label} {count}개를 표시 중' },
  routeSegmentFallback: { zh: '第 {segments} 段路线未能完成精确规划，已使用连线保留顺序。', en: 'Segments {segments} could not be planned precisely, so straight guide lines are shown instead.', ja: '{segments} 区間は正確なルートを作れなかったため、順番を保つ補助線に切り替えました。', ko: '{segments} 구간은 정확한 경로를 만들지 못해 순서를 유지하는 안내선으로 대신 표시했습니다.' },
};

export const scenicMapSearchOptionSource = [
  { id: 'food', label: { zh: '美食', en: 'food spots', ja: '食事スポット', ko: '맛집' }, keyword: '美食', tone: '#cf6a32' },
  { id: 'cinema', label: { zh: '影院', en: 'cinemas', ja: '映画館', ko: '영화관' }, keyword: '影院', tone: '#7a4fc7' },
  { id: 'mall', label: { zh: '购物中心', en: 'malls', ja: 'ショッピングモール', ko: '쇼핑몰' }, keyword: '购物中心', tone: '#2f7c68' },
  { id: 'boardgame', label: { zh: '棋牌/桌游', en: 'board game spots', ja: 'ボードゲーム', ko: '보드게임 장소' }, keyword: '棋牌 桌游', tone: '#8a5a2f' },
  { id: 'scenic', label: { zh: '景区', en: 'scenic areas', ja: '景勝地', ko: '관광지' }, keyword: '景区', tone: '#2f8a5c' },
];

function formatTemplate(template, params = {}) {
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    String(template || ''),
  );
}

export function getScenicMapDialogText(language = 'zh') {
  return resolveLocalized(scenicMapDialogTextSource, language);
}

export function getScenicSearchOptions(language = 'zh') {
  return resolveLocalized(scenicMapSearchOptionSource, language);
}

export function buildScenicWaypointName(index, language = 'zh') {
  const text = getScenicMapDialogText(language);
  return `${text.waypointName} ${index + 1}`;
}

export function buildScenicManualRouteSummary(markerNotes = [], language = 'zh') {
  const text = getScenicMapDialogText(language);
  const waypoints = Array.isArray(markerNotes) ? markerNotes.map((_, index) => String(index + 1)) : [];
  return [text.currentLocationLabel, ...waypoints, text.destinationLabel].join(' -> ');
}

export function buildScenicAgentRouteSummary({
  startName = '',
  endName = '',
  routeMode = 'walking',
  distanceMeters = 0,
  durationSeconds = 0,
  language = 'zh',
} = {}) {
  const text = getScenicMapDialogText(language);
  const modeLabel = routeMode === 'driving' ? text.drivingShort : text.walkingShort;
  return [
    startName,
    endName,
    modeLabel,
    formatDistance(distanceMeters, language),
    formatDuration(durationSeconds, language),
  ].filter(Boolean).join(' · ');
}

export function buildScenicDestinationMarkerLabel(name, language = 'zh') {
  const text = getScenicMapDialogText(language);
  return `${text.destinationLabel} · ${name}`;
}

export function buildScenicCurrentMarkerLabel(language = 'zh') {
  const text = getScenicMapDialogText(language);
  return `${text.startLabel} · ${text.currentLocationLabel}`;
}

export function buildScenicWaypointMarkerLabel(index, note = '', language = 'zh') {
  const normalizedNote = String(note || '').trim() || buildScenicWaypointName(index, language);
  return `${index + 1}. ${normalizedNote}`;
}

export function buildScenicSearchSummary({ count = 0, searchLabel = '', language = 'zh' } = {}) {
  const text = getScenicMapDialogText(language);

  if (Number(count) > 0) {
    return formatTemplate(text.displayedNearby, { count, label: searchLabel });
  }

  return `${text.searchVerb} ${searchLabel}`.trim();
}

export function buildScenicNearbySuccessMessage({ count = 0, searchLabel = '', language = 'zh' } = {}) {
  const text = getScenicMapDialogText(language);
  return formatTemplate(text.foundNearby, { count, label: searchLabel });
}

export function buildScenicSearchCapabilityFailedMessage({ searchLabel = '', language = 'zh' } = {}) {
  const text = getScenicMapDialogText(language);
  return formatTemplate(text.searchCapabilityFailed, { label: searchLabel });
}

export function buildScenicSearchFailedMessage({ searchLabel = '', language = 'zh' } = {}) {
  const text = getScenicMapDialogText(language);
  return formatTemplate(text.searchFailedLater, { label: searchLabel });
}

export function buildScenicMaxWaypointsMessage(count, language = 'zh') {
  const text = getScenicMapDialogText(language);
  return formatTemplate(text.maxWaypoints, { count });
}

export function buildScenicSegmentFallbackMessage(failedSegments = [], language = 'zh') {
  const text = getScenicMapDialogText(language);
  return formatTemplate(text.routeSegmentFallback, { segments: failedSegments.join(', ') });
}

export function buildScenicCredentialDetails({ amapKey, amapSecurityCode, language = 'zh' } = {}) {
  const text = getScenicMapDialogText(language);
  return `${text.keyLabel} ${amapKey ? text.keyConfigured : text.keyMissing} / ${text.securityLabel} ${amapSecurityCode ? text.keyConfigured : text.keyMissing}`;
}

export function buildScenicCountLabel(count, unit, language = 'zh') {
  const text = getScenicMapDialogText(language);
  const resolvedUnit = unit === 'segment' ? text.segmentUnit : text.pointUnit;
  return `${count} ${resolvedUnit}`.trim();
}
