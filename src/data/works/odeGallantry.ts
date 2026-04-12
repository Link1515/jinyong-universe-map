import type { Character, Relationship } from "../../types";

export const characters: Character[] = [
  { id: "shi-potian", name: "石破天", aliases: ["狗雜種"], novels: ["ode-gallantry"], gender: "male", factions: ["長樂幫", "俠客島"], title: "俠客島傳人", description: "憨厚善良，因身分錯置誤入重重江湖陰謀。", tags: ["主角"] },
  { id: "ding-dang", name: "丁璫", aliases: [], novels: ["ode-gallantry"], gender: "female", factions: ["長樂幫"], title: "丁不三孫女", description: "與石中玉、石破天的身份誤會密切相關。", tags: ["重要配角"] },
  { id: "shi-zhongyu", name: "石中玉", aliases: [], novels: ["ode-gallantry"], gender: "male", factions: [], title: "石清閔柔之子", description: "與石破天相貌相似，造成大規模誤認。", tags: ["關鍵角色"] },
  { id: "bai-wanjian", name: "白萬劍", aliases: [], novels: ["ode-gallantry"], gender: "male", factions: ["雪山派"], title: "雪山派高手", description: "與俠客島、石破天一行人的衝突重要。", tags: ["重要配角"] }
];

export const relationships: Relationship[] = [
  { id: "r41", source: "shi-potian", target: "ding-dang", type: "romance", label: "身份錯認下的情感", description: "丁璫與石破天、石中玉間存在複雜誤會。", directed: false, novels: ["ode-gallantry"], weight: 3 },
  { id: "r42", source: "shi-potian", target: "shi-zhongyu", type: "rival", label: "身份鏡像", description: "兩人相貌相似造成重重衝突與誤認。", directed: false, novels: ["ode-gallantry"], weight: 4 },
  { id: "r43", source: "bai-wanjian", target: "shi-potian", type: "rival", label: "江湖衝突", description: "白萬劍與石破天在俠客島事件中多次交鋒。", directed: false, novels: ["ode-gallantry"], weight: 3 },
  { id: "r44", source: "ding-dang", target: "shi-zhongyu", type: "romance", label: "舊情", description: "丁璫原本更偏向石中玉。", directed: false, novels: ["ode-gallantry"], weight: 2 }
];
