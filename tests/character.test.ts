import { describe, it, expect } from 'vitest';
import { Vector3, Box3, PerspectiveCamera } from 'three';
import { createCharacter } from '../src/engine/character';
import { CharacterAnimator, turnToward } from '../src/engine/characterAnimator';
import { FollowCamera } from '../src/engine/cameraController';
import { findPath, walkable } from '../src/engine/navigation';
import { characterBodyBounds } from '../src/engine/characterModel';
import { characterConfig, environmentDimensions, playerVariant } from '../src/engine/characterConfig';

describe('articulated characters and movement-derived animation', () => {
  it('builds six rigid blocks at absolute configured heights, grounded and repeatable', () => {
    for(const kind of ['explorer','explorerGirl','nara','wira','sari'] as const) {
      const rig=createCharacter(kind), again=createCharacter(kind), bounds=characterBodyBounds(rig);
      expect(rig.core).toHaveLength(6);
      expect(bounds.max.y-bounds.min.y).toBeCloseTo(characterConfig.heights[kind],6);
      expect(bounds.min.y).toBeCloseTo(characterConfig.groundY,6);
      expect(rig.root.scale.toArray()).toEqual([1,1,1]);
      expect(rig.visual.scale.toArray()).toEqual([rig.dimensions.scale,rig.dimensions.scale,rig.dimensions.scale]);
      expect(again.dimensions.scale).toBe(rig.dimensions.scale);
      expect(again.dimensions.height).toBe(rig.dimensions.height);
      expect(rig.leftArm.shoulder.children.filter(n=>n.type==='Mesh')).toHaveLength(1);
      expect(rig.leftLeg.hip.children.filter(n=>n.type==='Mesh')).toHaveLength(1);
      expect(rig.leftArm.elbow.children.filter(n=>n.type==='Mesh')).toHaveLength(0);
      expect(rig.leftLeg.knee.children.filter(n=>n.type==='Mesh')).toHaveLength(0);
      expect(environmentDimensions.door.height-bounds.max.y).toBeGreaterThan(.20);
      expect(rig.labelSocket.position.y-bounds.max.y).toBeCloseTo(.30);
    }
  });
  it('ignores held tools, labels and shadow when measuring body height',()=> {
    const rig=createCharacter('explorer');const before=characterBodyBounds(rig);
    Object.values(rig.tools).forEach(t=>{t.visible=true;t.scale.setScalar(10);});
    rig.labelSocket.position.y=100;rig.root.getObjectByName('contact-shadow')!.position.y=-20;
    expect(characterBodyBounds(rig)).toEqual(before);
  });
  it('provides a distinct siswi silhouette without changing student size or mission state',()=> {
    const boy=createCharacter('explorer'),girl=createCharacter('explorerGirl');
    expect(boy.root.getObjectByName('ponytail')).toBeUndefined();expect(girl.root.getObjectByName('ponytail')).toBeDefined();
    expect(girl.dimensions.height).toBe(boy.dimensions.height);
    expect(playerVariant('siswi')).toBe('explorerGirl');expect(playerVariant(null)).toBe('explorer');
  });
  it('keeps navigation roots and label/tool attachment identities stable', () => {
    for (const kind of ['explorer', 'explorerGirl', 'nara', 'wira', 'sari'] as const) {
      const rig = createCharacter(kind, kind === 'nara' ? 'nara' : kind === 'wira' ? 'warga' : kind === 'sari' ? 'sari' : undefined);
      const animator = new CharacterAnimator(rig, 1);
      rig.root.position.set(3, 0, 6); const origin = rig.root.position.clone();
      const label = rig.labelSocket.position.clone();
      animator.setPose('read');
      for (let i = 0; i < 120; i++) animator.update(1 / 60, .03);
      expect(rig.root.position).toEqual(origin);
      expect(rig.labelSocket.position).toEqual(label);
      expect(rig.leftArm.toolSocket.parent).toBe(rig.leftArm.hand);
      expect(rig.rightLeg.knee.parent).toBe(rig.rightLeg.hip);
      if (kind !== 'explorer' && kind !== 'explorerGirl') rig.root.traverse(o => expect(o.userData.place).toBe(kind === 'nara' ? 'nara' : kind === 'sari' ? 'sari' : 'warga'));
    }
  });
  it('settles the feet after collision without advancing the stride in place', () => {
    const rig = createCharacter('explorer'), animator = new CharacterAnimator(rig);
    for (let i = 0; i < 60; i++) animator.update(1 / 60, 4.6 / 60);
    const stride = animator.stride;
    for (let i = 0; i < 90; i++) animator.update(1 / 60, 0);
    expect(animator.stride).toBe(stride);
    expect(animator.speed).toBe(0);
    expect(rig.leftLeg.hip.rotation.x).toBeCloseTo(0, 3);
    expect(rig.rightLeg.hip.rotation.x).toBeCloseTo(0, 3);
  });
  it('is stable across different frame rates, follows the shortest turn, and clamps head motion', () => {
    const a = new CharacterAnimator(createCharacter('explorer')), b = new CharacterAnimator(createCharacter('explorer'));
    for (let i = 0; i < 60; i++) a.update(1 / 60, 2 / 60);
    for (let i = 0; i < 30; i++) b.update(1 / 30, 2 / 30);
    expect(a.stride).toBeCloseTo(b.stride, 8);
    expect(a.rig.leftLeg.hip.rotation.x).toBeCloseTo(b.rig.leftLeg.hip.rotation.x, 3);
    const turned = turnToward(Math.PI - .01, -Math.PI + .01, 1 / 60);
    expect(turned).toBeGreaterThan(Math.PI - .01);
    expect(turned - (Math.PI - .01)).toBeLessThan(.02);
    a.lookAt(10); for (let i = 0; i < 120; i++) a.update(1 / 60, 0);
    expect(Math.abs(a.rig.head.rotation.y)).toBeLessThan(.70);
  });
  it('uses distinct tools for reading, sampling, and measuring and restores relaxed arms', () => {
    const rig = createCharacter('explorer'), animator = new CharacterAnimator(rig);
    for (const [pose, tool] of [['read', 'notebook'], ['sample', 'sample'], ['measure', 'meter'], ['water','wateringCan'], ['ruler','ruler']] as const) {
      animator.setPose(pose); for (let i = 0; i < 60; i++) animator.update(1 / 60, 0);
      expect(rig.tools[tool].visible).toBe(true);
      expect(Object.values(rig.tools).filter(t => t.visible)).toHaveLength(1);
    }
    animator.setPose('none'); for (let i = 0; i < 120; i++) animator.update(1 / 60, 0);
    expect(Object.values(rig.tools).some(t => t.visible)).toBe(false);
    expect(rig.rightArm.elbow.rotation.x).toBeCloseTo(0, 3);
  });
  it('suppresses idle sway, blinking and gait under reduced motion while retaining tool poses', () => {
    const rig = createCharacter('explorer'), animator = new CharacterAnimator(rig);
    for (let i = 0; i < 360; i++) animator.update(1 / 60, .05, true);
    expect(rig.torso.rotation.z).toBe(0); expect(rig.eyes.scale.y).toBe(1);
    expect(animator.stride).toBe(0);
    animator.setPose('measure'); animator.update(.1, 0, true);
    expect(rig.tools.meter.visible).toBe(true);
  });
});
it('rigid feet do not sink while walking; Nara legs stay inside the upper skirt',()=> {
  for(const kind of ['explorer','nara'] as const) {
    const rig=createCharacter(kind),animator=new CharacterAnimator(rig);
    for(let frame=0;frame<80;frame++) {
      animator.update(1/60,4.6/60);
      rig.root.updateMatrixWorld(true);
      for(const leg of rig.core.filter(m=>m.name.includes('leg-block'))) {
        expect(new Box3().setFromObject(leg).min.y).toBeGreaterThanOrEqual(characterConfig.groundY-.0001);
        if(kind==='nara') {
          const positions=leg.geometry.getAttribute('position');
          for(let i=0;i<positions.count;i++) {
            const v=new Vector3().fromBufferAttribute(positions,i).applyMatrix4(leg.matrixWorld);
            if(v.y>=characterConfig.groundY+.65*rig.dimensions.scale&&v.y<=characterConfig.groundY+1.5*rig.dimensions.scale)
              expect(Math.abs(v.z)).toBeLessThanOrEqual(.42*rig.dimensions.scale+.001);
          }
        }
      }
    }
  }
});
describe('camera clearance and control continuity', () => {
  it('replaces region blockers and uses an interaction angle without changing manual yaw', () => {
    const camera=new PerspectiveCamera(48,1,.1,100), wall=new Box3(new Vector3(-3,0,4),new Vector3(3,6,5));
    const follow=new FollowCamera(camera,[wall]);follow.yaw=0;follow.pitch=.3;follow.resize(1280,900);follow.update(new Vector3(),.016,false,true);
    expect(follow.safeDistance).toBeLessThan(5);
    follow.setObstacles([]);follow.interactionYaw=-.85;follow.update(new Vector3(),.016,false,true);
    expect(follow.safeDistance).toBe(10.8);expect(follow.yaw).toBe(0);expect(camera.position.x).toBeLessThan(0);
  });
  it('keeps the camera before a wall and eases outward without changing manual yaw', () => {
    const camera = new PerspectiveCamera(48, 1, .1, 100);
    const wall = new Box3(new Vector3(-3, 0, 4), new Vector3(3, 6, 5));
    const follow = new FollowCamera(camera, [wall]); follow.yaw = 0; follow.pitch = .3;
    follow.resize(1280, 900); follow.update(new Vector3(), .016, false, true);
    expect(camera.position.z).toBeLessThan(4);
    const close = follow.safeDistance; follow.distance = 'far';
    follow.update(new Vector3(10, 0, 0), .016, false);
    expect(follow.safeDistance).toBeGreaterThan(close);
    expect(follow.yaw).toBe(0);
    expect(camera.position.distanceTo(new Vector3(10, 1.4, 0))).toBeLessThan(14);
  });
  it('can navigate away from a wall when the rounded starting cell is inside the obstacle', () => {
    const start = { x: -4.55, z: -9 };
    expect(walkable(start)).toBe(true);
    const path = findPath(start, { x: 0, z: 3 });
    expect(path.length).toBeGreaterThan(0); expect(path.every(point => walkable(point))).toBe(true);
  });
  it('does not force a minimum camera distance through a wall when the player is beside it', () => {
    const camera = new PerspectiveCamera(48, 1, .1, 100);
    const wall = new Box3(new Vector3(-3, 0, -5), new Vector3(3, 6, 0));
    const follow = new FollowCamera(camera, [wall]); follow.yaw = Math.PI; follow.pitch = .3;
    follow.resize(1280, 900);
    follow.update(new Vector3(0, 0, .45), .016, false, true);
    expect(camera.position.z).toBeGreaterThan(.30);
    expect(wall.containsPoint(camera.position)).toBe(false);
  });
});
