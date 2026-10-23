import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export type CharacterKind = 'explorer' | 'nara' | 'wira';
export interface ArmRig { shoulder: THREE.Group; elbow: THREE.Group; hand: THREE.Group; toolSocket: THREE.Group; }
export interface LegRig { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group; }
export interface CharacterRig {
  kind: CharacterKind;
  /** Navigation/interaction root: visual animation never translates this group. */
  root: THREE.Group;
  visual: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftArm: ArmRig;
  rightArm: ArmRig;
  leftLeg: LegRig;
  rightLeg: LegRig;
  eyes: THREE.Group;
  labelSocket: THREE.Group;
  tools: { notebook: THREE.Group; meter: THREE.Group; sample: THREE.Group };
}

// Shared immutable geometry/materials. Construction happens once, never in update().
const geometries = new Map<string, THREE.BufferGeometry>();
const materials = new Map<string, THREE.MeshLambertMaterial>();
function material(color: string) {
  let m = materials.get(color);
  if (!m) { m = new THREE.MeshLambertMaterial({ color }); materials.set(color, m); }
  return m;
}
function geometry(w: number, h: number, d: number, radius: number) {
  const key = `${w}/${h}/${d}/${radius}`;
  let g = geometries.get(key);
  if (!g) { g = new RoundedBoxGeometry(w, h, d, 1, Math.min(radius, w / 3, h / 3, d / 3)); geometries.set(key, g); }
  return g;
}
const palettes = {
  explorer: { skin: '#dca477', hair: '#40312a', coat: '#337caa', shirt: '#d8bb79', pants: '#586772', shoes: '#66503c', trim: '#a9c9ce', bag: '#947047' },
  nara: { skin: '#bf8c67', hair: '#302d32', coat: '#786490', shirt: '#f4e6cd', pants: '#535367', shoes: '#53433e', trim: '#c7b8d0', bag: '#81745d' },
  wira: { skin: '#c08c61', hair: '#4b352b', coat: '#9d7844', shirt: '#e1d4b1', pants: '#536f65', shoes: '#554638', trim: '#c4a56e', bag: '#756346' },
};

export function createCharacter(kind: CharacterKind, placeId?: string): CharacterRig {
  const p = palettes[kind];
  const root = new THREE.Group(); root.name = `character-${kind}`;
  const visual = new THREE.Group(); visual.name = 'visual'; visual.position.y = 0.1; root.add(visual);
  const group = (name: string, parent: THREE.Group, x: number, y: number, z = 0) => {
    const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); parent.add(g); return g;
  };
  // Batch rigid details by material within each joint, retaining independent articulation.
  const batches = new Map<THREE.Group, Map<string, THREE.BufferGeometry[]>>();
  const part = (parent: THREE.Group, size: [number, number, number], color: string, x: number, y: number, z: number, radius = .035, rz = 0) => {
    const g = geometry(...size, radius).clone();
    if (rz) g.rotateZ(rz); g.translate(x, y, z);
    let colors = batches.get(parent); if (!colors) { colors = new Map(); batches.set(parent, colors); }
    const list = colors.get(color) ?? []; list.push(g); colors.set(color, list);
  };
  const torso = group('torso', visual, 0, 1.20);
  const head = group('head', torso, 0, .79);
  const eyes = group('eyes', head, 0, .23, .354);
  const broad = kind === 'wira' ? .08 : 0;
  part(torso, [.73 + broad, .77, .46], p.coat, 0, .18, 0, .07);
  part(torso, [.59 + broad, .27, .43], p.pants, 0, -.32, 0, .04);
  part(torso, [.64 + broad, .095, .46], p.bag, 0, -.23, .012, .02);
  // Visible undershirt, open jacket/vest edges, collar and cuffs.
  part(torso, [.29, .65, .055], p.shirt, 0, .22, .25, .015);
  for (const side of [-1, 1]) {
    part(torso, [.095, .61, .085], p.trim, side * .20, .20, .26, .015);
    part(torso, [.20, .13, .09], p.shirt, side * .13, .54, .27, .015, side * .27);
    part(torso, [.15, .18, .05], p.trim, side * .29, .02, .253, .015);
  }
  part(head, [.24, .18, .25], p.skin, 0, -.23, 0, .035);
  part(head, [.69 + broad * .4, .69, .64], p.skin, 0, .18, 0, .065);
  for (const side of [-1, 1]) {
    part(head, [.11, .19, .24], p.skin, side * .36, .13, 0, .045);
    part(eyes, [.082, .105, .027], '#292d2b', side * .16, 0, 0, .02);
    part(eyes, [.022, .025, .015], '#fff6dc', side * .16 - .012, .022, .019, .005);
    part(head, [.12, .035, .035], p.hair, side * .16, .36, .337, .009, side * -.08);
  }
  part(head, [.09, .105, .08], p.skin, 0, .11, .345, .025);
  // Three soft segments form a friendly smile, readable at close inspection.
  part(head, [.14, .025, .027], '#81543c', 0, -.007, .335, .008);
  part(head, [.055, .025, .027], '#81543c', -.087, .011, .335, .008, -.40);
  part(head, [.055, .025, .027], '#81543c', .087, .011, .335, .008, .40);
  part(head, [.74 + broad * .4, .23, .68], p.hair, 0, .55, -.015, .055);
  part(head, [.73, .40, .14], p.hair, 0, .29, -.29, .04);
  if (kind === 'explorer') {
    part(head, [.38, .25, .18], p.hair, -.19, .43, .29, .04, -.10);
    part(head, [.27, .17, .18], '#534033', .10, .48, .30, .035, -.18);
    part(head, [.14, .30, .18], p.hair, -.30, .30, .22, .025);
    part(torso, [.57, .62, .28], p.bag, 0, .15, -.38, .06);
    part(torso, [.42, .20, .12], '#b18b56', 0, -.02, -.56, .035);
    part(torso, [.60, .12, .30], '#b18b56', 0, .43, -.39, .035);
    for (const side of [-1, 1]) part(torso, [.095, .66, .085], p.bag, side * .29, .22, .29, .02, side * -.10);
  } else if (kind === 'nara') {
    eyes.position.z = .409;
    // Teacher silhouette: neat swept hair/bun, glasses, long cardigan and skirt.
    part(head, [.52, .20, .19], p.hair, -.09, .46, .29, .045, -.12);
    part(head, [.34, .32, .31], p.hair, .09, .51, -.42, .1);
    part(torso, [.81, .36, .50], p.coat, 0, -.28, 0, .045);
    part(torso, [.66, .35, .43], p.pants, 0, -.48, 0, .035);
    for (const side of [-1, 1]) {
      part(head, [.245, .19, .033], '#62575f', side * .16, .23, .356, .035);
      part(head, [.193, .135, .04], p.skin, side * .16, .23, .375, .025);
    }
    part(head, [.10, .025, .04], '#62575f', 0, .24, .37, .008);
  } else {
    // Resident silhouette: broad vest, rolled sleeves and an olive work cap.
    part(head, [.78, .18, .71], '#61785b', 0, .66, -.01, .055);
    part(head, [.84, .07, .81], '#8b9b68', 0, .54, .06, .035);
    part(head, [.22, .045, .035], p.hair, 0, .05, .369, .01);
    part(torso, [.30, .12, .07], p.trim, -.23, .36, .27, .015);
  }
  const arm = (side: number): ArmRig => {
    const shoulder = group(side < 0 ? 'left-shoulder' : 'right-shoulder', torso, side * (.49 + broad / 2), .50);
    const elbow = group('elbow', shoulder, 0, -.40);
    const hand = group('hand', elbow, 0, -.40);
    const toolSocket = group('tool-socket', hand, 0, -.04, .06);
    const sleeve = kind === 'wira' ? p.shirt : p.coat;
    part(shoulder, [.30, .41, .35], sleeve, 0, -.18, 0, .065);
    part(elbow, [.25, .34, .30], sleeve, 0, -.16, 0, .045);
    part(elbow, [.28, .10, .33], p.trim, 0, -.30, 0, .025);
    part(hand, [.26, .25, .29], p.skin, 0, -.05, .01, .06);
    part(hand, [.09, .14, .13], p.skin, -side * .12, -.015, .11, .025);
    return { shoulder, elbow, hand, toolSocket };
  };
  const leg = (side: number): LegRig => {
    const hip = group(side < 0 ? 'left-hip' : 'right-hip', visual, side * .20, .94);
    const knee = group('knee', hip, 0, -.43);
    const ankle = group('ankle', knee, 0, -.38);
    part(hip, [.30, .43, .35], p.pants, 0, -.19, 0, .045);
    part(knee, [.28, .38, .33], p.pants, 0, -.17, 0, .035);
    part(knee, [.30, .10, .35], p.trim, 0, -.30, 0, .02);
    part(ankle, [.34, .24, .53], p.shoes, 0, .005, .09, .055);
    part(ankle, [.36, .065, .55], '#342f2b', 0, -.09, .10, .015);
    part(ankle, [.24, .08, .20], '#ac9673', 0, .105, .19, .02);
    return { hip, knee, ankle };
  };
  const leftArm = arm(-1), rightArm = arm(1), leftLeg = leg(-1), rightLeg = leg(1);
  const notebook = group('notebook', leftArm.toolSocket, 0, 0, 0);
  part(notebook, [.38, .48, .075], '#426f65', 0, -.10, .10, .015);
  part(notebook, [.32, .40, .04], '#f8edd4', 0, -.10, .15, .008);
  part(notebook, [.035, .28, .04], '#c89846', .12, -.10, .18, .005);
  const meter = group('meter', rightArm.toolSocket, 0, 0, 0);
  part(meter, [.25, .38, .19], '#e9b451', 0, -.02, .12, .035);
  part(meter, [.17, .14, .03], '#35595b', 0, .03, .23, .008);
  const sample = group('sample', rightArm.toolSocket, 0, 0, 0);
  part(sample, [.22, .35, .22], '#7ca9ad', 0, -.04, .12, .03);
  part(sample, [.17, .07, .17], '#f0dfac', 0, .17, .12, .015);
  part(sample, [.15, .12, .025], '#f6ecd8', 0, -.02, .241, .005);
  notebook.visible = meter.visible = sample.visible = false;
  for (const [parent, colors] of batches) for (const [color, list] of colors) {
    const mesh = new THREE.Mesh(mergeGeometries(list), material(color));
    mesh.name = `${parent.name}-geometry`; parent.add(mesh); list.forEach(g => g.dispose());
  }
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.62, 24), new THREE.MeshBasicMaterial({ color: '#344b36', transparent: true, opacity: .20, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = .092; shadow.scale.y = .72; root.add(shadow);
  const labelSocket = group('label-socket', root, 0, kind === 'wira' ? 3.12 : 3.04);
  if (placeId) root.traverse(child => { child.userData.place = placeId; });
  return { kind, root, visual, torso, head, eyes, leftArm, rightArm, leftLeg, rightLeg, labelSocket, tools: { notebook, meter, sample } };
}
