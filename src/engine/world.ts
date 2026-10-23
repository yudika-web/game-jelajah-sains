import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { places, type PlaceId } from '../data/content';
import { findPath, obstacles, walkable, type Point } from './navigation';

export type InputMode = 'laptop' | 'hp' | 'ifp';
export class World {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(48, 1, 0.1, 110);
  readonly renderer: THREE.WebGLRenderer;
  readonly player = new THREE.Group();
  readonly position = new THREE.Vector3(-1, 0, 6);
  readonly canvas: HTMLCanvasElement;
  mode: InputMode = 'laptop';
  paused = true;
  reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  move = { x: 0, z: 0 };
  yaw = 0.25;
  pitch = 0.64;
  path: Point[] = [];
  onArrive: (() => void) | null = null;
  onUpdate: (near: PlaceId | null) => void = () => {};
  private limbs: THREE.Group[] = [];
  private ray = new THREE.Raycaster();
  private target = new THREE.Vector3();
  private marker: THREE.Mesh;
  private barrier: THREE.Group;
  private staticGeometry = new Map<number, THREE.BufferGeometry[]>();
  private collisionBoxes: THREE.Box3[] = [];
  private clock = new THREE.Clock();
  private lastNear: PlaceId | null | undefined;
  private elapsed = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.scene.background = new THREE.Color('#d9e9e3');
    this.scene.fog = new THREE.Fog('#d9e9e3', 48, 100);
    this.scene.add(new THREE.HemisphereLight('#fff9e8', '#6b9274', 1.6));
    const sun = new THREE.DirectionalLight('#fff0cf', 2.2);
    sun.position.set(-15, 25, 10); this.scene.add(sun);
    this.buildTown();
    this.player.add(this.avatar('#28786e', '#e6af83', true));
    this.scene.add(this.player);
    this.marker = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.5, 24), new THREE.MeshBasicMaterial({ color: '#f9c76b', side: THREE.DoubleSide }));
    this.marker.rotation.x = -Math.PI / 2; this.marker.visible = false; this.scene.add(this.marker);
    this.barrier = new THREE.Group();
    for (let i = 0; i < 6; i++) this.box(this.barrier, 0.9, 0.65, 0.55, '#92724b', 6 + (i % 3) * 0.75, 0.35 + Math.floor(i / 3) * 0.55, -10.7);
    this.barrier.visible = false; this.scene.add(this.barrier);
    this.flushStatic();
    this.positionCamera(true);
    this.resize();
    addEventListener('resize', () => this.resize());
    this.renderer.setAnimationLoop(() => this.frame());
    canvas.dataset.ready = 'true';
  }
  private box(parent: THREE.Group | THREE.Scene, w: number, h: number, d: number, color: string, x: number, y: number, z: number, staticMesh = false) {
    const geometry = new THREE.BoxGeometry(w, h, d);
    if (staticMesh) {
      geometry.translate(x, y, z);
      const c = new THREE.Color(color).getHex();
      const bucket = this.staticGeometry.get(c) ?? [];
      bucket.push(geometry); this.staticGeometry.set(c, bucket);
      return;
    }
    const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color }));
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  private flushStatic() {
    for (const [color, geometries] of this.staticGeometry) {
      const geometry = mergeGeometries(geometries);
      this.scene.add(new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color })));
      geometries.forEach(g => g.dispose());
    }
    this.staticGeometry.clear();
  }
  private label(text: string, x: number, y: number, z: number, id?: PlaceId, building = false) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 96;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = building ? '#244b42ee' : '#fffdf3f2';
    ctx.beginPath(); ctx.roundRect(4, 4, 504, 88, 24); ctx.fill();
    ctx.fillStyle = building ? '#fff9e6' : '#244b42';
    ctx.font = '600 30px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 49);
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: true, toneMapped: false }));
    sprite.position.set(x, y, z); sprite.scale.set(3.5, 0.66, 1);
    sprite.userData.place = id; this.scene.add(sprite);
  }
  private avatar(shirt: string, skin: string, animate = false) {
    const group = new THREE.Group();
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.65, 20), new THREE.MeshBasicMaterial({ color: '#344b36', transparent: true, opacity: 0.17, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.115; shadow.scale.y = 0.7; group.add(shadow);
    this.box(group, 0.64, 0.8, 0.38, shirt, 0, 1.15, 0);
    this.box(group, 0.55, 0.55, 0.52, skin, 0, 1.85, 0);
    this.box(group, 0.59, 0.17, 0.56, '#3b3433', 0, 2.12, 0);
    // Face points toward +z, matching the movement heading.
    this.box(group, 0.07, 0.07, 0.025, '#293932', -0.13, 1.89, 0.27);
    this.box(group, 0.07, 0.07, 0.025, '#293932', 0.13, 1.89, 0.27);
    for (const side of [-1, 1]) {
      const arm = new THREE.Group(); arm.position.set(side * 0.47, 1.49, 0);
      this.box(arm, 0.23, 0.65, 0.3, shirt, 0, -0.25, 0);
      this.box(arm, 0.23, 0.23, 0.3, skin, 0, -0.65, 0);
      group.add(arm);
      const leg = new THREE.Group(); leg.position.set(side * 0.18, 0.78, 0);
      this.box(leg, 0.26, 0.65, 0.33, '#344b56', 0, -0.28, 0);
      this.box(leg, 0.29, 0.17, 0.45, '#eee9d9', 0, -0.62, 0.05);
      group.add(leg);
      if (animate) this.limbs.push(arm, leg);
    }
    if (animate) {
      this.box(group, 0.48, 0.6, 0.2, '#e7b65c', 0, 1.15, -0.29);
      this.box(group, 0.3, 0.18, 0.1, '#cc9847', 0, 1.05, -0.43);
    }
    return group;
  }
  private buildTown() {
    const s = this.scene;
    const b = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) => this.box(s, w, h, d, c, x, y, z, true);
    b(50, 0.9, 48, '#7da57c', 0, -0.5, 0);
    b(32, 0.08, 5, '#dfd7ba', -3, 0.01, 2);
    b(5, 0.09, 33, '#dfd7ba', 0, 0.02, 0);
    b(16, 0.1, 12, '#e8e0c8', -2, 0.03, 3);
    // Tile seams, school steps, and riverbank.
    for (let i = -8; i < 6; i += 2) b(0.035, 0.015, 11.8, '#cfc6ac', i, 0.095, 3);
    b(2, 0.15, 36, '#d5c89f', 10.6, 0.02, 0);
    b(5, 0.16, 42, '#509caa', 14, -0.01, 0);
    for (let i = -20; i < 20; i += 2) {
      b(0.7, 0.035, 0.08, '#8dc4c8', 13 + Math.sin(i) * 0.8, 0.09, i);
      b(0.6, 0.4, 1.2, '#bcb69f', 11.8, 0.1, i);
    }
    b(5, 0.07, 9, '#bb9570', 8.7, 0.02, -11);
    for (let i = 0; i < 5; i++) b(2.2, 0.05, 0.12, '#987557', 8.4, 0.08, -14 + i * 1.4);
    const buildings = [
      { x: -9, z: -9, w: 8, d: 6, h: 4.2, color: '#f0dfb4', roof: '#587d6d', label: 'SEKOLAH SAINS' },
      { x: -12, z: 6, w: 5, d: 5, h: 3.3, color: '#f1c2a4', roof: '#bd7359', label: 'RUMAH WARGA' },
      { x: -5, z: 13, w: 5, d: 4, h: 3.4, color: '#c5d6d3', roof: '#587d6d', label: 'LABORATORIUM' },
      { x: 2, z: -13, w: 4, d: 4, h: 3.2, color: '#e1d8b9', roof: '#b38a52', label: 'POS PENGAMATAN' },
    ];
    for (const house of buildings) {
      b(house.w, house.h, house.d, house.color, house.x, house.h / 2, house.z);
      b(house.w + 0.55, 0.5, house.d + 0.55, house.roof, house.x, house.h + 0.12, house.z);
      b(house.w + 0.15, 0.2, house.d + 0.15, '#f7eed4', house.x, house.h - 0.4, house.z);
      b(1.1, 2.1, 0.12, '#5b6b5e', house.x, 1.05, house.z + house.d / 2 + 0.08);
      for (const dx of [-house.w * 0.3, house.w * 0.3]) {
        b(1.15, 1.25, 0.16, '#f7f1dd', house.x + dx, 2.1, house.z + house.d / 2 + 0.1);
        b(0.89, 0.99, 0.18, '#739da4', house.x + dx, 2.1, house.z + house.d / 2 + 0.12);
        b(0.07, 1, 0.2, '#e9e4d3', house.x + dx, 2.1, house.z + house.d / 2 + 0.15);
      }
      this.label(house.label, house.x, house.h + 1, house.z, undefined, true);
      this.collisionBoxes.push(new THREE.Box3(new THREE.Vector3(house.x - house.w / 2 - 0.3, 0, house.z - house.d / 2 - 0.3), new THREE.Vector3(house.x + house.w / 2 + 0.3, house.h + 0.5, house.z + house.d / 2 + 0.3)));
    }
    // Repeated trees are merged per material to keep the scene inexpensive.
    for (const [x, z] of [[-16, -14], [-16, -2], [-16, 13], [-9, 14], [5, 13], [7, 7], [5, -8], [-5, -16], [-17, 4], [19, -10], [19, 2], [19, 12], [-7, -1]]) {
      b(0.45, 2.4, 0.45, '#957858', x, 1.1, z);
      b(2.3, 2.4, 2.3, '#548260', x, 3, z);
      b(1.6, 1.1, 1.6, '#73965f', x + 0.35, 4.3, z);
    }
    // Planters and benches decorate the edges, leaving main navigation open.
    for (const [x, z] of [[-6, 7], [4, 1], [-3, -3]]) {
      b(1.8, 0.3, 0.7, '#a97b4f', x, 0.65, z);
      b(1.8, 0.8, 0.18, '#a97b4f', x, 1.0, z - 0.35);
      for (const dx of [-0.65, 0.65]) b(0.14, 0.6, 0.55, '#525c4f', x + dx, 0.3, z);
    }
    for (const place of places) {
      if (place.id === 'nara' || place.id === 'warga') {
        const npc = this.avatar(place.color, place.id === 'nara' ? '#be885f' : '#d9a276');
        npc.position.set(place.x, 0, place.z); npc.userData.place = place.id;
        npc.traverse(child => { child.userData.place = place.id; });
        s.add(npc);
      } else if (place.id === 'sampleA' || place.id === 'sampleB') {
        b(1.1, 0.15, 1.4, '#d2ba8b', place.x, 0.14, place.z);
        b(0.4, 0.6, 0.4, place.color, place.x, 0.55, place.z);
        b(0.28, 0.12, 0.28, '#f1efdb', place.x, 0.91, place.z);
      } else {
        b(0.15, 1.3, 0.15, '#8b7356', place.x, 0.65, place.z);
        b(1.4, 0.9, 0.15, place.color, place.x, 1.4, place.z);
        if (place.id === 'book') b(0.7, 0.12, 0.6, '#f9ecd2', place.x, 1.92, place.z);
      }
      const disc = new THREE.Mesh(new THREE.RingGeometry(0.65, 0.77, 28), new THREE.MeshBasicMaterial({ color: place.color, side: THREE.DoubleSide }));
      disc.rotation.x = -Math.PI / 2; disc.position.set(place.x, 0.13, place.z); s.add(disc);
      this.label(place.short, place.x, place.id === 'nara' || place.id === 'warga' ? 2.8 : 2.4, place.z, place.id);
    }
    // Stylized distant hills, all local geometry.
    for (let i = 0; i < 7; i++) {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(8 + i % 3, 9 + i % 4, 4), new THREE.MeshLambertMaterial({ color: i % 2 ? '#97b49a' : '#abc1a2' }));
      hill.position.set(-35 + i * 12, 2, -33); s.add(hill);
    }
  }
  goTo(p: Point, onArrive?: () => void) {
    const path = findPath(this.position, p);
    if (!path.length) return false;
    this.path = path; this.onArrive = onArrive ?? null;
    this.marker.position.set(p.x, 0.15, p.z); this.marker.visible = true;
    return true;
  }
  stop() { this.move = { x: 0, z: 0 }; this.path = []; this.marker.visible = false; this.onArrive = null; }
  resetPosition() { this.stop(); this.position.set(-1, 0, 6); this.yaw = 0.25; this.pitch = 0.64; this.positionCamera(true); }
  resetCamera() { this.yaw = 0.25; this.pitch = 0.64; }
  setTrial(done: boolean) { this.barrier.visible = done; }
  pick(clientX: number, clientY: number): { place?: PlaceId; point?: Point } {
    const rect = this.canvas.getBoundingClientRect();
    this.ray.setFromCamera(new THREE.Vector2((clientX - rect.left) / rect.width * 2 - 1, -(clientY - rect.top) / rect.height * 2 + 1), this.camera);
    const objects = this.ray.intersectObjects(this.scene.children, true);
    const hit = objects.find(o => o.object.userData.place);
    if (hit) return { place: hit.object.userData.place as PlaceId };
    const point = this.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), new THREE.Vector3());
    return point && walkable(point) ? { point: { x: point.x, z: point.z } } : {};
  }
  nearest(): PlaceId | null {
    const place = [...places].sort((a, b) => Math.hypot(a.x - this.position.x, a.z - this.position.z) - Math.hypot(b.x - this.position.x, b.z - this.position.z))[0];
    return Math.hypot(place.x - this.position.x, place.z - this.position.z) < 2.6 ? place.id : null;
  }
  private resize() {
    this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
  }
  private positionCamera(immediate = false, dt = 0.016) {
    this.target.copy(this.position).add(new THREE.Vector3(0, 1.15, 0));
    const distance = innerWidth < 700 ? 17 : 18;
    const offset = new THREE.Vector3(Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), Math.cos(this.yaw) * Math.cos(this.pitch));
    // Clip the camera ray before opaque buildings; never put the camera through a wall.
    const ray = new THREE.Ray(this.target, offset);
    let safeDistance = distance;
    for (const box of this.collisionBoxes) {
      const point = ray.intersectBox(box, new THREE.Vector3());
      if (point) safeDistance = Math.min(safeDistance, Math.max(0.6, point.distanceTo(this.target) - 0.35));
    }
    const desired = this.target.clone().addScaledVector(offset, safeDistance);
    this.camera.position.lerp(desired, immediate || this.reducedMotion || safeDistance < distance ? 1 : 1 - Math.exp(-9 * dt));
    this.camera.lookAt(this.target);
  }
  private frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05); this.elapsed += dt;
    let dx = 0, dz = 0;
    if (!this.paused) {
      if (Math.hypot(this.move.x, this.move.z) > 0.05) {
        this.path = []; this.onArrive = null; this.marker.visible = false;
        dx = this.move.x * Math.cos(this.yaw) + this.move.z * Math.sin(this.yaw);
        dz = -this.move.x * Math.sin(this.yaw) + this.move.z * Math.cos(this.yaw);
      } else if (this.path.length) {
        const next = this.path[0]; const distance = Math.hypot(next.x - this.position.x, next.z - this.position.z);
        if (distance < 0.16) this.path.shift();
        else { dx = (next.x - this.position.x) / distance; dz = (next.z - this.position.z) / distance; }
        if (!this.path.length) { this.marker.visible = false; const arrive = this.onArrive; this.onArrive = null; arrive?.(); }
      }
      const magnitude = Math.hypot(dx, dz);
      if (magnitude > 1) { dx /= magnitude; dz /= magnitude; }
      const speed = 4.6 * dt;
      if (walkable({ x: this.position.x + dx * speed, z: this.position.z })) this.position.x += dx * speed;
      if (walkable({ x: this.position.x, z: this.position.z + dz * speed })) this.position.z += dz * speed;
      if (magnitude > 0.05) this.player.rotation.y = Math.atan2(dx, dz);
    }
    this.player.position.copy(this.position);
    this.limbs.forEach((limb, index) => { limb.rotation.x = this.paused || this.reducedMotion ? 0 : Math.sin(this.elapsed * 10) * Math.min(1, Math.hypot(dx, dz)) * (index === 0 || index === 3 ? 0.55 : -0.55); });
    this.positionCamera(false, dt);
    const nearest = this.nearest();
    if (nearest !== this.lastNear) { this.lastNear = nearest; this.onUpdate(nearest); }
    this.canvas.dataset.x = this.position.x.toFixed(2); this.canvas.dataset.z = this.position.z.toFixed(2);
    this.canvas.dataset.near = nearest ?? ''; this.canvas.dataset.moving = String(this.path.length > 0);
    this.renderer.render(this.scene, this.camera);
  }
}
