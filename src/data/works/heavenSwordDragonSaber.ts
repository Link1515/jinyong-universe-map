import type { Character, Relationship } from "../../types";

export const characters: Character[] = [
  { id: "zhang-wuji", name: "張無忌", aliases: [], novels: ["heaven-sword-dragon-saber"], gender: "male", factions: ["明教", "武當派"], title: "明教教主", description: "身世與武學承襲複雜，位處多方勢力核心。", tags: ["主角"] },
  { id: "zhao-min", name: "趙敏", aliases: ["敏敏特穆爾"], novels: ["heaven-sword-dragon-saber"], gender: "female", factions: ["元廷"], title: "紹敏郡主", description: "聰明果決，與張無忌亦敵亦友。", tags: ["女主角"] },
  { id: "zhou-zhiruo", name: "周芷若", aliases: [], novels: ["heaven-sword-dragon-saber"], gender: "female", factions: ["峨眉派"], title: "峨眉掌門", description: "背負師門期待，與張無忌關係複雜。", tags: ["重要配角"] },
  { id: "xie-xun", name: "謝遜", aliases: ["金毛獅王"], novels: ["heaven-sword-dragon-saber"], gender: "male", factions: ["明教"], title: "明教四大法王", description: "與張無忌有義父義子之情，也牽涉屠龍刀恩怨。", tags: ["重要配角"] }
];

export const relationships: Relationship[] = [
  { id: "r29", source: "zhang-wuji", target: "zhao-min", type: "romance", label: "戀人", description: "張無忌最終與趙敏攜手。", directed: false, novels: ["heaven-sword-dragon-saber"], weight: 5 },
  { id: "r30", source: "zhang-wuji", target: "zhou-zhiruo", type: "romance", label: "舊情與虧欠", description: "張無忌與周芷若感情與責任糾纏。", directed: false, novels: ["heaven-sword-dragon-saber"], weight: 4 },
  { id: "r31", source: "xie-xun", target: "zhang-wuji", type: "family", label: "義父義子", description: "謝遜與張無忌有深厚義親之情。", directed: true, novels: ["heaven-sword-dragon-saber"], weight: 4 },
  { id: "r32", source: "zhao-min", target: "zhou-zhiruo", type: "rival", label: "情敵與立場衝突", description: "兩人情感與政治立場均相斥。", directed: false, novels: ["heaven-sword-dragon-saber"], weight: 4 }
];
