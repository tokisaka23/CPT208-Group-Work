const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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
  const derivedPan = Number.isFinite(focusHotspot?.x)
    ? ((focusHotspot.x - 50) * 3.6) / 1.8 + 50
    : 50;
  const hotspotTilt = Number.isFinite(focusHotspot?.pitch)
    ? focusHotspot.pitch
    : Number.isFinite(focusHotspot?.y)
      ? Math.round((50 - focusHotspot.y) * 1.5)
      : 0;
  const derivedTilt = isMobile
    ? clamp(hotspotTilt - 2, -20, 16)
    : clamp(hotspotTilt + 1, -16, 22);
  const derivedFov = isMobile ? 96 : 84;

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
    fov: scene?.initialMobileFov ?? scene?.initialFov ?? derivedFov,
  };
}
