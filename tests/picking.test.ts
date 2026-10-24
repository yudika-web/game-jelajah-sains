import { it, expect } from 'vitest';
import { Group, Mesh, BoxGeometry, MeshBasicMaterial } from 'three';
import { visibleForPicking } from '../src/engine/picking';
it('does not select hidden labels, tools or descendants of a hidden region group',()=> {
  const root=new Group(), tools=new Group(), mesh=new Mesh(new BoxGeometry(),new MeshBasicMaterial()), sibling=new Group();
  root.add(tools,sibling);tools.add(mesh);
  expect(visibleForPicking(mesh)).toBe(true);
  mesh.visible=false;expect(visibleForPicking(mesh)).toBe(false);mesh.visible=true;
  tools.visible=false;expect(visibleForPicking(mesh)).toBe(false);expect(visibleForPicking(sibling)).toBe(true);
  tools.visible=true;root.visible=false;expect(visibleForPicking(mesh)).toBe(false);
});
