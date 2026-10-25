import * as THREE from 'three';
import { damp } from './characterAnimator';
import { characterConfig } from './characterConfig';

export type CameraDistance = 'near' | 'normal' | 'far';
export const cameraDistances: Record<CameraDistance, number> = { near: 8.5, normal: 10.8, far: 14 };

export class FollowCamera {
  distance: CameraDistance = 'normal';
  yaw = .25;
  pitch = .46;
  safeDistance = cameraDistances.normal;
  interactionFraming = false;
  interactionYaw = 0;
  inspectionWidth = 0; // Optional apparatus framing; exploration preferences remain unchanged.
  private target = new THREE.Vector3();
  private offset = new THREE.Vector3();
  private desired = new THREE.Vector3();
  private hit = new THREE.Vector3();
  private direction = new THREE.Vector3();
  private ray = new THREE.Ray();
  private currentDistance = cameraDistances.normal;
  private width = 1;
  private height = 1;
  private shiftX = 0;
  private shiftY = 0;
  private paddedBoxes: THREE.Box3[];
  constructor(readonly camera: THREE.PerspectiveCamera, boxes: THREE.Box3[]) {
    // Approximate camera radius keeps the near plane clear of wall corners.
    this.paddedBoxes = boxes.map(b => b.clone().expandByScalar(.30));
  }
  setObstacles(boxes: THREE.Box3[]) { this.paddedBoxes = boxes.map(b => b.clone().expandByScalar(.30)); }
  reset() { this.yaw = .25; this.pitch = .46; }
  resize(width: number, height: number) {
    this.width = width; this.height = height;
    this.camera.aspect = width / height;
    // Move the character modestly right of centre on wide screens, away from the mission card.
    const shift = width >= 701 ? Math.min(width * .065, 100) : 0;
    this.camera.setViewOffset(width, height, -shift, 0, width, height);
    this.shiftX = -shift; this.shiftY = 0;
    this.camera.updateProjectionMatrix();
  }
  private clearance(direction: THREE.Vector3, maximum: number) {
    this.ray.set(this.target, direction);
    let distance = maximum;
    for (const box of this.paddedBoxes) {
      if (this.ray.intersectBox(box, this.hit)) distance = Math.min(distance, Math.max(.025, this.hit.distanceTo(this.target) - .1));
    }
    return distance;
  }
  update(position: THREE.Vector3, dt: number, reducedMotion: boolean, immediate = false) {
    const wide = this.width >= 701;
    const shiftX = this.interactionFraming ? (wide ? this.width * .20 : 0) : (wide ? -Math.min(this.width * .065, 100) : 0);
    const shiftY = wide ? 0 : this.height * (this.interactionFraming ? .16 : -.055);
    this.shiftX = reducedMotion || immediate ? shiftX : damp(this.shiftX, shiftX, 8, dt);
    this.shiftY = reducedMotion || immediate ? shiftY : damp(this.shiftY, shiftY, 8, dt);
    this.camera.setViewOffset(this.width, this.height, this.shiftX, this.shiftY, this.width, this.height);
    // Follow the stable world root, not the animated torso/head.
    this.target.copy(position); this.target.y += characterConfig.cameraTargetHeight;
    const angle = this.yaw + this.interactionYaw;
    this.offset.set(Math.sin(angle) * Math.cos(this.pitch), Math.sin(this.pitch), Math.cos(angle) * Math.cos(this.pitch));
    const requested = Math.max(cameraDistances[this.distance], this.inspectionWidth / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.aspect) * (wide ? 1.8 : 1.1));
    this.safeDistance = this.clearance(this.offset, requested);
    this.currentDistance = immediate || this.safeDistance < this.currentDistance ? this.safeDistance : damp(this.currentDistance, this.safeDistance, 5, dt);
    this.desired.copy(this.target).addScaledVector(this.offset, this.currentDistance);
    this.camera.position.lerp(this.desired, immediate || reducedMotion ? 1 : 1 - Math.exp(-9 * dt));
    // Smoothing an orbit can sweep across a corner even if the desired ray is clear.
    this.direction.copy(this.camera.position).sub(this.target);
    const length = this.direction.length();
    if (length > 0) {
      this.direction.divideScalar(length);
      const clear = this.clearance(this.direction, length);
      if (clear < length) this.camera.position.copy(this.target).addScaledVector(this.direction, clear);
    }
    this.camera.lookAt(this.target);
  }
}
