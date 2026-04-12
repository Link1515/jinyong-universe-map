import type { Character, Relationship } from '../../types'

export const characters: Character[] = [
  { id: 'di-yun', name: '狄雲', aliases: [], novels: ['a-deadly-secret'], gender: 'male', factions: [], title: '苦命俠士', description: '屢遭背叛陷害，仍盡力守住良善。', tags: ['主角'] },
  { id: 'qi-fang', name: '戚芳', aliases: [], novels: ['a-deadly-secret'], gender: 'female', factions: [], title: '戚長發之女', description: '與狄雲青梅竹馬，命運悲苦。', tags: ['重要配角'] },
  { id: 'wan-gui', name: '萬圭', aliases: [], novels: ['a-deadly-secret'], gender: 'male', factions: ['萬家'], title: '萬家子弟', description: '為利與欲陷害狄雲，是主要加害者之一。', tags: ['反派'] },
  { id: 'ding-dian', name: '丁典', aliases: [], novels: ['a-deadly-secret'], gender: 'male', factions: [], title: '俠士', description: '傳授神照經給狄雲，並以情義影響其人生。', tags: ['重要配角'] },
]

export const relationships: Relationship[] = [
  { id: 'r33', source: 'di-yun', target: 'qi-fang', type: 'romance', label: '青梅竹馬', description: '狄雲與戚芳自幼情感深厚。', directed: false, novels: ['a-deadly-secret'], weight: 4 },
  { id: 'r34', source: 'qi-fang', target: 'wan-gui', type: 'marriage', label: '被迫成婚', description: '戚芳後嫁萬圭，充滿悲劇色彩。', directed: false, novels: ['a-deadly-secret'], weight: 3 },
  { id: 'r35', source: 'wan-gui', target: 'di-yun', type: 'pursuit', label: '陷害迫害', description: '萬圭長期設計陷害狄雲。', directed: true, novels: ['a-deadly-secret'], weight: 5 },
  { id: 'r36', source: 'ding-dian', target: 'di-yun', type: 'mentor', label: '傳功', description: '丁典傳授神照經給狄雲。', directed: true, novels: ['a-deadly-secret'], weight: 4 },
]
