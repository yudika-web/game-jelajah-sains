import * as THREE from 'three';
import { greenhousePlaces } from '../data/greenhouseRegion';
import type { PlaceId } from '../data/content';
import { formatC, initialC, outsideC } from '../game/greenhouseModel';
import { EnvironmentKit } from './environmentKit';

export interface GreenhouseVisual {
  shade: boolean;
  vent: boolean;
  unlocked: boolean;
  borrowed: boolean;
  checked: boolean;
  temperature: number;
}
const metal = '#366052';
const gold = '#dfae52';
const face = '#133d3d';

export function buildGreenhouse(root: THREE.Group, label: (text: string, x: number, y: number, z: number, id: PlaceId) => void) {
  const group = new THREE.Group();
  group.name = 'm03-greenhouse';
  root.add(group);
  const env = new EnvironmentKit(group);
  const block = (parent: THREE.Group, size: [number, number, number], color: string, at: [number, number, number]) =>
    env.liveBox(parent, ...size, color, ...at);
  function station(id: PlaceId, x: number, y: number, z: number) {
    const object = new THREE.Group();
    object.name = `object-${id}`;
    object.position.set(x, y, z);
    group.add(object);
    return object;
  }
  const tag = (object: THREE.Object3D, id: PlaceId) => object.traverse(mesh => { mesh.userData.place = id; });

  env.book('heatBook', -9, -2.65, '#46829c');
  env.book('heatNotes', -12, -4.25, '#b48448', true);
  env.table(-13, -.75);
  env.sign('ACUAN 30 °C', -13, .72, -.40, 1.4);

  function screen(parent: THREE.Group, w: number, h: number, at: [number, number, number]) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 96;
    const ctx = canvas.getContext('2d')!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const surface = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({map: texture}));
    surface.position.set(...at);
    parent.add(surface);
    let previous = '';
    return (value: string) => {
      if (previous === value) return;
      previous = value;
      ctx.fillStyle = face; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#e8ffcf'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold 54px sans-serif'; ctx.fillText(value, 128, 49);
      texture.needsUpdate = true;
    };
  }
  const instrument = station('heatMeter', -13, 1.17, -.69);
  block(instrument, [.40, .60, .18], gold, [0, 0, 0]);
  block(instrument, [.08, .28, .08], metal, [0, .38, 0]);
  block(instrument, [.09, .08, .04], face, [0, -.15, .09]);
  const instrumentScreen = screen(instrument, .34, .14, [0, .09, .096]);
  instrument.rotation.x = -.27;
  tag(instrument, 'heatMeter');

  const rack = station('heatShade', -14.05, 0, -6.8);
  for (const x of [-.55, .55]) block(rack, [.14, 1.5, .52], metal, [x, .75, 0]);
  for (const y of [.35, .95, 1.49]) block(rack, [1.26, .09, .63], '#bdaa7d', [0, y, 0]);
  const roll = block(rack, [1.04, .22, .45], '#527038', [0, 1.13, 0]);
  tag(rack, 'heatShade');

  const shade = station('heatShade', -10, 3.97, -9);
  block(shade, [.15, .12, 5.55], metal, [0, 0, 0]);
  const sheets = [-1, 1].map(side => {
    const sheet = new THREE.Group();
    sheet.position.x = side * .08;
    sheet.rotation.z = -side * .35;
    shade.add(sheet);
    block(sheet, [3.06, .045, 5.53], '#5c7138', [side * 1.53, .03, 0]);
    for (const z of [-2.71, 0, 2.71]) block(sheet, [3.08, .06, .09], '#a7b36c', [side * 1.54, .065, z]);
    return sheet;
  });
  tag(shade, 'heatShade');

  // Viewer faces the front of the nursery. The hinged panel occupies one bay.
  const vent = station('heatVent', -8.15, 2.52, -6.37);
  block(vent, [1.68, .14, .24], metal, [0, 0, 0]);
  for (const x of [-.82, .82]) block(vent, [.11, 1.09, .14], metal, [x, -.51, -.04]);
  block(vent, [1.68, .10, .18], metal, [0, -1.06, 0]);
  const flap = new THREE.Group();
  vent.add(flap);
  for (const y of [-.16, -.35, -.54, -.73, -.92]) {
    block(flap, [1.53, .135, .095], '#86a68d', [0, y, .04]);
  }
  const latch = block(vent, [.13, .38, .10], gold, [0, -1.02, .16]);
  const arrows = new THREE.Group();
  group.add(arrows);
  for (const [x, direction, color] of [[-8.47, -1, '#286860'], [-7.83, 1, '#8e5e29']] as const) {
    const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, direction), new THREE.Vector3(x, 1.52, -5.56 - direction * .46), .94, color, .27, .18);
    arrows.add(arrow);
  }
  tag(vent, 'heatVent');

  function probe(id: 'heatInside' | 'heatOutside', x: number, z: number, short: string) {
    const stand = station(id, x, 0, z);
    block(stand, [.29, .09, .3], metal, [0, .09, 0]);
    block(stand, [.08, 1.28, .08], metal, [0, .68, 0]);
    block(stand, [.29, .36, .23], gold, [0, 1.28, 0]);
    const reading = screen(stand, .48, .20, [0, 1.54, .13]);
    env.sign(short, x, .99, z + .17, .8);
    tag(stand, id);
    return reading;
  }
  const inside = probe('heatInside', -10.7, -7.12, 'DALAM');
  const outside = probe('heatOutside', -5.9, -8.25, 'LUAR');
  for (const p of greenhousePlaces) label(p.short, p.x, p.id === 'heatVent' ? 3.12 : p.id === 'heatInside' ? 2.56 : 2.05, p.z, p.id);
  env.finish();

  let lastTemperature = NaN;
  let lastChecked: boolean | undefined;
  let reading = '—';
  return {
    update(state: GreenhouseVisual, reducedMotion: boolean, dt: number) {
      instrument.visible = !state.borrowed;
      if (state.checked !== lastChecked || state.temperature !== lastTemperature) {
        lastTemperature = state.temperature;
        lastChecked = state.checked;
        reading = state.checked ? formatC(state.temperature) : '—';
        instrumentScreen(state.checked ? formatC(initialC) : '—');
        inside(reading);
        outside(state.checked ? formatC(outsideC) : '—');
      }
      roll.visible = !state.shade;
      shade.visible = state.shade;
      const angle = state.vent ? -Math.PI * .41 : 0;
      const spread = state.shade ? 1 : .05;
      if (!state.shade) sheets.forEach(sheet => { sheet.scale.x = .05; });
      const blend = reducedMotion || !dt ? 1 : 1 - Math.exp(-10 * dt);
      if (dt || reducedMotion) {
        sheets.forEach(sheet => { sheet.scale.x = THREE.MathUtils.lerp(sheet.scale.x, spread, blend); });
        flap.rotation.x = THREE.MathUtils.lerp(flap.rotation.x, angle, blend);
        latch.rotation.z = THREE.MathUtils.lerp(latch.rotation.z, state.unlocked ? Math.PI / 2 : 0, blend);
      }
      arrows.visible = state.vent && flap.rotation.x < -.5;
    },
    get flapAngle() { return flap.rotation.x; },
    get insideReading() { return reading; },
  };
}
