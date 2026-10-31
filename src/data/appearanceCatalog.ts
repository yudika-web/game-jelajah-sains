import {paidCosmetics} from './paidCosmetics';
export type AvatarBase='student-boy'|'student-girl';
export type CosmeticSlot='outfit'|'hair'|'headwear'|'facewear'|'backpack';
export type TemporaryEquipment='none'|'dive'|'astronaut';
export const avatarBases=[
 {id:'student-boy',name:'Siswa penjelajah',kind:'explorer',outfit:'outfit-teal',hair:'hair-sweep'},
 {id:'student-girl',name:'Siswi penjelajah',kind:'explorerGirl',outfit:'outfit-coral',hair:'hair-tied'},
] as const;
export const cosmeticSlotRules={cap:{hideCrown:true,fringeScale:.68},temporaryHelmet:{hides:['headwear','hair','facewear','backpack']}} as const;
export interface CosmeticItem {id:string;category:CosmeticSlot;name:string;access:'free'|'paid'|'locked';price?:number;priceVersion?:number;available?:boolean;bases:readonly AvatarBase[];visual:{style:string;coat?:string;shirt?:string;pants?:string;boots?:string;color?:string};}
const bases=['student-boy','student-girl'] as const;
/** Stable IDs are saved; labels/colors can evolve without renaming an owned selection. Free starter IDs remain free; paid additions use separate stable IDs. */
export const appearanceCatalog:readonly CosmeticItem[]=[
 {id:'outfit-teal',category:'outfit',name:'Penjelajah Teal',access:'free',bases,visual:{style:'jacket',coat:'#27818d',shirt:'#f5e6c6',pants:'#484951',boots:'#795333'}},
 {id:'outfit-coral',category:'outfit',name:'Penjelajah Senja',access:'free',bases,visual:{style:'jacket',coat:'#bf6a54',shirt:'#fff0d0',pants:'#3e5368',boots:'#745338'}},
 {id:'hair-crop',category:'hair',name:'Pendek rapi',access:'free',bases,visual:{style:'crop',color:'#493327'}},
 {id:'hair-sweep',category:'hair',name:'Pendek berponi',access:'free',bases,visual:{style:'sweep',color:'#493327'}},
 {id:'hair-shoulder',category:'hair',name:'Sebahu',access:'free',bases,visual:{style:'shoulder',color:'#493327'}},
 {id:'hair-tied',category:'hair',name:'Ikat',access:'free',bases,visual:{style:'tied',color:'#493327'}},
 {id:'head-none',category:'headwear',name:'Tanpa topi',access:'free',bases,visual:{style:'none'}},
 {id:'cap-explorer',category:'headwear',name:'Topi penjelajah',access:'free',bases,visual:{style:'cap',color:'#b38a43'}},
 {id:'face-none',category:'facewear',name:'Tanpa kacamata',access:'free',bases,visual:{style:'none'}},
 {id:'glasses-round',category:'facewear',name:'Kacamata bundar',access:'free',bases,visual:{style:'glasses',color:'#334e4c'}},
 {id:'pack-mustard',category:'backpack',name:'Tas penjelajah',access:'free',bases,visual:{style:'pack',color:'#ce9a36'}},
 {id:'back-none',category:'backpack',name:'Tanpa tas',access:'free',bases,visual:{style:'none'}},
 ...paidCosmetics,
];
export const cosmeticSlots:readonly CosmeticSlot[]=['outfit','hair','headwear','facewear','backpack'];
export const slotNames:Record<CosmeticSlot,string>={outfit:'Pakaian',hair:'Rambut',headwear:'Aksesori kepala',facewear:'Kacamata',backpack:'Tas'};
export function cosmetic(id:string){return appearanceCatalog.find(i=>i.id===id);}
