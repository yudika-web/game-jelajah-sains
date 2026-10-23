import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { places, type PlaceId } from '../data/content';
import { findPath, walkable, type Point } from './navigation';
import { createCharacter, type CharacterRig } from './character';
import { CharacterAnimator, turnToward, type InteractionPose } from './characterAnimator';
import { FollowCamera, type CameraDistance } from './cameraController';

export type InputMode = 'laptop' | 'hp' | 'ifp';
export class World {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(48, 1, 0.1, 110);
  readonly renderer: THREE.WebGLRenderer;
  readonly playerRig = createCharacter('explorer');
  readonly player = this.playerRig.root;
  readonly playerAnimator = new CharacterAnimator(this.playerRig);
  readonly position = new THREE.Vector3(-1, 0, 6);
  readonly canvas: HTMLCanvasElement;
  mode: InputMode = 'laptop';
  paused = true;
  reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  move = { x: 0, z: 0 };
  readonly followCamera: FollowCamera;
  get yaw() { return this.followCamera.yaw; }
  set yaw(value: number) { this.followCamera.yaw = value; }
  get pitch() { return this.followCamera.pitch; }
  set pitch(value: number) { this.followCamera.pitch = value; }
  get cameraDistance(): CameraDistance { return this.followCamera.distance; }
  set cameraDistance(value: CameraDistance) { this.followCamera.distance = value; }
  path: Point[] = [];
  onArrive: (() => void) | null = null;
  onUpdate: (near: PlaceId | null) => void = () => {};
  private npcs: { id: PlaceId; rig: CharacterRig; animator: CharacterAnimator; timer: number }[] = [];
  private ray = new THREE.Raycaster();
  private marker: THREE.Mesh;
  private barrier: THREE.Group;
  private staticGeometry = new Map<number, THREE.BufferGeometry[]>();
  private collisionBoxes: THREE.Box3[] = [];
  private clock = new THREE.Clock();
  private lastNear: PlaceId | null | undefined;
  private elapsed = 0;
  private facing = 0;
  private interacting: PlaceId | null = null;
  private npcLabelPosition = new THREE.Vector3();
  private metricsTimer = 0;
  private movementPoint = { x: 0, z: 0 };

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
    this.followCamera = new FollowCamera(this.camera, this.collisionBoxes);
    this.player.position.copy(this.position);
    this.scene.add(this.player);
    this.marker = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.5, 24), new THREE.MeshBasicMaterial({ color: '#f9c76b', side: THREE.DoubleSide }));
    this.marker.rotation.x = -Math.PI / 2; this.marker.visible = false; this.scene.add(this.marker);
    this.barrier = new THREE.Group();
    for (let i = 0; i < 6; i++) this.box(this.barrier, 0.9, 0.65, 0.55, '#92724b', 6 + (i % 3) * 0.75, 0.35 + Math.floor(i / 3) * 0.55, -10.7);
    this.barrier.visible = false; this.scene.add(this.barrier);
    this.flushStatic();
    this.resize();
    this.followCamera.update(this.position, .016, this.reducedMotion, true);
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
    sprite.userData.place = id; this.scene.add(sprite); return sprite;
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
      this.collisionBoxes.push(new THREE.Box3(new THREE.Vector3(house.x - house.w / 2, 0, house.z - house.d / 2), new THREE.Vector3(house.x + house.w / 2, house.h + 0.5, house.z + house.d / 2)));
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
        const rig = createCharacter(place.id === 'nara' ? 'nara' : 'wira', place.id);
        rig.root.position.set(place.x, 0, place.z);
        this.npcs.push({ id: place.id, rig, animator: new CharacterAnimator(rig, place.id === 'nara' ? 1.3 : 3.8), timer: 0 });
        s.add(rig.root);
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
      const npc = this.npcs.find(n => n.id === place.id);
      if (npc) {
        npc.rig.root.updateMatrixWorld(true);
        npc.rig.labelSocket.getWorldPosition(this.npcLabelPosition);
        this.label(place.short, place.x, this.npcLabelPosition.y, place.z, place.id);
      } else this.label(place.short, place.x, 2.4, place.z, place.id);
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
    this.endInteraction(); this.path = path; this.onArrive = onArrive ?? null;
    this.marker.position.set(p.x, 0.15, p.z); this.marker.visible = true;
    return true;
  }
  stop() { this.move = { x: 0, z: 0 }; this.path = []; this.marker.visible = false; this.onArrive = null; }
  resetPosition() { this.stop(); this.endInteraction(); this.position.set(-1, 0, 6); this.facing = 0; this.followCamera.reset(); this.followCamera.update(this.position, .016, this.reducedMotion, true); }
  resetCamera() { this.followCamera.reset(); }
  facePoint(p: Point) { this.facing = Math.atan2(p.x - this.position.x, p.z - this.position.z); }
  beginInteraction(id: PlaceId, pose: InteractionPose) {
    this.stop(); this.interacting = id; this.playerAnimator.setPose(pose);
    this.followCamera.interactionFraming = true;
    const place = places.find(p => p.id === id)!; this.facePoint(place);
    const npc = this.npcs.find(n => n.id === id); npc?.animator.greet();
  }
  setInteractionPose(pose: InteractionPose) { this.playerAnimator.setPose(pose); this.followCamera.interactionFraming = pose !== 'none'; }
  endInteraction() { this.interacting = null; this.playerAnimator.setPose('none'); this.followCamera.interactionFraming = false; }
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
    let nearest: PlaceId | null = null, distance = 2.6;
    for (const p of places) {
      const d = Math.hypot(p.x - this.position.x, p.z - this.position.z);
      if (d < distance) { nearest = p.id; distance = d; }
    }
    return nearest;
  }
  private resize() {
    this.followCamera.resize(innerWidth, innerHeight);
    this.renderer.setSize(innerWidth, innerHeight);
  }
  private frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05); this.elapsed += dt;
    const oldX = this.position.x, oldZ = this.position.z;
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
      this.movementPoint.x = this.position.x + dx * speed; this.movementPoint.z = this.position.z;
      if (walkable(this.movementPoint)) this.position.x += dx * speed;
      this.movementPoint.x = this.position.x; this.movementPoint.z = this.position.z + dz * speed;
      if (walkable(this.movementPoint)) this.position.z += dz * speed;
    }
    const travelled = Math.hypot(this.position.x - oldX, this.position.z - oldZ);
    if (travelled > .00001) this.facing = Math.atan2(this.position.x - oldX, this.position.z - oldZ);
    this.player.rotation.y = turnToward(this.player.rotation.y, this.facing, dt);
    this.player.position.copy(this.position);
    this.playerAnimator.update(dt, travelled, this.reducedMotion);
    for (const npc of this.npcs) {
      const x = this.position.x - npc.rig.root.position.x, z = this.position.z - npc.rig.root.position.z;
      const nearby = this.interacting === npc.id || Math.hypot(x, z) < 7;
      npc.timer += dt;
      if (!nearby && npc.timer < .12) continue;
      const npcDt = npc.timer; npc.timer = 0;
      const targetYaw = nearby ? Math.atan2(x, z) : 0;
      // Torso only turns within a comfortable arc; head supplies the remaining glance.
      const bodyYaw = Math.max(-.85, Math.min(.85, targetYaw));
      npc.rig.root.rotation.y = turnToward(npc.rig.root.rotation.y, bodyYaw, npcDt, 3);
      npc.animator.lookAt(nearby ? Math.atan2(Math.sin(targetYaw - npc.rig.root.rotation.y), Math.cos(targetYaw - npc.rig.root.rotation.y)) : 0);
      npc.animator.update(npcDt, 0, this.reducedMotion);
    }
    this.followCamera.update(this.position, dt, this.reducedMotion);
    const nearest = this.nearest();
    if (nearest !== this.lastNear) { this.lastNear = nearest; this.onUpdate(nearest); }
    this.canvas.dataset.x = this.position.x.toFixed(2); this.canvas.dataset.z = this.position.z.toFixed(2);
    this.canvas.dataset.near = nearest ?? ''; this.canvas.dataset.moving = String(this.path.length > 0);
    // Throttled diagnostics make motion/collision assertions possible without a production debug API.
    this.metricsTimer += dt;
    if (this.metricsTimer > .10) {
      this.metricsTimer = 0;
      this.canvas.dataset.speed = this.playerAnimator.speed.toFixed(3);
      this.canvas.dataset.stride = this.playerAnimator.stride.toFixed(3);
      this.canvas.dataset.facing = this.player.rotation.y.toFixed(3);
      this.canvas.dataset.pose = this.playerAnimator.pose;
      this.canvas.dataset.cameraDistance = this.cameraDistance;
      this.canvas.dataset.cameraYaw = this.yaw.toFixed(3);
      this.canvas.dataset.reducedMotion = String(this.reducedMotion);
      this.canvas.dataset.drawCalls = String(this.renderer.info.render.calls);
      this.canvas.dataset.triangles = String(this.renderer.info.render.triangles);
    }
    this.renderer.render(this.scene, this.camera);
  }
}
