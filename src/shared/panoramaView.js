const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const sanitizePan = (value, fallback = 50) => (Number.isFinite(value) ? value : fallback);
const MOBILE_FOV_DEFAULT = 74;
const MOBILE_FOV_MIN = 60;
const MOBILE_FOV_MAX = 78;

const sanitizeMobileFov = (value, fallback = MOBILE_FOV_DEFAULT) =>
  clamp(Number.isFinite(value) ? value : fallback, MOBILE_FOV_MIN, MOBILE_FOV_MAX);

export function panoramaPanToYaw(pan = 50) {
  return sanitizePan(pan, 50) * 3.6;
}

export function pickPanoramaFocusHotspot(scene, activeHotspotId = '') {
  const hotspots = scene?.hotspots || [];
  if (!hotspots.length) {
    return null;
  }

  return hotspots.find((item) => item.id === activeHotspotId)
    || hotspots.find((item) => item.id === scene?.initialHotspotId)
    || hotspots[0];
}

export function derivePanoramaInitialView(scene, activeHotspotId = '', isMobile = false) {
  const focusHotspot = pickPanoramaFocusHotspot(scene, activeHotspotId);
  const derivedPan = sanitizePan(focusHotspot?.x, 50);
  const hotspotTilt = Number.isFinite(focusHotspot?.pitch)
    ? focusHotspot.pitch
    : Number.isFinite(focusHotspot?.y)
      ? Math.round((50 - focusHotspot.y) * 1.5)
      : 0;
  const derivedTilt = isMobile
    ? clamp(hotspotTilt - 2, -20, 16)
    : clamp(hotspotTilt + 1, -16, 22);
  const derivedFov = isMobile ? MOBILE_FOV_DEFAULT : 84;
  const mobileFov = sanitizeMobileFov(
    scene?.initialMobileFov ?? scene?.initialFov ?? derivedFov,
    derivedFov,
  );

  if (!isMobile) {
    return {
      pan: scene?.initialPan ?? 50,
      tilt: scene?.initialTilt ?? 0,
      fov: scene?.initialFov ?? 70,
    };
  }

  return {
    pan: scene?.initialMobilePan ?? scene?.initialPan ?? derivedPan,
    tilt: scene?.initialMobileTilt ?? scene?.initialTilt ?? derivedTilt,
    fov: mobileFov,
  };
}
