export interface Point3{x:number;y:number;z:number;}
export interface VolumeArea{bounds:{min:Point3;max:Point3};body:Point3;obstacles:readonly {min:Point3;max:Point3}[];}
type V=Point3;
export const distance3=(a:V,b:V)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
export function createVolumeNavigation({bounds,body,obstacles}:VolumeArea){
function walkable(p:V){for(const a of ['x','y','z'] as const)if(!Number.isFinite(p[a])||p[a]<bounds.min[a]+body[a]||p[a]>bounds.max[a]-body[a])return false;return !obstacles.some(o=>p.x>o.min.x-body.x&&p.x<o.max.x+body.x&&p.y>o.min.y-body.y&&p.y<o.max.y+body.y&&p.z>o.min.z-body.z&&p.z<o.max.z+body.z);}
function segmentClear(a:V,b:V){const n=Math.ceil(distance3(a,b)/.10);for(let i=0;i<=n;i++){const t=n?i/n:0;if(!walkable({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t}))return false;}return true;}
function sweep(p:V,axis:'x'|'y'|'z',delta:number){let end=Math.max(bounds.min[axis]+body[axis],Math.min(bounds.max[axis]-body[axis],p[axis]+delta));const other=(['x','y','z'] as const).filter(a=>a!==axis);for(const b of obstacles){if(other.some(a=>p[a]<=b.min[a]-body[a]||p[a]>=b.max[a]+body[a]))continue;if(delta>0&&p[axis]<=b.min[axis]-body[axis])end=Math.min(end,b.min[axis]-body[axis]-1e-7);if(delta<0&&p[axis]>=b.max[axis]+body[axis])end=Math.max(end,b.max[axis]+body[axis]+1e-7);}return end;}
/** Six-neighbour 3D A*: neither a ground route nor a straight line through a module. */
function findPath(start:V,end:V):V[]{
 if(!walkable(start)||!walkable(end))return [];if(segmentClear(start,end))return [{...end}];
 const cell=(p:V)=>{const list:V[]=[];for(let x=Math.floor(p.x);x<=Math.ceil(p.x);x++)for(let y=Math.floor(p.y);y<=Math.ceil(p.y);y++)for(let z=Math.floor(p.z);z<=Math.ceil(p.z);z++){const v={x,y,z};if(walkable(v)&&segmentClear(p,v))list.push(v);}return list.sort((a,b)=>distance3(p,a)-distance3(p,b))[0];};
 const first=cell(start),last=cell(end);if(!first||!last)return [];const key=(p:V)=>`${p.x},${p.y},${p.z}`,open=[first],parent=new Map<string,V|null>([[key(first),null]]),cost=new Map([[key(first),0]]);let iterations=0;
 while(open.length&&iterations++<14000){let best=0;for(let i=1;i<open.length;i++)if(cost.get(key(open[i]))!+distance3(open[i],last)<cost.get(key(open[best]))!+distance3(open[best],last))best=i;const current=open.splice(best,1)[0];if(key(current)===key(last)){const raw:V[]=[{...end}];let at:V|null=current;while(at){raw.unshift(at);at=parent.get(key(at))??null;}const path:V[]=[];let prev=start,i=0;while(i<raw.length){let j=i;while(j+1<raw.length&&segmentClear(prev,raw[j+1]))j++;path.push(raw[j]);prev=raw[j];i=j+1;}return path;}
 for(const a of ['x','y','z'] as const)for(const sign of [-1,1]){const n={...current,[a]:current[a]+sign},k=key(n),next=cost.get(key(current))!+1;if(walkable(n)&&next<(cost.get(k)??Infinity)){cost.set(k,next);parent.set(k,current);if(!open.some(v=>key(v)===k))open.push(n);}}
 }return [];
}

return{walkable,segmentClear,sweep,findPath};
}
