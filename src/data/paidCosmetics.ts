import type {CosmeticItem} from './appearanceCatalog';
const bases=['student-boy','student-girl'] as const;
/** Paid additions never rename or relock the twelve free starter IDs. */
export const paidCosmetics:readonly CosmeticItem[]=[
 {id:'outfit-field',category:'outfit',name:'Penjelajah lapangan',access:'paid',price:180,priceVersion:1,bases,visual:{style:'field-vest',coat:'#7b8052',shirt:'#f2ddae',pants:'#4a584a',boots:'#795333'}},
 {id:'outfit-lab',category:'outfit',name:'Peneliti laboratorium',access:'paid',price:180,priceVersion:1,bases,visual:{style:'lab-coat',coat:'#e8eee4',shirt:'#547e9a',pants:'#40566b',boots:'#514a43'}},
 {id:'outfit-gardener',category:'outfit',name:'Pekebun',access:'paid',price:180,priceVersion:1,bases,visual:{style:'apron',coat:'#77986a',shirt:'#f1e0b3',pants:'#67513c',boots:'#6c4b31'}},
 {id:'outfit-technician',category:'outfit',name:'Teknisi bengkel',access:'paid',price:180,priceVersion:1,bases,visual:{style:'workwear',coat:'#3d6780',shirt:'#dcaa54',pants:'#374b5d',boots:'#5a4438'}},
 {id:'hair-curls',category:'hair',name:'Keriting pendek',access:'paid',price:60,priceVersion:1,bases,visual:{style:'curls',color:'#51382c'}},
 {id:'hair-undercut',category:'hair',name:'Cepak samping',access:'paid',price:60,priceVersion:1,bases,visual:{style:'undercut',color:'#3f3028'}},
 {id:'hair-braid',category:'hair',name:'Kepang',access:'paid',price:60,priceVersion:1,bases,visual:{style:'braid',color:'#583b2b'}},
 {id:'hair-bun',category:'hair',name:'Sanggul',access:'paid',price:60,priceVersion:1,bases,visual:{style:'bun',color:'#493327'}},
 {id:'hat-widebrim',category:'headwear',name:'Topi lapangan bertepi lebar',access:'paid',price:40,priceVersion:1,bases,visual:{style:'wide-hat',color:'#bca16c'}},
 {id:'glasses-research',category:'facewear',name:'Kacamata bingkai bulat',access:'paid',price:40,priceVersion:1,bases,visual:{style:'round-frames',color:'#946d38'}},
 {id:'pack-expedition',category:'backpack',name:'Tas ekspedisi berkompartemen',access:'paid',price:40,priceVersion:1,bases,visual:{style:'compartments',color:'#426e79'}},
 {id:'headset-field',category:'headwear',name:'Headset kosmetik',access:'paid',price:40,priceVersion:1,bases,visual:{style:'headset',color:'#48616c'}},
];
/** Historical prices outlive availability and current catalog pricing. Never edit v1. */
export const cosmeticPriceHistory:Readonly<Record<number,Readonly<Record<string,number>>>>={1:{
 'outfit-field':180,'outfit-lab':180,'outfit-gardener':180,'outfit-technician':180,
 'hair-curls':60,'hair-undercut':60,'hair-braid':60,'hair-bun':60,
 'hat-widebrim':40,'glasses-research':40,'pack-expedition':40,'headset-field':40,
}};
export function historicalCosmeticPrice(id:string,version:number){const prices=cosmeticPriceHistory[version];return prices&&Object.hasOwn(prices,id)?prices[id]:undefined;}
export const shopCategories=['outfits','hair','accessories'] as const;
export type ShopCategory=typeof shopCategories[number];
export const shopCategoryNames={outfits:'Kostum',hair:'Rambut',accessories:'Aksesori'};
export function shopItems(category:ShopCategory){return paidCosmetics.filter(i=>i.available!==false&&(category==='outfits'?i.category==='outfit':category==='hair'?i.category==='hair':!['outfit','hair'].includes(i.category)));}
