import { readonly, ref, watch } from 'vue';

export const LOCALES = ['zh', 'en', 'ja', 'ko'];

export const LANGUAGE_OPTIONS = [
  { value: 'zh', label: '简体中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
];

export const ROUTE_TITLE_KEYS = {
  '/': 'pingjiang',
  '/gardens': 'gardens',
  '/zhuozheng': 'zhuozhengyuan',
  '/liu': 'liuyuan',
  '/wangshi': 'wangshiyuan',
  '/museums': 'museums',
  '/heritage': 'heritage',
};

const LANGUAGE_STORAGE_KEY = 'pingjiang-language';

const routeTitleSource = {
  pingjiang: {
    zh: '平江古街',
    en: 'Pingjiang Road',
    ja: '平江古街',
    ko: '평강고가',
  },
  gardens: {
    zh: '古典园林',
    en: 'Classical Gardens',
    ja: '古典庭園',
    ko: '고전 정원',
  },
  zhuozhengyuan: {
    zh: '拙政园',
    en: 'Humble Administrator\'s Garden',
    ja: '拙政園',
    ko: '졸정원',
  },
  liuyuan: {
    zh: '留园',
    en: 'Lingering Garden',
    ja: '留園',
    ko: '유원',
  },
  wangshiyuan: {
    zh: '网师园',
    en: 'Master of Nets Garden',
    ja: '網師園',
    ko: '망사원',
  },
  museums: {
    zh: '文博殿堂',
    en: 'Museums',
    ja: '博物館と文化',
    ko: '박물관과 문화',
  },
  heritage: {
    zh: '非遗市井',
    en: 'Living Heritage',
    ja: '暮らしの無形遺産',
    ko: '생활 유산',
  },
  appName: {
    zh: '江南慢游',
    en: 'Jiangnan Slow Travel',
    ja: '江南スロートラベル',
    ko: '강남 슬로우 트래블',
  },
};

function loadInitialLanguage() {
  if (typeof window === 'undefined') {
    return 'zh';
  }

  const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (saved && LOCALES.includes(saved)) {
    return saved;
  }

  return 'zh';
}

export const currentLanguage = ref(loadInitialLanguage());

watch(currentLanguage, (value) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
});

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function isLocalizedObject(value) {
  return isPlainObject(value) && LOCALES.some((locale) => locale in value);
}

export function resolveLocalized(value, language = currentLanguage.value) {
  if (Array.isArray(value)) {
    return value.map((item) => resolveLocalized(item, language));
  }

  if (isLocalizedObject(value)) {
    return value[language] ?? value.zh ?? value.en ?? value.ja ?? value.ko ?? '';
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveLocalized(item, language)]),
    );
  }

  return value;
}

export function setLanguage(language) {
  if (!LOCALES.includes(language)) {
    return;
  }

  currentLanguage.value = language;
}

export function getRouteTitle(routeKeyOrPath, language = currentLanguage.value) {
  const titleKey = routeTitleSource[routeKeyOrPath] ? routeKeyOrPath : ROUTE_TITLE_KEYS[routeKeyOrPath];
  const titleSource = routeTitleSource[titleKey] || routeTitleSource.pingjiang;
  return resolveLocalized(titleSource, language);
}

export function getDocumentTitle(routeKeyOrPath, language = currentLanguage.value) {
  return `${getRouteTitle(routeKeyOrPath, language)} · ${resolveLocalized(routeTitleSource.appName, language)}`;
}

export function useLanguage() {
  return {
    language: readonly(currentLanguage),
    languageOptions: LANGUAGE_OPTIONS,
    setLanguage,
  };
}
