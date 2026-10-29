import { analogInput } from './movement';
import type { World } from './world';

export function bindInput(world: World, joystick: HTMLElement, interact: () => void, shortcut: (key: string) => void, tap: (x: number, y: number) => void) {
  const keys = new Set<string>();
  const shifts = new Set<string>();
  let stickPointer: number | null = null;
  let cameraPointer: number | null = null;
  let last = { x: 0, y: 0 }, origin = { x: 0, y: 0 }, dragged = false;
  const knob = joystick.querySelector<HTMLElement>('.stick-knob')!;
  let analog = { x: 0, z: 0 };
  const refresh = () => {
    if (world.paused) { world.move = { x: 0, z: 0 }; world.running = false; return; }
    if (world.mode === 'laptop') world.running = !(world.region==='space'&&!world.expedition.landControls)&&shifts.size > 0;
    world.setMovementInput({
      x: (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0) + analog.x,
      z: (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0) + analog.z,
    });
  };
  const clear = () => {
    keys.clear(); shifts.clear(); analog = { x: 0, z: 0 }; stickPointer = cameraPointer = null;
    knob.style.transform = ''; world.suspendMotion(); refresh();
  };
  const editable = (target: EventTarget | null) => target instanceof HTMLElement && (target.isContentEditable || !!target.closest('input, select, textarea'));
  addEventListener('keydown', e => {
    if (editable(e.target) && e.key !== 'Escape') return;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      if (!world.paused && !e.repeat) { shifts.add(e.code); refresh(); }
      return;
    }
    const key = e.key.toLowerCase();
    if(world.region==='space'&&world.expedition.outside&&(e.code==='Space'||key==='q')){e.preventDefault();if(!e.repeat&&!world.paused)world.expedition.eva.changeHeight(e.code==='Space'?1:-1);return;}
    if(world.rov.active&&(e.code==='Space'||key==='q')){e.preventDefault();if(!e.repeat&&!world.paused)world.rovDepth(e.code==='Space'?-1:1);return;}
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      e.preventDefault(); if (!world.paused && (!e.repeat || keys.has(key))) { keys.add(key); refresh(); }
    }
    if (!e.repeat) { if (key === 'e' && !world.paused) interact(); else shortcut(key); }
  });
  addEventListener('keyup', e => { shifts.delete(e.code); keys.delete(e.key.toLowerCase()); refresh(); });
  document.addEventListener('focusin', e => { if (editable(e.target)) clear(); });
  addEventListener('blur', clear);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
  joystick.addEventListener('pointerdown', e => {
    if (world.paused || stickPointer !== null) return;
    e.preventDefault(); stickPointer = e.pointerId; joystick.setPointerCapture(e.pointerId);
    updateStick(e);
  });
  function updateStick(e: PointerEvent) {
    if (e.pointerId !== stickPointer) return;
    const rect = joystick.getBoundingClientRect(); const radius = rect.width * 0.32;
    const x = e.clientX - rect.left - rect.width / 2, y = e.clientY - rect.top - rect.height / 2;
    const length = Math.hypot(x, y); const ratio = Math.min(1, radius / Math.max(1, length));
    analog = analogInput(x * ratio / radius, y * ratio / radius);
    knob.style.transform = `translate(${x * ratio}px, ${y * ratio}px)`; refresh();
  }
  joystick.addEventListener('pointermove', updateStick);
  const releaseStick = (e: PointerEvent) => {
    if (e.pointerId === stickPointer) {
      stickPointer = null; analog = { x: 0, z: 0 }; knob.style.transform = ''; refresh();
      if (e.type !== 'pointerup') world.stop(false); // cancellation must halt immediately; retain the selected mode
    }
  };
  joystick.addEventListener('pointerup', releaseStick);
  joystick.addEventListener('pointercancel', releaseStick);
  joystick.addEventListener('lostpointercapture', releaseStick);
  world.canvas.addEventListener('pointerdown', e => {
    if (world.paused || cameraPointer !== null) return;
    cameraPointer = e.pointerId; last = origin = { x: e.clientX, y: e.clientY }; dragged = false;
    world.canvas.setPointerCapture(e.pointerId);
  });
  world.canvas.addEventListener('pointermove', e => {
    if (e.pointerId !== cameraPointer || world.paused) return;
    if (Math.hypot(e.clientX - origin.x, e.clientY - origin.y) > 8) dragged = true;
    if (dragged && world.mode !== 'ifp') {
      world.yaw -= (e.clientX - last.x) * 0.006;
      world.pitch = Math.max(0.2, Math.min(1.1, world.pitch + (e.clientY - last.y) * 0.004));
    }
    last = { x: e.clientX, y: e.clientY };
  });
  world.canvas.addEventListener('pointerup', e => {
    if (e.pointerId !== cameraPointer) return;
    cameraPointer = null;
    if (!dragged && !world.paused) tap(e.clientX, e.clientY);
  });
  world.canvas.addEventListener('pointercancel', e => { if (e.pointerId === cameraPointer) cameraPointer = null; if(world.boat.aboard||world.rov.active||world.expedition.outside)clear(); });
  world.canvas.addEventListener('lostpointercapture', e => { if (e.pointerId === cameraPointer) cameraPointer = null; });
  return clear;
}
