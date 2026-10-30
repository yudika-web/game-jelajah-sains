/** Existing 5 x 5 home footprint becomes an open-roof showroom, not a new district. */
export const shopPosition={x:-12,z:5.1};
export const shopObstacles=[
 {x:-12,z:3.5,width:5,depth:.20},{x:-14.5,z:6,width:.20,depth:5},{x:-9.5,z:6,width:.20,depth:5},
 {x:-13.7,z:8.5,width:1.6,depth:.20},{x:-10.3,z:8.5,width:1.6,depth:.20},
 {x:-12,z:4.9,width:1.8,depth:.7},{x:-13.95,z:6.2,width:.48,depth:1.8},{x:-10.02,z:7.2,width:.55,depth:.70},
];
export function insideShop(p:{x:number;z:number}){return p.x>=-13.05&&p.x<=-10.95&&p.z>=5.8&&p.z<=7.7;}
