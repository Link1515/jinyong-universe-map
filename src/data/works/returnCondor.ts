import type { Character, Relationship } from '../../types'

export const characters: Character[] = [
  {
    id: 'yang-guo',
    name: '楊過',
    aliases: ['神鵰大俠'],
    novels: ['return-condor'],
    gender: 'male',
    factions: ['古墓派'],
    title: '神鵰大俠',
    description: '性格叛逆卻重情重義，在情愛與家國間成長。',
    tags: ['主角'],
  },
  { id: 'xiao-longnu', name: '小龍女', aliases: [], novels: ['return-condor'], gender: 'female', factions: ['古墓派'], title: '古墓傳人', description: '清冷出塵，與楊過情深義篤。', tags: ['主角'] },
  {
    id: 'guo-xiang',
    name: '郭襄',
    aliases: [],
    novels: ['return-condor'],
    gender: 'female',
    factions: ['峨眉派'],
    title: '郭家二女',
    description: '敬慕楊過，後成峨眉派開山祖師。',
    tags: ['重要配角'],
  },
  {
    id: 'li-mochou',
    name: '李莫愁',
    aliases: ['赤練仙子'],
    novels: ['return-condor'],
    gender: 'female',
    factions: ['古墓派'],
    title: '古墓叛徒',
    description: '執念深重，與小龍女、楊過多次衝突。',
    tags: ['反派'],
  },
]

export const relationships: Relationship[] = [
  { id: 'r17', source: 'yang-guo', target: 'xiao-longnu', type: 'romance', label: '戀人', description: '楊過與小龍女共同構成神鵰核心情感線。', directed: false, novels: ['return-condor'], weight: 5 },
  { id: 'r18', source: 'xiao-longnu', target: 'yang-guo', type: 'mentor', label: '師徒', description: '小龍女是楊過的師父。', directed: true, novels: ['return-condor'], weight: 4 },
  { id: 'r19', source: 'guo-xiang', target: 'yang-guo', type: 'romance', label: '傾慕', description: '郭襄對楊過長存敬慕之情。', directed: true, novels: ['return-condor'], weight: 3 },
  { id: 'r20', source: 'li-mochou', target: 'xiao-longnu', type: 'rival', label: '同門反目', description: '李莫愁與小龍女屬同門，卻長期敵對。', directed: false, novels: ['return-condor'], weight: 4 },
]
