import * as THREE from 'three';

const paintNoise = (ctx, width, height, {
  lines = 120,
  dots = 900,
  dotColor = 'rgba(0, 0, 0, 0.05)',
  lineColor = 'rgba(0, 0, 0, 0.06)',
  lineWidth = [0.5, 1.4],
} = {}) => {
  for (let index = 0; index < dots; index += 1) {
    ctx.fillStyle = dotColor;
    ctx.fillRect(
      Math.random() * width,
      Math.random() * height,
      1 + Math.random() * 2,
      1 + Math.random() * 2,
    );
  }

  for (let index = 0; index < lines; index += 1) {
    const startX = Math.random() * width;
    const startY = Math.random() * height;
    const endX = startX + (Math.random() - 0.5) * width * 0.18;
    const endY = startY + (Math.random() - 0.5) * height * 0.18;

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth[0] + Math.random() * (lineWidth[1] - lineWidth[0]);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
};

const createCanvasTexture = (size, repeat, painter, anisotropy = 1) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  painter(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.anisotropy = anisotropy;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

const createPlasterTexture = (anisotropy) => createCanvasTexture(512, [4, 4], (ctx, size) => {
  ctx.fillStyle = '#f1eee6';
  ctx.fillRect(0, 0, size, size);
  paintNoise(ctx, size, size, {
    lines: 70,
    dots: 1600,
    dotColor: 'rgba(112, 103, 92, 0.04)',
    lineColor: 'rgba(90, 86, 78, 0.05)',
    lineWidth: [0.4, 1.1],
  });

  ctx.strokeStyle = 'rgba(113, 102, 86, 0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(size * 0.16, size * 0.26);
  ctx.bezierCurveTo(size * 0.34, size * 0.3, size * 0.42, size * 0.12, size * 0.62, size * 0.16);
  ctx.stroke();
}, anisotropy);

const createRoofTexture = (anisotropy) => createCanvasTexture(512, [6, 4], (ctx, size) => {
  ctx.fillStyle = '#3f4445';
  ctx.fillRect(0, 0, size, size);

  const rows = 18;
  const tileHeight = size / rows;

  for (let row = 0; row < rows; row += 1) {
    const offset = row % 2 === 0 ? 0 : tileHeight * 0.5;

    for (let x = -tileHeight; x < size + tileHeight; x += tileHeight) {
      const startX = x + offset;
      const y = row * tileHeight;

      ctx.fillStyle = row % 2 === 0 ? '#4d5152' : '#383d3e';
      ctx.beginPath();
      ctx.moveTo(startX, y + tileHeight * 0.9);
      ctx.quadraticCurveTo(startX + tileHeight * 0.5, y, startX + tileHeight, y + tileHeight * 0.9);
      ctx.lineTo(startX + tileHeight, y + tileHeight * 1.1);
      ctx.quadraticCurveTo(startX + tileHeight * 0.5, y + tileHeight * 0.28, startX, y + tileHeight * 1.1);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startX + tileHeight * 0.18, y + tileHeight * 0.86);
      ctx.quadraticCurveTo(startX + tileHeight * 0.5, y + tileHeight * 0.24, startX + tileHeight * 0.82, y + tileHeight * 0.86);
      ctx.stroke();
    }
  }

  paintNoise(ctx, size, size, {
    lines: 20,
    dots: 850,
    dotColor: 'rgba(255, 255, 255, 0.03)',
    lineColor: 'rgba(255, 255, 255, 0.025)',
    lineWidth: [0.5, 1],
  });
}, anisotropy);

const createWoodTexture = (anisotropy) => createCanvasTexture(512, [3, 2], (ctx, size) => {
  const gradient = ctx.createLinearGradient(0, 0, size, size * 0.1);
  gradient.addColorStop(0, '#8a5f44');
  gradient.addColorStop(0.5, '#7b553e');
  gradient.addColorStop(1, '#6f4d38');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  for (let index = 0; index < 90; index += 1) {
    const y = (index / 90) * size;
    ctx.strokeStyle = `rgba(56, 31, 17, ${0.05 + Math.random() * 0.09})`;
    ctx.lineWidth = 1 + Math.random() * 2.4;
    ctx.beginPath();
    ctx.moveTo(0, y + Math.random() * 8);
    ctx.bezierCurveTo(size * 0.28, y - 4, size * 0.64, y + 12, size, y + Math.random() * 10);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(240, 215, 172, 0.05)';
  ctx.fillRect(size * 0.12, 0, size * 0.04, size);
}, anisotropy);

const createStoneTexture = (anisotropy) => createCanvasTexture(512, [4, 4], (ctx, size) => {
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#a9a39a');
  gradient.addColorStop(0.5, '#8d877e');
  gradient.addColorStop(1, '#b8b0a4');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  for (let index = 0; index < 1800; index += 1) {
    const alpha = 0.04 + Math.random() * 0.09;
    const tone = Math.random() > 0.5 ? 36 : 220;
    ctx.fillStyle = `rgba(${tone}, ${tone}, ${tone}, ${alpha})`;
    const radius = 1 + Math.random() * 5;
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  paintNoise(ctx, size, size, {
    lines: 110,
    dots: 240,
    dotColor: 'rgba(255, 255, 255, 0.03)',
    lineColor: 'rgba(47, 43, 38, 0.12)',
    lineWidth: [0.6, 1.8],
  });
}, anisotropy);

const createPathTexture = (anisotropy) => createCanvasTexture(512, [5, 5], (ctx, size) => {
  ctx.fillStyle = '#b9ab90';
  ctx.fillRect(0, 0, size, size);

  for (let index = 0; index < 8; index += 1) {
    ctx.strokeStyle = 'rgba(140, 126, 108, 0.45)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo((size / 8) * index, 0);
    ctx.lineTo((size / 8) * index, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, (size / 8) * index);
    ctx.lineTo(size, (size / 8) * index);
    ctx.stroke();
  }

  paintNoise(ctx, size, size, {
    lines: 60,
    dots: 1200,
    dotColor: 'rgba(72, 62, 52, 0.05)',
    lineColor: 'rgba(52, 46, 40, 0.06)',
  });
}, anisotropy);

const createGroundTexture = (anisotropy) => createCanvasTexture(512, [8, 8], (ctx, size) => {
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#8b8d73');
  gradient.addColorStop(0.55, '#6d745d');
  gradient.addColorStop(1, '#989378');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  for (let index = 0; index < 2600; index += 1) {
    const alpha = 0.03 + Math.random() * 0.07;
    ctx.fillStyle = Math.random() > 0.45
      ? `rgba(44, 73, 36, ${alpha})`
      : `rgba(113, 86, 53, ${alpha})`;
    const radius = 1 + Math.random() * 4;
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  paintNoise(ctx, size, size, {
    lines: 40,
    dots: 240,
    dotColor: 'rgba(255, 255, 255, 0.025)',
    lineColor: 'rgba(32, 28, 24, 0.08)',
  });
}, anisotropy);

const createHotspotTexture = (color) => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const center = 64;

  const glow = ctx.createRadialGradient(center, center, 6, center, center, 56);
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  glow.addColorStop(0.22, color);
  glow.addColorStop(0.5, 'rgba(255, 255, 255, 0.18)');
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(center, center, 56, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(center, center, 28, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.arc(center, center, 10, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

export const createMaterialLibrary = (renderer, palette = {}) => {
  const anisotropy = Math.min(renderer?.capabilities?.getMaxAnisotropy?.() || 1, 8);

  const plasterMap = createPlasterTexture(anisotropy);
  const roofMap = createRoofTexture(anisotropy);
  const woodMap = createWoodTexture(anisotropy);
  const stoneMap = createStoneTexture(anisotropy);
  const pathMap = createPathTexture(anisotropy);
  const groundMap = createGroundTexture(anisotropy);
  const hotspotMap = createHotspotTexture(palette.accent || '#7f927f');

  return {
    plaster: new THREE.MeshStandardMaterial({
      color: palette.plaster || '#f1eee6',
      map: plasterMap,
      bumpMap: plasterMap,
      bumpScale: 0.08,
      roughness: 0.98,
    }),
    roof: new THREE.MeshStandardMaterial({
      color: palette.roof || '#404646',
      map: roofMap,
      bumpMap: roofMap,
      bumpScale: 0.18,
      roughness: 0.86,
      metalness: 0.05,
    }),
    roofTrim: new THREE.MeshStandardMaterial({
      color: '#2d3132',
      roughness: 0.82,
      metalness: 0.12,
    }),
    wood: new THREE.MeshStandardMaterial({
      color: palette.wood || '#7a553d',
      map: woodMap,
      bumpMap: woodMap,
      bumpScale: 0.06,
      roughness: 0.82,
    }),
    stone: new THREE.MeshStandardMaterial({
      color: palette.stone || '#a29c91',
      map: stoneMap,
      bumpMap: stoneMap,
      bumpScale: 0.1,
      roughness: 0.95,
    }),
    path: new THREE.MeshStandardMaterial({
      color: palette.path || '#c3b095',
      map: pathMap,
      bumpMap: pathMap,
      bumpScale: 0.05,
      roughness: 0.96,
    }),
    ground: new THREE.MeshStandardMaterial({
      color: palette.ground || '#8a876f',
      map: groundMap,
      bumpMap: groundMap,
      bumpScale: 0.06,
      roughness: 1,
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: palette.foliage || '#6c7e62',
      roughness: 0.96,
    }),
    foliageDark: new THREE.MeshStandardMaterial({
      color: palette.foliageDeep || '#54684f',
      roughness: 0.95,
    }),
    water: new THREE.MeshPhysicalMaterial({
      color: palette.water || '#6f9293',
      transparent: true,
      opacity: 0.92,
      roughness: 0.18,
      metalness: 0.04,
      transmission: 0.04,
      clearcoat: 0.9,
      clearcoatRoughness: 0.18,
      ior: 1.33,
      reflectivity: 0.72,
      side: THREE.DoubleSide,
    }),
    waterBed: new THREE.MeshStandardMaterial({
      color: palette.waterDeep || '#4e5f5d',
      roughness: 0.96,
      metalness: 0.02,
    }),
    accent: new THREE.MeshStandardMaterial({
      color: palette.accent || '#7d957f',
      roughness: 0.74,
      metalness: 0.06,
    }),
    hotspot: new THREE.SpriteMaterial({
      map: hotspotMap,
      color: '#ffffff',
      transparent: true,
      depthWrite: false,
      depthTest: true,
      opacity: 0.95,
    }),
  };
};
