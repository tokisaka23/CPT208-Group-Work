const AMAP_SCRIPT_ID = 'cpt208-amap-sdk';
const AMAP_PLUGIN_LIST = 'AMap.Walking,AMap.Driving,AMap.PlaceSearch,AMap.ToolBar,AMap.Scale';

let amapLoadPromise = null;

export function getAmapKey() {
  return String(import.meta.env.VITE_AMAP_KEY || '').trim();
}

export function getAmapSecurityCode() {
  return String(import.meta.env.VITE_AMAP_SECURITY_CODE || '').trim();
}

export function hasAmapKey() {
  return Boolean(getAmapKey());
}

export function hasAmapSecurityCode() {
  return Boolean(getAmapSecurityCode());
}

export function hasAmapCredentials() {
  return hasAmapKey() && hasAmapSecurityCode();
}

function ensureAmapSecurityConfig() {
  if (typeof window === 'undefined') {
    return;
  }

  const key = getAmapKey();
  const securityCode = getAmapSecurityCode();

  if (!key) {
    throw new Error('当前尚未配置高德地图 Key，请先在 .env.local 中填写 VITE_AMAP_KEY。');
  }

  if (!securityCode) {
    throw new Error(
      '当前尚未配置高德安全密钥，请先在 .env.local 中填写 VITE_AMAP_SECURITY_CODE。',
    );
  }

  window._AMapSecurityConfig = {
    securityJsCode: securityCode,
  };
}

function buildAmapScriptUrl() {
  const url = new URL('https://webapi.amap.com/maps');
  url.searchParams.set('v', '2.0');
  url.searchParams.set('key', getAmapKey());
  url.searchParams.set('plugin', AMAP_PLUGIN_LIST);
  return url.toString();
}

export async function loadAmapSdk() {
  if (typeof window === 'undefined') {
    throw new Error('当前环境不支持加载地图 SDK。');
  }

  ensureAmapSecurityConfig();

  if (window.AMap) {
    return window.AMap;
  }

  if (amapLoadPromise) {
    return amapLoadPromise;
  }

  amapLoadPromise = new Promise((resolve, reject) => {
    const existedScript = document.getElementById(AMAP_SCRIPT_ID);

    if (existedScript) {
      existedScript.addEventListener('load', () => resolve(window.AMap));
      existedScript.addEventListener('error', () => reject(new Error('高德地图 SDK 加载失败。')));
      return;
    }

    const script = document.createElement('script');
    script.id = AMAP_SCRIPT_ID;
    script.src = buildAmapScriptUrl();
    script.async = true;
    script.onload = () => resolve(window.AMap);
    script.onerror = () => reject(new Error('高德地图 SDK 加载失败。'));
    document.head.appendChild(script);
  });

  return amapLoadPromise;
}
