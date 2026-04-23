<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as THREE from 'three';
import { derivePanoramaInitialView, panoramaPanToYaw } from '../shared/panoramaView';

const props = defineProps({
  scene: {
    type: Object,
    required: true,
  },
  activeHotspotId: {
    type: String,
    default: '',
  },
  autoPlay: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['hotspot-select', 'view-change']);

const containerRef = ref(null);
const overlayRef = ref(null);
const projectedHotspots = ref([]);
const flatScale = ref(1);
const flatOffsetX = ref(0);
const flatOffsetY = ref(0);
const useSphereMode = computed(() => props.scene?.isPanorama === true);
const hasSphericalHotspots = computed(() =>
  (props.scene?.hotspots || []).some((item) => Number.isFinite(item?.yaw) && Number.isFinite(item?.pitch)),
);

const fallbackHotspots = computed(() => {
  if (useSphereMode.value && hasSphericalHotspots.value) {
    return [];
  }

  return (props.scene?.hotspots || []).filter((item) => Number.isFinite(item?.x) && Number.isFinite(item?.y));
});
const flatImageStyle = computed(() => ({
  transform: `translate3d(${flatOffsetX.value}%, ${flatOffsetY.value}%, 0) scale(${flatScale.value})`,
  transition: viewerState.isDragging ? 'none' : 'transform 0.24s ease',
}));

let renderer = null;
let scene3d = null;
let camera = null;
let sphereMesh = null;
let textureLoader = null;
let animationFrameId = 0;
let resizeObserver = null;

const viewerState = {
  lon: 0,
  lat: 0,
  isDragging: false,
  pointerStartX: 0,
  pointerStartY: 0,
  pointerStartLon: 0,
  pointerStartLat: 0,
  pointerStartFlatX: 0,
  pointerStartFlatY: 0,
  fov: 70,
};

const hotspotVector = new THREE.Vector3();
const projectionVector = new THREE.Vector3();

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const toRadians = (degrees) => (degrees * Math.PI) / 180;
const isMobileViewport = () => typeof window !== 'undefined' && window.innerWidth <= 640;
const getInitialView = () => derivePanoramaInitialView(props.scene, props.activeHotspotId, isMobileViewport());
const resetFlatView = () => {
  flatScale.value = 1;
  flatOffsetX.value = 0;
  flatOffsetY.value = 0;
};

const projectHotspots = () => {
  if (!camera || !overlayRef.value || !hasSphericalHotspots.value) {
    projectedHotspots.value = [];
    return;
  }

  const width = overlayRef.value.clientWidth || 1;
  const height = overlayRef.value.clientHeight || 1;

  projectedHotspots.value = (props.scene?.hotspots || [])
    .map((hotspot) => {
      if (!Number.isFinite(hotspot?.yaw) || !Number.isFinite(hotspot?.pitch)) {
        return null;
      }

      const yaw = toRadians(hotspot.yaw);
      const pitch = toRadians(hotspot.pitch);
      const radius = 500;

      hotspotVector.set(
        radius * Math.cos(pitch) * Math.cos(yaw),
        radius * Math.sin(pitch),
        radius * Math.cos(pitch) * Math.sin(yaw),
      );

      projectionVector.copy(hotspotVector).project(camera);

      const visible = projectionVector.z < 1
        && projectionVector.z > -1
        && Math.abs(projectionVector.x) <= 1.08
        && Math.abs(projectionVector.y) <= 1.08;
      const left = (projectionVector.x * 0.5 + 0.5) * width;
      const top = (-projectionVector.y * 0.5 + 0.5) * height;

      return {
        ...hotspot,
        visible,
        left,
        top,
      };
    })
    .filter(Boolean)
    .filter((hotspot) => hotspot.visible);
};

const applyCameraRotation = () => {
  if (!camera) {
    return;
  }

  viewerState.lat = clamp(viewerState.lat, -85, 85);

  const phi = THREE.MathUtils.degToRad(90 - viewerState.lat);
  const theta = THREE.MathUtils.degToRad(viewerState.lon);

  camera.lookAt(
    500 * Math.sin(phi) * Math.cos(theta),
    500 * Math.cos(phi),
    500 * Math.sin(phi) * Math.sin(theta),
  );

  camera.fov = viewerState.fov;
  camera.updateProjectionMatrix();

  emit('view-change', {
    yaw: viewerState.lon,
    pitch: viewerState.lat,
    fov: viewerState.fov,
  });
};

const renderFrame = () => {
  if (!renderer || !scene3d || !camera) {
    return;
  }

  if (props.autoPlay && !viewerState.isDragging) {
    viewerState.lon += 0.03;
  }

  applyCameraRotation();
  renderer.render(scene3d, camera);
  projectHotspots();
  animationFrameId = requestAnimationFrame(renderFrame);
};

const disposeRenderer = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
  }

  resizeObserver?.disconnect();
  resizeObserver = null;

  if (sphereMesh) {
    sphereMesh.geometry.dispose();
    sphereMesh.material.dispose();
    scene3d?.remove(sphereMesh);
    sphereMesh = null;
  }

  renderer?.dispose();
  renderer?.domElement?.remove();
  renderer = null;
  scene3d = null;
  camera = null;
};

const resizeRenderer = () => {
  if (!renderer || !camera || !containerRef.value) {
    return;
  }

  const width = containerRef.value.clientWidth || 1;
  const height = containerRef.value.clientHeight || 1;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  projectHotspots();
};

const updateTexture = async () => {
  if (!useSphereMode.value || !scene3d || !camera || !renderer || !props.scene?.image) {
    return;
  }

  const texture = await textureLoader.loadAsync(props.scene.image);
  texture.colorSpace = THREE.SRGBColorSpace;
  const textureWidth = texture.image?.width ?? 0;
  const textureHeight = texture.image?.height ?? 0;
  const canUseMipmaps = renderer?.capabilities?.isWebGL2
    || (THREE.MathUtils.isPowerOfTwo(textureWidth) && THREE.MathUtils.isPowerOfTwo(textureHeight));

  texture.generateMipmaps = canUseMipmaps;
  texture.minFilter = canUseMipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = Math.min(renderer?.capabilities?.getMaxAnisotropy?.() ?? 1, 8);
  texture.needsUpdate = true;

  if (sphereMesh) {
    const previousMaterial = sphereMesh.material;
    previousMaterial.map?.dispose?.();
    previousMaterial.dispose();
    sphereMesh.material = new THREE.MeshBasicMaterial({ map: texture });
  } else {
    const geometry = new THREE.SphereGeometry(500, 64, 40);
    geometry.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    sphereMesh = new THREE.Mesh(geometry, material);
    scene3d.add(sphereMesh);
  }

  const initialView = getInitialView();
  viewerState.lon = panoramaPanToYaw(initialView.pan);
  viewerState.lat = initialView.tilt;
  viewerState.fov = initialView.fov;
  applyCameraRotation();
  projectHotspots();
}

const initializeRenderer = async () => {
  if (!containerRef.value) {
    return;
  }

  disposeRenderer();

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobileViewport() ? 2 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';

  scene3d = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, 1, 1, 1100);
  textureLoader = new THREE.TextureLoader();
  textureLoader.setCrossOrigin('anonymous');

  containerRef.value.appendChild(renderer.domElement);

  resizeObserver = new ResizeObserver(() => {
    resizeRenderer();
  });
  resizeObserver.observe(containerRef.value);

  resizeRenderer();
  await updateTexture();
  renderFrame();
};

const beginDrag = (event) => {
  if (event.pointerType === 'mouse' && event.button !== 0) {
    return;
  }

  viewerState.isDragging = true;
  viewerState.pointerStartX = event.clientX;
  viewerState.pointerStartY = event.clientY;
  viewerState.pointerStartLon = viewerState.lon;
  viewerState.pointerStartLat = viewerState.lat;
  viewerState.pointerStartFlatX = flatOffsetX.value;
  viewerState.pointerStartFlatY = flatOffsetY.value;
  event.currentTarget?.setPointerCapture?.(event.pointerId);
};

const handleDrag = (event) => {
  if (!viewerState.isDragging || !overlayRef.value) {
    return;
  }

  const width = overlayRef.value.clientWidth || 1;
  const height = overlayRef.value.clientHeight || 1;

  if (!useSphereMode.value) {
    flatOffsetX.value = clamp(
      viewerState.pointerStartFlatX + ((event.clientX - viewerState.pointerStartX) / width) * 14,
      -8,
      8,
    );
    flatOffsetY.value = clamp(
      viewerState.pointerStartFlatY + ((event.clientY - viewerState.pointerStartY) / height) * 10,
      -6,
      6,
    );
    emit('view-change', {
      yaw: 180 + flatOffsetX.value * 8,
      pitch: flatOffsetY.value * -3,
      fov: 70 / flatScale.value,
    });
    return;
  }

  viewerState.lon = viewerState.pointerStartLon - ((event.clientX - viewerState.pointerStartX) / width) * 180;
  viewerState.lat = viewerState.pointerStartLat + ((event.clientY - viewerState.pointerStartY) / height) * 120;
};

const endDrag = (event) => {
  viewerState.isDragging = false;
  event.currentTarget?.releasePointerCapture?.(event.pointerId);
};

const handleWheel = (event) => {
  event.preventDefault();
  if (!useSphereMode.value) {
    flatScale.value = clamp(flatScale.value - event.deltaY * 0.0008, 1, 1.18);
    emit('view-change', {
      yaw: 180 + flatOffsetX.value * 8,
      pitch: flatOffsetY.value * -3,
      fov: 70 / flatScale.value,
    });
    return;
  }
  viewerState.fov = clamp(viewerState.fov + event.deltaY * 0.02, 42, 88);
};

watch(
  () => props.scene,
  async () => {
    await nextTick();
    resetFlatView();
    if (useSphereMode.value) {
      if (renderer) {
        await updateTexture();
      } else {
        await initializeRenderer();
      }
    } else {
      disposeRenderer();
      emit('view-change', {
        yaw: 180,
        pitch: 0,
        fov: 70,
      });
    }
  },
  { deep: true },
);

onMounted(async () => {
  await nextTick();
  if (useSphereMode.value) {
    await initializeRenderer();
  }
});

onBeforeUnmount(() => {
  disposeRenderer();
});
</script>

<template>
  <div
    ref="overlayRef"
    class="panorama-sphere-viewer"
    @pointerdown="beginDrag"
    @pointermove="handleDrag"
    @pointerup="endDrag"
    @pointercancel="endDrag"
    @pointerleave="endDrag"
    @wheel="handleWheel"
  >
    <div v-if="useSphereMode" ref="containerRef" class="panorama-sphere-viewer__canvas" />
    <img
      v-else
      :src="scene.image"
      :alt="scene.title"
      class="panorama-sphere-viewer__flat-image"
      :style="flatImageStyle"
      draggable="false"
    />

    <button
      v-for="hotspot in projectedHotspots"
      :key="hotspot.id"
      type="button"
      :class="['panorama-sphere-viewer__hotspot', { 'is-active': hotspot.id === activeHotspotId }]"
      :style="{ left: `${hotspot.left}px`, top: `${hotspot.top}px` }"
      @click.stop="emit('hotspot-select', hotspot.id)"
    >
      <span>{{ hotspot.label }}</span>
    </button>

    <button
      v-for="hotspot in fallbackHotspots"
      :key="`fallback-${hotspot.id}`"
      type="button"
      :class="['panorama-sphere-viewer__hotspot panorama-sphere-viewer__hotspot--fallback', { 'is-active': hotspot.id === activeHotspotId }]"
      :style="{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }"
      @click.stop="emit('hotspot-select', hotspot.id)"
    >
      <span>{{ hotspot.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.panorama-sphere-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: none;
  cursor: grab;
}

.panorama-sphere-viewer:active {
  cursor: grabbing;
}

.panorama-sphere-viewer__canvas {
  position: absolute;
  inset: 0;
}

.panorama-sphere-viewer__flat-image {
  position: absolute;
  inset: -2%;
  width: 104%;
  height: 104%;
  object-fit: cover;
  transform-origin: center center;
  user-select: none;
  -webkit-user-drag: none;
}

.panorama-sphere-viewer__hotspot {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  transform: translate(-50%, -50%);
  padding: 0.56rem 0.82rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(13, 18, 24, 0.46);
  color: white;
  cursor: pointer;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition:
    transform 0.24s ease,
    background-color 0.24s ease,
    box-shadow 0.24s ease;
}

.panorama-sphere-viewer__hotspot::before {
  content: '';
  width: 0.7rem;
  height: 0.7rem;
  flex: none;
  border-radius: 50%;
  background: white;
  box-shadow: 0 0 0 0.45rem rgba(255, 255, 255, 0.14);
}

.panorama-sphere-viewer__hotspot span {
  white-space: nowrap;
  font-size: 0.82rem;
}

.panorama-sphere-viewer__hotspot:hover,
.panorama-sphere-viewer__hotspot.is-active {
  transform: translate(-50%, -50%) scale(1.04);
  background: rgba(158, 41, 28, 0.78);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.22);
}

.panorama-sphere-viewer__hotspot--fallback {
  opacity: 0.92;
}

@media (max-width: 640px) {
  .panorama-sphere-viewer__hotspot {
    min-width: 1.9rem;
    min-height: 1.9rem;
    padding: 0;
    justify-content: center;
    gap: 0;
    border-radius: 999px;
    background: rgba(10, 16, 22, 0.52);
  }

  .panorama-sphere-viewer__hotspot::before {
    width: 0.52rem;
    height: 0.52rem;
    box-shadow: 0 0 0 0.28rem rgba(255, 255, 255, 0.12);
  }

  .panorama-sphere-viewer__hotspot span {
    position: absolute;
    left: 50%;
    top: calc(100% + 0.45rem);
    transform: translateX(-50%);
    max-width: 7.8rem;
    padding: 0.34rem 0.56rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: 999px;
    background: rgba(10, 16, 22, 0.74);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  .panorama-sphere-viewer__hotspot.is-active span,
  .panorama-sphere-viewer__hotspot:hover span {
    opacity: 1;
  }
}

@media (max-width: 430px) {
  .panorama-sphere-viewer__hotspot {
    min-width: 1.75rem;
    min-height: 1.75rem;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .panorama-sphere-viewer__hotspot::before {
    width: 0.46rem;
    height: 0.46rem;
    box-shadow: 0 0 0 0.24rem rgba(255, 255, 255, 0.12);
  }

  .panorama-sphere-viewer__hotspot span {
    max-width: 5.9rem;
    top: calc(100% + 0.38rem);
    padding: 0.28rem 0.5rem;
    font-size: 0.72rem;
  }
}
</style>
