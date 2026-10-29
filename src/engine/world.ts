import {DivingController,UnderwaterEnvironment,diveNavigation,type DiveAction} from './divingController';
import {buildDivingWorld} from './divingWorld';
import {diveConfig,diveShore,divePoints,divePointPlaces,diveObstacles,type DivePointId} from '../data/diving';
import {SpaceExpedition,type ExpeditionAction} from '../game/spaceExpedition';
import {buildSpaceExpeditionWorld} from './spaceExpeditionWorld';
import {preparationPlaces,preparationNavigation,evaPlaceList,evaPoints,exteriorObstacles,safeSpaceSpawn,type EvaPointId,type Vector3Data} from '../data/spaceExpedition';
import {evaWalkable} from './evaNavigation';
import {spaceCameraBoxes} from './spaceStation';
import {SpaceInstrumentCamera} from './spaceInstrumentCamera';
import {setTemporaryEquipment} from './character';
import {WardrobePreview} from './wardrobePreview';
import {appearanceKey,parseAppearance,type Appearance} from '../game/appearance';
import {disposeRegion as releaseAvatar} from './disposeRegion';
import {buildTownEnvironment,townBuildings,townLabelRange,townTableCamera} from './townEnvironment';
import {configureEnvironment,environmentMaterial,environmentStyle,qualityPixelRatio} from './environmentStyle';
import {buildMarket,createMarketParcel} from './marketWorld';
import {initialMarket,type MarketProgress} from '../game/marketMission';
import {marketPlaces,marketObstacles} from '../data/marketRegion';
import {disposeRegion} from './disposeRegion';
import {buildSpace,type SpaceGuides} from './spaceWorld';
import {initialSpace,type SpaceProgress} from '../game/spaceMission';
import type {SpaceStage} from '../data/spaceContent';
import {buildGeopark} from './geoparkWorld';
import {geoNavigation} from '../data/geoparkRegion';
import {initialGeo,type GeoProgress} from '../game/geoparkMission';
import {plateModels,type PlateId} from '../data/geoparkContent';
import {buildPontoon} from './pontoonWorld';
import {initialPontoon,type PontoonProgress} from '../game/pontoonMission';
import {buildSolid} from './solidWorld';
import {initialSolid,type SolidProgress} from '../game/solidMission';
import {buildHydraulic} from './hydraulicWorld';
import {initialHydraulic,type HydraulicProgress} from '../game/hydraulicMission';
import {RovController} from './rovController';
import {buildPressureWorld} from './pressureWorld';
import {pressureConfig,type PressurePoint} from '../data/pressureContent';
import {waterPressurePa} from '../game/pressureModel';
import {buildCoastal} from './coastalWorld';
import {coastalDocks,coastalBoatNavigation} from '../data/coastalRegion';
import type {OrganismId} from '../data/coastalContent';
import type {CoastalProgress} from '../game/coastalMission';
import {buildEnergy,type EnergyView} from './energyWorld';
import {initialEnergy,type EnergyProgress} from '../game/energyMission';
import {buildElectromagnet,type ElectromagnetView} from './electromagnetWorld';
import {initialElectromagnet,type ElectromagnetProgress} from '../game/electromagnetMission';
import {buildWorkshop,type WorkshopView} from './workshopWorld';
import {evaluateCircuit} from '../game/circuitModel';
import type {WorkshopProgress} from '../game/workshopMission';
import {poolSwimmingNavigation,entersPool,exitsPool,poolExit,poolMarker,swimSpeeds} from '../data/poolRegion';
import type {BuoyancyTrial} from '../game/buoyancyTrial';
import { BoatController } from './boatController';
import { boatConfig,boatNavigation,docks,type DockId } from '../data/boatRegion';
import type { IrrigationProgress } from '../game/irrigationMission';
import type { FlowSampling } from '../game/flowSampling';
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
  readonly camera = new THREE.PerspectiveCamera(environmentStyle.camera.fov, 1, environmentStyle.camera.near, environmentStyle.camera.far);
  readonly renderer: THREE.WebGLRenderer;
  playerRig = createCharacter(playerVariant(new URLSearchParams(location.search).get('avatar')));
  player = this.playerRig.root;
  playerAnimator = new CharacterAnimator(this.playerRig);
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
  private regionRoot = Object.assign(new THREE.Group(),{name:'active-region'});private regionDisposals=0;
  swimming=false;private swimDistance=0;
  onSwimPractice:()=>void=()=>{};onBuoyancyFrame:(dt:number,active:boolean)=>void=()=>{};private buoyancyTrial:BuoyancyTrial|null=null;
  setBuoyancyTrial(t:BuoyancyTrial|null){this.buoyancyTrial=t;}
  private swimAppearance(active:boolean){this.playerAnimator.swimming=active;this.playerRig.tools.vest.visible=active;for(const name of ['backpack','backpack-pocket','contact-shadow']){const m=this.player.getObjectByName(name);if(m)m.visible=!active;}}
  returnShore(){this.stop();this.swimming=false;this.swimAppearance(false);this.position.set(poolExit.x,0,poolExit.z);this.endInteraction();}
  private updateSwimming(distance:number){if(this.region!=='river'||this.boat.aboard||this.rov.active)return;if(!this.swimming&&entersPool(this.position)){this.swimming=true;this.swimDistance=0;Object.values(this.playerRig.tools).forEach(t=>t.visible=false);this.swimAppearance(true);this.running=false;}if(this.swimming){this.swimDistance+=distance;if(exitsPool(this.position)){this.swimming=false;this.swimAppearance(false);this.running=false;}else if(this.swimDistance>2&&Math.hypot(this.position.x-poolMarker.x,this.position.z-poolMarker.z)<.8)this.onSwimPractice();}}
  diveSuspended=false;readonly dive=new DivingController();private diveView:ReturnType<typeof buildDivingWorld>|null=null;readonly waterEnvironment=new UnderwaterEnvironment();diveFocus:DivePointId|null=null;
  private diveCameraPoint=new THREE.Vector3();private divePreviousPosition=new THREE.Vector3();private diveCameraBefore:{yaw:number;pitch:number}|null=null;
  onDiveChange:()=>void=()=>{};onDiveFrame:()=>void=()=>{};onDiveArrive:(id:DivePointId|'entry')=>void=()=>{};
  get locomotionMode(){return this.dive.controlled?'diving':this.rov.active?'rov':this.boat.aboard?'boat':this.swimming?'pool-swim':this.region==='space'&&this.expedition.controlledPose?'astronaut':'land';}
  diveAction(action:DiveAction,revision=this.dive.revision){if(this.region!=='coast'||this.boat.aboard||this.rov.active||this.swimming)return false;const controlled=this.dive.controlled,ok=this.dive.act(action,this.position,revision);if(ok){this.endInteraction();if(controlled||this.dive.controlled||action==='recover')this.position.set(this.dive.pose.x,this.dive.pose.y,this.dive.pose.z);setTemporaryEquipment(this.playerRig,this.dive.equipped?'dive':'none');if(action==='recover'){this.followCamera.targetHeight=characterConfig.cameraTargetHeight;this.followCamera.distanceScale=1;this.followCamera.update(this.position,.016,true,true);}}return ok;}
  recoverDive(){const used=this.dive.equipped;this.dive.reset();this.playerAnimator.diving=false;if(used){setTemporaryEquipment(this.playerRig,'none');if(this.region==='coast')this.position.set(diveShore.x,0,diveShore.z);}this.waterEnvironment.reset();this.diveFocus=null;if(this.region==='coast'){(this.scene.background as THREE.Color).set('#d9e9e3');const fog=this.scene.fog as THREE.Fog;fog.color.set('#d9e9e3');fog.near=48;fog.far=100;this.followCamera?.setObstacles(this.collisionBoxes);}}
  readonly rov=new RovController();private pressureView:ReturnType<typeof buildPressureWorld>|null=null;
  setPressureChecked(checked:boolean){this.pressureView?.update(checked);}
  onPressureFrame:(dt:number,active:boolean)=>void=()=>{};
  private rovCameraPoint=new THREE.Vector3();private rovSensorPoint=new THREE.Vector3();private rovSample={xMm:0,zMm:0,depthMm:0,pressurePa:0};
  rovSnapshot(){if(this.pressureView){this.pressureView.robot.position.set(this.rov.position.x,this.rov.position.y,this.rov.position.z);this.pressureView.sensor.getWorldPosition(this.rovSensorPoint);}else this.rovSensorPoint.set(this.rov.position.x,this.rov.position.y+pressureConfig.sensorOffsetY,this.rov.position.z);const h=Math.max(0,pressureConfig.surfaceY-this.rovSensorPoint.y);this.rovSample.xMm=Math.round(this.rovSensorPoint.x*1000);this.rovSample.zMm=Math.round(this.rovSensorPoint.z*1000);this.rovSample.depthMm=Math.round(h*1000);this.rovSample.pressurePa=Math.round(waterPressurePa(h));return this.rovSample;}
  launchRov(){if(this.region!=='coast'||this.boat.aboard||this.swimming||this.dive.equipped)return false;this.stop();this.endInteraction();this.rov.launch();this.followCamera.interactionYaw=pressureConfig.cameraYawOffset;this.followCamera.setObstacles(this.pressureView?.cameraBoxes??[]);return true;}
  recoverRov(){const wasActive=this.rov.active;this.rov.recover();this.stop();if(!wasActive)return;this.followCamera.interactionYaw=0;this.followCamera?.setObstacles(this.collisionBoxes);if(this.scene.background)(this.scene.background as THREE.Color).set('#d9e9e3');if(this.scene.fog){const f=this.scene.fog as THREE.Fog;f.color.set('#d9e9e3');f.near=48;f.far=100;}}
  rovDepth(delta:number){if(!this.paused)this.rov.changeDepth(delta);}
  readonly boat=new BoatController();
  onBoatTutorial:(stage:'board'|'arrive'|'land',distanceMm:number)=>void=()=>{};
  onIrrigationFrame:(dt:number,active:boolean)=>void=()=>{};
  private flowSampling:FlowSampling|null=null;
  setFlowSampling(s:FlowSampling|null){this.flowSampling=s;}
  setIrrigation(p:IrrigationProgress){this.riverView?.irrigation.update(p);this.canvas.dataset.screenCleaned=String(p.cleaned);}
  private boatAppearance(active:boolean){this.playerRig.tools.vest.visible=active;for(const name of ['backpack','backpack-pocket','contact-shadow']){const obj=this.player.getObjectByName(name);if(obj)obj.visible=!active;}}
  boardBoat(){if(this.dive.equipped||this.rov.active||!['river','coast'].includes(this.region)||this.swimming||!this.boat.board(this.position))return false;this.stop();this.endFishing();Object.values(this.playerRig.tools).forEach(t=>t.visible=false);this.boatAppearance(true);this.playerAnimator.boating=true;this.position.set(this.boat.position.x,0,this.boat.position.z);this.facing=this.boat.yaw;this.player.rotation.y=this.facing;if(this.region==='river')this.onBoatTutorial('board',0);return true;}
  startBoat(){if(!this.boat.start())return false;this.stop();this.boat.start();return true;}
  moorBoat(){const d=this.boat.moor(this.position);if(!d)return null;this.stop();this.position.set(this.boat.position.x,0,this.boat.position.z);this.facing=this.boat.yaw;this.player.rotation.y=this.facing;if(this.region==='river'&&d==='irrigation'&&this.boat.tripFrom==='research')this.onBoatTutorial('arrive',this.boat.distanceMm);return d;}
  exitBoat(){const dock=this.boat.dock,p=this.boat.exit(regions[this.region].navigation);if(!p)return false;this.stop();this.playerAnimator.boating=false;this.boatAppearance(false);this.position.set(p.x,0,p.z);this.endInteraction();if(this.region==='river'&&dock==='irrigation')this.onBoatTutorial('land',this.boat.distanceMm);return true;}
  recoverBoat(){this.stop();this.boat.recover();this.running=false;this.playerAnimator.boating=false;this.boatAppearance(false);this.flowSampling=null;if(this.region==='river'||this.region==='coast')this.position.set(this.boat.docks.research.land.x,0,this.boat.docks.research.land.z);this.endInteraction();}
  sailTo(dock:DockId,arrive?:()=>void){return this.boat.aboard&&this.goTo(this.boat.docks[dock].water,arrive);}
  private coastalView:ReturnType<typeof buildCoastal>|null=null;
  coastalFocus:OrganismId|null=null;private coastalCameraPoint=new THREE.Vector3();
  setCoastal(p:CoastalProgress){this.coastalView?.update(p);this.canvas.dataset.coastRecords=String(p.records.length);this.canvas.dataset.coastLinks=String(p.links.length);this.canvas.dataset.coastScenario=String(p.scenario);}
  private pontoonView:ReturnType<typeof buildPontoon>|null=null;private pontoonProgress=initialPontoon();
  pontoonFraction=0;pontoonZ=24;pontoonFocus:'spring'|'pontoon'|null=null;private pontoonCameraPoint=new THREE.Vector3();
  onPontoonFrame:(dt:number,active:boolean)=>void=()=>{};
  setPontoon(p:PontoonProgress){this.pontoonProgress=p;this.canvas.dataset.pontoonPhase=p.trial?.phase??p.delivery;this.canvas.dataset.pontoonCargo=p.cargo;}
  private solidView:ReturnType<typeof buildSolid>|null=null;private solidProgress=initialSolid();
  solidFraction=0;solidFocus=false;private solidCameraPoint=new THREE.Vector3(-5,.7,26.2);
  onSolidFrame:(dt:number,active:boolean)=>void=()=>{};
  setSolid(p:SolidProgress){this.solidProgress=p;this.canvas.dataset.solidPhase=p.trial?.phase??'idle';this.canvas.dataset.solidSelected=p.installed??'';}
  private hydraulicView:ReturnType<typeof buildHydraulic>|null=null;private hydraulicProgress=initialHydraulic();
  hydraulicFraction=0;hydraulicFocus=false;private hydraulicCameraPoint=new THREE.Vector3(8,.65,26.2);
  onHydraulicFrame:(dt:number,active:boolean)=>void=()=>{};
  setHydraulic(p:HydraulicProgress){this.hydraulicProgress=p;this.canvas.dataset.hydraulicPhase=p.trial?.phase??'idle';this.canvas.dataset.hydraulicModule=p.installed??'';}
  private energyView:EnergyView|null=null;private energyProgress=initialEnergy();
  energyFraction=0;energyFocus:'solar'|'wind'|'service'|'battery'|null=null;private energyCameraPoint=new THREE.Vector3();
  onEnergyFrame:(dt:number,active:boolean)=>void=()=>{};
  setEnergy(p:EnergyProgress){this.energyProgress=p;this.energyView?.update(p);this.canvas.dataset.energyBattery=String(p.batteryMWh);this.canvas.dataset.energyTrial=p.trial?.phase??'idle';this.canvas.dataset.energySupply=String(p.supplyOn);this.canvas.dataset.energyPreview=String(this.regionRoot.userData.energyPreviewMWh??'');this.canvas.dataset.energyService=String(this.regionRoot.userData.energyServiceOn??false);this.canvas.dataset.energyIntervals=String(p.attempts.at(-1)?.records.length??0);}
  private electromagnetView:ElectromagnetView|null=null;
  private electromagnetProgress=initialElectromagnet();
  electromagnetFraction=0;electromagnetCamera=false;private electromagnetCameraPoint=new THREE.Vector3(26,1,-8);
  onElectromagnetFrame:(dt:number,active:boolean)=>void=()=>{};
  setElectromagnet(p:ElectromagnetProgress){this.electromagnetProgress=p;this.electromagnetView?.update(p);this.canvas.dataset.magnetSource=String(p.sourceOn);this.canvas.dataset.magnetTrial=p.trial?.phase??'idle';this.canvas.dataset.craneClips=JSON.stringify(p.crane.clips);this.canvas.dataset.cranePosition=String(p.crane.position);this.canvas.dataset.craneElevation=String(p.crane.elevation);}
  private workshopView:WorkshopView|null=null;
  setWorkshop(p:WorkshopProgress){this.workshopView?.update(p);this.canvas.dataset.lampOn=String(evaluateCircuit(p).lampOn);this.canvas.dataset.circuitRepaired=String(p.repaired);this.canvas.dataset.circuitConnected=String(p.sourceConnected);this.canvas.dataset.circuitSwitch=String(p.switchClosed);}
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
  private marketView:ReturnType<typeof buildMarket>|null=null;private marketProgress=initialMarket();
  private iceParcel=createMarketParcel(this.playerRig.rightArm.toolSocket);marketFocus:PlaceId|null=null;marketFraction=0;private marketCameraPoint=new THREE.Vector3();
  onMarketFrame:(dt:number,active:boolean)=>void=()=>{};onMarketMotion:(distance:number)=>void=()=>{};private trackMarketStep=(distance:number)=>this.onMarketMotion(distance);
  setMarketFocus(id:PlaceId|null){const prior=this.marketFocus;this.marketFocus=id;if(this.region!=='town'||!id&&!prior)return;const p=marketPlaces.find(p=>p.id===id);const point=p?new THREE.Vector3(p.x,.5,p.z-1):null;this.followCamera.setObstacles(point?this.collisionBoxes.filter(b=>!b.containsPoint(point)):this.collisionBoxes);}
  setMarket(p:MarketProgress){this.marketProgress=p;this.canvas.dataset.marketTrial=p.trial?.kind??'';this.canvas.dataset.marketPhase=p.trial?.phase??'idle';this.canvas.dataset.marketParcel=p.parcel.state;this.canvas.dataset.marketParcelId=p.parcel.id;this.canvas.dataset.marketIceG=String(p.parcel.iceG);this.canvas.dataset.marketLiquidG=String(p.parcel.liquidG);}
  readonly expedition=new SpaceExpedition();private expeditionView:ReturnType<typeof buildSpaceExpeditionWorld>|null=null;private spaceInterior:THREE.Group|null=null;
  onExpeditionChange:()=>void=()=>{};onExpeditionFrame:()=>void=()=>{};onEvaArrive:(id:EvaPointId)=>void=()=>{};
  private expeditionCamera=new THREE.Vector3();private expeditionTarget=new THREE.Vector3();private tetherPoint=new THREE.Vector3();private expeditionPreviousPosition=new THREE.Vector3();private evaCameraBefore:{yaw:number;pitch:number}|null=null;
  beginPreparation(){if(this.region!=='space')return;this.expedition.prepare();this.position.set(0,0,15);this.followCamera.setObstacles(preparationNavigation.obstacles.map(o=>new THREE.Box3(new THREE.Vector3(o.x-o.width/2,0,o.z-o.depth/2),new THREE.Vector3(o.x+o.width/2,3,o.z+o.depth/2))));this.followCamera.update(this.position,.016,this.reducedMotion,true);}
  expeditionAction(action:ExpeditionAction,revision=this.expedition.revision){if(this.region!=='space')return false;const was=this.expedition.controlledPose;const ok=this.expedition.act(action,this.position,revision);if(ok){this.endInteraction();if(was||this.expedition.controlledPose)this.position.set(this.expedition.pose.x,this.expedition.pose.y,this.expedition.pose.z);}return ok;}
  recoverExpedition(){this.expedition.reset();setTemporaryEquipment(this.playerRig,'none');this.playerAnimator.floating=false;this.playerAnimator.boating=this.boat.aboard;if(this.region==='space'){this.position.set(safeSpaceSpawn.x,0,safeSpaceSpawn.z);this.followCamera.setObstacles(spaceCameraBoxes());}}
  private spaceView:ReturnType<typeof buildSpace>|null=null;private spaceProgress=initialSpace();
  spaceDetail=false;spaceGuides:SpaceGuides={labels:true,orbits:true,light:true};readonly spaceInstrumentCamera=new SpaceInstrumentCamera();
  spaceFocus:SpaceStage|null=null;spaceEarthView=false;spaceAngle=0;onSpaceFrame:(dt:number,active:boolean)=>void=()=>{};
  setSpace(p:SpaceProgress){this.spaceProgress=p;}
  private geoView:ReturnType<typeof buildGeopark>|null=null;
  private geoProgress=initialGeo();geoFraction=0;geoFocus:PlateId|'earth'|null=null;
  private geoCameraPoint=new THREE.Vector3();onGeoFrame:(dt:number,active:boolean)=>void=()=>{};
  setGeopark(p:GeoProgress){const changed=this.geoProgress.exercise!==p.exercise;this.geoProgress=p;if(this.region==='geopark'&&changed){this.stop();this.collisionBoxes=this.navigation.obstacles.map(o=>new THREE.Box3(new THREE.Vector3(o.x-o.width/2,0,o.z-o.depth/2),new THREE.Vector3(o.x+o.width/2,o.x===13&&o.z===-16?5:o.x===-12&&o.z===16?3.4:1.2,o.z+o.depth/2)));this.followCamera.setObstacles(this.collisionBoxes);if(!walkable(this.position,this.navigation))this.resetPosition();}}
  get places() {return this.region==='coast'&&this.dive.active?divePointPlaces:this.region==='space'&&this.expedition.phase==='preparation'?preparationPlaces:this.region==='space'&&this.expedition.outside?evaPlaceList:regions[this.region].places;}
  get navigation() {if(this.region==='space'&&this.expedition.phase==='preparation')return preparationNavigation; if(this.region==='geopark')return geoNavigation(this.geoProgress.exercise);if(this.boat.aboard)return this.region==='coast'?coastalBoatNavigation:boatNavigation;if(this.swimming)return poolSwimmingNavigation;return this.region==='rimba'?rimbaNavigation(this.rimbaProgress.cOpen,this.pushing):regions[this.region].navigation; }
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
  private wardrobePreview:WardrobePreview|null=null;
  private wardrobeStage:HTMLElement|null=null;
  private wardrobeClear=new THREE.Color();
  showWardrobe(a:Appearance,stage:HTMLElement){
    if(!this.wardrobePreview){this.renderer.getClearColor(this.wardrobeClear);this.wardrobePreview=new WardrobePreview(a);}else this.wardrobePreview.setAppearance(a);
    this.wardrobeStage=stage;this.canvas.dataset.wardrobe='true';
  }
  rotateWardrobe(angle:number){this.wardrobePreview?.rotate(angle);}
  closeWardrobe(){this.wardrobePreview?.dispose();this.wardrobePreview=null;this.wardrobeStage=null;this.renderer.setClearColor(this.wardrobeClear);this.canvas.dataset.wardrobe='false';delete this.canvas.dataset.previewAppearance;this.stop();}
  setPlayerAppearance(value:Appearance){
    const a=parseAppearance(value,value);
    if(appearanceKey(a)!==appearanceKey(this.playerRig.appearance!)){
      this.stop();const old=this.playerRig;
      this.playerRig=createCharacter(a.base==='student-girl'?'explorerGirl':'explorer',undefined,a);
      this.player=this.playerRig.root;this.player.position.copy(old.root.position);this.player.rotation.copy(old.root.rotation);
      this.playerRig.rightArm.toolSocket.add(this.iceParcel);
      this.scene.remove(old.root);releaseAvatar(old.root);this.scene.add(this.player);
      setTemporaryEquipment(this.playerRig,old.cosmetics?.mode??'none');
      this.playerAnimator=new CharacterAnimator(this.playerRig);this.playerAnimator.pushing=this.pushing;
      this.setRimba(this.rimbaProgress);
      if(this.boat.aboard){this.playerAnimator.boating=true;this.boatAppearance(true);}else if(this.swimming)this.swimAppearance(true);
    }
    this.canvas.dataset.appearance=JSON.stringify(a);
  }

  private townView:ReturnType<typeof buildTownEnvironment>|null=null;
  private townIndicators:THREE.Mesh[]=[];
  private lowQuality=false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
    configureEnvironment(this.renderer,this.scene,devicePixelRatio);
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
    this.dive.onChange=()=>{this.stop();this.lastNear=undefined;const active=this.dive.controlled;if(active&&!this.diveCameraBefore){this.diveCameraBefore={yaw:this.yaw,pitch:this.pitch};this.yaw=.15;this.pitch=.27;}else if(!active&&this.diveCameraBefore){this.yaw=this.diveCameraBefore.yaw;this.pitch=this.diveCameraBefore.pitch;this.diveCameraBefore=null;}if(this.region==='coast')this.followCamera.setObstacles(active?diveObstacles.map(o=>new THREE.Box3(new THREE.Vector3(o.min.x,o.min.y,o.min.z),new THREE.Vector3(o.max.x,o.max.y,o.max.z))):this.collisionBoxes);this.onDiveChange();};
    this.expedition.onChange=()=>{this.stop();this.lastNear=undefined;if(this.region==='space'){this.followCamera.setObstacles(this.expedition.outside?exteriorObstacles.map(o=>new THREE.Box3(new THREE.Vector3(o.min.x,o.min.y,o.min.z),new THREE.Vector3(o.max.x,o.max.y,o.max.z))):this.expedition.phase==='preparation'?preparationNavigation.obstacles.map(o=>new THREE.Box3(new THREE.Vector3(o.x-o.width/2,0,o.z-o.depth/2),new THREE.Vector3(o.x+o.width/2,3,o.z+o.depth/2))):spaceCameraBoxes());this.followCamera.resize(innerWidth,innerHeight);if(this.expedition.outside){this.evaCameraBefore={yaw:this.yaw,pitch:this.pitch};this.yaw=-1.4;this.pitch=.40;this.followCamera.update(this.position,.016,true,true);}else if(this.evaCameraBefore){this.yaw=this.evaCameraBefore.yaw;this.pitch=this.evaCameraBefore.pitch;this.evaCameraBefore=null;}}this.onExpeditionChange();};
    canvas.dataset.ready = 'true';
  }
  setLowQuality(low:boolean){
    this.lowQuality=low;this.spaceView?.quality(low);
    this.renderer.setPixelRatio(qualityPixelRatio(low,devicePixelRatio));
    this.canvas.dataset.quality=low?'low':'normal';
    this.canvas.dataset.pixelRatio=String(this.renderer.getPixelRatio());
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
    const mesh = new THREE.Mesh(geometry, environmentMaterial(color));
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  private flushStatic() {
    for (const [color, geometries] of this.staticGeometry) {
      const geometry = mergeGeometries(geometries);
      this.regionRoot.add(new THREE.Mesh(geometry, environmentMaterial(color)));
      geometries.forEach(g => g.dispose());
    }
    this.staticGeometry.clear();
  }
  private label(text: string, x: number, y: number, z: number, id?: PlaceId, building = false) {
    const plantLabel = /^[AB][123]$/.test(text), terminalLabel=/^(B[+−-]|[SL][12])$/.test(text),smallLabel=plantLabel||terminalLabel;
    const c = document.createElement('canvas'); c.width = smallLabel ? 128 : 512; c.height = smallLabel ? 64 : 96;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = building ? '#244b42ee' : '#fffdf3f2';
    ctx.beginPath(); ctx.roundRect(4, 4, c.width-8, c.height-8, plantLabel?12:24); ctx.fill();
    ctx.fillStyle = building ? '#fff9e6' : '#244b42';
    ctx.font = '600 30px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, c.width/2, c.height/2+1);
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: true, toneMapped: false }));
    sprite.position.set(x, y, z); const npcLabel=id==='nara'||id==='warga'||id==='sari'||id==='damar'||id==='lestari'||id==='bima';
    sprite.scale.set(id&&marketPlaces.some(p=>p.id===id)?1.9:terminalLabel?.55:plantLabel?.65:npcLabel?2:3.5,id&&marketPlaces.some(p=>p.id===id)?.356:terminalLabel?.275:plantLabel?.325:npcLabel?.375:.66,1);
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
    this.townView=buildTownEnvironment(s);
    this.collisionBoxes.push(new THREE.Box3(new THREE.Vector3(-11.125,0,-.30),new THREE.Vector3(-9.875,2.1,.30)));
    for(const house of townBuildings)this.collisionBoxes.push(new THREE.Box3(new THREE.Vector3(house.x-house.w/2,0,house.z-house.d/2),new THREE.Vector3(house.x+house.w/2,house.h+.95,house.z+house.d/2)));
    for (const place of places) {
      if (place.id === 'nara' || place.id === 'warga') {
        const rig = createCharacter(place.id === 'nara' ? 'nara' : 'wira', place.id);
        rig.root.position.set(place.x, 0, place.z);
        this.npcs.push({ id: place.id, rig, animator: new CharacterAnimator(rig, place.id === 'nara' ? 1.3 : 3.8), timer: 0 });
        s.add(rig.root);
      } else if (place.id === 'gardenGate'||place.id==='rimbaGate'||place.id==='riverGate'||place.id==='workshopGate') {
        for(const dx of [-1.8,1.8]) b(.3,3.5,.3,'#98784f',place.x+dx,1.75,place.z);
        b(4.2,.5,.5,'#6d8d5c',place.x,3.6,place.z);
      }
      const disc = new THREE.Mesh(new THREE.RingGeometry(0.47, 0.54, 24), new THREE.MeshBasicMaterial({ color: place.color, side: THREE.DoubleSide }));
      disc.rotation.x = -Math.PI / 2; disc.position.set(place.x, 0.13, place.z); disc.userData.place=place.id;s.add(disc);this.townIndicators.push(disc);
      const npc = this.npcs.find(n => n.id === place.id);
      if (npc) {
        npc.rig.root.updateMatrixWorld(true);
        npc.rig.labelSocket.getWorldPosition(this.npcLabelPosition);
        this.npcLabels.set(place.id, this.label(place.short, place.x, this.npcLabelPosition.y, place.z, place.id));
      } else this.label(place.id==='observatory'?'Observatorium':place.short, place.x, 2.1, place.z, place.id);
    }
    this.marketView=buildMarket(s);for(const o of marketObstacles)this.collisionBoxes.push(new THREE.Box3(new THREE.Vector3(o.x-o.width/2,townTableCamera.minY,o.z-o.depth/2),new THREE.Vector3(o.x+o.width/2,townTableCamera.maxY,o.z+o.depth/2)));
    // Stylized distant hills, all local geometry.
    for (let i = 0; i < 7; i++) {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(8 + i % 3, 9 + i % 4, 4), new THREE.MeshLambertMaterial({ color: i % 2 ? '#97b49a' : '#abc1a2' }));
      hill.position.set(-35 + i * 12, 2, -33); s.add(hill);
    }
  }
  setRegion(region: RegionId, fromGate = false) {
    if (this.region === region) return;
    this.recoverDive();this.diveView=null;this.recoverExpedition();this.expeditionView=null;this.spaceInterior=null;this.recoverRov();const previous=this.region;this.swimming=false;this.swimAppearance(false);this.boat.recover();this.playerAnimator.boating=false;this.boatAppearance(false);this.endFishing();this.stop(); this.endInteraction();
    this.scene.remove(this.regionRoot);
    disposeRegion(this.regionRoot);
    this.regionRoot.clear(); this.regionRoot = Object.assign(new THREE.Group(),{name:'active-region'});this.regionDisposals++; this.scene.add(this.regionRoot);
    this.townView=null;this.townIndicators=[];this.canvas.dataset.townActors='0';this.canvas.dataset.townAmbientTime='0';this.canvas.dataset.townLabels='0';this.marketView=null;this.marketFocus=null;this.iceParcel.visible=false;this.spaceView=null;this.spaceFocus=null;this.spaceDetail=false;this.spaceInstrumentCamera.reset();this.spaceEarthView=false;this.camera.layers.set(0);this.geoView=null;this.geoFocus=null;this.npcs = []; this.npcLabels.clear(); this.regionLabels = []; this.collisionBoxes = []; this.lastNear = undefined; this.gardenView = null; this.rimbaView=null;this.riverView=null;this.workshopView=null;this.electromagnetView=null;this.energyView=null;this.hydraulicView=null;this.solidView=null;this.pontoonView=null;this.pontoonFocus=null;this.solidFocus=false;this.hydraulicFocus=false; this.pushing=false;this.playerAnimator.pushing=false;this.playerRig.tools.bucket.visible=false;
    this.pressureView=null;this.coastalView=null;this.coastalFocus=null;this.region = region;const sky=region==='space'?'#081426':'#d9e9e3';(this.scene.background as THREE.Color).set(sky);(this.scene.fog as THREE.Fog).color.set(sky);this.boat.configure(region==='coast'?coastalDocks:docks); this.barrier.visible = false;
    if (region === 'town') this.buildTown();
    else if(region==='space'){
      const b=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>{this.box(this.regionRoot,w,h,d,c,x,y,z,true);};
      this.spaceInterior=new THREE.Group();this.spaceInterior.name='space-interior';this.regionRoot.add(this.spaceInterior);
      const addLabel=(...args:Parameters<World['label']>)=>{const label=this.label(...args);this.spaceInterior!.add(label);return label;};
      this.spaceView=buildSpace({root:this.spaceInterior,box:b,label:addLabel,npc:(x,z)=>{const rig=createCharacter('nara','spaceNara');rig.root.position.set(x,0,z);this.spaceInterior!.add(rig.root);this.npcs.push({id:'spaceNara',rig,animator:new CharacterAnimator(rig,1.8),timer:0});this.npcLabels.set('spaceNara',addLabel('Bu Nara',x,rig.labelSocket.position.y,z,'spaceNara'));}});
      this.regionRoot.add(this.spaceView.sky);this.expeditionView=buildSpaceExpeditionWorld(this.regionRoot);
      this.spaceView.quality(this.lowQuality);
      this.collisionBoxes=spaceCameraBoxes();
    }
    else if(region==='geopark'){
      const b=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>{this.box(this.regionRoot,w,h,d,c,x,y,z,true);};
      this.geoView=buildGeopark({root:this.regionRoot,box:b,label:(...args)=>this.label(...args),npc:(x,z)=>{const rig=createCharacter('raka','raka');rig.root.position.set(x,0,z);this.regionRoot.add(rig.root);this.npcs.push({id:'raka',rig,animator:new CharacterAnimator(rig,2.1),timer:0});this.npcLabels.set('raka',this.label('Kak Raka',x,rig.labelSocket.position.y,z,'raka'));}});
      this.collisionBoxes=this.navigation.obstacles.map(o=>new THREE.Box3(new THREE.Vector3(o.x-o.width/2,0,o.z-o.depth/2),new THREE.Vector3(o.x+o.width/2,o.x===13&&o.z===-16?5:o.x===-12&&o.z===16?3.4:1.2,o.z+o.depth/2)));
    }
    else if(region==='garden') {
      const b = (w:number,h:number,d:number,c:string,x:number,y:number,z:number) => { this.box(this.regionRoot,w,h,d,c,x,y,z,true); };
      this.gardenView = buildGarden({ root: this.regionRoot, box: b, label: (...args) => { this.label(...args); }, npc: (id,x,z) => {
        const rig = createCharacter('sari', id); rig.root.position.set(x,0,z); this.regionRoot.add(rig.root);
        this.npcs.push({id,rig,animator:new CharacterAnimator(rig,2.4),timer:0});
        this.npcLabels.set(id,this.label('Bu Sari',x,rig.labelSocket.position.y,z,id));
      } });
      this.collisionBoxes = this.navigation.obstacles.map(o => new THREE.Box3(new THREE.Vector3(o.x-o.width/2,0,o.z-o.depth/2),new THREE.Vector3(o.x+o.width/2,o.z < -1 && o.z > -5 ? .7 : 4,o.z+o.depth/2)));
    }
    else if(region==='workshop'){
      const b=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>{this.box(this.regionRoot,w,h,d,c,x,y,z,true);};
      this.hydraulicView=buildHydraulic({root:this.regionRoot,box:b,label:(...args)=>this.label(...args)});
      this.energyView=buildEnergy({root:this.regionRoot,box:b,label:(...args)=>this.label(...args)});
      this.electromagnetView=buildElectromagnet({root:this.regionRoot,box:b,label:(...args)=>this.label(...args)});
      this.workshopView=buildWorkshop({root:this.regionRoot,box:b,label:(...args)=>this.label(...args),npc:(x,z)=>{
        const rig=createCharacter('bima','bima');rig.root.position.set(x,0,z);this.regionRoot.add(rig.root);
        this.npcs.push({id:'bima',rig,animator:new CharacterAnimator(rig,3.1),timer:0});
        this.npcLabels.set('bima',this.label('Kak Bima',x,rig.labelSocket.position.y,z,'bima'));
      }});
      // The protected navigation bay is open air; only the crane posts block the camera.
      this.collisionBoxes=this.navigation.obstacles.filter(o=>!(o.x===26&&o.z===-8)&&!(o.x===-4&&o.z===-26.7)).map(o=>new THREE.Box3(new THREE.Vector3(o.x-o.width/2,0,o.z-o.depth/2),new THREE.Vector3(o.x+o.width/2,o.width>=7?4:1.2,o.z+o.depth/2)));
      this.collisionBoxes.push(new THREE.Box3(new THREE.Vector3(-4.11,0,-26.81),new THREE.Vector3(-3.89,4.4,-26.59)));
      for(const x of [21.9,30.1])this.collisionBoxes.push(new THREE.Box3(new THREE.Vector3(x-.15,0,-8.4),new THREE.Vector3(x+.15,3.8,-8)));
    }
    else if(region==='coast'){
      const b=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>{this.box(this.regionRoot,w,h,d,c,x,y,z,true);};
      this.coastalView=buildCoastal({root:this.regionRoot,box:b,label:(...args)=>{this.label(...args);},npc:(x,z)=>{
        const rig=createCharacter('lestari','coastLestari');rig.root.position.set(x,0,z);this.regionRoot.add(rig.root);
        this.npcs.push({id:'coastLestari',rig,animator:new CharacterAnimator(rig,2.8),timer:0});
        this.npcLabels.set('coastLestari',this.label('Kak Lestari',x,rig.labelSocket.position.y,z,'coastLestari'));
      }});
      this.pressureView=buildPressureWorld(this.regionRoot);this.diveView=buildDivingWorld(this.regionRoot);
      this.collisionBoxes=[new THREE.Box3(new THREE.Vector3(-13.5,0,8),new THREE.Vector3(-8.5,3,12)),new THREE.Box3(new THREE.Vector3(-11.7,0,20.9),new THREE.Vector3(-10.3,1.8,21.7)),new THREE.Box3(new THREE.Vector3(-4.75,0,19.9),new THREE.Vector3(-3.25,.9,20.7))];
    }
    else if(region==='river'){
      const b=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>{this.box(this.regionRoot,w,h,d,c,x,y,z,true);};
      this.pontoonView=buildPontoon({root:this.regionRoot,box:b,label:(...args)=>this.label(...args)});this.riverView=buildRiver({root:this.regionRoot,box:b,label:(...args)=>{this.label(...args);},npc:(x,z)=>{
        const rig=createCharacter('lestari','lestari');rig.root.position.set(x,0,z);this.regionRoot.add(rig.root);
        this.npcs.push({id:'lestari',rig,animator:new CharacterAnimator(rig,2.8),timer:0});
        this.npcLabels.set('lestari',this.label('Kak Lestari',x,rig.labelSocket.position.y,z,'lestari'));
      }});
      this.collisionBoxes=[new THREE.Box3(new THREE.Vector3(-13,0,9.5),new THREE.Vector3(-9,3.5,12.5))];
    }
    else {
      const b=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>{this.box(this.regionRoot,w,h,d,c,x,y,z,true);};
      this.solidView=buildSolid({root:this.regionRoot,box:b,label:(...args)=>this.label(...args)});this.rimbaView=buildRimba({root:this.regionRoot,box:b,label:(...args)=>this.label(...args),npc:(x,z)=>{
        const rig=createCharacter('damar','damar');rig.root.position.set(x,0,z);this.regionRoot.add(rig.root);
        this.npcs.push({id:'damar',rig,animator:new CharacterAnimator(rig,1.7),timer:0});
        this.npcLabels.set('damar',this.label('Pak Damar',x,rig.labelSocket.position.y,z,'damar'));
      }});
      this.collisionBoxes=this.navigation.obstacles.map(o=>new THREE.Box3(new THREE.Vector3(o.x-o.width/2,0,o.z-o.depth/2),new THREE.Vector3(o.x+o.width/2,o.z>20?1.2:2.5,o.z+o.depth/2)));
      this.rimbaView.update(this.rimbaProgress);
    }
    if(region==='garden') this.collisionBoxes.push(new THREE.Box3(new THREE.Vector3(-2.2,0,15.7),new THREE.Vector3(2.2,4.2,16.3)));
    if(fromGate&&region==='river'&&previous==='coast')this.boat.recover();
    this.flushStatic(); this.followCamera.setObstacles(this.collisionBoxes);if(region==='rimba')this.updateRimbaCamera();this.resetPosition();
    if(fromGate && region === 'town') { this.position.set(previous==='workshop'?-15:previous==='rimba'?7:previous==='river'?-1:-14,0,previous==='workshop'?-3:previous==='rimba'?13:previous==='river'?-3:0); this.followCamera.update(this.position,.016,this.reducedMotion,true); }
    if(fromGate&&region==='town'&&previous==='space'){this.position.set(2,0,-8.4);this.followCamera.update(this.position,.016,this.reducedMotion,true);}
    if(fromGate&&region==='river'&&previous==='coast'){this.position.set(0,0,12);this.followCamera.update(this.position,.016,this.reducedMotion,true);}
    this.player.position.copy(this.position); this.canvas.dataset.region = region;
  }
  private updateRimbaCamera() {
    this.collisionBoxes=this.navigation.obstacles.filter(o=>o.width>=1.3).map(o=>new THREE.Box3(new THREE.Vector3(o.x-o.width/2,0,o.z-o.depth/2),new THREE.Vector3(o.x+o.width/2,o.z>20?1.2:o.width===4?3.5:o.width===1.4&&o.depth===1.5?1.3:2.3,o.z+o.depth/2)));
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
    const color=this.region==='space'?'#081426':this.region==='rimba'?(p.report?'#d3dfce':'#cbb59a'):'#d9e9e3';
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
    if(this.dive.controlled||this.rov.active||this.region==='space'&&!this.expedition.landControls)return false;
    const path = findPath(this.position, p, this.navigation);
    if (!path.length) return false;
    if(this.boat.aboard)this.boat.start();
    this.endInteraction(); this.path = path; this.onArrive = onArrive ?? null;
    this.marker.position.set(p.x, 0.15, p.z); this.marker.visible = true;
    return true;
  }
  setMovementInput(input: Point) {
    this.move = this.boat.aboard&&!this.boat.enabled?{x:0,z:0}:input;
    if (Math.hypot(input.x, input.z) > 0) { this.path.length = 0; this.onArrive = null; this.marker.visible = false; }
  }
  stop(resetRun = true) { this.dive.stop();this.expedition.stop();this.rov.stop();this.boat.stop();this.move = { x: 0, z: 0 }; this.path = []; this.marker.visible = false; this.onArrive = null; if (resetRun) this.running = false; this.movement.stop(); }
  resetPosition() {this.recoverDive();this.recoverExpedition();this.recoverRov();this.swimming=false;this.swimAppearance(false); this.recoverBoat();this.stop();this.pushing=false;this.playerAnimator.pushing=false; this.endInteraction(); const spawn = regions[this.region].spawn; this.position.set(spawn.x, 0, spawn.z); this.facing = 0; this.followCamera.reset(); this.followCamera.update(this.position, .016, this.reducedMotion, true); }
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
  endInteraction() { this.coastalFocus=null; this.interacting = null; this.playerAnimator.setPose('none'); this.followCamera.interactionFraming = false; this.followCamera.interactionYaw = 0; }
  setTrial(done: boolean) { this.barrier.visible = done && this.region === 'town'; }
  pick(clientX: number, clientY: number): {divePoint?:Vector3Data;evaPoint?:Vector3Data; rovPoint?:PressurePoint;place?: PlaceId; point?: Point } {
    const rect = this.canvas.getBoundingClientRect();
    this.ray.setFromCamera(new THREE.Vector2((clientX - rect.left) / rect.width * 2 - 1, -(clientY - rect.top) / rect.height * 2 + 1), this.camera);
    const objects = this.ray.intersectObjects(this.scene.children, true);
    if(this.dive.active){const hit=objects.find(o=>o.object.userData.place in divePoints&&visibleForPicking(o.object));if(hit)return{place:hit.object.userData.place};const point=this.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-this.dive.position.y),new THREE.Vector3());return point&&diveNavigation.walkable(point)?{divePoint:{x:point.x,y:point.y,z:point.z}}:{};}
    if(this.rov.active){const target=objects.find(o=>o.object.userData.rovPoint&&visibleForPicking(o.object));return target?{rovPoint:target.object.userData.rovPoint}:{};}
    const hit = objects.find(o => o.object.userData.place && visibleForPicking(o.object));
    if (hit) return { place: hit.object.userData.place as PlaceId };
    if(this.region==='space'&&this.expedition.outside){const point=this.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-this.expedition.eva.position.y),new THREE.Vector3());return point&&evaWalkable(point)?{evaPoint:{x:point.x,y:point.y,z:point.z}}:{};}
    const point = this.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), new THREE.Vector3());
    return point && walkable(point, this.navigation) ? { point: { x: point.x, z: point.z } } : {};
  }
  nearest(): PlaceId | null {
    if(this.dive.controlled)return this.dive.active?this.dive.nearby():null;
    if(this.region==='space'&&!this.expedition.landControls)return this.expedition.outside?this.expedition.eva.nearby():null;
    if(this.rov.active)return null;
    if(this.boat.aboard){const d=this.boat.nearby(this.position);return d?this.boat.docks[d].place:null;}
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
    this.onIrrigationFrame(dt,!document.hidden&&document.hasFocus());
    this.onRiverFrame(dt,!document.hidden&&document.hasFocus());
    if(this.fishingSession?.active){const phase=this.fishingSession.phase;this.playerAnimator.fishingCast=Math.min(1,this.fishingSession.elapsed/.8);this.playerAnimator.setPose(phase==='casting'?'fishCast':phase==='observing'||phase==='released'?'fishPull':'fishWait');}
    let travelled = 0, dx = 0, dz = 0;
    if(this.region==='coast'){
      const controlled=this.dive.controlled,before=this.divePreviousPosition.copy(this.position);const arrived=this.dive.frame(dt,!this.paused&&!this.diveSuspended&&!document.hidden&&document.hasFocus(),this.reducedMotion,this.move,this.yaw);
      if(controlled||this.dive.controlled){this.position.set(this.dive.pose.x,this.dive.pose.y,this.dive.pose.z);travelled=this.position.distanceTo(before);dx=this.position.x-before.x;dz=this.position.z-before.z;this.running=false;}
      this.playerAnimator.diving=this.dive.controlled;const shadow=this.player.getObjectByName('contact-shadow');if(shadow&&!this.boat.aboard)shadow.visible=!this.dive.controlled;
      if(arrived)this.onDiveArrive(arrived);
      this.diveView?.frame(!this.paused&&!document.hidden&&document.hasFocus()?dt:0,this.reducedMotion,this.lowQuality,this.position,this.dive.active);this.onDiveFrame();
    }
    document.body.classList.toggle('dive-mode',this.dive.controlled);this.canvas.dataset.divePhase=this.region==='coast'?this.dive.phase:'inactive';this.canvas.dataset.diveDepth=this.dive.depth.toFixed(3);this.canvas.dataset.diveY=this.dive.position.y.toFixed(3);this.canvas.dataset.diveEquipped=String(this.dive.equipped);this.canvas.dataset.diveDistance=this.dive.distance.toFixed(3);this.canvas.dataset.diveArrivals=String(this.dive.arrivals);this.canvas.dataset.locomotionMode=this.locomotionMode;

    if(this.region==='space'){
      const controlled=this.expedition.controlledPose,before=this.expeditionPreviousPosition.copy(this.position);const arrived=this.expedition.frame(dt,!this.paused&&!document.hidden&&document.hasFocus(),this.reducedMotion,this.move,this.yaw);
      if(controlled||this.expedition.controlledPose){this.position.set(this.expedition.pose.x,this.expedition.pose.y,this.expedition.pose.z);travelled=this.position.distanceTo(before);dx=this.position.x-before.x;dz=this.position.z-before.z;}
      if(!this.expedition.landControls)this.running=false;
      if(arrived&&this.expedition.outside)this.onEvaArrive(arrived);
      const gear=this.expedition.equipped?'astronaut':'none';if(this.playerRig.cosmetics?.mode!==gear)setTemporaryEquipment(this.playerRig,gear);
      this.playerAnimator.floating=this.expedition.outside||this.expedition.phase==='exiting'||this.expedition.phase==='reentering';this.playerAnimator.boating=this.expedition.seated;
      const shadow=this.player.getObjectByName('contact-shadow');if(shadow)shadow.visible=!this.playerAnimator.floating;
    }
    if(!this.paused&&this.rov.active)this.rov.step(this.move,this.yaw+pressureConfig.cameraYawOffset,dt);
    if (!this.paused&&!this.dive.controlled&&!this.rov.active&&!(this.region==='space'&&!this.expedition.landControls)) {
      if (Math.hypot(this.move.x, this.move.z) > 0) {
        this.path.length = 0; this.onArrive = null; this.marker.visible = false;
      }
      const result = this.movement.step(this.position, this.move, this.yaw, this.running, this.path, dt, this.navigation, this.boat.aboard?boatConfig:this.swimming?swimSpeeds:this.pushing?rimbaCartConfig:undefined, this.region==='rimba'?this.trackRimbaStep:this.region==='town'?this.trackMarketStep:undefined);
      travelled = result.distance; dx = result.dx; dz = result.dz;this.updateSwimming(travelled);if(this.boat.aboard)this.boat.motion(this.position,travelled,this.player.rotation.y);
      if (result.arrived || result.blocked && !this.path.length) {
        this.marker.visible = false; const arrive = this.onArrive; this.onArrive = null;
        if (result.arrived) arrive?.();
      }
    }
    if (travelled > .00001 && !this.interacting) this.facing = Math.atan2(dx, dz);
    if(this.region==='space'&&this.expedition.seated)this.facing=0;
    this.player.rotation.y = turnToward(this.player.rotation.y, this.facing, dt);
    this.player.position.copy(this.position);
    if(this.swimming)this.playerAnimator.setPose('none');
    if(this.boat.aboard)this.boat.yaw=this.player.rotation.y;
    this.playerAnimator.update(dt, travelled, this.reducedMotion);
    this.iceParcel.visible=this.region==='town'&&this.marketProgress.parcel.state==='carried'&&!['measure','sample','water','ruler','plant','fishCast','fishWait','fishPull'].includes(this.playerAnimator.pose);if(this.iceParcel.visible){this.playerRig.rightArm.shoulder.rotation.x=-.45;for(const key of ['meter','sample','wateringCan','ruler','rod'] as const)this.playerRig.tools[key].visible=false;}this.canvas.dataset.marketParcelVisible=String(this.iceParcel.visible);
    this.onMarketFrame(dt,this.region==='town'&&!document.hidden&&document.hasFocus());this.canvas.dataset.marketFraction=this.marketFraction.toFixed(3);this.marketView?.frame(this.marketProgress,this.marketFraction,document.hidden||!document.hasFocus()||this.paused&&!this.marketFocus?0:dt,this.reducedMotion);
    this.townView?.frame(dt,!this.paused&&!document.hidden&&document.hasFocus(),this.reducedMotion,this.lowQuality,this.position);
    for (const npc of this.npcs) {
      if(this.region==='town'&&npc.id==='nara')npc.animator.setPose(this.interacting==='nara'?'none':'read');
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
      if(this.region==='town'&&npc.id==='warga'&&this.interacting!=='warga'&&!this.paused&&!this.reducedMotion){npc.rig.rightArm.shoulder.rotation.x=-.45+Math.sin(this.elapsed*1.5)*.10;}
    }
    if(this.riverView){
      this.playerRig.tools.rod.getObjectByName('rod-tip')!.getWorldPosition(this.rodTip);
      this.riverView.frame(document.hidden?0:dt,this.reducedMotion,this.fishingSession?.phase??'idle',this.fishingSession?.elapsed??0,this.fishingGroup,this.rodTip,this.position,this.fishingSession?.site??'A');
    }
    this.onSpaceFrame(dt,this.region==='space'&&!document.hidden&&document.hasFocus());this.spaceView?.frame(this.spaceProgress,this.spaceAngle,this.spaceFocus,this.spaceDetail,this.spaceGuides);document.body.classList.toggle('space-instrument',this.region==='space'&&!!this.spaceFocus);document.body.classList.toggle('space-region',this.region==='space');this.canvas.dataset.spaceDetail=String(this.spaceDetail);this.canvas.dataset.spaceQuality=this.lowQuality?'low':'normal';this.canvas.dataset.spaceGuides=JSON.stringify(this.spaceGuides);this.canvas.dataset.spaceFocus=this.spaceFocus??'';this.canvas.dataset.spaceEarthView=String(this.spaceEarthView);this.canvas.dataset.spaceAngle=String(this.spaceAngle);this.canvas.dataset.spaceModels=this.spaceView?'3':'0';
    if(this.region==='space'&&this.expeditionView){
      this.spaceInterior!.visible=this.expedition.showInterior;
      this.player.updateMatrixWorld(true);const socket=this.playerRig.spaceGear?.tetherSocket;this.expeditionView.frame(this.expedition,socket?socket.getWorldPosition(this.tetherPoint):null);
      const ground=this.expeditionView.preparation.visible;this.spaceView!.sky.visible=!ground;const sky=this.scene.background as THREE.Color;sky.set(ground?'#91b7c9':'#081426');(this.scene.fog as THREE.Fog).color.copy(sky);
      this.canvas.dataset.expeditionPhase=this.expedition.phase;this.canvas.dataset.expeditionDirection=this.expedition.direction;this.canvas.dataset.expeditionEquipped=String(this.expedition.equipped);this.canvas.dataset.innerDoor=String(this.expedition.innerOpen);this.canvas.dataset.outerDoor=String(this.expedition.outerOpen);this.canvas.dataset.evaY=this.expedition.eva.position.y.toFixed(3);this.canvas.dataset.evaLength=this.expedition.eva.length.toFixed(3);this.canvas.dataset.evaDistance=this.expedition.eva.distance.toFixed(3);this.canvas.dataset.evaArrivals=String(this.expedition.eva.arrivals);this.canvas.dataset.shuttleCount='1';this.onExpeditionFrame();
    }else{this.canvas.dataset.expeditionPhase='inactive';this.canvas.dataset.shuttleCount='0';}
    document.body.classList.toggle('space-special',this.region==='space'&&!this.expedition.landControls);document.body.classList.toggle('space-eva',this.region==='space'&&this.expedition.outside);
    this.onGeoFrame(dt,this.region==='geopark'&&!document.hidden&&document.hasFocus());this.geoView?.frame(this.geoProgress,this.geoFraction);this.canvas.dataset.geoExercise=String(this.geoProgress.exercise);this.canvas.dataset.geoModels=this.geoView?'3':'0';
    this.onPontoonFrame(dt,this.region==='river'&&!document.hidden&&document.hasFocus());this.pontoonView?.frame(this.pontoonProgress,this.pontoonFraction,this.pontoonZ);if(this.pontoonView){this.canvas.dataset.pontoonZ=String(this.pontoonZ);this.canvas.dataset.pontoonLoads='1';this.canvas.dataset.pontoonObjectY=String(this.regionRoot.userData.pontoonObjectY);}
    this.onSolidFrame(dt,this.region==='rimba'&&!document.hidden&&document.hasFocus());this.solidView?.frame(this.solidProgress,this.solidFraction);if(this.solidView){this.canvas.dataset.solidLoads='1';this.canvas.dataset.solidPressure=String(this.regionRoot.userData.solidPressure??'');this.canvas.dataset.solidLoadY=String(this.regionRoot.userData.solidLoadY);this.canvas.dataset.solidSlide=String(this.regionRoot.userData.solidSlide);this.canvas.dataset.solidApplied=String(this.regionRoot.userData.solidApplied);}
    this.onHydraulicFrame(dt,this.region==='workshop'&&!document.hidden&&document.hasFocus());this.hydraulicView?.frame(this.hydraulicProgress,this.hydraulicFraction);if(this.hydraulicView){this.canvas.dataset.hydraulicInput=String(this.regionRoot.userData.hydraulicInputMm);this.canvas.dataset.hydraulicOutput=String(this.regionRoot.userData.hydraulicOutputMm);this.canvas.dataset.hydraulicCrates='1';}
    this.onEnergyFrame(dt,this.region==='workshop'&&!document.hidden);this.energyView?.frame(document.hidden?0:dt,this.energyFraction,this.reducedMotion);if(this.energyView)this.canvas.dataset.energyRotor=String(this.regionRoot.userData.energyRotorAngle??0);
    this.onElectromagnetFrame(dt,this.region==='workshop'&&!document.hidden);
    this.electromagnetView?.frame(this.electromagnetProgress,this.electromagnetFraction);
    this.riverView?.pool.frame(this.buoyancyTrial);this.canvas.dataset.swimming=String(this.swimming);
    this.riverView?.irrigation.frame(this.boat,this.flowSampling);
    this.coastalView?.frame(document.hidden||this.paused?0:dt,this.reducedMotion,this.boat);this.canvas.dataset.coastFocus=this.coastalFocus??'';
    this.canvas.dataset.boatAboard=String(this.boat.aboard);this.canvas.dataset.boatEnabled=String(this.boat.enabled);this.canvas.dataset.boatDock=this.boat.dock??'';this.canvas.dataset.boatDistance=String(this.boat.distanceMm);
    this.canvas.dataset.fishingPhase=this.fishingSession?.phase??'idle';
    this.canvas.dataset.rodVisible=String(this.playerRig.tools.rod.visible);
    this.rimbaView?.frame(this.position,this.player.rotation.y,travelled,this.pushing,this.reducedMotion);
    this.canvas.dataset.pushing=String(this.pushing);if(this.rimbaView)this.canvas.dataset.cartWheelAngle=this.rimbaView.wheelAngle().toFixed(4);
    if(this.energyFocus==='solar')this.energyCameraPoint.set(-12,.7,-25.2);else if(this.energyFocus==='wind')this.energyCameraPoint.set(-4,1.7,-25.7);else if(this.energyFocus==='battery')this.energyCameraPoint.set(4,.6,-25.7);else this.energyCameraPoint.set(29,.6,-25.7);
    if(this.coastalFocus)this.coastalView?.focus(this.coastalFocus,this.coastalCameraPoint);
    if(this.geoFocus){const focus=this.geoFocus;const p=this.places.find(p=>p.id===(focus==='earth'?'geoEarth':plateModels[focus].place));if(p)this.geoCameraPoint.set(p.x,1,p.z-.8);}
    this.pontoonCameraPoint.set(this.pontoonFocus==='spring'?-6:7,this.pontoonFocus==='spring'?1:0,this.pontoonFocus==='spring'?23.2:this.pontoonZ);
    this.rovCameraPoint.set(this.rov.position.x,this.rov.position.y,this.rov.position.z);if(this.rov.active)this.followCamera.interactionYaw=pressureConfig.cameraYawOffset;this.followCamera.targetHeight=this.dive.controlled?.8:this.rov.active||this.pontoonFocus?.20:characterConfig.cameraTargetHeight;this.followCamera.distanceScale=this.dive.controlled?(this.diveFocus?.55:.58):this.region==='space'&&this.expedition.outside?.65:this.rov.active?.55:(this.marketFocus||this.spaceFocus||this.geoFocus||this.hydraulicFocus||this.solidFocus||this.pontoonFocus)?.38:1;
    if(this.diveFocus){const p=divePoints[this.diveFocus].position;this.diveCameraPoint.set(p.x,p.y,p.z);}
    if(this.marketFocus){const p=this.places.find(p=>p.id===this.marketFocus);if(p)this.marketCameraPoint.set(p.x,.20,p.z-1);}
    this.followCamera.inspectionWidth=this.marketFocus?2.8:this.spaceFocus?(this.spaceFocus==='revolution'?9.8:6.3):this.geoFocus?4.5:this.pontoonFocus?(this.pontoonFocus==='spring'?2.4:4.5):this.solidFocus?4.8:this.hydraulicFocus?3.3:this.coastalFocus?3:this.energyFocus?(this.energyFocus==='service'?5:4):this.electromagnetCamera&&this.region==='workshop'?10:0;
    if(!(this.region==='space'&&(this.expedition.controlledPose&&!this.expedition.outside||this.spaceFocus&&(this.spaceEarthView||this.spaceDetail))))this.followCamera.update(this.diveFocus?this.diveCameraPoint:this.marketFocus&&this.region==='town'?this.marketCameraPoint:this.spaceFocus&&this.region==='space'&&this.spaceView?this.spaceView.cameraPoint:this.geoFocus&&this.region==='geopark'?this.geoCameraPoint:this.pontoonFocus&&this.region==='river'?this.pontoonCameraPoint:this.solidFocus&&this.region==='rimba'?this.solidCameraPoint:this.hydraulicFocus&&this.region==='workshop'?this.hydraulicCameraPoint:this.rov.active?this.rovCameraPoint:this.coastalFocus&&this.region==='coast'?this.coastalCameraPoint:this.energyFocus&&this.region==='workshop'?this.energyCameraPoint:this.electromagnetCamera&&this.region==='workshop'?this.electromagnetCameraPoint:this.position, dt, this.reducedMotion);
    if(this.region==='space'&&this.expedition.controlledPose&&!this.expedition.outside){
      if(this.expedition.inVehicle){const ship=this.expedition.shipPosition();this.expeditionTarget.set(ship.x,ship.y+1.15,ship.z);this.expeditionCamera.set(ship.x+5,ship.y+2.8,ship.z+5.5);}else{this.expeditionTarget.set(14,1.2,21);this.expeditionCamera.set(18.6,3.5,25.6);}
      this.camera.setViewOffset(innerWidth,innerHeight,innerWidth>=701?innerWidth*.18:0,innerWidth<701?innerHeight*.16:0,innerWidth,innerHeight);this.spaceInstrumentCamera.update(this.camera,this.expeditionCamera,this.expeditionTarget,dt,this.reducedMotion);this.camera.layers.set(0);
    }else if(this.region==='space'&&this.spaceFocus&&this.spaceView&&(this.spaceEarthView||this.spaceDetail)){
      this.camera.layers.set(this.spaceEarthView?3:0);
      this.spaceInstrumentCamera.update(this.camera,this.spaceEarthView?this.spaceView.earthObserver:this.spaceView.detailPosition,this.spaceEarthView?this.spaceView.moonTarget:this.spaceView.detailTarget,dt,this.reducedMotion);
    }else{this.camera.layers.set(0);this.spaceInstrumentCamera.reset();}
    this.canvas.dataset.spaceCameraReady=String(this.spaceInstrumentCamera.ready);
    this.onPressureFrame(dt,this.region==='coast'&&!document.hidden&&document.hasFocus());
    this.pressureView?.frame(document.hidden||this.paused?0:dt,this.reducedMotion,this.rov);
    if(this.rov.active){(this.scene.background as THREE.Color).set('#86b7b6');const f=this.scene.fog as THREE.Fog;f.color.set('#86b7b6');f.near=8;f.far=38;}
    if(this.region==='coast'){
      const under=this.waterEnvironment.update(this.camera.position.y,this.dive.active);if(!this.rov.active){const color=under?'#448f9e':'#d9e9e3';(this.scene.background as THREE.Color).set(color);const f=this.scene.fog as THREE.Fog;f.color.set(color);f.near=under?4:48;f.far=under?(this.lowQuality?23:30):100;}
    }else this.waterEnvironment.reset();
    this.canvas.dataset.underwater=String(this.waterEnvironment.underwater);this.canvas.dataset.waterSwitches=String(this.waterEnvironment.switches);
    this.canvas.dataset.rovActive=String(this.rov.active);this.canvas.dataset.rovDepth=this.rov.depth.toFixed(3);this.canvas.dataset.rovTarget=this.rov.targetDepth.toFixed(3);this.canvas.dataset.rovX=this.rov.position.x.toFixed(3);this.canvas.dataset.rovZ=this.rov.position.z.toFixed(3);this.canvas.dataset.rovY=this.rov.position.y.toFixed(3);this.canvas.dataset.rovPressure=String(Math.round(waterPressurePa(Math.max(0,this.rov.depth))));this.canvas.dataset.rovStable=this.rov.stable??'';this.canvas.dataset.rovMoving=String(this.rov.moving);
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
      this.canvas.dataset.avatarRoots=String(this.scene.children.filter(o=>o.name.startsWith('character-')).length);this.canvas.dataset.regionRoots=String(this.scene.children.filter(o=>o.name==='active-region').length);this.canvas.dataset.regionDisposals=String(this.regionDisposals);this.canvas.dataset.geometries=String(this.renderer.info.memory.geometries);this.canvas.dataset.textures=String(this.renderer.info.memory.textures);
      this.canvas.dataset.drawCalls = String(this.renderer.info.render.calls);
      this.canvas.dataset.triangles = String(this.renderer.info.render.triangles);
      for (const [id, label] of this.npcLabels) {
        this.projectedLabel.copy(label.position).project(this.camera);
        this.canvas.setAttribute(`data-${id}-label-x`, ((this.projectedLabel.x*.5+.5)*innerWidth).toFixed(1));
        this.canvas.setAttribute(`data-${id}-label-y`, ((-.5*this.projectedLabel.y+.5)*innerHeight).toFixed(1));
      }
    }
    if(this.region==='town'){
      for(const label of this.regionLabels){
        const near=Math.hypot(label.position.x-this.position.x,label.position.z-this.position.z);
        label.visible=!this.marketFocus&&(near<townLabelRange||this.interacting===label.userData.place);
        const distance=label.position.distanceTo(this.camera.position),pixels=Math.min(158,innerWidth*.34);
        const width=Math.min(2.7,distance*2*Math.tan(this.camera.fov*Math.PI/360)*pixels/innerHeight);
        label.scale.set(width,width/(512/96),1);
      }
      for(const disc of this.townIndicators)disc.visible=!this.marketFocus&&Math.hypot(disc.position.x-this.position.x,disc.position.z-this.position.z)<5;
      this.canvas.dataset.townActors=String(this.lowQuality?2:3);
      this.canvas.dataset.townAmbientTime=String(this.townView?.root.userData.ambientTime??0);
      this.canvas.dataset.townLabels=String(this.regionLabels.filter(l=>l.visible).length);
    }
    if(this.region==='space')for(const label of this.regionLabels){label.visible=!this.spaceFocus&&Math.hypot(label.position.x-this.position.x,label.position.z-this.position.z)<9;const width=Math.min(2.6,label.position.distanceTo(this.camera.position)*2*Math.tan(this.camera.fov*Math.PI/360)*Math.min(150,innerWidth*.34)/innerHeight);label.scale.set(width,width/(512/96),1);}
    if(this.region==='geopark')for(const label of this.regionLabels)label.visible=!this.geoFocus&&Math.hypot(label.position.x-this.position.x,label.position.z-this.position.z)<12;
    if(this.region==='workshop')for(const label of this.regionLabels)label.visible=!this.hydraulicFocus;
    if(this.region==='garden'||this.region==='rimba'||this.region==='river'||this.region==='coast') for(const label of this.regionLabels) {
      const nearPlayer=Math.hypot(label.position.x-this.position.x,label.position.z-this.position.z);
      const distance=label.position.distanceTo(this.camera.position), plant=label.userData.plantLabel;
      label.visible=!this.dive.controlled&&!this.pontoonFocus&&!this.solidFocus&&!this.rov.active&&!label.userData.regionHidden && distance>2.5 && nearPlayer<(plant?7:14) && (!this.interacting || label.userData.place===this.interacting);
      const maxPixels=plant?38:Math.min(174,innerWidth*.36);
      const width=Math.min(plant?.65:['sari','damar','lestari','coastLestari'].includes(label.userData.place)?2:3.2,distance*2*Math.tan(this.camera.fov*Math.PI/360)*maxPixels/innerHeight);
      label.scale.set(width,width/(plant?2:512/96),1);
    }
    this.gardenView?.frame(dt, this.reducedMotion);
    this.canvas.dataset.region = this.region;
    this.canvas.dataset.playerHeight = this.playerRig.dimensions.height.toFixed(3);
    this.canvas.dataset.playerScale = this.playerRig.visual.scale.y.toFixed(6);
    this.canvas.dataset.avatar = this.playerRig.kind;
    if(this.wardrobePreview&&this.wardrobeStage)this.wardrobePreview.render(this.renderer,this.wardrobeStage.getBoundingClientRect());else this.renderer.render(this.scene, this.camera);
  }
}
