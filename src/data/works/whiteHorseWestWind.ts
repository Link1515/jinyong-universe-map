import type { Character, Relationship } from "../../types";

export const characters: Character[] = [
  { id: "li-wenxiu", name: "李文秀", aliases: [], novels: ["white-horse-west-wind"], gender: "female", factions: [], title: "白馬少女", description: "在大漠成長，情感與身分皆游離於多方文化之間。", tags: ["主角"] },
  { id: "su-pulu", name: "蘇普", aliases: [], novels: ["white-horse-west-wind"], gender: "male", factions: ["哈薩克"], title: "哈薩克青年", description: "與李文秀青梅竹馬，卻與族群現實相牽連。", tags: ["重要配角"] },
  { id: "awa", name: "阿曼", aliases: [], novels: ["white-horse-west-wind"], gender: "female", factions: ["哈薩克"], title: "哈薩克少女", description: "蘇普所愛之人，也映照李文秀的失落。", tags: ["重要配角"] },
  { id: "jiu-ye", name: "計老人", aliases: ["計爺爺"], novels: ["white-horse-west-wind"], gender: "male", factions: [], title: "隱居老人", description: "照料李文秀長大，亦是其人生引路者。", tags: ["長輩"] }
];

export const relationships: Relationship[] = [
  { id: "r25", source: "li-wenxiu", target: "su-pulu", type: "romance", label: "單戀", description: "李文秀對蘇普有深情，但無法如願。", directed: true, novels: ["white-horse-west-wind"], weight: 4 },
  { id: "r26", source: "su-pulu", target: "awa", type: "romance", label: "戀人", description: "蘇普真正心繫阿曼。", directed: false, novels: ["white-horse-west-wind"], weight: 4 },
  { id: "r27", source: "jiu-ye", target: "li-wenxiu", type: "mentor", label: "撫養教導", description: "計老人照料並教導李文秀。", directed: true, novels: ["white-horse-west-wind"], weight: 4 },
  { id: "r28", source: "li-wenxiu", target: "awa", type: "alliance", label: "共同經歷", description: "李文秀與阿曼在危局中互有牽連。", directed: false, novels: ["white-horse-west-wind"], weight: 2 }
];
