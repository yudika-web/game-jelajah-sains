import {appearanceCatalog,avatarBases,cosmeticSlots,cosmetic,type AvatarBase,type CosmeticSlot,type TemporaryEquipment,type CosmeticItem} from '../data/appearanceCatalog';
export interface Appearance {version:1;base:AvatarBase;outfit:string;hair:string;headwear:string;facewear:string;backpack:string;}
export type AppearanceAccess=readonly string[]|'preview';
export function defaultAppearance(base:AvatarBase='student-boy'):Appearance{const preset=avatarBases.find(v=>v.id===base)??avatarBases[0];return {version:1,base:preset.id,outfit:preset.outfit,hair:preset.hair,headwear:'head-none',facewear:'face-none',backpack:'pack-mustard'};}
export function canWear(item:CosmeticItem,base:AvatarBase,access:AppearanceAccess=[]){return item.available!==false&&item.bases.includes(base)&&(item.access==='free'||item.access==='paid'&&(access==='preview'||access.includes(item.id)));}
/** Rendering may preview all catalog items; personal state passes receipt-backed ownership. */
export function parseAppearance(raw:unknown,fallback?:Appearance,access:AppearanceAccess=[]):Appearance {
 const value=raw&&typeof raw==='object'&&(raw as Record<string,unknown>).version===1?raw as Record<string,unknown>:{};
 const base=value.base==='student-boy'||value.base==='student-girl'?value.base:fallback?.base??'student-boy';const result=defaultAppearance(base);
 for(const slot of cosmeticSlots){const item=typeof value[slot]==='string'?cosmetic(value[slot]):undefined,old=fallback&&fallback.base===base?cosmetic(fallback[slot]):undefined;
  result[slot]=item&&item.category===slot&&canWear(item,base,access)?item.id:old&&old.category===slot&&canWear(old,base,access)?old.id:result[slot];}
 return result;
}
export class AppearanceAccessError extends Error{constructor(){super('Penampilan belum dapat dipakai: ada barang yang belum dimiliki atau berada pada slot yang salah. Coba tidak sama dengan membeli.');}}
/** Unknown/retired IDs fall back safely; known locked items are an invalid apply/import. */
export function validateOwnedAppearance(raw:unknown,owned:readonly string[],fallback?:Appearance){
 const value=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};
 const base=value.base==='student-girl'?'student-girl':'student-boy';
 for(const slot of cosmeticSlots){const item=typeof value[slot]==='string'?cosmetic(value[slot]):undefined;
  if(item&&item.available!==false&&(item.access==='paid'&&(item.category!==slot||!canWear(item,base,owned))))throw new AppearanceAccessError();}
 return parseAppearance(raw,fallback,owned);
}
export function chooseCosmetic(a:Appearance,slot:CosmeticSlot,id:string,access:AppearanceAccess=[]):Appearance {const item=cosmetic(id);if(!item||item.category!==slot||!canWear(item,a.base,access))return a;return {...a,[slot]:id};}
export function appearanceKey(a:Appearance){return [a.base,...cosmeticSlots.map(s=>a[s])].join('/');}
export function resolvedAppearance(a:Appearance,equipment:TemporaryEquipment='none'){const personal=parseAppearance(a,a,'preview');return {personal,equipment,visibleHeadwear:equipment==='none'?personal.headwear:'head-none',showHair:equipment==='none',showBackpack:equipment==='none'};}
export function appearanceItems(slot:CosmeticSlot,base:AvatarBase,owned:readonly string[]=[]){return appearanceCatalog.filter(i=>i.category===slot&&canWear(i,base,owned));}
