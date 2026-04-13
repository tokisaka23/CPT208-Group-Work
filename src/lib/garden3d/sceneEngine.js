import * as THREE from 'three';
import { createMaterialLibrary } from './proceduralTextures.js';

const tau = Math.PI * 2;
const tempVec = new THREE.Vector3();

const setShadows = (object, { cast = true, receive = true } = {}) => {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = cast;
      child.receiveShadow = receive;
    }
  });
};

const markInteractive = (object, itemId, interactiveMeshes) => {
  object.traverse((child) => {
    if (child.isMesh || child.isSprite) {
      child.userData.itemId = itemId;
      interactiveMeshes.push(child);
    }
  });
};

const createSplineShape = (points) => {
  const vectors = points.map(([x, z]) => new THREE.Vector2(x, z));
  const curve = new THREE.SplineCurve([...vectors, vectors[0]]);
  return new THREE.Shape(curve.getPoints(Math.max(48, points.length * 18)));
};

const createFilledShape = (points, material, y = 0.04) => {
  const geometry = new THREE.ShapeGeometry(createSplineShape(points), 64);
  geometry.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = y;
  mesh.receiveShadow = true;
  return mesh;
};

const createLinearShape = (points, width) => {
  const shape = new THREE.Shape();
  const left = [];
  const right = [];

  for (let index = 0; index < points.length; index += 1) {
    const current = new THREE.Vector2(points[index][0], points[index][1]);
    const nextIndex = Math.min(points.length - 1, index + 1);
    const prevIndex = Math.max(0, index - 1);
    const prev = new THREE.Vector2(points[prevIndex][0], points[prevIndex][1]);
    const next = new THREE.Vector2(points[nextIndex][0], points[nextIndex][1]);
    const tangent = next.clone().sub(prev).normalize();
    const normal = new THREE.Vector2(-tangent.y, tangent.x).multiplyScalar(width / 2);

    left.push(current.clone().add(normal));
    right.push(current.clone().sub(normal));
  }

  shape.moveTo(left[0].x, left[0].y);
  left.slice(1).forEach((point) => shape.lineTo(point.x, point.y));
  right.reverse().forEach((point) => shape.lineTo(point.x, point.y));
  shape.closePath();
  return shape;
};

const createPathRibbon = (points, width, material, y = 0.05) => {
  const geometry = new THREE.ShapeGeometry(createLinearShape(points, width), 32);
  geometry.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = y;
  mesh.receiveShadow = true;
  return mesh;
};

const createLatticePanel = (width, height, materials) => {
  const group = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.08), materials.wood);
  group.add(frame);

  const verticalCount = Math.max(3, Math.round(width / 0.45));
  for (let index = 1; index < verticalCount; index += 1) {
    const x = -width / 2 + (width / verticalCount) * index;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.05, height * 0.9, 0.1), materials.wood);
    bar.position.set(x, 0, 0.02);
    group.add(bar);
  }

  const horizontalCount = Math.max(2, Math.round(height / 0.38));
  for (let index = 1; index < horizontalCount; index += 1) {
    const y = -height / 2 + (height / horizontalCount) * index;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(width * 0.92, 0.05, 0.1), materials.wood);
    bar.position.set(0, y, 0.02);
    group.add(bar);
  }

  return group;
};

const createRoof = (width, depth, rise, materials, eave = 0.78) => {
  const group = new THREE.Group();
  const slopeDepth = depth / 2 + eave;
  const slopeLength = Math.sqrt(slopeDepth ** 2 + rise ** 2);
  const slopeAngle = Math.atan2(rise, slopeDepth);

  const roofHalf = new THREE.Mesh(
    new THREE.BoxGeometry(width + eave * 2, 0.18, slopeLength),
    materials.roof,
  );
  roofHalf.position.set(0, rise * 0.5, depth * 0.25);
  roofHalf.rotation.x = -slopeAngle;

  const roofHalfBack = roofHalf.clone();
  roofHalfBack.position.z *= -1;
  roofHalfBack.rotation.x *= -1;

  const ridge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, width + eave * 1.9, 12),
    materials.roofTrim,
  );
  ridge.rotation.z = Math.PI / 2;
  ridge.position.y = rise + 0.08;

  const eaveFront = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, width + eave * 2, 10),
    materials.roofTrim,
  );
  eaveFront.rotation.z = Math.PI / 2;
  eaveFront.position.set(0, 0.16, depth / 2 + eave * 0.56);
  const eaveBack = eaveFront.clone();
  eaveBack.position.z *= -1;

  group.add(roofHalf, roofHalfBack, ridge, eaveFront, eaveBack);
  return group;
};

const createStepRun = (width, stepDepth, stepHeight, count, material) => {
  const group = new THREE.Group();
  for (let index = 0; index < count; index += 1) {
    const depth = stepDepth * (count - index);
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(width, stepHeight, depth),
      material,
    );
    step.position.set(0, stepHeight * (index + 0.5), depth * 0.5 - (count * stepDepth) / 2);
    group.add(step);
  }
  return group;
};

const createDoorLeaf = (width, height, materials) => {
  const group = new THREE.Group();
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, 0.08),
    materials.wood,
  );
  group.add(panel);

  const inset = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.72, height * 0.72, 0.04),
    materials.plaster,
  );
  inset.position.z = 0.03;
  group.add(inset);

  const midRail = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.76, 0.08, 0.1),
    materials.wood,
  );
  group.add(midRail);

  const vertical = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, height * 0.8, 0.1),
    materials.wood,
  );
  vertical.position.z = 0.01;
  group.add(vertical);

  return group;
};

const createRafterBand = (width, depth, materials, spacing = 0.34) => {
  const group = new THREE.Group();
  const count = Math.max(4, Math.round(width / spacing));
  for (let index = 0; index <= count; index += 1) {
    const x = -width / 2 + (width / count) * index;
    const slat = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.12, depth),
      materials.wood,
    );
    slat.position.x = x;
    group.add(slat);
  }
  return group;
};

const createDeckBoards = (width, depth, materials, boardDepth = 0.18, y = 0) => {
  const group = new THREE.Group();
  const count = Math.max(4, Math.floor((depth - 0.3) / boardDepth));
  for (let index = 0; index < count; index += 1) {
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(width - 0.28, 0.04, boardDepth * 0.78),
      materials.wood,
    );
    board.position.set(0, y, -depth / 2 + 0.2 + index * boardDepth);
    group.add(board);
  }
  return group;
};

const createScholarTableSet = (materials) => {
  const group = new THREE.Group();

  const tableTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.08, 0.74),
    materials.wood,
  );
  tableTop.position.y = 0.78;
  group.add(tableTop);

  [
    [-0.44, 0.37, -0.26],
    [0.44, 0.37, -0.26],
    [-0.44, 0.37, 0.26],
    [0.44, 0.37, 0.26],
  ].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.08), materials.wood);
    leg.position.set(x, y, z);
    group.add(leg);
  });

  [
    [-0.9, 0.26, 0],
    [0.9, 0.26, 0],
  ].forEach(([x, y, z]) => {
    const stoolTop = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.42), materials.wood);
    stoolTop.position.set(x, y + 0.26, z);
    group.add(stoolTop);

    [
      [-0.14, 0, -0.14],
      [0.14, 0, -0.14],
      [-0.14, 0, 0.14],
      [0.14, 0, 0.14],
    ].forEach(([sx, , sz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.48, 0.05), materials.wood);
      leg.position.set(x + sx, y, z + sz);
      group.add(leg);
    });
  });

  return group;
};

const createBoundaryWall = (wall, materials) => {
  const group = new THREE.Group();
  group.position.set(...wall.position);
  group.rotation.y = wall.rotationY || 0;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(wall.size[0], wall.size[1], wall.size[2]),
    materials.plaster,
  );
  body.position.y = wall.size[1] / 2;

  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(wall.size[0] + 0.24, 0.18, wall.size[2] + 0.48),
    materials.roof,
  );
  cap.position.y = wall.size[1] + 0.08;

  group.add(body, cap);
  setShadows(group);
  return group;
};

const createShrub = (position, scale, materials) => {
  const group = new THREE.Group();
  group.position.set(...position);

  const shrub = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.7 * scale, 1),
    materials.foliage,
  );
  shrub.scale.set(1.2, 0.9, 1);
  shrub.position.y = 0.7 * scale;

  const shrubDark = shrub.clone();
  shrubDark.material = materials.foliageDark;
  shrubDark.scale.multiplyScalar(0.78);
  shrubDark.position.set(0.25 * scale, 0.84 * scale, -0.18 * scale);

  group.add(shrub, shrubDark);
  setShadows(group);
  return group;
};

const createBambooCluster = (spec, materials, swayingTrees) => {
  const group = new THREE.Group();
  group.position.set(...spec.position);

  const stalkCount = spec.count || 6;
  for (let index = 0; index < stalkCount; index += 1) {
    const stemPivot = new THREE.Group();
    stemPivot.position.set((Math.random() - 0.5) * 0.8, 0, (Math.random() - 0.5) * 0.8);

    const height = 3.5 + Math.random() * 2.2;
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.07, height, 8),
      materials.accent,
    );
    stem.position.y = height / 2;
    stemPivot.add(stem);

    for (let node = 1; node < 6; node += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.01, 6, 10), materials.wood);
      ring.position.y = (height / 6) * node;
      ring.rotation.x = Math.PI / 2;
      stemPivot.add(ring);
    }

    const leafPivot = new THREE.Group();
    leafPivot.position.y = height * 0.7;
    for (let leafIndex = 0; leafIndex < 9; leafIndex += 1) {
      const leaf = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.03, 0.55 + Math.random() * 0.38, 2, 6),
        leafIndex % 3 === 0 ? materials.foliageDark : materials.foliage,
      );
      leaf.rotation.z = (Math.random() - 0.5) * 1.5;
      leaf.rotation.x = Math.PI / 2;
      leaf.position.set(
        (Math.random() - 0.5) * 0.75,
        Math.random() * 0.8,
        (Math.random() - 0.5) * 0.6,
      );
      leafPivot.add(leaf);
    }

    stemPivot.add(leafPivot);
    group.add(stemPivot);
    swayingTrees.push({ pivot: leafPivot, seed: spec.position[0] + index, amountX: 0.03, amountZ: 0.08 });
  }

  setShadows(group);
  return group;
};

const createWillow = (spec, materials, swayingTrees) => {
  const group = new THREE.Group();
  group.position.set(...spec.position);
  const scale = spec.scale || 1;

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22 * scale, 0.38 * scale, 5 * scale, 10),
    materials.wood,
  );
  trunk.position.y = 2.5 * scale;
  trunk.rotation.z = -0.08;
  group.add(trunk);

  const canopyPivot = new THREE.Group();
  canopyPivot.position.y = 4.7 * scale;
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(1.9 * scale, 20, 16),
    materials.foliage,
  );
  canopy.scale.set(1.1, 0.85, 1.12);
  canopy.position.y = 0.2 * scale;
  canopyPivot.add(canopy);

  for (let strand = 0; strand < 22; strand += 1) {
    const frond = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03 * scale, 0.015 * scale, 2.1 * scale, 6),
      strand % 4 === 0 ? materials.foliageDark : materials.foliage,
    );
    const angle = (strand / 22) * tau;
    const radius = 1.5 * scale + Math.random() * 0.45 * scale;
    frond.position.set(Math.cos(angle) * radius, -0.65 * scale, Math.sin(angle) * radius);
    frond.rotation.x = 0.06;
    frond.rotation.z = (Math.random() - 0.5) * 0.3;
    canopyPivot.add(frond);
  }

  group.add(canopyPivot);
  swayingTrees.push({ pivot: canopyPivot, seed: spec.position[0] + spec.position[2], amountX: 0.025, amountZ: 0.05 });
  setShadows(group);
  return group;
};

const createPine = (spec, materials, swayingTrees) => {
  const group = new THREE.Group();
  group.position.set(...spec.position);
  const scale = spec.scale || 1;

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * scale, 0.28 * scale, 4.4 * scale, 10),
    materials.wood,
  );
  trunk.position.y = 2.2 * scale;
  group.add(trunk);

  const crownPivot = new THREE.Group();
  crownPivot.position.y = 3.1 * scale;
  [
    { y: 0.1, radius: 1.4 },
    { y: 0.9, radius: 1.1 },
    { y: 1.62, radius: 0.78 },
  ].forEach((layer, index) => {
    const foliage = new THREE.Mesh(
      new THREE.SphereGeometry(layer.radius * scale, 16, 12),
      index === 1 ? materials.foliage : materials.foliageDark,
    );
    foliage.scale.set(1.5, 0.42, 1.15);
    foliage.position.y = layer.y * scale;
    crownPivot.add(foliage);
  });

  group.add(crownPivot);
  swayingTrees.push({ pivot: crownPivot, seed: spec.position[0] * 0.5, amountX: 0.01, amountZ: 0.02 });
  setShadows(group);
  return group;
};

const createLotusCluster = (cluster, materials) => {
  const group = new THREE.Group();
  const [x, z, spread = 1.1] = cluster;
  group.position.set(x, 0.14, z);

  for (let index = 0; index < 8; index += 1) {
    const pad = new THREE.Mesh(
      new THREE.CircleGeometry(0.24 + Math.random() * 0.22, 16),
      index % 3 === 0 ? materials.foliageDark : materials.foliage,
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set((Math.random() - 0.5) * spread, Math.random() * 0.015, (Math.random() - 0.5) * spread);
    pad.scale.x = 1.15;
    group.add(pad);
  }

  for (let bloom = 0; bloom < 2; bloom += 1) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.42, 6), materials.accent);
    stem.position.set((Math.random() - 0.5) * spread * 0.8, 0.2, (Math.random() - 0.5) * spread * 0.8);
    group.add(stem);

    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), materials.plaster);
    flower.position.copy(stem.position).add(new THREE.Vector3(0, 0.22, 0));
    flower.scale.set(1, 0.7, 1);
    group.add(flower);
  }

  setShadows(group, { cast: false, receive: true });
  return group;
};

const createReedPatch = (spec, materials, swayingTrees) => {
  const group = new THREE.Group();
  group.position.set(spec.position[0], 0, spec.position[2]);

  const count = spec.count || 14;
  for (let index = 0; index < count; index += 1) {
    const pivot = new THREE.Group();
    pivot.position.set((Math.random() - 0.5) * spec.spread, 0, (Math.random() - 0.5) * spec.spread);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.02, spec.height * (0.85 + Math.random() * 0.35), 5),
      materials.accent,
    );
    stem.position.y = spec.height / 2;
    pivot.add(stem);

    const leaf = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.015, spec.height * 0.42, 2, 4),
      materials.foliage,
    );
    leaf.position.y = spec.height * 0.75;
    leaf.rotation.z = (Math.random() - 0.5) * 0.55;
    pivot.add(leaf);

    group.add(pivot);
    swayingTrees.push({ pivot, seed: index + spec.position[0], amountX: 0.02, amountZ: 0.06 });
  }

  setShadows(group);
  return group;
};

const buildTerrain = (layout, materials) => {
  const [width, depth] = layout.terrain.size;
  const geometry = new THREE.PlaneGeometry(width, depth, 120, 110);
  const positions = geometry.attributes.position;
  const rockeryCenter = new THREE.Vector2(-12.5, -8.5);
  const pondCenter = new THREE.Vector2(0.4, -1.8);

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = positions.getY(index);
    const point = new THREE.Vector2(x, z);
    const rockeryInfluence = Math.exp(-point.distanceToSquared(rockeryCenter) / 42);
    const pondInfluence = Math.exp(-point.distanceToSquared(pondCenter) / 95);
    const ripple = Math.sin(x * 0.22) * Math.cos(z * 0.18) * 0.07;
    positions.setZ(index, ripple + rockeryInfluence * 0.48 - pondInfluence * 0.16);
  }

  geometry.computeVertexNormals();
  geometry.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, materials.ground);
  mesh.receiveShadow = true;
  return mesh;
};

const buildCourtyardFeature = (item, materials) => {
  const group = new THREE.Group();
  group.add(createFilledShape(item.outline, materials.path, 0.06));

  const hall = new THREE.Group();
  hall.position.set(...item.hall.position);
  hall.rotation.y = item.hall.rotationY || 0;

  const platform = new THREE.Mesh(new THREE.BoxGeometry(item.hall.size[0], 0.48, item.hall.size[2]), materials.stone);
  platform.position.y = 0.24;
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(item.hall.size[0] - 0.8, item.hall.size[1], item.hall.size[2] - 0.48),
    materials.plaster,
  );
  body.position.y = item.hall.size[1] / 2 + 0.48;
  const openBay = new THREE.Mesh(
    new THREE.BoxGeometry(item.hall.size[0] - 1.3, item.hall.size[1] - 0.8, 0.26),
    materials.wood,
  );
  openBay.position.set(0, item.hall.size[1] / 2 + 0.48, -item.hall.size[2] / 2 + 0.12);

  const roof = createRoof(item.hall.size[0], item.hall.size[2], 1.3, materials, 0.9);
  roof.position.y = item.hall.size[1] + 0.76;
  hall.add(platform, body, openBay, roof);

  const steps = createStepRun(item.hall.size[0] * 0.44, 0.42, 0.12, 3, materials.stone);
  steps.position.set(0, 0, -item.hall.size[2] / 2 - 0.18);
  hall.add(steps);

  const plaque = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.36, 0.07),
    materials.wood,
  );
  plaque.position.set(0, item.hall.size[1] + 0.08, -item.hall.size[2] / 2 + 0.14);
  hall.add(plaque);

  [
    [-item.hall.size[0] / 2 + 0.45, 1.7, -item.hall.size[2] / 2 + 0.4],
    [item.hall.size[0] / 2 - 0.45, 1.7, -item.hall.size[2] / 2 + 0.4],
    [-item.hall.size[0] / 2 + 0.45, 1.7, item.hall.size[2] / 2 - 0.4],
    [item.hall.size[0] / 2 - 0.45, 1.7, item.hall.size[2] / 2 - 0.4],
  ].forEach(([x, y, z]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.3, 0.18), materials.wood);
    post.position.set(x, y, z);
    hall.add(post);
  });

  item.hall.windows.forEach((windowSpec) => {
    const panel = createLatticePanel(windowSpec.size[0], windowSpec.size[1], materials);
    panel.position.set(...windowSpec.position);
    hall.add(panel);
  });

  [-1.8, 0, 1.8].forEach((x) => {
    const door = createDoorLeaf(1.05, 2.26, materials);
    door.position.set(x, 1.6, -item.hall.size[2] / 2 + 0.17);
    hall.add(door);
  });

  group.add(hall);
  item.sideWalls.forEach((wall) => group.add(createBoundaryWall(wall, materials)));
  (item.planters || []).forEach((planter) => group.add(createShrub(planter.position, planter.scale, materials)));

  setShadows(group);
  return group;
};

const buildCorridorSegment = (segment, materials) => {
  const group = new THREE.Group();
  group.position.set(...segment.position);
  group.rotation.y = segment.rotationY || 0;

  const [length, height, depth] = segment.size;
  const platform = new THREE.Mesh(new THREE.BoxGeometry(length, 0.22, depth), materials.stone);
  platform.position.y = 0.11;
  group.add(platform);

  const roof = createRoof(length, depth, 0.95, materials, 0.66);
  roof.position.y = height + 1.22;
  group.add(roof);

  const beam = new THREE.Mesh(new THREE.BoxGeometry(length + 0.18, 0.18, 0.22), materials.wood);
  beam.position.y = height + 0.82;
  group.add(beam);

  const rafters = createRafterBand(length + 0.08, depth - 0.18, materials, 0.42);
  rafters.position.y = height + 0.66;
  group.add(rafters);

  const boards = createDeckBoards(length, depth, materials, 0.22, 0.24);
  group.add(boards);

  const postCount = Math.max(4, Math.round(length / (segment.postSpacing || 2.05)));
  for (let index = 0; index <= postCount; index += 1) {
    const x = -length / 2 + (length / postCount) * index;
    [-depth / 2 + 0.16, depth / 2 - 0.16].forEach((z) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, height + 1.1, 0.14), materials.wood);
      post.position.set(x, (height + 1.1) / 2, z);
      group.add(post);
    });
  }

  if (segment.wallSide) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(length - 0.34, height, 0.22), materials.plaster);
    wall.position.set(0, height / 2 + 0.2, (depth / 2 - 0.12) * segment.wallSide);
    group.add(wall);

    (segment.windows || []).forEach((windowSpec) => {
      const panel = createLatticePanel(windowSpec.size[0], windowSpec.size[1], materials);
      panel.position.set(windowSpec.offsetX, windowSpec.offsetY, (depth / 2 - 0.01) * segment.wallSide);
      group.add(panel);
    });
  }

  if (segment.openSide) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(length - 0.4, 0.18, 0.12), materials.wood);
    rail.position.set(0, 1.08, (depth / 2 - 0.2) * segment.openSide);
    group.add(rail);

    const lowerRail = new THREE.Mesh(new THREE.BoxGeometry(length - 0.42, 0.12, 0.08), materials.wood);
    lowerRail.position.set(0, 0.62, (depth / 2 - 0.17) * segment.openSide);
    group.add(lowerRail);
  }

  setShadows(group);
  return group;
};

const buildMoonGateFeature = (item, materials) => {
  const group = new THREE.Group();
  group.position.set(...item.position);
  group.rotation.y = item.rotationY || 0;

  const [width, height, depth] = item.size;
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(width / 2, height);
  shape.lineTo(-width / 2, height);
  shape.closePath();

  const gateHole = new THREE.Path();
  gateHole.absellipse(0, item.openingY, item.openingRadius, item.openingRadius, 0, tau, false);
  shape.holes.push(gateHole);

  (item.windows || []).forEach((windowSpec) => {
    const hole = new THREE.Path();
    hole.moveTo(windowSpec.offsetX - windowSpec.size[0] / 2, windowSpec.offsetY - windowSpec.size[1] / 2);
    hole.lineTo(windowSpec.offsetX + windowSpec.size[0] / 2, windowSpec.offsetY - windowSpec.size[1] / 2);
    hole.lineTo(windowSpec.offsetX + windowSpec.size[0] / 2, windowSpec.offsetY + windowSpec.size[1] / 2);
    hole.lineTo(windowSpec.offsetX - windowSpec.size[0] / 2, windowSpec.offsetY + windowSpec.size[1] / 2);
    hole.closePath();
    shape.holes.push(hole);
  });

  const wall = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 48 }),
    materials.plaster,
  );
  wall.geometry.translate(0, 0, -depth / 2);

  const cap = new THREE.Mesh(new THREE.BoxGeometry(width + 0.28, 0.22, depth + 0.55), materials.roof);
  cap.position.y = height + 0.1;
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(width + 0.18, 0.3, depth + 0.12), materials.stone);
  plinth.position.y = 0.15;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(item.openingRadius, 0.08, 16, 48), materials.stone);
  ring.position.set(0, item.openingY, depth / 2 + 0.02);

  group.add(plinth, wall, cap, ring);

  const threshold = new THREE.Mesh(
    new THREE.BoxGeometry(item.openingRadius * 1.6, 0.12, depth + 0.06),
    materials.stone,
  );
  threshold.position.set(0, 0.06, 0);
  group.add(threshold);

  (item.windows || []).forEach((windowSpec) => {
    const panel = createLatticePanel(windowSpec.size[0] * 0.95, windowSpec.size[1] * 0.9, materials);
    panel.position.set(windowSpec.offsetX, windowSpec.offsetY, depth / 2 + 0.03);
    group.add(panel);
  });

  setShadows(group);
  return group;
};

const buildPondFeature = (item, materials, animatedWaters, swayingTrees) => {
  const group = new THREE.Group();
  const shape = createSplineShape(item.outline);

  const pondBed = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: item.depth, bevelEnabled: false, curveSegments: 64 }),
    materials.waterBed,
  );
  pondBed.geometry.rotateX(-Math.PI / 2);
  pondBed.position.y = -item.depth;

  const waterGeometry = new THREE.ShapeGeometry(shape, 96);
  waterGeometry.rotateX(-Math.PI / 2);
  const basePositions = Float32Array.from(waterGeometry.attributes.position.array);
  const water = new THREE.Mesh(waterGeometry, materials.water);
  water.position.y = item.waterLevel;

  group.add(pondBed, water);

  item.outline.forEach(([x, z], index) => {
    if (index % 2 !== 0) return;
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.34 + ((index % 4) * 0.06), 0),
      materials.stone,
    );
    rock.position.set(x + Math.sin(index) * 0.25, 0.14, z + Math.cos(index) * 0.22);
    rock.scale.set(1.2, 0.7, 1);
    group.add(rock);

    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(0.7 + (index % 3) * 0.08, 0.08, 0.36),
      materials.path,
    );
    slab.position.set(x + Math.sin(index) * 0.18, 0.09, z + Math.cos(index) * 0.16);
    slab.rotation.y = index * 0.34;
    group.add(slab);
  });

  (item.lotusClusters || []).forEach((cluster) => group.add(createLotusCluster(cluster, materials)));
  (item.reedPatches || []).forEach((patch) => group.add(createReedPatch(patch, materials, swayingTrees)));

  animatedWaters.push({
    geometry: waterGeometry,
    basePositions,
    phase: item.outline[0][0] * 0.18,
    amplitude: item.waveAmplitude || 0.06,
  });

  setShadows(group);
  return group;
};

const buildPavilionFeature = (item, materials) => {
  const group = new THREE.Group();
  group.position.set(...item.position);
  group.rotation.y = item.rotationY || 0;

  const [width, height, depth] = item.size;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(width, item.platformHeight, depth), materials.stone);
  deck.position.y = item.platformHeight / 2;
  group.add(deck);

  group.add(createDeckBoards(width, depth, materials, 0.18, item.platformHeight + 0.03));

  const roof = createRoof(width, depth, 1.5, materials, 0.92);
  roof.position.y = height + item.platformHeight + 0.88;
  group.add(roof);

  const rafters = createRafterBand(width + 0.12, depth - 0.2, materials, 0.36);
  rafters.position.y = height + item.platformHeight + 0.5;
  group.add(rafters);

  [
    [-width / 2 + 0.42, 1.95, -depth / 2 + 0.42],
    [width / 2 - 0.42, 1.95, -depth / 2 + 0.42],
    [-width / 2 + 0.42, 1.95, depth / 2 - 0.42],
    [width / 2 - 0.42, 1.95, depth / 2 - 0.42],
    [0, 1.95, -depth / 2 + 0.42],
    [0, 1.95, depth / 2 - 0.42],
  ].forEach(([x, y, z]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.75, 0.16), materials.wood);
    post.position.set(x, y, z);
    group.add(post);
  });

  const benchRail = new THREE.Mesh(new THREE.BoxGeometry(width - 0.9, 0.16, 0.12), materials.wood);
  benchRail.position.set(0, 1.14, depth / 2 - 0.28);
  group.add(benchRail);

  const latticeBack = createLatticePanel(width - 1, 1.35, materials);
  latticeBack.position.set(0, 1.55, -depth / 2 + 0.16);
  group.add(latticeBack);

  const stoneStep = new THREE.Mesh(new THREE.BoxGeometry(width * 0.42, 0.16, 0.6), materials.stone);
  stoneStep.position.set(0, 0.08, depth / 2 + 0.42);
  group.add(stoneStep);

  const tableSet = createScholarTableSet(materials);
  tableSet.position.set(0, item.platformHeight + 0.02, -0.05);
  group.add(tableSet);

  [-width / 2 + 0.6, width / 2 - 0.6].forEach((x) => {
    const sideRail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, depth - 1), materials.wood);
    sideRail.position.set(x, 1.14, 0);
    group.add(sideRail);
  });

  [
    [-width / 2 + 0.48, -depth / 2 + 0.48],
    [width / 2 - 0.48, -depth / 2 + 0.48],
    [-width / 2 + 0.48, depth / 2 - 0.48],
    [width / 2 - 0.48, depth / 2 - 0.48],
  ].forEach(([x, z]) => {
    const pile = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.8, 0.14), materials.wood);
    pile.position.set(x, -0.12, z);
    group.add(pile);
  });

  setShadows(group);
  return group;
};

const buildBridgePathFeature = (item, materials) => {
  const group = new THREE.Group();
  (item.stonePaths || []).forEach((path) => group.add(createFilledShape(path, materials.path, 0.05)));
  (item.steppingStones || []).forEach((stone) => {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(stone.size[0], stone.size[1], stone.size[2]), materials.stone);
    slab.position.set(stone.position[0], stone.position[1], stone.position[2]);
    slab.rotation.y = stone.rotationY || 0;
    group.add(slab);
  });

  item.bridgeSegments.forEach((segment) => {
    const bridge = new THREE.Group();
    bridge.position.set(...segment.position);
    bridge.rotation.y = segment.rotationY || 0;

    const deck = new THREE.Mesh(new THREE.BoxGeometry(segment.size[0], segment.size[1], segment.size[2]), materials.wood);
    deck.position.y = segment.size[1] / 2;
    bridge.add(deck);

    const boardCount = 5;
    for (let index = 0; index < boardCount; index += 1) {
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(segment.size[0] - 0.18, 0.03, 0.16),
        materials.wood,
      );
      board.position.set(0, segment.size[1] + 0.02, -segment.size[2] / 2 + 0.18 + index * 0.26);
      bridge.add(board);
    }

    const rail = new THREE.Mesh(new THREE.BoxGeometry(segment.size[0] - 0.18, 0.14, 0.12), materials.wood);
    rail.position.set(0, 0.78, segment.size[2] / 2 - 0.08);
    bridge.add(rail);
    const railBack = rail.clone();
    railBack.position.z *= -1;
    bridge.add(railBack);

    for (let index = 0; index < 4; index += 1) {
      const x = -segment.size[0] / 2 + 0.35 + index * ((segment.size[0] - 0.7) / 3);
      [-segment.size[2] / 2 + 0.1, segment.size[2] / 2 - 0.1].forEach((z) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.08), materials.wood);
        post.position.set(x, 0.42, z);
        bridge.add(post);
      });
    }

    group.add(bridge);

    const abutment = new THREE.Mesh(
      new THREE.BoxGeometry(segment.size[0] * 0.32, 0.18, segment.size[2] + 0.2),
      materials.stone,
    );
    abutment.position.set(segment.position[0] - Math.cos(segment.rotationY || 0) * segment.size[0] * 0.45, 0.09, segment.position[2] - Math.sin(segment.rotationY || 0) * segment.size[0] * 0.45);
    abutment.rotation.y = segment.rotationY || 0;
    group.add(abutment);
  });

  setShadows(group);
  return group;
};

const buildRockeryFeature = (item, materials, swayingTrees) => {
  const group = new THREE.Group();
  group.position.set(...item.position);

  const mound = new THREE.Mesh(new THREE.SphereGeometry(3.8, 24, 18), materials.stone);
  mound.scale.set(1.35, 0.55, 1.05);
  mound.position.y = 0.86;
  group.add(mound);

  const grotto = new THREE.Mesh(
    new THREE.SphereGeometry(0.82, 18, 14),
    new THREE.MeshStandardMaterial({ color: '#4f4b45', roughness: 1 }),
  );
  grotto.scale.set(1.2, 0.72, 0.85);
  grotto.position.set(-0.9, 1.02, 1.18);
  group.add(grotto);

  item.stoneForms.forEach((form, index) => {
    const mesh = new THREE.Mesh(
      index % 2 === 0
        ? new THREE.TorusKnotGeometry(form.radius, form.tube, 96, 10, 2, 3)
        : new THREE.DodecahedronGeometry(form.radius, 0),
      materials.stone,
    );
    mesh.position.set(...form.position);
    mesh.scale.set(...form.scale);
    mesh.rotation.set(...form.rotation);
    group.add(mesh);
  });

  (item.pathRibbons || []).forEach((ribbon) => {
    group.add(createPathRibbon(ribbon.points, ribbon.width, materials.path, ribbon.y || 0.06));
  });
  (item.bamboo || []).forEach((spec) => group.add(createBambooCluster(spec, materials, swayingTrees)));
  (item.pines || []).forEach((spec) => group.add(createPine(spec, materials, swayingTrees)));
  (item.shrubs || []).forEach((spec) => group.add(createShrub(spec.position, spec.scale, materials)));

  setShadows(group);
  return group;
};

const addHotspot = (item, scene, materials, interactiveMeshes, animatedHotspots) => {
  if (!item.hotspot) return;

  const hotspot = new THREE.Sprite(materials.hotspot.clone());
  hotspot.position.set(...item.hotspot);
  hotspot.scale.setScalar(item.hotspotScale || 0.95);
  hotspot.renderOrder = 3;
  hotspot.userData.itemId = item.id;
  interactiveMeshes.push(hotspot);
  scene.add(hotspot);
  animatedHotspots.push({
    sprite: hotspot,
    seed: item.hotspot[0] * 0.37 + item.hotspot[2] * 0.21,
    baseScale: item.hotspotScale || 0.95,
  });
};

export const isDetailedSuzhouScene = (config) => config?.sceneType === 'detailed-zhuozheng-section';

export const buildDetailedGardenScene = ({
  scene,
  renderer,
  config,
  sceneItems,
  interactiveMeshes,
  swayingTrees,
  animatedWaters,
  animatedHotspots,
}) => {
  const materials = createMaterialLibrary(renderer, config.palette);

  scene.background = new THREE.Color(config.palette.sky || '#d8e0d7');
  scene.fog = new THREE.Fog(config.palette.fog || '#dce4db', 24, 70);

  const ambient = new THREE.HemisphereLight(0xf5f1e6, 0x71806d, 1.2);
  const sunlight = new THREE.DirectionalLight(config.palette.sunlight || 0xfff3dc, 1.45);
  sunlight.position.set(18, 24, 10);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  sunlight.shadow.camera.left = -26;
  sunlight.shadow.camera.right = 26;
  sunlight.shadow.camera.top = 24;
  sunlight.shadow.camera.bottom = -24;
  sunlight.shadow.camera.near = 1;
  sunlight.shadow.camera.far = 60;
  sunlight.shadow.bias = -0.00012;

  const bounce = new THREE.DirectionalLight(0xcad8d0, 0.42);
  bounce.position.set(-16, 10, -14);
  const rim = new THREE.DirectionalLight(0xf9e7d0, 0.24);
  rim.position.set(8, 6, -20);

  scene.add(ambient, sunlight, bounce, rim);
  scene.add(buildTerrain(config.layout, materials));

  config.layout.boundaryWalls.forEach((wall) => scene.add(createBoundaryWall(wall, materials)));
  (config.layout.plantings?.willows || []).forEach((spec) => scene.add(createWillow(spec, materials, swayingTrees)));
  (config.layout.plantings?.bamboo || []).forEach((spec) => scene.add(createBambooCluster(spec, materials, swayingTrees)));
  (config.layout.plantings?.pines || []).forEach((spec) => scene.add(createPine(spec, materials, swayingTrees)));
  (config.layout.plantings?.shrubs || []).forEach((spec) => scene.add(createShrub(spec.position, spec.scale, materials)));

  sceneItems.forEach((item) => {
    let feature = null;

    if (item.type === 'courtyard') {
      feature = buildCourtyardFeature(item, materials);
    } else if (item.type === 'corridor') {
      feature = new THREE.Group();
      item.segments.forEach((segment) => feature.add(buildCorridorSegment(segment, materials)));
    } else if (item.type === 'moonGate') {
      feature = buildMoonGateFeature(item, materials);
    } else if (item.type === 'pond') {
      feature = buildPondFeature(item, materials, animatedWaters, swayingTrees);
    } else if (item.type === 'pavilion') {
      feature = buildPavilionFeature(item, materials);
    } else if (item.type === 'bridgePath') {
      feature = buildBridgePathFeature(item, materials);
    } else if (item.type === 'rockery') {
      feature = buildRockeryFeature(item, materials, swayingTrees);
    }

    if (!feature) return;

    markInteractive(feature, item.id, interactiveMeshes);
    scene.add(feature);
    addHotspot(item, scene, materials, interactiveMeshes, animatedHotspots);
  });
};

export const updateDetailedGardenAnimations = ({
  elapsed,
  camera,
  activeItemId,
  swayingTrees,
  animatedWaters,
  animatedHotspots,
}) => {
  animatedWaters.forEach((entry) => {
    const positions = entry.geometry.attributes.position.array;
    for (let index = 0; index < positions.length; index += 3) {
      const baseX = entry.basePositions[index];
      const baseY = entry.basePositions[index + 1];
      const baseZ = entry.basePositions[index + 2];
      positions[index + 1] = baseY + Math.sin(elapsed * 1.65 + baseX * 1.2 + baseZ * 1.4 + entry.phase) * entry.amplitude;
    }
    entry.geometry.attributes.position.needsUpdate = true;
    entry.geometry.computeVertexNormals();
  });

  swayingTrees.forEach((entry, index) => {
    entry.pivot.rotation.z = Math.sin(elapsed * 0.72 + index + entry.seed) * (entry.amountZ || 0.05);
    entry.pivot.rotation.x = Math.cos(elapsed * 0.46 + entry.seed) * (entry.amountX || 0.02);
  });

  animatedHotspots.forEach((entry, index) => {
    const isActive = entry.sprite.userData.itemId === activeItemId;
    const pulse = 1 + Math.sin(elapsed * 2.1 + entry.seed + index) * (isActive ? 0.18 : 0.12);
    entry.sprite.scale.setScalar(entry.baseScale * (isActive ? 1.24 : 1) * pulse);
    entry.sprite.material.opacity = isActive ? 1 : 0.72;
    entry.sprite.material.color.set(isActive ? '#ffffff' : '#e3efe5');
    if (camera) {
      tempVec.copy(camera.position);
      entry.sprite.lookAt(tempVec);
    }
  });
};
