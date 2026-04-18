export const suzhouPoiMap = {
  zhuozhengyuan: {
    id: 'zhuozhengyuan',
    name: '拙政园',
    localizedName: {
      zh: '拙政园',
      en: 'Humble Administrator\'s Garden',
      ja: '拙政園',
      ko: '졸정원',
    },
    type: 'garden',
    lng: 120.626801,
    lat: 31.326496,
    address: '江苏省苏州市姑苏区东北街178号',
    localizedAddress: {
      zh: '江苏省苏州市姑苏区东北街178号',
      en: '178 Northeast Street, Gusu District, Suzhou, Jiangsu',
      ja: '江蘇省蘇州市姑蘇区東北街178号',
      ko: '장쑤성 쑤저우시 구쑤구 둥베이제 178호',
    },
    foodKeyword: '苏州美食',
  },
  liuyuan: {
    id: 'liuyuan',
    name: '留园',
    localizedName: {
      zh: '留园',
      en: 'Lingering Garden',
      ja: '留園',
      ko: '유원',
    },
    type: 'garden',
    lng: 120.597412,
    lat: 31.318108,
    address: '江苏省苏州市姑苏区留园路338号',
    localizedAddress: {
      zh: '江苏省苏州市姑苏区留园路338号',
      en: '338 Liuyuan Road, Gusu District, Suzhou, Jiangsu',
      ja: '江蘇省蘇州市姑蘇区留園路338号',
      ko: '장쑤성 쑤저우시 구쑤구 류위안로 338호',
    },
    foodKeyword: '苏州小吃',
  },
  wangshiyuan: {
    id: 'wangshiyuan',
    name: '网师园',
    localizedName: {
      zh: '网师园',
      en: 'Master of Nets Garden',
      ja: '網師園',
      ko: '망사원',
    },
    type: 'garden',
    lng: 120.638903,
    lat: 31.302765,
    address: '江苏省苏州市姑苏区阔家头巷11号',
    localizedAddress: {
      zh: '江苏省苏州市姑苏区阔家头巷11号',
      en: '11 Kuojiatou Alley, Gusu District, Suzhou, Jiangsu',
      ja: '江蘇省蘇州市姑蘇区闊家頭巷11号',
      ko: '장쑤성 쑤저우시 구쑤구 쿠오자터우샹 11호',
    },
    foodKeyword: '苏州面馆',
  },
  tianpingshan: {
    id: 'tianpingshan',
    name: '天平山',
    localizedName: {
      zh: '天平山',
      en: 'Tianping Mountain',
      ja: '天平山',
      ko: '천평산',
    },
    type: 'scenic',
    lng: 120.544802,
    lat: 31.261131,
    address: '江苏省苏州市吴中区灵天路',
    localizedAddress: {
      zh: '江苏省苏州市吴中区灵天路',
      en: 'Lingtian Road, Wuzhong District, Suzhou, Jiangsu',
      ja: '江蘇省蘇州市呉中区霊天路',
      ko: '장쑤성 쑤저우시 우중구 링톈로',
    },
    foodKeyword: '苏州本帮菜',
  },
  pingjiangroad: {
    id: 'pingjiangroad',
    name: '平江路',
    localizedName: {
      zh: '平江路',
      en: 'Pingjiang Road',
      ja: '平江路',
      ko: '평강로',
    },
    type: 'street',
    lng: 120.632247,
    lat: 31.311504,
    address: '江苏省苏州市姑苏区平江路',
    localizedAddress: {
      zh: '江苏省苏州市姑苏区平江路',
      en: 'Pingjiang Road, Gusu District, Suzhou, Jiangsu',
      ja: '江蘇省蘇州市姑蘇区平江路',
      ko: '장쑤성 쑤저우시 구쑤구 핑장로',
    },
    foodKeyword: '苏州小吃',
  },
  suzhoumuseum: {
    id: 'suzhoumuseum',
    name: '苏州博物馆',
    localizedName: {
      zh: '苏州博物馆',
      en: 'Suzhou Museum',
      ja: '蘇州博物館',
      ko: '쑤저우 박물관',
    },
    type: 'museum',
    lng: 120.623563,
    lat: 31.325536,
    address: '江苏省苏州市姑苏区东北街204号',
    localizedAddress: {
      zh: '江苏省苏州市姑苏区东北街204号',
      en: '204 Northeast Street, Gusu District, Suzhou, Jiangsu',
      ja: '江蘇省蘇州市姑蘇区東北街204号',
      ko: '장쑤성 쑤저우시 구쑤구 둥베이제 204호',
    },
    foodKeyword: '苏州美食',
  },
};

const aliasMap = {
  '拙政园': 'zhuozhengyuan',
  '留园': 'liuyuan',
  '网师园': 'wangshiyuan',
  '天平山': 'tianpingshan',
  '平江路': 'pingjiangroad',
  '平江古街': 'pingjiangroad',
  '苏州博物馆': 'suzhoumuseum',
};

export function resolveSuzhouPoi(target) {
  const normalizedTarget = String(target || '').trim();

  if (!normalizedTarget) {
    return null;
  }

  return suzhouPoiMap[normalizedTarget] || suzhouPoiMap[aliasMap[normalizedTarget]] || null;
}

function resolvePoiLocalizedValue(value, language = 'zh') {
  if (!value || typeof value !== 'object') {
    return '';
  }

  return value[language] || value.zh || value.en || value.ja || value.ko || '';
}

export function getPoiDisplayName(target, language = 'zh') {
  const poi = typeof target === 'string' ? resolveSuzhouPoi(target) : target;
  return resolvePoiLocalizedValue(poi?.localizedName, language) || String(poi?.name || '').trim();
}

export function getPoiDisplayAddress(target, language = 'zh') {
  const poi = typeof target === 'string' ? resolveSuzhouPoi(target) : target;
  return resolvePoiLocalizedValue(poi?.localizedAddress, language) || String(poi?.address || '').trim();
}

export function listSuzhouPois() {
  return Object.values(suzhouPoiMap);
}
