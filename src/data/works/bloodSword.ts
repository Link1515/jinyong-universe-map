import type { Character, Relationship } from "../../types";

export const characters: Character[] = [
  { id: "yuan-chengzhi", name: "袁承志", aliases: [], novels: ["blood-sword"], gender: "male", factions: ["華山派"], title: "金蛇郎君傳人", description: "袁崇煥之子，承繼金蛇秘笈與家國仇恨。", tags: ["主角"] },
  { id: "xia-qingqing", name: "夏青青", aliases: [], novels: ["blood-sword"], gender: "female", factions: [], title: "江湖女子", description: "性格剛烈，與袁承志感情深厚。", tags: ["女主角"] },
  { id: "wen-qingqing", name: "溫青青", aliases: [], novels: ["blood-sword"], gender: "female", factions: ["溫家"], title: "溫家堡千金", description: "出身複雜，與袁承志攜手闖蕩。", tags: ["女主角"] },
  { id: "he-tieshou", name: "何鐵手", aliases: [], novels: ["blood-sword"], gender: "female", factions: ["五毒教"], title: "五毒教教主", description: "由敵轉友，後成袁承志同道。", tags: ["重要配角"] }
];

export const relationships: Relationship[] = [
  { id: "r5", source: "yuan-chengzhi", target: "xia-qingqing", type: "romance", label: "戀人", description: "袁承志與夏青青感情深厚。", directed: false, novels: ["blood-sword"], weight: 4 },
  { id: "r6", source: "yuan-chengzhi", target: "wen-qingqing", type: "alliance", label: "同行", description: "袁承志與溫青青多次共同歷險。", directed: false, novels: ["blood-sword"], weight: 3 },
  { id: "r7", source: "yuan-chengzhi", target: "he-tieshou", type: "alliance", label: "化敵為友", description: "何鐵手後期成為袁承志一方助力。", directed: false, novels: ["blood-sword"], weight: 3 },
  { id: "r8", source: "he-tieshou", target: "xia-qingqing", type: "rival", label: "情感競逐", description: "何鐵手對袁承志的傾慕，使她與夏青青關係緊張。", directed: false, novels: ["blood-sword"], weight: 2 }
];
