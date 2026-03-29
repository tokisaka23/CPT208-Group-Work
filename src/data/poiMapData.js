export const suzhouPoiMap = {
  zhuozhengyuan: {
    id: 'zhuozhengyuan',
    name: '拙政园',
    type: 'garden',
    lng: 120.626801,
    lat: 31.326496,
    address: '江苏省苏州市姑苏区东北街178号',
    foodKeyword: '苏州美食',
  },
  liuyuan: {
    id: 'liuyuan',
    name: '留园',
    type: 'garden',
    lng: 120.597412,
    lat: 31.318108,
    address: '江苏省苏州市姑苏区留园路338号',
    foodKeyword: '苏州小吃',
  },
  wangshiyuan: {
    id: 'wangshiyuan',
    name: '网师园',
    type: 'garden',
    lng: 120.638903,
    lat: 31.302765,
    address: '江苏省苏州市姑苏区阔家头巷11号',
    foodKeyword: '苏州面馆',
  },
  tianpingshan: {
    id: 'tianpingshan',
    name: '天平山',
    type: 'scenic',
    lng: 120.544802,
    lat: 31.261131,
    address: '江苏省苏州市吴中区灵天路',
    foodKeyword: '苏州本帮菜',
  },
  pingjiangroad: {
    id: 'pingjiangroad',
    name: '平江路',
    type: 'street',
    lng: 120.632247,
    lat: 31.311504,
    address: '江苏省苏州市姑苏区平江路',
    foodKeyword: '苏州小吃',
  },
  suzhoumuseum: {
    id: 'suzhoumuseum',
    name: '苏州博物馆',
    type: 'museum',
    lng: 120.623563,
    lat: 31.325536,
    address: '江苏省苏州市姑苏区东北街204号',
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

export function listSuzhouPois() {
  return Object.values(suzhouPoiMap);
}
