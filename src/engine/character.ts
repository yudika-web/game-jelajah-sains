import type * as THREE from 'three';
import { buildReferenceCharacter } from './characterModel';

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

export function createCharacter(kind: CharacterKind, placeId?: string): CharacterRig {
  return buildReferenceCharacter(kind, placeId);
}
