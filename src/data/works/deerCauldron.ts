import type { Character, Relationship } from "../../types";

export const characters: Character[] = [
  { id: "wei-xiaobao", name: "韋小寶", aliases: ["小寶"], novels: ["deer-cauldron"], gender: "male", factions: ["清廷", "天地會"], title: "鹿鼎公", description: "市井出身，憑機變穿梭於宮廷與江湖。", tags: ["主角"] },
  { id: "kangxi", name: "康熙", aliases: ["玄燁"], novels: ["deer-cauldron"], gender: "male", factions: ["清廷"], title: "清朝皇帝", description: "與韋小寶既是君臣也是近乎兄弟的夥伴。", tags: ["重要配角"] },
  { id: "chen-jinnan", name: "陳近南", aliases: [], novels: ["deer-cauldron"], gender: "male", factions: ["天地會"], title: "天地會總舵主", description: "韋小寶的師父與精神楷模。", tags: ["重要配角"] },
  { id: "jian-ning", name: "建寧公主", aliases: [], novels: ["deer-cauldron"], gender: "female", factions: ["清廷"], title: "清廷公主", description: "性格驕縱，與韋小寶婚姻關係充滿戲劇性。", tags: ["重要配角"] }
];

export const relationships: Relationship[] = [
  { id: "r49", source: "wei-xiaobao", target: "kangxi", type: "alliance", label: "君臣摯友", description: "韋小寶與康熙既合作也彼此信任。", directed: false, novels: ["deer-cauldron"], weight: 5 },
  { id: "r50", source: "chen-jinnan", target: "wei-xiaobao", type: "mentor", label: "師父", description: "陳近南是韋小寶最重要的江湖師父。", directed: true, novels: ["deer-cauldron"], weight: 4 },
  { id: "r51", source: "wei-xiaobao", target: "jian-ning", type: "marriage", label: "夫妻", description: "建寧公主是韋小寶諸多妻妾之一。", directed: false, novels: ["deer-cauldron"], weight: 3 },
  { id: "r52", source: "kangxi", target: "chen-jinnan", type: "rival", label: "朝廷與反清勢力", description: "康熙與陳近南分屬對立陣營。", directed: false, novels: ["deer-cauldron"], weight: 4 }
];
