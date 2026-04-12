import type { Character, Relationship } from "../../types";

export const characters: Character[] = [
  { id: "linghu-chong", name: "令狐沖", aliases: [], novels: ["smiling-proud-wanderer"], gender: "male", factions: ["華山派", "恆山派"], title: "恆山派掌門", description: "瀟灑不羈，對權力秩序始終保持距離。", tags: ["主角"] },
  { id: "ren-yingying", name: "任盈盈", aliases: ["聖姑"], novels: ["smiling-proud-wanderer"], gender: "female", factions: ["日月神教"], title: "日月神教聖姑", description: "沉著機敏，與令狐沖情深。", tags: ["主角"] },
  { id: "yue-buqun", name: "岳不群", aliases: ["君子劍"], novels: ["smiling-proud-wanderer"], gender: "male", factions: ["華山派"], title: "華山掌門", description: "外表正派，實則野心深沉，成為令狐沖的關鍵對立者。", tags: ["反派"] },
  { id: "dongfang-bubai", name: "東方不敗", aliases: [], novels: ["smiling-proud-wanderer"], gender: "unknown", factions: ["日月神教"], title: "日月神教教主", description: "以絕世武功與權力支配武林格局。", tags: ["反派"] }
];

export const relationships: Relationship[] = [
  { id: "r45", source: "linghu-chong", target: "ren-yingying", type: "romance", label: "戀人", description: "令狐沖與任盈盈在艱難局勢中相互扶持。", directed: false, novels: ["smiling-proud-wanderer"], weight: 5 },
  { id: "r46", source: "yue-buqun", target: "linghu-chong", type: "mentor", label: "師徒反目", description: "岳不群曾為令狐沖師父，後全面決裂。", directed: true, novels: ["smiling-proud-wanderer"], weight: 5 },
  { id: "r47", source: "linghu-chong", target: "dongfang-bubai", type: "rival", label: "強敵", description: "令狐沖與東方不敗代表兩種江湖力量對撞。", directed: false, novels: ["smiling-proud-wanderer"], weight: 4 },
  { id: "r48", source: "ren-yingying", target: "dongfang-bubai", type: "sect", label: "同屬神教", description: "兩人同屬日月神教，但權力格局緊張。", directed: false, novels: ["smiling-proud-wanderer"], weight: 2 }
];
