# Immersive Garden And Panorama

## Purpose

Record the prompts used to study 720yun-style panorama roaming and rebuild a local version for this app.

## Primary Prompt Summary

```text
Help me analyze how a 720yun-style panorama roaming website works. Focus on interaction patterns, not copying code: how it loads panorama images, maps an image onto a sphere, handles hotspot navigation, scene thumbnails, initial camera direction, mobile dragging, gyroscope/touch behavior, loading states, and scene descriptions. After the analysis, help me build a similar experience in our own Vue 3 project using our own Suzhou garden images and our own code. Do not copy 720yun assets or proprietary implementation details.

The goal is to build local panorama roaming pages for Humble Administrator's Garden, Lingering Garden, and Master of Nets Garden. Users should be able to drag to look around, click hotspots to switch scenes, use a scene list, read scene notes, use a mobile layout, and hear background music.
```

## Follow-Up Prompt Summary

```text
The panorama pages still need mobile tuning. Check why WebP panorama images fail in some browsers and add automatic JPG fallback when WebP loading fails. Then adjust the mobile initial direction and FOV based on the 720yun-style experience, so scenes do not open too zoomed-in or miss the main subject. Control buttons and scene sheets must not block the view. Background music should resume after a user gesture. Add tests for default panorama view, fallback images, and mobile layout.
```

## Assisted Components

- `src/components/GardenImmersiveViewer.vue`
- `src/components/GardenScenePreview.vue`
- `src/components/PanoramaSphereViewer.vue`
- `src/lib/garden3d/sceneEngine.js`
- `src/lib/garden3d/proceduralTextures.js`
- `src/data/gardenImmersiveScenes.js`
- `src/data/gardenImmersiveScenesDetailed.js`
- `src/data/zhuozhengPanoramaTour.js`
- `src/data/liuyuanPanoramaTour.js`
- `src/data/wangshiyuanPanoramaTour.js`
- `src/views/*Panorama*View.vue`

## Human Review And Verification

- Checked scene framing on desktop and mobile dimensions.
- Reviewed 720yun as an interaction reference, not as copied source code or copied assets.
- Verified panorama texture fallback behavior through tests.
- Confirmed mobile controls remain thumb-reachable and do not collide with global navigation.
- Reviewed performance-sensitive assets and added WebP/JPG fallback paths.
