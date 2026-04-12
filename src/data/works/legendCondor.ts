import type { Character, Relationship } from '../../types'

export const characters: Character[] = [
  { id: 'guo-jing', name: '郭靖', aliases: [], novels: ['legend-condor'], gender: 'male', factions: ['丐幫'], title: '北俠', description: '忠厚質樸的大俠，承接家國大義。', tags: ['主角'] },
  {
    id: 'huang-rong',
    name: '黃蓉',
    aliases: [],
    novels: ['legend-condor'],
    gender: 'female',
    factions: ['桃花島', '丐幫'],
    title: '桃花島少主',
    description: '聰慧機敏，與郭靖並肩面對江湖與戰亂。',
    tags: ['主角'],
  },
  {
    id: 'huang-yaoshi',
    name: '黃藥師',
    aliases: ['東邪'],
    novels: ['legend-condor'],
    gender: 'male',
    factions: ['桃花島'],
    title: '桃花島主',
    description: '黃蓉之父，性情孤傲，武學卓絕。',
    tags: ['五絕'],
  },
  {
    id: 'yang-kang',
    name: '楊康',
    aliases: ['完顏康'],
    novels: ['legend-condor'],
    gender: 'male',
    factions: ['金國'],
    title: '金國小王爺',
    description: '楊鐵心之子，因立場與野心走向郭靖對立面。',
    tags: ['反派', '宿敵'],
  },
]

export const relationships: Relationship[] = [
  { id: 'r9', source: 'guo-jing', target: 'huang-rong', type: 'romance', label: '伴侶', description: '郭靖與黃蓉是射鵰中的核心伴侶。', directed: false, novels: ['legend-condor'], weight: 5 },
  { id: 'r10', source: 'huang-yaoshi', target: 'huang-rong', type: 'family', label: '父女', description: '黃藥師是黃蓉之父。', directed: true, novels: ['legend-condor'], weight: 4 },
  { id: 'r11', source: 'guo-jing', target: 'yang-kang', type: 'rival', label: '宿敵', description: '二人因家國與價值選擇徹底分道。', directed: false, novels: ['legend-condor'], weight: 5 },
  {
    id: 'r12',
    source: 'huang-yaoshi',
    target: 'guo-jing',
    type: 'mentor',
    label: '傳藝與考驗',
    description: '黃藥師雖不正式收徒，但對郭靖成長影響深。',
    directed: true,
    novels: ['legend-condor'],
    weight: 2,
    metadata: { note: '偏向長輩與考驗者' },
  },
]
