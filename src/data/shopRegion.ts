/** Existing 5 x 5 home footprint becomes an open-roof showroom, not a new district. */
export const shopPosition={x:-12,z:5.1};
export const shopObstacles=[
 {x:-12,z:3.5,width:5,depth:.20},{x:-14.5,z:6,width:.20,depth:5},{x:-9.5,z:6,width:.20,depth:5},
 {x:-13.7,z:8.5,width:1.6,depth:.20},{x:-10.3,z:8.5,width:1.6,depth:.20},
 {x:-12,z:4.9,width:1.8,depth:.7},{x:-13.95,z:6.2,width:.48,depth:1.8},{x:-10.02,z:7.2,width:.55,depth:.70},
];
export function insideShop(p:{x:number;z:number}){return p.x>=-13.05&&p.x<=-10.95&&p.z>=5.8&&p.z<=7.7;}

/** Camera heights follow the rendered walls/furnishings, not a full-height solid house. */
export const shopCameraObstacles=[
 ...shopObstacles.map((o,i)=>({...o,height:[3,1.2,1.2,2.745,2.745,1.02,2.05,1.235][i]})),
 ...[-14.5,-9.5].flatMap(x=>[3.5,8.5].map(z=>({x,z,width:.22,depth:.22,height:3}))),
 {x:-9.65,z:5.6,width:.20,depth:1.3,height:2.045},
];
