import type { Object3D } from 'three';
/** Raycaster also intersects hidden objects; ignore their complete ancestor chain. */
export function visibleForPicking(object: Object3D): boolean {
  for (let node: Object3D | null = object; node; node = node.parent) if (!node.visible) return false;
  return true;
}
