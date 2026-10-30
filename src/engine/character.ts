import {applyDivingEquipment,type DivingEquipment} from './divingEquipment';
import {applyAstronautEquipment,type AstronautEquipment} from './astronautEquipment';
import type {Appearance} from '../game/appearance';
import type {TemporaryEquipment} from '../data/appearanceCatalog';
import type * as THREE from 'three';
import { buildReferenceCharacter } from './characterModel';

export type CharacterKind = 'explorer' | 'explorerGirl' | 'nara' | 'wira' | 'sari' | 'damar' | 'lestari' | 'bima' | 'raka' | 'mira';
export interface ArmRig { shoulder: THREE.Group; elbow: THREE.Group; hand: THREE.Group; toolSocket: THREE.Group; }
export interface LegRig { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group; }
export interface CharacterRig {
  kind: CharacterKind;
  appearance:Appearance|null;
  spaceGear?:AstronautEquipment;
  diveGear?:DivingEquipment;
  cosmetics?:{hair:THREE.Group;headwear:THREE.Group;facewear:THREE.Group;backpack:THREE.Group;outfitDetails:THREE.Group;equipment:THREE.Group;crown:THREE.Object3D;fringe:THREE.Object3D;mode:TemporaryEquipment};
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
  /** The six rigid avatar blocks; sockets do not split the visible limbs. */
  core: THREE.Mesh[];
  bodyMeshes: THREE.Mesh[];
  dimensions: { baseHeight: number; height: number; scale: number; groundY: number; visualY: number; headCenter: number; headHeight: number };
  labelSocket: THREE.Group;
  tools: { notebook: THREE.Group; meter: THREE.Group; sample: THREE.Group; wateringCan: THREE.Group; ruler: THREE.Group; bucket:THREE.Group; rod:THREE.Group; vest:THREE.Group };
}

export function createCharacter(kind: CharacterKind, placeId?: string, appearance?:Appearance): CharacterRig {
  return buildReferenceCharacter(kind, placeId, appearance);
}

/** Equipment is transient. It never writes to the personal selection or ownership. */
export function setTemporaryEquipment(rig:CharacterRig,mode:TemporaryEquipment){
 const c=rig.cosmetics;if(!c||!rig.appearance)return;
 applyAstronautEquipment(rig,false);applyDivingEquipment(rig,false);
 if(mode==='astronaut')applyAstronautEquipment(rig,true);if(mode==='dive')applyDivingEquipment(rig,true);
 if(mode==='dive')c.equipment.children.forEach(o=>o.visible=false);
 c.outfitDetails.visible=mode==='none';c.mode=mode;c.equipment.visible=mode!=='none';c.hair.visible=mode==='none';c.headwear.visible=mode==='none';c.facewear.visible=mode==='none';c.backpack.visible=mode==='none';
 rig.root.userData.equipment=mode;
}
