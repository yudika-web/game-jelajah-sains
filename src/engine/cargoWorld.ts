import * as THREE from 'three';
import { cargoBay, cargoDepot, cargoDistance, cargoFinish, cargoFoot, cargoPackageId, cargoPlaces, cargoRoutes, cargoStart, cargoWidth } from '../data/cargoRegion';
import type { Point } from './navigation';
import { EnvironmentKit } from './environmentKit';
import type { CargoController } from './cargoController';

const laneColor = { A: '#a59367', B: '#77989a' };

export function buildCargoWorld(parent: THREE.Group) {
  const env = new EnvironmentKit(parent);
  const flat = (a: Point, b: Point, width: number, color: string, y: number) => {
    env.box(width, .024, cargoDistance(a, b) + width * .62, color, (a.x + b.x) / 2, y, (a.z + b.z) / 2,
      0, Math.atan2(b.x - a.x, b.z - a.z));
  };
  for (const route of ['B', 'A'] as const) {
    const points = cargoRoutes[route].points;
    for (let i = 1; i < points.length; i++) {
      const width = route === 'A' && i >= 3 && i < points.length - 2 ? 2.62 : 3.3;
      flat(points[i - 1], points[i], width, laneColor[route], route === 'A' ? .107 : .079);
    }
  }
  const checkpointMarks = new Map<string, Point>();
  for (const { points } of Object.values(cargoRoutes)) {
    for (const p of points.slice(2, -2)) checkpointMarks.set(`${p.x},${p.z}`, p);
  }
  for (const p of checkpointMarks.values()) env.box(.42, .022, .42, '#f1e1a7', p.x, .135, p.z, 0, Math.PI / 4);
  env.box(2.4, .022, 3.1, '#d9bc74', cargoDepot.x, .13, cargoDepot.z);
  env.box(2.7, .022, 2.5, '#b7c58a', cargoBay.x, .13, cargoBay.z);
  for (const p of Object.values(cargoFoot)) {
    env.box(.79, .025, .78, '#f0dfa1', p.x, .136, p.z);
    env.box(.56, .025, .54, '#9fa578', p.x, .149, p.z);
  }
  for (const [p, axis, name] of [[cargoStart, 'x', 'MULAI'], [cargoFinish, 'z', 'SELESAI']] as const) {
    const alongX = axis === 'x';
    env.box(alongX ? .16 : 2.8, .03, alongX ? 2.8 : .16, '#fff0bb', p.x, .143, p.z);
    for (const side of [-1, 1]) env.box(.14, .9, .14, '#eed6a1', p.x + (alongX ? 0 : side * 1.65), .45, p.z + (alongX ? side * 1.65 : 0));
    env.sign(name, p.x + (alongX ? 0 : -1.6), 1.12, p.z + (alongX ? 1.56 : 0), 1.05);
  }
  env.sign('A · SEMPIT', -11.2, .70, 16.05, 1.65);
  env.sign('B · LAPANG', -9.8, .70, 21.6, 1.65);
  env.sign('PARKIR DERMAGA', cargoBay.x - 1.25, .65, cargoBay.z - .25, 1.8);
  for (const p of cargoPlaces) {
    if (p.id !== 'cargoDepot') env.book(p.id, p.x, p.z - .55, p.color, p.id === 'cargoNotes');
  }
  const truck = new THREE.Group();
  truck.name = 'm04-cargo-vehicle';
  env.root.add(truck);
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    env.liveBox(truck, w, h, d, color, x, y, z);
  box(1.36, .22, 2.48, '#526c6a', 0, .40, 0);
  box(cargoWidth + .04, .38, .53, '#e3a84d', 0, .63, .92);
  box(1.28, .23, 1.02, '#d59140', 0, .60, -.76);
  for (const x of [-.60, .60]) box(.10, .30, 1.05, '#dfaa64', x, .85, -.74);
  box(1.26, .32, .10, '#dfaa64', 0, .86, -1.24);
  box(.58, .16, .48, '#30514f', 0, .74, .02);
  box(.58, .40, .12, '#3c5c58', 0, .92, -.23);
  box(.08, .32, .10, '#374d51', 0, .83, .63);
  for (const x of [-.43, .43]) {
    box(.26, .16, .046, '#f6e6a4', x, .68, 1.198);
    box(.17, .12, .053, '#b84f3f', x, .55, -1.25);
  }
  box(.68, .09, .035, '#fff2cb', 0, .76, 1.208);
  const steering = new THREE.Group();
  steering.position.set(0, .995, .60);
  truck.add(steering);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.17, .032, 5, 12), env.mat('#263e46'));
  steering.add(rim);
  env.liveBox(steering, .34, .045, .04, '#405862', 0, 0, 0);
  const tire = new THREE.CylinderGeometry(.31, .31, .22, 12).rotateZ(Math.PI / 2);
  const hub = new THREE.CylinderGeometry(.125, .125, .238, 8).rotateZ(Math.PI / 2);
  const wheels = [-.69, .69].flatMap(x => [-.82, .82].map(z => {
    const axle = new THREE.Group(), spin = new THREE.Group();
    axle.position.set(x, .32, z);
    truck.add(axle);
    axle.add(spin);
    spin.add(new THREE.Mesh(tire, env.mat('#253b3e')), new THREE.Mesh(hub, env.mat('#b4baac')));
    env.liveBox(spin, .247, .05, .105, '#d9bc74', 0, .23, .04);
    return { axle, spin, front: z > 0 };
  }));
  const crate = (frame: THREE.Group, color: string, x: number, y: number, z: number) => {
    const packageView = new THREE.Group();
    frame.add(packageView);
    packageView.position.set(x, y, z);
    env.liveBox(packageView, .65, .47, .60, color, 0, .235, 0);
    for (const band of [-.214, .214]) env.liveBox(packageView, .060, .488, .615, '#eee0a7', band, .235, 0);
    env.liveBox(packageView, .23, .15, .018, '#f5ead0', 0, .24, .307);
    return packageView;
  };
  const load = crate(truck, '#7f9fa3', 0, .73, -.77);
  const dispatch = crate(env.root, '#bd724a', cargoDepot.x - 1.34, .01, cargoDepot.z + 1.32);
  const receipt = crate(env.root, '#bd724a', -6.7, .01, 9.35);
  env.sign(cargoPackageId, cargoDepot.x - 1.23, .66, cargoDepot.z + 1.73, 1.85);
  const arrows = new THREE.Group();
  truck.add(arrows);
  const drive = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(.76, .54, 0), 1, '#2b7957', .23, .20);
  const drag = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(-.76, .54, 0), 1, '#ad6343', .23, .20);
  arrows.add(drive, drag);
  env.finish();
  let tagged = false;
  return {
    update(cargo: CargoController, delivered: boolean) {
      const atDepot = cargo.parked === 'depot' && !cargo.aboard;
      if (atDepot !== tagged) {
        truck.traverse(node => { node.userData.place = atDepot ? 'cargoDepot' : undefined; });
        tagged = atDepot;
      }
      truck.position.set(cargo.position.x, .11, cargo.position.z);
      truck.rotation.y = cargo.yaw;
      for (const w of wheels) {
        w.spin.rotation.x = cargo.wheel % (2 * Math.PI);
        w.axle.rotation.y = w.front ? -cargo.steer : 0;
      }
      steering.rotation.z = cargo.steer * 1.45;
      const task = cargo.run ?? cargo.staged;
      load.visible = !!task && !(delivered && task.kind === 'delivery') && task.kind !== 'practice';
      const color = task?.kind === 'delivery' ? '#bd724a' : '#7f9fa3';
      (load.children[0] as THREE.Mesh).material = env.mat(color);
      dispatch.visible = !delivered && task?.kind !== 'delivery';
      receipt.visible = delivered;
      arrows.visible = cargo.aboard && Math.abs(cargo.steer) < .05 && cargo.forces.contact === 0;
      drive.visible = cargo.forces.drive > .01;
      drag.visible = cargo.forces.drag + cargo.forces.brake > .01;
      if (drive.visible) drive.setLength(.35 + Math.min(1.2, cargo.forces.drive / 500), .23, .20);
      if (drag.visible) drag.setLength(.35 + Math.min(1.2, (cargo.forces.drag + cargo.forces.brake) / 500), .23, .20);
    },
  };
}
