import {appearanceCatalog,avatarBases,cosmeticSlots,cosmetic,type AvatarBase,type CosmeticSlot,type TemporaryEquipment} from '../data/appearanceCatalog';
export interface Appearance {version:1;base:AvatarBase;outfit:string;hair:string;headwear:string;facewear:string;backpack:string;}
export function defaultAppearance(base:AvatarBase='student-boy'):Appearance{const preset=avatarBases.find(v=>v.id===base)??avatarBases[0];return {version:1,base:preset.id,outfit:preset.outfit,hair:preset.hair,headwear:'head-none',facewear:'face-none',backpack:'pack-mustard'};}
/** Unknown IDs, wrong slots, locked/future items and incompatible selections fall back independently. */
export function parseAppearance(raw:unknown,fallback?:Appearance):Appearance {
 const value=raw&&typeof raw==='object'&&(raw as Record<string,unknown>).version===1?raw as Record<string,unknown>:{};
 const base=value.base==='student-boy'||value.base==='student-girl'?value.base:fallback?.base??'student-boy';
 const result=defaultAppearance(base);
 for(const slot of cosmeticSlots){const item=typeof value[slot]==='string'?cosmetic(value[slot]):undefined;
  const old=fallback&&fallback.base===base?cosmetic(fallback[slot]):undefined;result[slot]=item&&item.category===slot&&item.access==='free'&&item.bases.includes(base)?item.id:old&&old.category===slot&&old.access==='free'&&old.bases.includes(base)?old.id:result[slot];}
 return result;
}
export function chooseCosmetic(a:Appearance,slot:CosmeticSlot,id:string):Appearance {const item=cosmetic(id);if(!item||item.category!==slot||item.access!=='free'||!item.bases.includes(a.base))return a;return {...a,[slot]:id};}
export function appearanceKey(a:Appearance){return [a.base,...cosmeticSlots.map(s=>a[s])].join('/');}
export function resolvedAppearance(a:Appearance,equipment:TemporaryEquipment='none'){
 const personal=parseAppearance(a,a);
 return {personal,equipment,visibleHeadwear:equipment==='none'?personal.headwear:'head-none',showHair:equipment==='none',showBackpack:equipment==='none'};
}
export function appearanceItems(slot:CosmeticSlot,base:AvatarBase){return appearanceCatalog.filter(i=>i.category===slot&&i.access==='free'&&i.bases.includes(base));}
