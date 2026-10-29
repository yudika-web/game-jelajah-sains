import { movementConfig } from './movement';
import type { CharacterRig } from './character';

export type InteractionPose = 'none' | 'greet' | 'read' | 'measure' | 'sample' | 'water' | 'ruler' | 'plant' | 'fishCast' | 'fishWait' | 'fishPull';
export function damp(current: number, target: number, response: number, dt: number) {
  return target + (current - target) * Math.exp(-response * dt);
}
export function turnToward(current: number, target: number, dt: number, response = 11) {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + delta * (1 - Math.exp(-response * dt));
}
export class CharacterAnimator {
  pose: InteractionPose = 'none';
  pushing = false;
  swimming=false;
  boating = false;
  floating=false;
  fishingCast = 0;
  speed = 0;
  state: 'idle' | 'walk' | 'run' | 'interact' | 'float' = 'idle';
  private runBlend = 0;
  stride = 0;
  private time = 0;
  private blend = 0;
  private greeting = 0;
  private interaction = 0;
  private lookYaw = 0;
  private requestedLook = 0;
  private lastPose: InteractionPose = 'none';
  private activePose: InteractionPose = 'none';
  private arms;
  private legs;
  private armJoints;
  private previousArmRotations = new Float64Array(18);
  constructor(readonly rig: CharacterRig, private phase = 0) {
    this.arms = [rig.leftArm, rig.rightArm]; this.legs = [rig.leftLeg, rig.rightLeg];
    this.armJoints = [rig.leftArm.shoulder, rig.leftArm.elbow, rig.leftArm.hand, rig.rightArm.shoulder, rig.rightArm.elbow, rig.rightArm.hand];
  }
  setPose(pose: InteractionPose) { this.pose = pose; }
  greet() { this.greeting = 1; }
  lookAt(relativeYaw: number) { this.requestedLook = Math.max(-.65, Math.min(.65, relativeYaw)); }
  /** distance is the *actual* navigation displacement after collision resolution. */
  update(dt: number, distance: number, reducedMotion = false) {
    dt = Math.min(Math.max(dt, 0), movementConfig.maxFrameTime);
    const r = this.rig;
    for (let i = 0; i < this.armJoints.length; i++) {
      const rotation = this.armJoints[i].rotation;
      this.previousArmRotations[i * 3] = rotation.x; this.previousArmRotations[i * 3 + 1] = rotation.y; this.previousArmRotations[i * 3 + 2] = rotation.z;
    }
    this.time += dt;
    this.speed = dt > 0 ? distance / dt : 0;
    const walking = !this.swimming && !this.boating && !this.floating && this.pose === 'none' && this.speed > .025;
    this.state = this.floating?'float':this.swimming || this.boating || this.pose !== 'none' ? 'interact' : !walking ? 'idle' : this.speed > movementConfig.walkSpeed + .35 ? 'run' : 'walk';
    this.blend = damp(this.blend, walking ? Math.min(1, this.speed / movementConfig.walkSpeed) : 0, walking ? 18 : 24, dt);
    this.runBlend = damp(this.runBlend, walking ? Math.max(0, Math.min(1, (this.speed - movementConfig.walkSpeed) / (movementConfig.runSpeed - movementConfig.walkSpeed))) : 0, 14, dt);
    // Stop advancing the cycle at a wall: only a short settling transition remains.
    this.stride += reducedMotion || !walking ? 0 : distance * 3.3;
    const wave = reducedMotion ? 0 : Math.sin(this.stride);
    const sway = reducedMotion ? 0 : Math.sin(this.time * 1.6 + this.phase);
    const moving = reducedMotion ? 0 : this.blend;
    this.interaction = damp(this.interaction, this.pose === 'none' ? 0 : 1, 10, dt);
    if (this.pose !== 'none') this.activePose = this.pose;
    const pose = this.interaction > .001 ? this.activePose : 'none';
    this.greeting = Math.max(0, this.greeting - dt * .65);
    const greet = reducedMotion ? 0 : Math.sin(this.time * 9) * .16 * this.greeting;
    const breathe = reducedMotion ? 0 : sway * .0015;
    r.torso.scale.y = 1 + breathe;
    r.torso.rotation.z = sway * .008 * (1 - moving) + wave * moving * .025;
    r.torso.rotation.x = moving * (.035 + this.runBlend * .09);
    r.visual.position.y = r.dimensions.visualY; // feet remain on the ground; no root bobbing
    this.lookYaw = damp(this.lookYaw, this.requestedLook, 5, dt);
    r.head.rotation.y = this.lookYaw + (reducedMotion ? 0 : Math.sin(this.time * .55 + this.phase) * .035);
    r.head.rotation.x = reducedMotion ? 0 : Math.sin(this.time * .8 + this.phase) * .015;
    const blink = !reducedMotion && (this.time + this.phase) % 5.1 > 4.98;
    r.eyes.scale.y = blink ? .12 : 1;
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1, step = wave * (i === 0 ? 1 : -1);
      const a = this.arms[i], l = this.legs[i];
      a.shoulder.rotation.set(step * moving * (.43 + this.runBlend * .25), 0, side * .035);
      a.elbow.rotation.set(0,0,0);
      a.hand.rotation.set(0, 0, 0);
      const angle = -step * moving * (r.kind==='nara' ? .055 : .38 + this.runBlend * .20);
      l.hip.rotation.x = angle;
      // Rigid feet: compensate only the tiny low corner of a swung block, in base units.
      l.hip.position.y = 1.35 + Math.max(0,.30*Math.abs(Math.sin(angle))-1.35*(1-Math.cos(angle)));
      l.knee.rotation.set(0,0,0); l.ankle.rotation.set(0,0,0);
    }
    if (pose !== this.lastPose) {
      r.tools.notebook.visible = pose === 'read';
      r.tools.meter.visible = pose === 'measure';
      r.tools.sample.visible = pose === 'sample';
      r.tools.wateringCan.visible = pose === 'water'; r.tools.ruler.visible = pose === 'ruler';
      this.lastPose = pose;
    }
    const interaction = this.interaction;
    if (pose === 'read') {
      r.leftArm.shoulder.rotation.x -= 1.05 * interaction;
      r.leftArm.hand.rotation.y = .25 * interaction;
      r.head.rotation.x += .17 * interaction;
    } else if (pose === 'measure' || pose === 'sample' || pose === 'water' || pose === 'ruler' || pose === 'plant') {
      r.rightArm.shoulder.rotation.x -= (pose === 'water' ? 1.05 : .85) * interaction;
      r.head.rotation.x += .14 * interaction;
      if(pose==='water') r.rightArm.hand.rotation.z = -.35 * interaction;
      if(pose==='plant') r.torso.rotation.x += .18 * interaction;
    } else if (pose === 'fishCast' || pose === 'fishWait' || pose === 'fishPull') {
      r.rightArm.shoulder.rotation.x=-(pose==='fishCast'?1.8-this.fishingCast*.95:pose==='fishPull'?1.35:.85)*interaction;
      r.leftArm.shoulder.rotation.x=-.65*interaction;r.torso.rotation.x=(pose==='fishPull'?-.04:.02)*interaction;
    } else if (pose === 'greet' || this.greeting > 0) {
      const strength = this.pose === 'greet' ? interaction : this.greeting;
      const conversational = r.kind === 'wira';
      r.rightArm.shoulder.rotation.z = (conversational ? .20 : .92 + greet*.3) * strength;
      r.rightArm.shoulder.rotation.x = (conversational ? -.55 : -.65) * strength;
      r.rightArm.hand.rotation.z = conversational ? greet * .35 : greet;
      if (conversational) { r.leftArm.shoulder.rotation.x -= .20 * strength; r.head.rotation.x += .045 * strength; }
    }
    if(this.pushing && this.pose==='none') {
      r.leftArm.shoulder.rotation.x=-.85;r.rightArm.shoulder.rotation.x=-.85;
      r.leftArm.shoulder.rotation.z=-.025;r.rightArm.shoulder.rotation.z=.025;
      r.torso.rotation.x=reducedMotion?0:.06;
    }
    if(this.swimming){r.visual.position.y=r.dimensions.visualY-.90;r.torso.rotation.x=.85;for(let i=0;i<2;i++){this.arms[i].shoulder.rotation.x=-1.2+(reducedMotion?0:Math.sin(this.time*4+i*Math.PI)*.35*Math.min(1,this.speed));this.legs[i].hip.rotation.x=.5+(reducedMotion?0:Math.sin(this.time*4+i*Math.PI)*.16*Math.min(1,this.speed));}}
    if(this.floating){r.torso.rotation.set(.035,0,0);for(const arm of this.arms){arm.shoulder.rotation.x=-.35;arm.shoulder.rotation.z=arm===this.arms[0]?-.18:.18;}for(const leg of this.legs){leg.hip.rotation.x=.12;leg.hip.position.y=1.35;}}
    if(this.boating){for(const leg of this.legs){leg.hip.rotation.x=-1.25;leg.hip.position.y=1.35;}r.leftArm.shoulder.rotation.x=-.75;r.rightArm.shoulder.rotation.x=-.75;r.torso.rotation.set(0,0,0);}
    for (let i = 0; i < this.armJoints.length; i++) {
      const rotation = this.armJoints[i].rotation;
      rotation.x = damp(this.previousArmRotations[i * 3], rotation.x, 18, dt);
      rotation.y = damp(this.previousArmRotations[i * 3 + 1], rotation.y, 18, dt);
      rotation.z = damp(this.previousArmRotations[i * 3 + 2], rotation.z, 18, dt);
    }
  }
}
