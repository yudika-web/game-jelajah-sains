import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { ArmRig, CharacterKind, CharacterRig, LegRig } from './character';

const geometryCache = new Map<string, THREE.BufferGeometry>();
const materialCache = new Map<string, THREE.MeshLambertMaterial>();
function cached(key: string, build: () => THREE.BufferGeometry) {
  let geometry = geometryCache.get(key);
  if (!geometry) {
    geometry = build();
    if (geometry.index) geometry = geometry.toNonIndexed();
    geometry.deleteAttribute('uv'); geometryCache.set(key, geometry);
  }
  return geometry;
}
function surface(color: string, flat = false) {
  const key = `${color}/${flat}`;
  let material = materialCache.get(key);
  if (!material) { material = new THREE.MeshLambertMaterial({ color, flatShading: flat }); materialCache.set(key, material); }
  return material;
}
const palettes = {
  explorer: { skin: '#efb27d', ear: '#dea06d', hair: '#50372b', hairLight: '#654431', coat: '#267c8d', shirt: '#f5ead4', pants: '#4d4c56', boots: '#8b603e', cuff: '#a0cbd0', bag: '#dda048' },
  nara: { skin: '#c99573', ear: '#b78261', hair: '#403331', hairLight: '#57443d', coat: '#78658f', shirt: '#f6ead5', pants: '#4c4d60', boots: '#635044', cuff: '#c2b5ca', bag: '#9b8057' },
  wira: { skin: '#ce986e', ear: '#b8825c', hair: '#50382b', hairLight: '#654631', coat: '#a0804c', shirt: '#e6d8b9', pants: '#526b61', boots: '#75563c', cuff: '#c3ab77', bag: '#a38550' },
};

/** Local, articulated reference model; all dimensions are in the existing gameplay scale. */
export function buildReferenceCharacter(kind: CharacterKind, placeId?: string): CharacterRig {
  const p = palettes[kind];
  const root = new THREE.Group(); root.name = `character-${kind}`;
  const group = (name: string, parent: THREE.Group, x = 0, y = 0, z = 0) => {
    const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); parent.add(g); return g;
  };
  const visual = group('visual', root, 0, .1);
  const batches = new Map<THREE.Group, Map<string, { color: string; flat: boolean; geometries: THREE.BufferGeometry[] }>>();
  const add = (parent: THREE.Group, base: THREE.BufferGeometry, color: string, x: number, y: number, z: number, flat = false, rz = 0) => {
    const geometry = base.clone(); if (rz) geometry.rotateZ(rz); geometry.translate(x, y, z);
    let colors = batches.get(parent); if (!colors) { colors = new Map(); batches.set(parent, colors); }
    const key = `${color}/${flat}`;
    let bucket = colors.get(key); if (!bucket) { bucket = { color, flat, geometries: [] }; colors.set(key, bucket); }
    bucket.geometries.push(geometry);
  };
  const boxGeometry = (w: number, h: number, d: number, radius: number, segments = 2) => cached(`box/${w}/${h}/${d}/${radius}/${segments}`, () => new RoundedBoxGeometry(w, h, d, segments, Math.min(radius, w * .45, h * .45, d * .45)));
  const box = (parent: THREE.Group, size: [number, number, number], color: string, x: number, y: number, z: number, radius = .04, rz = 0) => add(parent, boxGeometry(...size, radius), color, x, y, z, false, rz);
  const oval = (parent: THREE.Group, size: [number, number, number], color: string, x: number, y: number, z: number) => {
    const g = cached(`oval/${size}`, () => new THREE.SphereGeometry(1, 16, 12).scale(size[0] / 2, size[1] / 2, size[2] / 2));
    add(parent, g, color, x, y, z);
  };
  const line = (parent: THREE.Group, name: string, points: number[][], radius: number, color: string) => {
    const g = cached(`line/${name}`, () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v => new THREE.Vector3(...v as [number, number, number]))), 10, radius, 5, false));
    add(parent, g, color, 0, 0, 0);
  };
  const hull = (parent: THREE.Group, name: string, points: number[][], color: string) => {
    const g = cached(`hull/${name}`, () => new ConvexGeometry(points.map(v => new THREE.Vector3(...v as [number, number, number]))));
    add(parent, g, color, 0, 0, 0, true);
  };
  const lock = (name: string, points: [number, number][], depth: number, z: number, color: string) => {
    const g = cached(`lock/${name}`, () => {
      const shape = new THREE.Shape(); shape.moveTo(...points[0]);
      for (let i = 1; i < points.length; i++) shape.lineTo(...points[i]); shape.closePath();
      const geometry = new THREE.ExtrudeGeometry(shape, {depth, bevelEnabled:true, bevelThickness:.025, bevelSize:.025, bevelSegments:1, steps:1, curveSegments:2});
      // Sweep the root back onto the scalp: the locks are volumes, not upright fins.
      const positions = geometry.getAttribute('position');
      for (let i = 0; i < positions.count; i++) positions.setZ(i, positions.getZ(i) - Math.max(0, positions.getY(i) - .55) * 1.1);
      geometry.computeVertexNormals(); return geometry;
    });
    add(head, g, color, 0, 0, z, true);
  };
  const broad = kind === 'wira' ? .07 : 0;
  const torso = group('torso', visual, 0, 1.34);
  const head = group('head', torso, 0, .79);
  const eyes = group('eyes', head, 0, .23, .405);

  // Soft jaw and broad cheeks: the head is wider than the jacket's central body.
  const face = cached(`head/${broad}`, () => {
    const g = new RoundedBoxGeometry(.96 + broad * .4, .86, .79, 3, .205);
    const positions = g.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      const jaw = y < -.10 ? 1 - Math.min(.11, (-y - .10) / .33 * .11) : 1;
      positions.setX(i, positions.getX(i) * jaw);
    }
    return g;
  });
  add(head, face, p.skin, 0, .18, 0);
  oval(head, [.27, .23, .29], p.skin, 0, -.23, 0);
  for (const side of [-1, 1]) {
    oval(head, [.19, .27, .19], p.skin, side * .493, .10, -.015);
    oval(head, [.09, .16, .035], p.ear, side * .535, .10, .079);
    oval(eyes, [.177, .225, .035], '#fff8e9', side * .20, 0, 0);
    oval(eyes, [.125, .180, .025], '#35271f', side * .20 + .009, -.012, .025);
    oval(eyes, [.030, .047, .014], '#fff8e9', side * .20 - .017, .038, .043);
    line(head, `brow/${side}`, [[side * .20 - .09, .411, .392], [side * .20 - .02, .435, .407], [side * .20 + .08, .420, .397]], .026, p.hair);
  }
  oval(head, [.116, .118, .137], p.skin, 0, .067, .409);
  line(head, 'smile', [[-.138, -.076, .376], [-.07, -.113, .398], [.036, -.119, .401], [.142, -.065, .373]], .013, '#895435');

  // An actual 3D scalp: the front hairline is high, sides/back wrap below the ears.
  const scalp = cached('hair/scalp', () => {
    const vertices: number[] = [], indices: number[] = [];
    const around = 16, rings = 5;
    for (let j = 0; j <= rings; j++) for (let i = 0; i <= around; i++) {
      const phi = i / around * Math.PI * 2;
      const front = Math.max(0, Math.sin(phi)), back = Math.max(0, -Math.sin(phi));
      const fraction = j / rings + .035 * Math.sin(phi * 3) * Math.sin(j / rings * Math.PI);
      const theta = fraction * (1.88 - front * .84 + back * .28);
      const facet = 1 + .018 * Math.cos(phi * 5);
      const rounded = (n: number, exponent: number) => Math.sign(n) * Math.pow(Math.abs(n), exponent);
      const ring = Math.pow(Math.sin(theta), .55);
      vertices.push(-rounded(Math.cos(phi),.55) * ring * .535 * facet, .24 + rounded(Math.cos(theta),.65) * .55, -.035 + rounded(Math.sin(phi),.55) * ring * .455 * facet);
      if (j < rings && i < around) {
        const a = j * (around + 1) + i, b = a + around + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); g.setIndex(indices); g.computeVertexNormals(); return g;
  });
  add(head, scalp, p.hair, 0, 0, 0, true);
  if (kind === 'explorer') {
    // Interlocking convex locks have depth and a swept silhouette from every side.
    hull(head, 'quiff-root', [[-.25,.69,-.25],[.22,.81,-.18],[.35,.80,.06],[.34,.68,.28],[-.04,.57,.36],[-.30,.61,.12]], p.hairLight);
    lock('quiff-left', [[-.06,.75],[-.37,.66],[-.50,.56],[-.46,.51],[-.12,.56],[.15,.68]], .14, .27, p.hair);
    lock('quiff-main', [[.30,.86],[.41,.76],[.34,.60],[.12,.53],[-.10,.51],[-.21,.53],[-.05,.62],[.09,.78]], .16, .31, p.hairLight);
    lock('quiff-tip', [[.36,.83],[.44,.71],[.35,.54],[.26,.49],[.18,.49],[.23,.65]], .11, .36, '#59402f');
    hull(head, 'temple-right', [[.41,.63,.03],[.53,.52,.10],[.56,.23,.14],[.43,.14,.23],[.35,.47,.28]], p.hair);
    hull(head, 'temple-left', [[-.44,.52,-.03],[-.54,.31,.00],[-.46,.12,.18],[-.36,.13,.21],[-.33,.43,.26]], p.hair);
    // Back plates prevent the rear silhouette from becoming a single blank cuboid.
    hull(head, 'hair-back-left', [[-.45,.42,-.38],[-.30,.66,-.36],[.0,.65,-.46],[.04,.26,-.57],[-.24,-.10,-.47],[-.46,.03,-.31]], '#493125');
    hull(head, 'hair-back-right', [[.03,.66,-.43],[.39,.55,-.36],[.48,.16,-.30],[.24,-.10,-.47],[.02,.26,-.58]], p.hair);
  } else if (kind === 'nara') {
    hull(head, 'teacher-sweep', [[.39,.79,-.06],[.47,.64,.18],[.29,.52,.45],[-.40,.52,.41],[-.38,.65,.13],[.0,.77,.06]], p.hairLight);
    oval(head, [.42, .37, .36], p.hair, .10, .54, -.49);
    // Wire frames leave the new oval eyes unobscured.
    for (const side of [-1, 1]) line(head, `glasses/${side}`, [[side*.20-.12,.23,.477],[side*.20-.10,.365,.477],[side*.20+.10,.365,.477],[side*.20+.12,.23,.477],[side*.20+.10,.10,.477],[side*.20-.10,.10,.477],[side*.20-.12,.23,.477]], .012, '#5f5354');
    line(head, 'glasses-bridge', [[-.07,.26,.480],[0,.28,.49],[.07,.26,.480]], .012, '#5f5354');
  } else {
    box(head, [1.04, .21, .86], '#657c59', 0, .75, -.035, .085);
    box(head, [1.10, .075, .98], '#8d9d6c', 0, .64, .045, .035);
    line(head, 'moustache', [[-.10,.004,.423],[0,.018,.446],[.10,.004,.423]], .018, p.hair);
  }

  const jacket = cached(`jacket/${broad}`, () => {
    const g = new RoundedBoxGeometry(.79 + broad, .79, .48, 2, .075);
    const positions = g.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i); const waist = 1 - .10 * (1 - Math.min(1, Math.abs(y) / .38));
      positions.setX(i, positions.getX(i) * waist);
    }
    return g;
  });
  add(torso, jacket, p.coat, 0, .15, 0);
  box(torso, [.46, .67, .10], p.shirt, 0, .18, .249, .035);
  box(torso, [.61 + broad, .24, .44], p.pants, 0, -.32, 0, .04);
  for (const side of [-1, 1]) {
    box(torso, [.175, .75, .12], p.coat, side * .307, .15, .258, .025, side * -.025);
    hull(torso, `collar/${side}`, [[side*.07,.53,.24],[side*.28,.60,.19],[side*.34,.45,.29],[side*.22,.40,.32],[side*.08,.53,.32]], p.coat);
  }
  box(torso, [.47, .115, .43], p.coat, 0, .545, -.015, .025);
  if (kind === 'explorer') {
    box(torso, [.67, .75, .35], p.bag, 0, .11, -.43, .125);
    box(torso, [.61, .19, .35], '#e9b65e', 0, .42, -.438, .065);
    box(torso, [.47, .30, .145], '#e4ac50', 0, -.075, -.658, .06);
    for (const side of [-1, 1]) {
      // Solid flat ribbon, curved over the shoulder rather than painted on the shirt.
      const strap = cached(`strap/${side}`, () => {
        const centers = [[side*.33,-.17,.345],[side*.35,.25,.35],[side*.35,.51,.27],[side*.34,.55,-.04],[side*.28,.45,-.32],[side*.25,.20,-.42]];
        const vertices: number[] = [], indices: number[] = [];
        for (let i = 0; i < centers.length; i++) {
          const c = new THREE.Vector3(...centers[i] as [number, number, number]);
          const tangent = new THREE.Vector3(...centers[Math.min(centers.length-1,i+1)] as [number, number, number]).sub(new THREE.Vector3(...centers[Math.max(0,i-1)] as [number, number, number])).normalize();
          const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(1,0,0)).normalize();
          for (const [dx, thickness] of [[-.055,-.023],[.055,-.023],[.055,.023],[-.055,.023]]) vertices.push(c.x+dx, c.y+normal.y*thickness, c.z+normal.z*thickness);
          if (i < centers.length-1) for (let s = 0; s < 4; s++) {
            const a = i*4+s,b = i*4+(s+1)%4; indices.push(a,b,a+4,b,b+4,a+4);
          }
        }
        indices.push(0,2,1,0,3,2,20,21,22,20,22,23);
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(vertices,3)); g.setIndex(indices); g.computeVertexNormals(); return g;
      });
      add(torso, strap, '#c59550', 0, 0, 0);
    }
  } else if (kind === 'nara') {
    box(torso, [.81, .34, .50], p.coat, 0, -.27, 0, .06);
    box(torso, [.65, .34, .43], p.pants, 0, -.48, 0, .04);
  } else {
    box(torso, [.26, .12, .06], p.cuff, -.25, .32, .328, .02);
  }
  const arm = (side: number): ArmRig => {
    const shoulder = group(side < 0 ? 'left-shoulder' : 'right-shoulder', torso, side * (.51 + broad / 2), .50);
    const elbow = group('elbow', shoulder, 0, -.40), hand = group('hand', elbow, 0, -.40);
    const toolSocket = group('tool-socket', hand, 0, -.04, .06);
    const sleeve = kind === 'wira' ? p.shirt : p.coat;
    box(shoulder, [.33, .44, .37], sleeve, 0, -.19, 0, .080);
    box(elbow, [.29, .35, .33], sleeve, 0, -.15, 0, .065);
    box(elbow, [.355, .145, .375], p.cuff, 0, -.285, .005, .035);
    box(hand, [.265, .285, .28], p.skin, 0, -.062, .012, .075);
    oval(hand, [.105, .18, .14], p.skin, -side*.116, -.012, .115);
    return { shoulder, elbow, hand, toolSocket };
  };
  const leg = (side: number): LegRig => {
    const hip = group(side < 0 ? 'left-hip' : 'right-hip', visual, side*.23, 1.08);
    const knee = group('knee', hip, 0, -.48), ankle = group('ankle', knee, 0, -.47);
    ankle.rotation.y = side * .04;
    box(hip, [.32, .49, .37], p.pants, 0, -.22, 0, .045);
    box(knee, [.30, .48, .34], p.pants, 0, -.215, .004, .04);
    box(ankle, [.325, .27, .35], p.boots, 0, .11, .025, .035);
    box(ankle, [.38, .205, .48], p.boots, 0, -.015, .15, .06);
    box(ankle, [.395, .067, .59], '#403c3a', 0, -.105, .10, .018);
    return { hip, knee, ankle };
  };
  const leftArm = arm(-1), rightArm = arm(1), leftLeg = leg(-1), rightLeg = leg(1);
  const notebook = group('notebook', leftArm.toolSocket);
  box(notebook, [.38,.48,.075], '#426f65', 0,-.10,.10,.015); box(notebook, [.32,.40,.04], '#f8edd4', 0,-.10,.15,.008);
  const meter = group('meter', rightArm.toolSocket);
  box(meter, [.25,.38,.19], '#e9b451', 0,-.02,.12,.035); box(meter, [.17,.14,.03], '#35595b', 0,.03,.23,.008);
  const sample = group('sample', rightArm.toolSocket);
  box(sample, [.22,.35,.22], '#7ca9ad', 0,-.04,.12,.03); box(sample, [.17,.07,.17], '#f0dfac', 0,.17,.12,.015); box(sample, [.15,.12,.025], '#f6ecd8', 0,-.02,.241,.005);
  notebook.visible = meter.visible = sample.visible = false;
  for (const [parent, colors] of batches) for (const b of colors.values()) {
    const mesh = new THREE.Mesh(mergeGeometries(b.geometries), surface(b.color,b.flat)); mesh.name = `${parent.name}-geometry`;
    parent.add(mesh); b.geometries.forEach(g => g.dispose());
  }
  const shadow = new THREE.Mesh(cached('shadow', () => new THREE.CircleGeometry(.67,24)), new THREE.MeshBasicMaterial({color:'#344b36',transparent:true,opacity:.17,depthWrite:false}));
  shadow.userData.sharedGeometry = true;
  shadow.rotation.x=-Math.PI/2; shadow.position.y=.092; shadow.scale.y=.72; root.add(shadow);
  const labelSocket = group('label-socket', root, 0, 3.60);
  if (placeId) root.traverse(child => { child.userData.place = placeId; });
  return { kind, root, visual, torso, head, eyes, leftArm, rightArm, leftLeg, rightLeg, labelSocket, tools: { notebook, meter, sample } };
}
