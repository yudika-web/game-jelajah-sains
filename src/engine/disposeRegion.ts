import * as THREE from 'three';
/** Release region-owned GPU resources exactly once; shared avatar caches remain owned by their cache. */
export function disposeRegion(root:THREE.Object3D){
 const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();
 root.traverse(node=>{
  for(const g of node.userData.ownedGeometries??[])geometries.add(g);
  for(const t of node.userData.ownedTextures??[])textures.add(t);
  if(!(node instanceof THREE.Mesh||node instanceof THREE.Sprite||node instanceof THREE.Line||node instanceof THREE.Points))return;
  if(!(node instanceof THREE.Sprite)&&!node.userData.sharedGeometry&&!node.geometry.userData.shared)geometries.add(node.geometry);
  for(const material of Array.isArray(node.material)?node.material:[node.material]){
   if(material.userData.shared)continue;
   materials.add(material);
   if(material instanceof THREE.ShaderMaterial)for(const u of Object.values(material.uniforms))if(u.value instanceof THREE.Texture&&!u.value.userData.shared)textures.add(u.value);
   const map=(material as THREE.MeshBasicMaterial).map;if(map)textures.add(map);
  }
 });
 geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());
}
