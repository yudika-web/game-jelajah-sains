import * as THREE from 'three';
import { guardHut, researchHut, rimbaRails, rimbaReservations, rimbaTrails, watchtower } from '../data/rimbaTrails';
import type { EnvironmentKit } from './environmentKit';

const surfaces = {
  earth: '#c5aa79',
  boards: '#a58560',
  gravel: '#bdb899',
} as const;

export function buildRimbaTrails(env: EnvironmentKit) {
  rimbaTrails.forEach((trail, index) => {
    if (trail.surface === 'yard') return; // The original apparatus and logistics apron own this surface.
    const width = trail.maxX - trail.minX, depth = trail.maxZ - trail.minZ;
    const x = (trail.minX + trail.maxX) / 2, z = (trail.minZ + trail.maxZ) / 2;
    const y = -.032 + index * .006;
    env.box(width, .028, depth, surfaces[trail.surface], x, y, z);
    if (trail.surface === 'boards') {
      for (let planks = trail.minZ + .5; planks < trail.maxZ; planks += .85) {
        env.box(width - .25, .018, .70, Math.round(planks) % 3 ? '#be9c72' : '#d0ad80', x, y + .02, planks);
      }
    }
  });

  for (const rail of rimbaRails) {
    const alongX = rail.axis === 'x';
    for (const y of [.46, .91]) {
      env.box(alongX ? rail.length : .12, .13, alongX ? .12 : rail.length, '#8d7150', rail.x, y, rail.z);
    }
    const spans = Math.ceil(rail.length / 3.4);
    for (let i = 0; i <= spans; i++) {
      const offset = rail.length * (i / spans - .5);
      env.box(.16, 1.19, .16, '#655341', rail.x + (alongX ? offset : 0), .56, rail.z + (alongX ? 0 : offset));
    }
  }

  for (const hut of [guardHut, researchHut]) {
    const { x, z, width, depth } = hut, guard = hut === guardHut;
    env.box(width, 3.1, depth, guard ? '#c5bb92' : '#ad9770', x, 1.55, z);
    env.roof(x, 3.3, z, width, depth, guard ? '#557756' : '#647d87');
    env.box(1.16, 2.10, .12, '#5d654c', x, 1.05, z + depth / 2);
    for (const dx of [-1.65, 1.65]) env.box(.92, .9, .12, '#a7c1b8', x + dx, 1.9, z + depth / 2);
  }

  const { x, z, width, depth } = watchtower;
  for (const dx of [-2.6, 2.6]) for (const dz of [-2.6, 2.6]) {
    env.box(.36, 11.8, .36, '#785b43', x + dx, 5.9, z + dz);
  }
  for (const dx of [-2.6, 2.6]) {
    env.box(.22, .25, 10.8, '#927455', x + dx, 4.55, z, .95);
    env.box(.22, .25, 10.8, '#927455', x + dx, 4.55, z, -.95);
  }
  env.box(width + .6, .35, depth + .6, '#8a6c4a', x, 9.0, z);
  env.box(width, 1.15, .16, '#ad865b', x, 9.63, z + 2.85);
  env.roof(x, 11.4, z, width + 1.4, depth + 1.4, '#bb8153');

  // All scenery in this block is outside the fenced navigation corridors.
  for (let row = 0; row < 8; row++) for (let col = 0; col < 6; col++) {
    const treeX = -70 + col * 11.2 + Math.sin(col + row) * 2.2;
    const treeZ = -108 + row * 14 + Math.cos(col - row) * 3.2;
    if (rimbaTrails.some(t => treeX > t.minX - 2 && treeX < t.maxX + 2 && treeZ > t.minZ - 2 && treeZ < t.maxZ + 2)) continue;
    if (rimbaReservations.some(t => treeX > t.minX - 2 && treeX < t.maxX + 2 && treeZ > t.minZ - 2 && treeZ < t.maxZ + 2)) continue;
    env.tree(treeX, treeZ, row * 6 + col, ['#3d6146', '#789153']);
  }
  for (let i = 0; i < 13; i++) {
    const edgeZ = -117 + i * 9.6;
    env.tree(-98 + i % 2 * 2, edgeZ, i, ['#456847', '#698550']);
  }

  // Differences in water, peat and planting are visible before the relevant checkpoint.
  env.box(12, .08, 17, '#526f68', -70, -.015, -102);
  env.box(8, .06, 8, '#688981', 12, -.014, -28);
  for (let i = 0; i < 6; i++) {
    env.rock(-66.3 + i * .76, .16, -25.8 + Math.sin(i) * .6, .53, .24, .7, '#7f8770', i);
  }
  for (let i = 0; i < 6; i++) {
    const fernX = -58.8 + i * .62, fernZ = -77 + Math.sin(i) * 2;
    for (const angle of [-.8, 0, .8]) {
      env.shape(new THREE.SphereGeometry(1, 6, 4), '#6c904f', fernX, .35, fernZ, .13, .60, .21, 0, .6 * i, angle);
    }
  }
  for (let i = 0; i < 3; i++) {
    const bedZ = -95 + i * 3.2;
    env.box(10, .20, 2.45, '#8d6e50', 10.5, .07, bedZ);
    for (let j = 0; j < 7; j++) {
      const seedX = 6.3 + 1.35 * j;
      env.cylinder(.04, .42, '#745b3a', seedX, .30, bedZ);
      env.shape(new THREE.SphereGeometry(1, 6, 4), '#70934e', seedX, .52, bedZ, .30, .24, .30);
    }
  }

  for (const [index, area] of rimbaReservations.entries()) {
    const width = area.maxX - area.minX, depth = area.maxZ - area.minZ;
    const cx = (area.minX + area.maxX) / 2, cz = (area.minZ + area.maxZ) / 2;
    env.box(width, .052, depth, index === 0 ? '#696755' : '#af966e', cx, -.022, cz);
    if (index === 0) {
      for (const dx of [-5.5, 5.5]) env.box(5, .18, 5.5, '#ae8c67', cx + dx, .10, cz);
      env.box(4.1, .06, 5.5, '#5b7871', cx, .01, cz);
    } else if (index === 1) {
      env.box(1.4, 1.1, 1.4, '#9d7853', cx, .53, cz);
      for (const dx of [-4, 4]) env.box(1.9, .04, 1.9, '#d4bb85', cx + dx, .024, cz);
    } else {
      env.cylinder(.52, .73, '#a28259', cx + 2.6, .35, cz);
      env.box(2.2, .04, 1.1, '#d4bb85', cx - 2, .018, cz);
    }
  }
}
