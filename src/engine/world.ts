import {poolSwimmingNavigation,entersPool,exitsPool,poolExit,poolMarker,swimSpeeds} from '../data/poolRegion';
import type {BuoyancyTrial} from '../game/buoyancyTrial';
import { buildRiver, type RiverView } from './riverWorld';
import { FishingSession } from '../game/fishingSession';
import type { FishGroup } from '../data/riverContent';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { places, type PlaceId } from '../data/content';
import { findPath, walkable, type Point } from './navigation';
import { createCharacter, type CharacterRig } from './character';
import { CharacterAnimator, turnToward, type InteractionPose } from './characterAnimator';
import { FollowCamera, type CameraDistance } from './cameraController';
import { regions } from '../data/regions';
import type { RegionId } from '../game/gameState';
import type { GardenProgress, Group } from '../game/gardenMission';
import { buildRimba, type RimbaView } from './rimbaWorld';
import { initialRimba, type RimbaProgress } from '../game/rimbaMission';
import { rimbaNavigation, rimbaCartConfig, cartParking } from '../data/rimbaRegion';
import { buildGarden, type GardenView } from './gardenWorld';
import { visibleForPicking } from './picking';
import { MovementController, movementDelta } from './movement';
import { characterConfig, environmentDimensions, playerVariant } from './characterConfig';

export type InputMode = 'laptop' | 'hp' | 'ifp';
export class World {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(48, 1, 0.1, 110);
  readonly renderer: THREE.WebGLRenderer;
  readonly playerRig = createCharacter(playerVariant(new URLSearchParams(location.search).get('avatar')));
  readonly player = this.playerRig.root;
  readonly playerAnimator = new CharacterAnimator(this.playerRig);
  readonly position = new THREE.Vector3(-1, 0, 6);
  readonly canvas: HTMLCanvasElement;
  mode: InputMode = 'laptop';
  paused = true;
  reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  move = { x: 0, z: 0 };
  private runMode = false;
  onRunModeChange: (running: boolean) => void = () => {};
  get running() { return this.runMode; }
  set running(value: boolean) { this.runMode = value; this.onRunModeChange(value); }
  private movement = new MovementController();
  private resetFrameTime = false;
  suspendMotion() { this.stop(); this.resetFrameTime = true; }
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
  region: RegionId = 'town';
  private regionRoot = new THREE.Group();
  swimming=false;private swimDistance=0;
  onSwimPractice:()=>void=()=>{};onBuoyancyFrame:(dt:number,active:boolean)=>void=()=>{};private buoyancyTrial:BuoyancyTrial|null=null;
  setBuoyancyTrial(t:BuoyancyTrial|null){this.buoyancyTrial=t;}
  private swimAppearance(active:boolean){this.playerAnimator.swimming=active;this.playerRig.tools.vest.visible=active;for(const name of ['backpack','backpack-pocket','contact-shadow']){const m=this.player.getObjectByName(name);if(m)m.visible=!active;}}
  returnShore(){this.stop();this.swimming=false;this.swimAppearance(false);this.position.set(poolExit.x,0,poolExit.z);this.endInteraction();}
  private updateSwimming(distance:number){if(this.region!=='river')return;if(!this.swimming&&entersPool(this.position)){this.swimming=true;this.swimDistance=0;Object.values(this.playerRig.tools).forEach(t=>t.visible=false);this.swimAppearance(true);this.running=false;}if(this.swimming){this.swimDistance+=distance;if(exitsPool(this.position)){this.swimming=false;this.swimAppearance(false);this.running=false;}else if(this.swimDistance>2&&Math.hypot(this.position.x-poolMarker.x,this.position.z-poolMarker.z)<.8)this.onSwimPractice();}}
  private riverView:RiverView|null=null;
  private fishingSession:FishingSession|null=null;
  private fishingGroup:FishGroup='flat';
  private rodTip=new THREE.Vector3();
  onRiverFrame:(dt:number,active:boolean)=>void=()=>{};
  beginFishing(session:FishingSession,group:FishGroup){
    this.stop();this.fishingSession=session;this.fishingGroup=group;this.paused=true;
    this.interacting=session.site==='A'?'fishingA':'fishingB';
    this.facing=Math.PI/2;this.player.rotation.y=this.facing;
    this.followCamera.interactionFraming=true;this.followCamera.interactionYaw=-.7;
    this.playerRig.tools.rod.visible=true;
  }
  endFishing(){this.fishingSession=null;this.playerRig.tools.rod.visible=false;this.riverView?.clearFishing();this.endInteraction();this.stop();}
  private rimbaView:RimbaView|null=null;
  private rimbaProgress=initialRimba();
  pushing=false;
  onRimbaMotion:(distance:number,seconds:number,position:Point)=>void=()=>{};
  private trackRimbaStep=(distance:number,seconds:number,position:Point)=>this.onRimbaMotion(distance,seconds,position);
  private gardenView: GardenView | null = null;
  get places() { return regions[this.region].places; }
  get navigation() {if(this.swimming)return poolSwimmingNavigation;return this.region==='rimba'?rimbaNavigation(this.rimbaProgress.cOpen,this.pushing):regions[this.region].navigation; }
  get interactionRadius() {return this.pushing?rimbaCartConfig.interaction:characterConfig.interactionRadius;}
  approach(id:PlaceId) {return this.pushing?rimbaCartConfig.approach:1.4;}
  canPushCart() {return this.region==='rimba'&&this.rimbaProgress.repaired&&Math.hypot(this.position.x-cartParking.x,this.position.z-cartParking.z)<3.25&&walkable(this.position,rimbaNavigation(this.rimbaProgress.cOpen,true));}
  setPushing(value:boolean) {if(value&&!this.canPushCart())return false;this.stop();this.pushing=value;this.playerAnimator.pushing=value;if(this.region==='rimba')this.updateRimbaCamera();return true;}
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
  private npcLabels = new Map<PlaceId, THREE.Sprite>();
  private projectedLabel = new THREE.Vector3();
  private regionLabels: THREE.Sprite[] = [];

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
    this.scene.add(this.regionRoot);
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
      this.regionRoot.add(new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color })));
      geometries.forEach(g => g.dispose());
    }
    this.staticGeometry.clear();
  }
  private label(text: string, x: number, y: number, z: number, id?: PlaceId, building = false) {
    const plantLabel = /^[AB][123]$/.test(text);
    const c = document.createElement('canvas'); c.width = plantLabel ? 128 : 512; c.height = plantLabel ? 64 : 96;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = building ? '#244b42ee' : '#fffdf3f2';
    ctx.beginPath(); ctx.roundRect(4, 4, c.width-8, c.height-8, plantLabel?12:24); ctx.fill();
    ctx.fillStyle = building ? '#fff9e6' : '#244b42';
    ctx.font = '600 30px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, c.width/2, c.height/2+1);
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: true, toneMapped: false }));
    sprite.position.set(x, y, z); const npcLabel=id==='nara'||id==='warga'||id==='sari'||id==='damar'||id==='lestari';
    sprite.scale.set(plantLabel?.65:npcLabel?2:3.5,plantLabel?.325:npcLabel?.375:.66,1);
    sprite.userData.plantLabel = plantLabel; this.regionLabels.push(sprite);
    sprite.userData.place = id; this.regionRoot.add(sprite); return sprite;
  }
  private buildTown() {
    const s = this.regionRoot;
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
      b(environmentDimensions.door.width, environmentDimensions.door.height, 0.12, '#5b6b5e', house.x, environmentDimensions.door.height/2, house.z + house.d / 2 + 0.08);
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
      b(1.8, .16, .7, '#a97b4f', x, environmentDimensions.benchSeat-.08, z);
      b(1.8, .65, .18, '#a97b4f', x, .86, z - 0.35);
      for (const dx of [-0.65, 0.65]) b(.14,.42,.55,'#525c4f',x+dx,.21, z);
    }
    for (const place of places) {
      if (place.id === 'nara' || place.id === 'warga') {
        const rig = createCharacter(place.id === 'nara' ? 'nara' : 'wira', place.id);
        rig.root.position.set(place.x, 0, place.z);
        this.npcs.push({ id: place.id, rig, animator: new CharacterAnimator(rig, place.id === 'nara' ? 1.3 : 3.8), timer: 0 });
        s.add(rig.root);
      } else if (place.id === 'gardenGate'||place.id==='rimbaGate'||place.id==='riverGate') {
        for(const dx of [-1.8,1.8]) b(.3,3.5,.3,'#98784f',place.x+dx,1.75,place.z);
        b(4.2,.5,.5,'#6d8d5c',place.x,3.6,place.z);
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
        this.npcLabels.set(place.id, this.label(place.short, place.x, this.npcLabelPosition.y, place.z, place.id));
      } else this.label(place.short, place.x, 2.4, place.z, place.id);
    }
    // Stylized distant hills, all local geometry.
    for (let i = 0; i < 7; i++) {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(8 + i % 3, 9 + i % 4, 4), new THREE.MeshLambertMaterial({ color: i % 2 ? '#97b49a' : '#abc1a2' }));
      hill.position.set(-35 + i * 12, 2, -33); s.add(hill);
    }
  }
  setRegion(region: RegionId, fromGate = false) {
    if (this.region === region) return;
    const previous=this.region;this.swimming=false;this.swimAppearance(false);this.endFishing();this.stop(); this.endInteraction();
    this.scene.remove(this.regionRoot);
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
    this.regionRoot.traverse(node => {
      if (node instanceof THREE.Mesh || node instanceof THREE.Sprite || node instanceof THREE.Line) {
        if ((node instanceof THREE.Mesh || node instanceof THREE.Line) && !node.userData.sharedGeometry && !node.geometry.userData.shared) geometries.add(node.geometry);
        for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
          if (material.userData.shared) continue;
          materials.add(material);
          const map = (material as THREE.MeshBasicMaterial).map; if (map) textures.add(map);
        }
      }
    });
    geometries.forEach(g => g.dispose()); textures.forEach(t => t.dispose()); materials.forEach(m => m.dispose());
    this.regionRoot.clear(); this.regionRoot = new THREE.Group(); this.scene.add(this.regionRoot);
    this.npcs = []; this.npcLabels.clear(); this.regionLabels = []; this.collisionBoxes = []; this.lastNear = undefined; this.gardenView = null; this.rimbaView=null;this.riverView=null; this.pushing=false;this.playerAnimator.pushing=false;this.playerRig.tools.bucket.visible=false;
    this.region = region; this.barrier.visible = false;
    if (region === 'town') this.buildTown();
    else if(region==='garden') {
      const b = (w:number,h:number,d:number,c:string,x:number,y:number,z:number) => { this.box(this.regionRoot,w,h,d,c,x,y,z,true); };
      this.gardenView = buildGarden({ root: this.regionRoot, box: b, label: (...args) => { this.label(...args); }, npc: (id,x,z) => {
        const rig = createCharacter('sari', id); rig.root.position.set(x,0,z); this.regionRoot.add(rig.root);
        this.npcs.push({id,rig,animator:new CharacterAnimator(rig,2.4),timer:0});
        this.npcLabels.set(id,this.label('Bu Sari',x,rig.labelSocket.position.y,z,id));
      } });
      this.collisionBoxes = this.navigation.obstacles.map(o => new THREE.Box3(new THREE.Vector3(o.x-o.width/2,0,o.z-o.depth/2),new THREE.Vector3(o.x+o.width/2,o.z < -1 && o.z > -5 ? .7 : 4,o.z+o.depth/2)));
    }
    else if(region==='river'){
      const b=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>{this.box(this.regionRoot,w,h,d,c,x,y,z,true);};
      this.riverView=buildRiver({root:this.regionRoot,box:b,label:(...args)=>{this.label(...args);},npc:(x,z)=>{
        const rig=createCharacter('lestari','lestari');rig.root.position.set(x,0,z);this.regionRoot.add(rig.root);
        this.npcs.push({id:'lestari',rig,animator:new CharacterAnimator(rig,2.8),timer:0});
        this.npcLabels.set('lestari',this.label('Kak Lestari',x,rig.labelSocket.position.y,z,'lestari'));
      }});
      this.collisionBoxes=[new THREE.Box3(new THREE.Vector3(-13,0,9.5),new THREE.Vector3(-9,3.5,12.5))];
    }
    else {
      const b=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>{this.box(this.regionRoot,w,h,d,c,x,y,z,true);};
      this.rimbaView=buildRimba({root:this.regionRoot,box:b,label:(...args)=>this.label(...args),npc:(x,z)=>{
        const rig=createCharacter('damar','damar');rig.root.position.set(x,0,z);this.regionRoot.add(rig.root);
        this.npcs.push({id:'damar',rig,animator:new CharacterAnimator(rig,1.7),timer:0});
        this.npcLabels.set('damar',this.label('Pak Damar',x,rig.labelSocket.position.y,z,'damar'));
      }});
      this.collisionBoxes=this.navigation.obstacles.map(o=>new THREE.Box3(new THREE.Vector3(o.x-o.width/2,0,o.z-o.depth/2),new THREE.Vector3(o.x+o.width/2,2.5,o.z+o.depth/2)));
      this.rimbaView.update(this.rimbaProgress);
    }
    if(region==='garden') this.collisionBoxes.push(new THREE.Box3(new THREE.Vector3(-2.2,0,15.7),new THREE.Vector3(2.2,4.2,16.3)));
    this.flushStatic(); this.followCamera.setObstacles(this.collisionBoxes);if(region==='rimba')this.updateRimbaCamera();this.resetPosition();
    if(fromGate && region === 'town') { this.position.set(previous==='rimba'?7:previous==='river'?-1:-14,0,previous==='rimba'?13:previous==='river'?-3:0); this.followCamera.update(this.position,.016,this.reducedMotion,true); }
    this.player.position.copy(this.position); this.canvas.dataset.region = region;
  }
  private updateRimbaCamera() {
    this.collisionBoxes=this.navigation.obstacles.filter(o=>o.width>=1.3).map(o=>new THREE.Box3(new THREE.Vector3(o.x-o.width/2,0,o.z-o.depth/2),new THREE.Vector3(o.x+o.width/2,o.width===4?3.5:o.width===1.4&&o.depth===1.5?1.3:2.3,o.z+o.depth/2)));
    this.followCamera.setObstacles(this.collisionBoxes);
  }
  setRimba(p:RimbaProgress) {
    const opened=p.cOpen!==this.rimbaProgress.cOpen;
    this.rimbaProgress=p;this.rimbaView?.update(p);
    if(p.activeTool!=='cart'&&this.pushing){this.pushing=false;this.playerAnimator.pushing=false;this.stop();}
    this.playerRig.tools.bucket.visible=this.region==='rimba'&&p.activeTool==='bucket';
    const gauge=this.playerRig.tools.bucket.getObjectByName('bucket-fill-indicator')!;gauge.scale.y=Math.max(.01,p.bucket/4000);gauge.visible=p.bucket>0;
    const water=this.playerRig.tools.bucket.getObjectByName('bucket-water')!;water.visible=p.bucket>0;water.position.y=-.49+.36*p.bucket/4000;
    if(this.region==='rimba'&&opened)this.updateRimbaCamera();
    const color=this.region==='rimba'?(p.report?'#d3dfce':'#cbb59a'):'#d9e9e3';
    (this.scene.background as THREE.Color).set(color);(this.scene.fog as THREE.Fog).color.set(color);
    this.canvas.dataset.cartRepaired=String(p.repaired);this.canvas.dataset.cartWater=String(p.cart);this.canvas.dataset.bucketWater=String(p.bucket);
    this.canvas.dataset.rimbaSource=String(p.source);this.canvas.dataset.rimbaTargets=JSON.stringify(p.targets);
  }
  setGarden(p: GardenProgress) {
    this.gardenView?.update(p);
    this.canvas.dataset.gardenDay = String(p.day); this.canvas.dataset.can = String(p.can); this.canvas.dataset.tank = String(p.tank);
    this.canvas.dataset.plantHeights = JSON.stringify({ A: p.planted.A, B: p.planted.B, day: p.day });
  }
  waterGarden(group: Group) { this.gardenView?.water(group); }
  goTo(p: Point, onArrive?: () => void) {
    const path = findPath(this.position, p, this.navigation);
    if (!path.length) return false;
    this.endInteraction(); this.path = path; this.onArrive = onArrive ?? null;
    this.marker.position.set(p.x, 0.15, p.z); this.marker.visible = true;
    return true;
  }
  setMovementInput(input: Point) {
    this.move = input;
    if (Math.hypot(input.x, input.z) > 0) { this.path.length = 0; this.onArrive = null; this.marker.visible = false; }
  }
  stop(resetRun = true) { this.move = { x: 0, z: 0 }; this.path = []; this.marker.visible = false; this.onArrive = null; if (resetRun) this.running = false; this.movement.stop(); }
  resetPosition() {this.swimming=false;this.swimAppearance(false);this.stop();this.pushing=false;this.playerAnimator.pushing=false; this.endInteraction(); const spawn = regions[this.region].spawn; this.position.set(spawn.x, 0, spawn.z); this.facing = 0; this.followCamera.reset(); this.followCamera.update(this.position, .016, this.reducedMotion, true); }
  resetCamera() { this.followCamera.reset(); }
  facePoint(p: Point) { this.facing = Math.atan2(p.x - this.position.x, p.z - this.position.z); }
  beginInteraction(id: PlaceId, pose: InteractionPose) {
    this.stop(); this.interacting = id; this.playerAnimator.setPose(pose);
    this.followCamera.interactionFraming = true;
    this.followCamera.interactionYaw = this.region==='garden' && (id==='plotA'||id==='plotB') ? -.85 : 0;
    const place = this.places.find(p => p.id === id)!; this.facePoint(place);
    const npc = this.npcs.find(n => n.id === id); npc?.animator.greet();
  }
  setInteractionPose(pose: InteractionPose) { this.playerAnimator.setPose(pose); this.followCamera.interactionFraming = pose !== 'none'; }
  endInteraction() { this.interacting = null; this.playerAnimator.setPose('none'); this.followCamera.interactionFraming = false; this.followCamera.interactionYaw = 0; }
  setTrial(done: boolean) { this.barrier.visible = done && this.region === 'town'; }
  pick(clientX: number, clientY: number): { place?: PlaceId; point?: Point } {
    const rect = this.canvas.getBoundingClientRect();
    this.ray.setFromCamera(new THREE.Vector2((clientX - rect.left) / rect.width * 2 - 1, -(clientY - rect.top) / rect.height * 2 + 1), this.camera);
    const objects = this.ray.intersectObjects(this.scene.children, true);
    const hit = objects.find(o => o.object.userData.place && visibleForPicking(o.object));
    if (hit) return { place: hit.object.userData.place as PlaceId };
    const point = this.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), new THREE.Vector3());
    return point && walkable(point, this.navigation) ? { point: { x: point.x, z: point.z } } : {};
  }
  nearest(): PlaceId | null {
    let nearest: PlaceId | null = null, distance: number = this.interactionRadius;
    for (const p of this.places) {
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
    const elapsed = this.clock.getDelta();
    const dt = this.resetFrameTime ? 0 : movementDelta(elapsed);
    this.resetFrameTime = false; this.elapsed += dt;
    this.onBuoyancyFrame(dt,!document.hidden&&document.hasFocus());
    this.onRiverFrame(dt,!document.hidden&&document.hasFocus());
    if(this.fishingSession?.active){const phase=this.fishingSession.phase;this.playerAnimator.fishingCast=Math.min(1,this.fishingSession.elapsed/.8);this.playerAnimator.setPose(phase==='casting'?'fishCast':phase==='observing'||phase==='released'?'fishPull':'fishWait');}
    let travelled = 0, dx = 0, dz = 0;
    if (!this.paused) {
      if (Math.hypot(this.move.x, this.move.z) > 0) {
        this.path.length = 0; this.onArrive = null; this.marker.visible = false;
      }
      const result = this.movement.step(this.position, this.move, this.yaw, this.running, this.path, dt, this.navigation, this.swimming?swimSpeeds:this.pushing?rimbaCartConfig:undefined, this.region==='rimba'?this.trackRimbaStep:undefined);
      travelled = result.distance; dx = result.dx; dz = result.dz;this.updateSwimming(travelled);
      if (result.arrived || result.blocked && !this.path.length) {
        this.marker.visible = false; const arrive = this.onArrive; this.onArrive = null;
        if (result.arrived) arrive?.();
      }
    }
    if (travelled > .00001 && !this.interacting) this.facing = Math.atan2(dx, dz);
    this.player.rotation.y = turnToward(this.player.rotation.y, this.facing, dt);
    this.player.position.copy(this.position);
    if(this.swimming)this.playerAnimator.setPose('none');
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
    if(this.riverView){
      this.playerRig.tools.rod.getObjectByName('rod-tip')!.getWorldPosition(this.rodTip);
      this.riverView.frame(document.hidden?0:dt,this.reducedMotion,this.fishingSession?.phase??'idle',this.fishingSession?.elapsed??0,this.fishingGroup,this.rodTip,this.position,this.fishingSession?.site??'A');
    }
    this.riverView?.pool.frame(this.buoyancyTrial);this.canvas.dataset.swimming=String(this.swimming);
    this.canvas.dataset.fishingPhase=this.fishingSession?.phase??'idle';
    this.canvas.dataset.rodVisible=String(this.playerRig.tools.rod.visible);
    this.rimbaView?.frame(this.position,this.player.rotation.y,travelled,this.pushing,this.reducedMotion);
    this.canvas.dataset.pushing=String(this.pushing);if(this.rimbaView)this.canvas.dataset.cartWheelAngle=this.rimbaView.wheelAngle().toFixed(4);
    this.followCamera.update(this.position, dt, this.reducedMotion);
    const nearest = this.nearest();
    if (nearest !== this.lastNear) { this.lastNear = nearest; this.onUpdate(nearest); }
    this.canvas.dataset.x = this.position.x.toFixed(2); this.canvas.dataset.z = this.position.z.toFixed(2);
    this.canvas.dataset.runMode = this.running ? 'run' : 'walk';
    this.canvas.dataset.locomotion = this.playerAnimator.state;
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
      for (const [id, label] of this.npcLabels) {
        this.projectedLabel.copy(label.position).project(this.camera);
        this.canvas.setAttribute(`data-${id}-label-x`, ((this.projectedLabel.x*.5+.5)*innerWidth).toFixed(1));
        this.canvas.setAttribute(`data-${id}-label-y`, ((-.5*this.projectedLabel.y+.5)*innerHeight).toFixed(1));
      }
    }
    if(this.region==='garden'||this.region==='rimba'||this.region==='river') for(const label of this.regionLabels) {
      const nearPlayer=Math.hypot(label.position.x-this.position.x,label.position.z-this.position.z);
      const distance=label.position.distanceTo(this.camera.position), plant=label.userData.plantLabel;
      label.visible=!label.userData.regionHidden && distance>2.5 && nearPlayer<(plant?7:14) && (!this.interacting || label.userData.place===this.interacting);
      const maxPixels=plant?38:Math.min(174,innerWidth*.36);
      const width=Math.min(plant?.65:['sari','damar','lestari'].includes(label.userData.place)?2:3.2,distance*2*Math.tan(this.camera.fov*Math.PI/360)*maxPixels/innerHeight);
      label.scale.set(width,width/(plant?2:512/96),1);
    }
    this.gardenView?.frame(dt, this.reducedMotion);
    this.canvas.dataset.region = this.region;
    this.canvas.dataset.playerHeight = this.playerRig.dimensions.height.toFixed(3);
    this.canvas.dataset.playerScale = this.playerRig.visual.scale.y.toFixed(6);
    this.canvas.dataset.avatar = this.playerRig.kind;
    this.renderer.render(this.scene, this.camera);
  }
}
