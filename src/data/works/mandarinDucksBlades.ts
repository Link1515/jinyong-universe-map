import type { Character, Relationship } from "../../types";

export const characters: Character[] = [
  { id: "ren-feiyan", name: "任飛燕", aliases: [], novels: ["mandarin-ducks-blades"], gender: "female", factions: [], title: "江湖俠女", description: "與群雄一同追索鴛鴦刀祕密。", tags: ["主角"] },
  { id: "xiao-zhonghui", name: "蕭中慧", aliases: [], novels: ["mandarin-ducks-blades"], gender: "female", factions: [], title: "蕭半和之女", description: "與袁冠南結伴，逐步揭開祕密。", tags: ["主角"] },
  { id: "yuan-guannan", name: "袁冠南", aliases: [], novels: ["mandarin-ducks-blades"], gender: "male", factions: [], title: "江湖少俠", description: "行事機敏，與蕭中慧共同冒險。", tags: ["主角"] },
  { id: "zhuo-tianxiong", name: "卓天雄", aliases: [], novels: ["mandarin-ducks-blades"], gender: "male", factions: ["威信鏢局"], title: "鏢局總鏢頭", description: "覬覦寶刀祕密，與年輕主角群對立。", tags: ["反派"] }
];

export const relationships: Relationship[] = [
  { id: "r21", source: "xiao-zhonghui", target: "yuan-guannan", type: "romance", label: "情侶", description: "蕭中慧與袁冠南在冒險中建立感情。", directed: false, novels: ["mandarin-ducks-blades"], weight: 4 },
  { id: "r22", source: "ren-feiyan", target: "xiao-zhonghui", type: "alliance", label: "聯手", description: "二人同屬主角群，共同面對追刀風波。", directed: false, novels: ["mandarin-ducks-blades"], weight: 2 },
  { id: "r23", source: "yuan-guannan", target: "zhuo-tianxiong", type: "rival", label: "奪刀對立", description: "袁冠南與卓天雄為寶刀秘密多次對峙。", directed: false, novels: ["mandarin-ducks-blades"], weight: 4 },
  { id: "r24", source: "xiao-zhonghui", target: "zhuo-tianxiong", type: "rival", label: "阻止陰謀", description: "蕭中慧與卓天雄立場衝突明確。", directed: false, novels: ["mandarin-ducks-blades"], weight: 3 }
];
