<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gardenImmersiveScenes } from '../data/gardenImmersiveScenesDetailed';
import {
  buildDetailedGardenScene,
  isDetailedSuzhouScene,
  updateDetailedGardenAnimations,
} from '../lib/garden3d/sceneEngine';
import { currentLanguage, resolveLocalized } from '../i18n';

const props = defineProps({
  garden: {
    type: Object,
    required: true,
  },
});

const uiTextSource = {
  guideMode: { zh: '导览模式', en: 'Guide Mode' },
  exploreMode: { zh: '自由探索', en: 'Free Explore' },
  roamStart: { zh: '开启漫游模式', en: 'Start Roaming' },
  roamStop: { zh: '停止漫游模式', en: 'Stop Roaming' },
  resetView: { zh: '回到全景', en: 'Reset View' },
  routeTitle: { zh: '导览路径', en: 'Guide Route' },
  historyLabel: { zh: '历史介绍', en: 'History' },
  playLabel: { zh: '推荐玩法', en: 'Recommended Activity' },
  desktopHint: { zh: '鼠标拖拽旋转，滚轮缩放，点击园林构件查看信息。', en: 'Drag to rotate, wheel to zoom, and click elements for details.' },
  touchHint: { zh: '单指旋转视角，双指缩放或平移，轻触园林构件查看信息。', en: 'Use one finger to rotate and two fingers to zoom or pan. Tap elements for details.' },
  guideSummary: { zh: '按推荐顺序缓慢推进镜头，适合第一次游园。', en: 'Move through the garden in a curated order.' },
  exploreSummary: { zh: '自由切换视角和尺度，适合自己慢慢观察细节。', en: 'Move freely and inspect details at your own pace.' },
  roaming: { zh: '漫游模式进行中', en: 'Roaming in progress' },
  ready: { zh: '场景可交互', en: 'Scene Ready' },
  unavailable: { zh: '当前园林暂无沉浸式场景数据。', en: 'No immersive scene is available for this garden yet.' },
};

const uiText = computed(() => resolveLocalized(uiTextSource, currentLanguage.value));
const detailViewsLabel = computed(() => (
  currentLanguage.value === 'en' ? 'Detail Views' : '细部视点'
));
const sceneKey = computed(() => {
  const variant = props.garden?.design?.variant;
  if (variant === 'zhuozheng') return 'zhuozhengyuan';
  if (variant === 'wangshi') return 'wangshiyuan';
  if (variant === 'liu') return 'liuyuan';

  const slug = props.garden?.design?.slug || props.garden?.slug;
  if (slug) {
    return slug;
  }

  const englishName = props.garden?.englishName || '';
  if (englishName.includes('Humble Administrator')) return 'zhuozhengyuan';
  if (englishName.includes('Lingering Garden')) return 'liuyuan';
  if (englishName.includes('Master of Nets')) return 'wangshiyuan';

  return '';
});
const rawConfig = computed(() => gardenImmersiveScenes[sceneKey.value] || null);
const sceneConfig = computed(() => (rawConfig.value ? resolveLocalized(rawConfig.value, currentLanguage.value) : null));
const guideSteps = computed(() => sceneConfig.value?.guideSteps || []);
const sceneItems = computed(() => sceneConfig.value?.items || []);

const viewerMode = ref('guide');
const roamActive = ref(false);
const activeGuideIndex = ref(0);
const activeItemId = ref('');
const canvasHost = ref(null);
const isTouchLike = ref(false);
const renderState = ref('loading');

const activeItem = computed(
  () => sceneItems.value.find((item) => item.id === activeItemId.value) || sceneItems.value[0] || null,
);
const activeDetailShots = computed(() => activeItem.value?.detailShots || []);

const statusCopy = computed(() => (roamActive.value ? uiText.value.roaming : uiText.value.ready));
const hintCopy = computed(() => (isTouchLike.value ? uiText.value.touchHint : uiText.value.desktopHint));
const modeSummary = computed(() => (
  viewerMode.value === 'guide' ? uiText.value.guideSummary : uiText.value.exploreSummary
));

let renderer;
let scene;
let camera;
let controls;
let animationFrame = 0;
let resizeObserver;
let lastRoamStepAt = 0;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const interactiveMeshes = [];
const swayingTrees = [];
const animatedWaters = [];
const animatedHotspots = [];
const pointerState = {
  x: 0,
  y: 0,
  dragging: false,
};

let desiredCamera = null;
let desiredTarget = null;

const disposeMaterial = (material) => {
  if (Array.isArray(material)) {
    material.forEach((item) => disposeMaterial(item));
    return;
  }

  [
    'map',
    'alphaMap',
    'aoMap',
    'bumpMap',
    'displacementMap',
    'emissiveMap',
    'envMap',
    'lightMap',
    'metalnessMap',
    'normalMap',
    'roughnessMap',
    'clearcoatMap',
    'clearcoatNormalMap',
    'clearcoatRoughnessMap',
    'transmissionMap',
    'thicknessMap',
  ].forEach((key) => material?.[key]?.dispose?.());
  material?.dispose();
};

const disposeObject = (object) => {
  object.traverse((child) => {
    child.geometry?.dispose();
    disposeMaterial(child.material);
  });
};

const clearScene = () => {
  if (!scene) {
    return;
  }

  while (scene.children.length) {
    const child = scene.children[scene.children.length - 1];
    scene.remove(child);
    disposeObject(child);
  }

  interactiveMeshes.length = 0;
  swayingTrees.length = 0;
  animatedWaters.length = 0;
  animatedHotspots.length = 0;
};

const setCameraPose = (cameraPosition, targetPosition, instant = false) => {
  if (!camera || !controls) {
    return;
  }

  const nextCamera = new THREE.Vector3(...cameraPosition);
  const nextTarget = new THREE.Vector3(...targetPosition);

  if (instant) {
    camera.position.copy(nextCamera);
    controls.target.copy(nextTarget);
    desiredCamera = null;
    desiredTarget = null;
    controls.update();
    return;
  }

  desiredCamera = nextCamera;
  desiredTarget = nextTarget;
};

const setActiveItem = (itemId, options = {}) => {
  const item = sceneItems.value.find((entry) => entry.id === itemId);

  if (!item) {
    return;
  }

  activeItemId.value = itemId;

  const stepIndex = guideSteps.value.findIndex((entry) => entry.itemId === itemId);
  if (stepIndex >= 0) {
    activeGuideIndex.value = stepIndex;
  }

  if (options.focus !== false) {
    setCameraPose(item.camera, item.target);
  }

  if (options.userInitiated) {
    roamActive.value = false;
  }
};

const setGuideStep = (index, options = {}) => {
  const total = guideSteps.value.length;
  if (!total) {
    return;
  }

  const safeIndex = ((index % total) + total) % total;
  activeGuideIndex.value = safeIndex;
  setActiveItem(guideSteps.value[safeIndex].itemId, options);
};

const resetView = (instant = false) => {
  const current = sceneConfig.value;
  if (!current) {
    return;
  }

  setCameraPose(current.view.camera, current.view.target, instant);
};

const focusDetailShot = (shot) => {
  if (!shot) {
    return;
  }

  roamActive.value = false;
  setCameraPose(shot.camera, shot.target);
};

const buildTree = (position, palette, seed) => {
  const group = new THREE.Group();
  group.position.set(...position);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.26, 2.2, 10),
    new THREE.MeshStandardMaterial({ color: '#73573d', roughness: 0.92 }),
  );
  trunk.position.y = 1.1;

  const crownPivot = new THREE.Group();
  crownPivot.position.y = 2.35;
  crownPivot.rotation.z = seed * 0.04;

  const crownMaterial = new THREE.MeshStandardMaterial({
    color: palette.foliage,
    roughness: 0.95,
    metalness: 0.02,
  });

  const crownA = new THREE.Mesh(new THREE.SphereGeometry(1.05, 16, 16), crownMaterial);
  crownA.position.set(0, 0.1, 0);

  const crownB = new THREE.Mesh(new THREE.SphereGeometry(0.8, 14, 14), crownMaterial);
  crownB.position.set(0.7, 0.35, 0.1);

  const crownC = new THREE.Mesh(new THREE.SphereGeometry(0.72, 14, 14), crownMaterial);
  crownC.position.set(-0.75, 0.28, -0.2);

  crownPivot.add(crownA, crownB, crownC);
  group.add(trunk, crownPivot);
  swayingTrees.push({ pivot: crownPivot, seed });
  return group;
};

const markInteractive = (group, itemId) => {
  group.traverse((child) => {
    if (child.isMesh) {
      child.userData.itemId = itemId;
      interactiveMeshes.push(child);
    }
  });
};

const buildPond = (item, palette) => {
  const [width, depth] = item.size;
  const group = new THREE.Group();
  group.position.set(...item.position);

  const waterGeometry = new THREE.PlaneGeometry(width, depth, 34, 24);
  const basePositions = Float32Array.from(waterGeometry.attributes.position.array);
  const water = new THREE.Mesh(
    waterGeometry,
    new THREE.MeshStandardMaterial({
      color: palette.water,
      transparent: true,
      opacity: 0.9,
      roughness: 0.18,
      metalness: 0.08,
    }),
  );
  water.rotation.x = -Math.PI / 2;

  const rimMaterial = new THREE.MeshStandardMaterial({ color: '#cbbba1', roughness: 0.92 });
  const rimLong = new THREE.Mesh(new THREE.BoxGeometry(width + 0.45, 0.14, 0.22), rimMaterial);
  const rimShort = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, depth + 0.45), rimMaterial);

  rimLong.position.set(0, 0.07, depth / 2 + 0.08);
  const rimLongBack = rimLong.clone();
  rimLongBack.position.z *= -1;
  rimShort.position.set(width / 2 + 0.08, 0.07, 0);
  const rimShortLeft = rimShort.clone();
  rimShortLeft.position.x *= -1;

  group.add(water, rimLong, rimLongBack, rimShort, rimShortLeft);
  animatedWaters.push({ geometry: waterGeometry, basePositions, phase: item.position[0] * 0.35 });
  return group;
};

const buildPavilion = (item, palette, isHall = false) => {
  const [width, height, depth] = item.size;
  const group = new THREE.Group();
  group.position.set(...item.position);
  group.rotation.y = item.rotationY || 0;

  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.34, depth),
    new THREE.MeshStandardMaterial({ color: '#bfa68a', roughness: 0.92 }),
  );
  platform.position.y = 0.17;

  const postMaterial = new THREE.MeshStandardMaterial({ color: palette.wood, roughness: 0.85 });
  const roofMaterial = new THREE.MeshStandardMaterial({ color: palette.roof, roughness: 0.72 });
  const postOffsets = [
    [-width / 2 + 0.3, 1.2, -depth / 2 + 0.3],
    [width / 2 - 0.3, 1.2, -depth / 2 + 0.3],
    [-width / 2 + 0.3, 1.2, depth / 2 - 0.3],
    [width / 2 - 0.3, 1.2, depth / 2 - 0.3],
  ];

  postOffsets.forEach(([x, y, z]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 2.4, 8), postMaterial);
    post.position.set(x, y, z);
    group.add(post);
  });

  const roof = new THREE.Mesh(
    isHall
      ? new THREE.BoxGeometry(width + 0.8, 0.48, depth + 0.8)
      : new THREE.ConeGeometry(Math.max(width, depth) * 0.68, height * 0.8, 4),
    roofMaterial,
  );
  roof.position.y = isHall ? 2.9 : 3;
  roof.rotation.y = isHall ? 0 : Math.PI / 4;

  const core = new THREE.Mesh(
    new THREE.BoxGeometry(width - 0.7, 1.3, depth - 0.7),
    new THREE.MeshStandardMaterial({ color: '#e8dccb', roughness: 0.96 }),
  );
  core.position.y = 1.25;

  group.add(platform, core, roof);
  return group;
};

const buildCorridor = (item, palette) => {
  const [length, height, depth] = item.size;
  const group = new THREE.Group();
  group.position.set(...item.position);
  group.rotation.y = item.rotationY || 0;

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(length, 0.18, depth),
    new THREE.MeshStandardMaterial({ color: '#c4ad92', roughness: 0.95 }),
  );
  base.position.y = 0.09;

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(length + 0.55, 0.3, depth + 0.35),
    new THREE.MeshStandardMaterial({ color: palette.roof, roughness: 0.74 }),
  );
  roof.position.y = height + 1.2;

  group.add(base, roof);

  const postMaterial = new THREE.MeshStandardMaterial({ color: palette.wood, roughness: 0.86 });
  const postCount = Math.max(4, Math.round(length / 1.8));
  for (let index = 0; index <= postCount; index += 1) {
    const offset = -length / 2 + (length / postCount) * index;
    [-depth / 2 + 0.12, depth / 2 - 0.12].forEach((z) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, height + 0.9, 0.12), postMaterial);
      post.position.set(offset, (height + 0.9) / 2, z);
      group.add(post);
    });
  }

  return group;
};

const buildGate = (item, palette) => {
  const [width, height, depth] = item.size;
  const group = new THREE.Group();
  group.position.set(...item.position);
  group.rotation.y = item.rotationY || 0;

  const wallMaterial = new THREE.MeshStandardMaterial({ color: '#efe5d7', roughness: 0.98 });
  const sideWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, height + 0.35, depth),
    wallMaterial,
  );
  sideWall.position.set(-(width / 2 + 0.3), (height + 0.35) / 2, 0);
  const sideWallRight = sideWall.clone();
  sideWallRight.position.x *= -1;

  const topWall = new THREE.Mesh(
    new THREE.BoxGeometry(width + 1.25, 0.52, depth),
    wallMaterial,
  );
  topWall.position.set(0, height + 0.1, 0);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(width * 0.45, 0.12, 14, 40),
    new THREE.MeshStandardMaterial({ color: palette.stone, roughness: 0.88 }),
  );
  ring.position.set(0, height * 0.55, depth / 2 + 0.02);

  const lattice = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.95, height * 0.9, 0.04),
    new THREE.MeshStandardMaterial({ color: palette.wood, transparent: true, opacity: 0.1 }),
  );
  lattice.position.set(0, height * 0.56, depth / 2 + 0.05);

  group.add(sideWall, sideWallRight, topWall, ring, lattice);
  return group;
};

const buildRockery = (item, palette) => {
  const group = new THREE.Group();
  group.position.set(...item.position);
  group.rotation.y = item.rotationY || 0;

  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: palette.stone,
    roughness: 0.94,
    metalness: 0.02,
  });

  const chunks = [
    { position: [-0.9, 0.65, 0.2], scale: [1.2, 1.4, 1.1] },
    { position: [0.6, 1, -0.3], scale: [1.1, 1.8, 1] },
    { position: [1.25, 0.55, 0.65], scale: [0.85, 1.1, 0.9] },
    { position: [-1.35, 0.45, -0.8], scale: [0.8, 1.1, 0.9] },
    { position: [0, 1.45, 0.2], scale: [0.7, 1, 0.75] },
  ];

  chunks.forEach((chunk, index) => {
    const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 0), stoneMaterial);
    mesh.position.set(...chunk.position);
    mesh.scale.set(...chunk.scale);
    mesh.rotation.set(index * 0.16, index * 0.34, index * 0.22);
    group.add(mesh);
  });

  return group;
};

const buildGardenScene = () => {
  const current = sceneConfig.value;
  if (!scene || !current || !renderer) {
    return;
  }

  clearScene();

  if (isDetailedSuzhouScene(current)) {
    buildDetailedGardenScene({
      scene,
      renderer,
      config: current,
      sceneItems: sceneItems.value,
      interactiveMeshes,
      swayingTrees,
      animatedWaters,
      animatedHotspots,
    });

    controls.minDistance = current.view.minDistance;
    controls.maxDistance = current.view.maxDistance;
    resetView(true);
    return;
  }

  scene.background = new THREE.Color('#edf0e8');
  scene.fog = new THREE.Fog(current.palette.ground, 22, 44);
  renderer.setClearColor(current.palette.ground, 1);

  const ambientLight = new THREE.HemisphereLight(0xf7f4ec, 0x8ba291, 1.15);
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.25);
  keyLight.position.set(12, 18, 8);
  const fillLight = new THREE.DirectionalLight(0xd7e5d9, 0.45);
  fillLight.position.set(-10, 8, -6);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(16, 72),
    new THREE.MeshStandardMaterial({ color: current.palette.ground, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(13.8, 15.9, 72),
    new THREE.MeshStandardMaterial({
      color: '#d9ccb6',
      roughness: 0.98,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.01;

  scene.add(ambientLight, keyLight, fillLight, ground, ring);

  sceneItems.value.forEach((item) => {
    let group;

    if (item.type === 'pond') {
      group = buildPond(item, current.palette);
    } else if (item.type === 'pavilion') {
      group = buildPavilion(item, current.palette, false);
    } else if (item.type === 'hall') {
      group = buildPavilion(item, current.palette, true);
    } else if (item.type === 'corridor') {
      group = buildCorridor(item, current.palette);
    } else if (item.type === 'gate') {
      group = buildGate(item, current.palette);
    } else {
      group = buildRockery(item, current.palette);
    }

    markInteractive(group, item.id);
    scene.add(group);
  });

  (current.trees || []).forEach((position, index) => {
    scene.add(buildTree(position, current.palette, index + 1));
  });

  controls.minDistance = current.view.minDistance;
  controls.maxDistance = current.view.maxDistance;
  resetView(true);
};

const resizeRenderer = () => {
  if (!canvasHost.value || !renderer || !camera) {
    return;
  }

  const width = canvasHost.value.clientWidth || 1;
  const height = canvasHost.value.clientHeight || 1;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

const pickItem = (event) => {
  if (!renderer || !camera) {
    return;
  }

  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const hit = raycaster.intersectObjects(interactiveMeshes, false).find((entry) => entry.object.userData.itemId);
  if (hit?.object?.userData?.itemId) {
    setActiveItem(hit.object.userData.itemId, { userInitiated: true });
  }
};

const handlePointerDown = (event) => {
  pointerState.x = event.clientX;
  pointerState.y = event.clientY;
  pointerState.dragging = false;
};

const handlePointerMove = (event) => {
  const deltaX = event.clientX - pointerState.x;
  const deltaY = event.clientY - pointerState.y;

  if (Math.hypot(deltaX, deltaY) > 6) {
    pointerState.dragging = true;
  }

  if (!renderer || pointerState.dragging) {
    return;
  }

  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hovering = raycaster.intersectObjects(interactiveMeshes, false).some((entry) => entry.object.userData.itemId);
  renderer.domElement.style.cursor = hovering ? 'pointer' : '';
};

const handlePointerUp = (event) => {
  if (!pointerState.dragging) {
    pickItem(event);
  }
};

const animate = () => {
  animationFrame = window.requestAnimationFrame(animate);

  const elapsed = performance.now() * 0.001;

  animatedWaters.forEach((entry) => {
    if (!isDetailedSuzhouScene(sceneConfig.value)) {
      const positions = entry.geometry.attributes.position.array;
      for (let index = 0; index < positions.length; index += 3) {
        const baseX = entry.basePositions[index];
        const baseY = entry.basePositions[index + 1];
        const baseZ = entry.basePositions[index + 2];
        positions[index + 1] = baseY + Math.sin(elapsed * 1.8 + baseX * 1.2 + baseZ * 1.4 + entry.phase) * 0.08;
      }
      entry.geometry.attributes.position.needsUpdate = true;
      entry.geometry.computeVertexNormals();
    }
  });

  if (isDetailedSuzhouScene(sceneConfig.value)) {
    updateDetailedGardenAnimations({
      elapsed,
      camera,
      activeItemId: activeItemId.value,
      swayingTrees,
      animatedWaters,
      animatedHotspots,
    });
  } else {
    swayingTrees.forEach((entry, index) => {
      entry.pivot.rotation.z = Math.sin(elapsed * 0.85 + index + entry.seed) * 0.05;
      entry.pivot.rotation.x = Math.cos(elapsed * 0.55 + entry.seed) * 0.02;
    });
  }

  if (camera && controls && desiredCamera && desiredTarget) {
    camera.position.lerp(desiredCamera, 0.08);
    controls.target.lerp(desiredTarget, 0.1);

    if (camera.position.distanceTo(desiredCamera) < 0.05 && controls.target.distanceTo(desiredTarget) < 0.05) {
      camera.position.copy(desiredCamera);
      controls.target.copy(desiredTarget);
      desiredCamera = null;
      desiredTarget = null;
    }
  }

  if (controls) {
    controls.autoRotate = roamActive.value && viewerMode.value === 'explore';
    controls.autoRotateSpeed = 0.45;
    controls.update();
  }

  if (
    roamActive.value
    && viewerMode.value === 'guide'
    && guideSteps.value.length > 1
    && !desiredCamera
    && performance.now() - lastRoamStepAt > 6200
  ) {
    setGuideStep(activeGuideIndex.value + 1, { userInitiated: false });
    lastRoamStepAt = performance.now();
  }

  renderer?.render(scene, camera);

  if (renderer && renderState.value !== 'ready') {
    renderState.value = 'ready';
  }
};

const initThree = () => {
  if (!canvasHost.value) {
    return;
  }

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
  } catch (error) {
    renderState.value = 'fallback';
    return;
  }

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 140);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.screenSpacePanning = true;
  controls.minPolarAngle = 0.75;
  controls.maxPolarAngle = 1.46;
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
  controls.addEventListener('start', () => {
    roamActive.value = false;
  });

  renderer.domElement.addEventListener('pointerdown', handlePointerDown);
  renderer.domElement.addEventListener('pointermove', handlePointerMove);
  renderer.domElement.addEventListener('pointerup', handlePointerUp);
  renderer.domElement.addEventListener('pointercancel', () => {
    pointerState.dragging = false;
  });

  canvasHost.value.appendChild(renderer.domElement);
  resizeRenderer();
  animate();

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => resizeRenderer());
    resizeObserver.observe(canvasHost.value);
  }
};

const destroyThree = () => {
  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  if (renderer?.domElement) {
    renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
    renderer.domElement.removeEventListener('pointermove', handlePointerMove);
    renderer.domElement.removeEventListener('pointerup', handlePointerUp);
    renderer.domElement.remove();
  }

  resizeObserver?.disconnect();
  clearScene();
  controls?.dispose();
  renderer?.dispose();

  renderer = null;
  scene = null;
  camera = null;
  controls = null;
  resizeObserver = null;
  renderState.value = 'loading';
};

const toggleRoam = () => {
  roamActive.value = !roamActive.value;
  lastRoamStepAt = performance.now();

  if (roamActive.value && viewerMode.value === 'guide') {
    setGuideStep(activeGuideIndex.value, { userInitiated: false });
  }
};

const setViewerMode = (mode) => {
  viewerMode.value = mode;
  roamActive.value = false;

  if (mode === 'guide' && guideSteps.value.length) {
    setGuideStep(activeGuideIndex.value, { userInitiated: false });
  }
};

watch(sceneKey, () => {
  if (!sceneConfig.value) {
    return;
  }

  renderState.value = 'loading';
  activeGuideIndex.value = 0;
  activeItemId.value = guideSteps.value[0]?.itemId || sceneItems.value[0]?.id || '';

  if (scene) {
    buildGardenScene();
    if (activeItemId.value) {
      setActiveItem(activeItemId.value, { userInitiated: false });
    }
  }
}, { immediate: true });

onMounted(() => {
  isTouchLike.value = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  initThree();

  if (sceneConfig.value) {
    buildGardenScene();
    if (activeItemId.value) {
      setActiveItem(activeItemId.value, { userInitiated: false });
    }
  }
});

onBeforeUnmount(() => {
  destroyThree();
});
</script>

<template>
  <section v-if="sceneConfig" class="detail-panel immersive-viewer">
    <div class="immersive-viewer__header">
      <div>
        <p class="eyebrow">{{ sceneConfig.eyebrow }}</p>
        <h2>{{ sceneConfig.title }}</h2>
        <p>{{ sceneConfig.intro }}</p>
      </div>

      <div class="immersive-viewer__actions">
        <div class="immersive-viewer__modes">
          <button
            type="button"
            :class="['immersive-pill', { 'is-active': viewerMode === 'guide' }]"
            @click="setViewerMode('guide')"
          >
            {{ uiText.guideMode }}
          </button>
          <button
            type="button"
            :class="['immersive-pill', { 'is-active': viewerMode === 'explore' }]"
            @click="setViewerMode('explore')"
          >
            {{ uiText.exploreMode }}
          </button>
        </div>

        <button type="button" class="immersive-button" @click="toggleRoam">
          {{ roamActive ? uiText.roamStop : uiText.roamStart }}
        </button>
        <button type="button" class="immersive-button immersive-button--ghost" @click="resetView()">
          {{ uiText.resetView }}
        </button>
      </div>
    </div>

    <div class="immersive-viewer__stage">
      <div ref="canvasHost" class="immersive-canvas" />
      <div v-if="renderState === 'fallback'" class="immersive-stage-fallback">
        <strong>当前设备未成功开启 3D 渲染</strong>
        <span>你仍然可以使用下方导览路径和信息卡查看这座园林的空间重点。</span>
      </div>

      <div class="immersive-hud">
        <span class="immersive-hud__status">{{ statusCopy }}</span>
        <p>{{ modeSummary }}</p>
        <span>{{ hintCopy }}</span>
      </div>
    </div>

    <div class="immersive-viewer__content">
      <article class="immersive-info-card">
        <p class="eyebrow">{{ activeItem?.label }}</p>
        <h3>{{ activeItem?.title }}</h3>

        <div class="immersive-info-card__block">
          <span>{{ uiText.historyLabel }}</span>
          <p>{{ activeItem?.history }}</p>
        </div>

        <div class="immersive-info-card__block">
          <span>{{ uiText.playLabel }}</span>
          <p>{{ activeItem?.play }}</p>
        </div>

        <div v-if="activeDetailShots.length" class="immersive-info-card__block">
          <span>{{ detailViewsLabel }}</span>

          <div class="immersive-detail-grid">
            <button
              v-for="shot in activeDetailShots"
              :key="shot.label"
              type="button"
              class="immersive-detail-chip"
              @click="focusDetailShot(shot)"
            >
              {{ shot.label }}
            </button>
          </div>
        </div>
      </article>

      <div class="immersive-route">
        <p class="eyebrow">{{ uiText.routeTitle }}</p>

        <div class="immersive-route__list">
          <button
            v-for="(entry, index) in guideSteps"
            :key="entry.itemId"
            type="button"
            :class="['immersive-route__item', { 'is-active': index === activeGuideIndex }]"
            @click="setGuideStep(index, { userInitiated: true })"
          >
            <strong>{{ entry.title }}</strong>
            <span>{{ entry.summary }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>

  <section v-else class="detail-panel immersive-viewer immersive-viewer--empty">
    <p>{{ uiText.unavailable }}</p>
  </section>
</template>

<style scoped>
.immersive-viewer {
  gap: 24px;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(var(--garden-accent-rgb), 0.14), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(249, 246, 240, 0.9));
}

.immersive-viewer__header,
.immersive-viewer__content {
  display: grid;
  gap: 18px;
}

.immersive-viewer__header {
  grid-template-columns: minmax(0, 1.35fr) auto;
  align-items: start;
}

.immersive-viewer__header h2,
.immersive-info-card h3 {
  margin: 0;
  font-family: var(--font-serif);
  line-height: 1.3;
}

.immersive-viewer__header p:last-child,
.immersive-info-card__block p,
.immersive-route__item span,
.immersive-hud p,
.immersive-hud span:last-child,
.immersive-viewer--empty p {
  margin: 0;
  color: var(--garden-muted);
  line-height: 1.82;
}

.immersive-viewer__actions,
.immersive-viewer__modes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.immersive-pill,
.immersive-button,
.immersive-route__item {
  border: 1px solid rgba(var(--garden-accent-rgb), 0.15);
  background: rgba(255, 255, 255, 0.78);
  color: var(--garden-accent);
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    border-color 0.28s ease,
    background-color 0.28s ease;
}

.immersive-pill,
.immersive-button {
  padding: 0.78rem 1rem;
  border-radius: 999px;
}

.immersive-button {
  cursor: pointer;
}

.immersive-button--ghost {
  background: rgba(255, 255, 255, 0.5);
}

.immersive-pill.is-active,
.immersive-button:hover,
.immersive-route__item.is-active,
.immersive-route__item:hover {
  transform: translateY(-1px);
  border-color: rgba(var(--garden-accent-rgb), 0.34);
  background: rgba(var(--garden-accent-rgb), 0.12);
  box-shadow: 0 14px 24px rgba(var(--garden-accent-rgb), 0.12);
}

.immersive-viewer__stage {
  position: relative;
  min-height: 620px;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(var(--garden-accent-rgb), 0.14);
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.4), transparent 32%),
    linear-gradient(180deg, rgba(220, 232, 224, 0.72), rgba(243, 237, 225, 0.95));
}

.immersive-canvas {
  width: 100%;
  height: 100%;
  min-height: 620px;
  touch-action: none;
}

.immersive-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.immersive-stage-fallback {
  position: absolute;
  inset: 18px;
  display: grid;
  place-content: center;
  gap: 10px;
  padding: 24px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.62), transparent 38%),
    linear-gradient(180deg, rgba(240, 235, 224, 0.74), rgba(228, 239, 233, 0.82));
  color: var(--garden-accent);
  text-align: center;
}

.immersive-stage-fallback span {
  color: var(--garden-muted);
  line-height: 1.72;
}

.immersive-hud {
  position: absolute;
  left: 24px;
  bottom: 24px;
  display: grid;
  gap: 8px;
  max-width: min(360px, calc(100% - 48px));
  padding: 16px 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.64);
  backdrop-filter: blur(12px);
}

.immersive-hud__status,
.immersive-info-card__block span,
.immersive-route__item strong {
  color: var(--garden-accent);
}

.immersive-viewer__content {
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.92fr);
  align-items: start;
}

.immersive-info-card,
.immersive-route {
  display: grid;
  gap: 14px;
  padding: 22px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(var(--garden-accent-rgb), 0.12);
}

.immersive-info-card__block,
.immersive-route__list {
  display: grid;
  gap: 12px;
}

.immersive-detail-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.immersive-detail-chip {
  padding: 0.62rem 0.92rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--garden-accent-rgb), 0.16);
  background: rgba(255, 255, 255, 0.82);
  color: var(--garden-accent);
  cursor: pointer;
  transition:
    transform 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease,
    background-color 0.24s ease;
}

.immersive-detail-chip:hover {
  transform: translateY(-1px);
  border-color: rgba(var(--garden-accent-rgb), 0.28);
  background: rgba(var(--garden-accent-rgb), 0.12);
  box-shadow: 0 10px 20px rgba(var(--garden-accent-rgb), 0.12);
}

.immersive-route__item {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 18px;
  text-align: left;
  cursor: pointer;
}

.immersive-viewer--empty {
  min-height: auto;
}

@media (max-width: 980px) {
  .immersive-viewer__header,
  .immersive-viewer__content {
    grid-template-columns: 1fr;
  }

  .immersive-viewer__actions {
    justify-content: flex-start;
  }
}

@media (max-width: 720px) {
  .immersive-viewer__stage,
  .immersive-canvas {
    min-height: 500px;
  }

  .immersive-hud {
    left: 16px;
    right: 16px;
    bottom: 16px;
    max-width: none;
  }
}
</style>
