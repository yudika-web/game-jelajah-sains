import type { World } from './world';

export function bindInput(world: World, joystick: HTMLElement, interact: () => void, shortcut: (key: string) => void, tap: (x: number, y: number) => void) {
  const keys = new Set<string>();
  let stickPointer: number | null = null;
  let cameraPointer: number | null = null;
  let last = { x: 0, y: 0 }, origin = { x: 0, y: 0 }, dragged = false;
  const knob = joystick.querySelector<HTMLElement>('.stick-knob')!;
  let analog = { x: 0, z: 0 };
  const refresh = () => {
    world.move = {
      x: (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0) + analog.x,
      z: (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0) + analog.z,
    };
  };
  const clear = () => {
    keys.clear(); analog = { x: 0, z: 0 }; stickPointer = cameraPointer = null;
    knob.style.transform = ''; world.stop(); refresh();
  };
  addEventListener('keydown', e => {
    if ((e.target as HTMLElement).matches('input, select, textarea, [contenteditable="true"]') && e.key !== 'Escape') return;
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      e.preventDefault(); if (!world.paused) { keys.add(key); refresh(); }
    }
    if (!e.repeat) { if (key === 'e' && !world.paused) interact(); else shortcut(key); }
  });
  addEventListener('keyup', e => { keys.delete(e.key.toLowerCase()); refresh(); });
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
    analog = { x: x * ratio / radius, z: y * ratio / radius };
    knob.style.transform = `translate(${x * ratio}px, ${y * ratio}px)`; refresh();
  }
  joystick.addEventListener('pointermove', updateStick);
  const releaseStick = (e: PointerEvent) => {
    if (e.pointerId === stickPointer) { stickPointer = null; analog = { x: 0, z: 0 }; knob.style.transform = ''; refresh(); }
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
      world.pitch = Math.max(0.3, Math.min(1.1, world.pitch + (e.clientY - last.y) * 0.004));
    }
    last = { x: e.clientX, y: e.clientY };
  });
  world.canvas.addEventListener('pointerup', e => {
    if (e.pointerId !== cameraPointer) return;
    cameraPointer = null;
    if (!dragged && !world.paused) tap(e.clientX, e.clientY);
  });
  world.canvas.addEventListener('pointercancel', e => { if (e.pointerId === cameraPointer) cameraPointer = null; });
  world.canvas.addEventListener('lostpointercapture', e => { if (e.pointerId === cameraPointer) cameraPointer = null; });
  return clear;
}
