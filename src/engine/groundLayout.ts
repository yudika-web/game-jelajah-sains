/** Ground slabs meet at an edge, never with two visible coplanar top faces.
 * World coordinates / navigation remain unchanged. Base land owns the old overlap.
 */
export interface GroundSlab {width:number;height:number;depth:number;color:string;x:number;y:number;z:number;}
type BoxBuilder=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>void;
function southExtension(base:GroundSlab,width:number,farZ:number,color:string):GroundSlab {
  const seam=base.z+base.depth/2;
  return {...base,width,depth:farZ-seam,color,z:(seam+farZ)/2};
}
const rimba:GroundSlab={width:42,height:.8,depth:43,color:'#738361',x:0,y:-.45,z:1};
const workshop:GroundSlab={width:40,height:.9,depth:40,color:'#92a494',x:0,y:-.5,z:0};
export const groundSlabs={rimba,solid:southExtension(rimba,38,38,'#81936d'),workshop,hydraulic:southExtension(workshop,40,37.5,'#9aab97')} as const;
export function addGround(box:BoxBuilder,s:GroundSlab){box(s.width,s.height,s.depth,s.color,s.x,s.y,s.z);}
