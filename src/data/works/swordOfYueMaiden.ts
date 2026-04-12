import type { Character, Relationship } from '../../types'

export const characters: Character[] = [
  {
    id: 'aqing',
    name: '阿青',
    aliases: [],
    novels: ['sword-of-yue-maiden'],
    gender: 'female',
    factions: ['越國'],
    title: '越女劍客',
    description: '劍術近乎神話，因情感投射介入國運。',
    tags: ['主角'],
  },
  {
    id: 'fanli',
    name: '范蠡',
    aliases: [],
    novels: ['sword-of-yue-maiden'],
    gender: 'male',
    factions: ['越國'],
    title: '越國大夫',
    description: '輔佐勾踐復國，也牽涉阿青與西施的情感張力。',
    tags: ['重要配角'],
  },
  {
    id: 'xishi',
    name: '西施',
    aliases: [],
    novels: ['sword-of-yue-maiden'],
    gender: 'female',
    factions: ['越國'],
    title: '越國美人',
    description: '被捲入政治與個人情感投射，是阿青情緒爆發的引點。',
    tags: ['關鍵角色'],
  },
  { id: 'goujian', name: '勾踐', aliases: [], novels: ['sword-of-yue-maiden'], gender: 'male', factions: ['越國'], title: '越王', description: '越國復興核心人物，亦象徵政治大局。', tags: ['君主'] },
]

export const relationships: Relationship[] = [
  { id: 'r53', source: 'aqing', target: 'fanli', type: 'romance', label: '傾慕', description: '阿青對范蠡懷有情感。', directed: true, novels: ['sword-of-yue-maiden'], weight: 3 },
  { id: 'r54', source: 'fanli', target: 'xishi', type: 'romance', label: '知己戀人', description: '范蠡與西施之間有深厚情感。', directed: false, novels: ['sword-of-yue-maiden'], weight: 4 },
  { id: 'r55', source: 'aqing', target: 'xishi', type: 'rival', label: '情感投射', description: '阿青對西施產生強烈敵意。', directed: false, novels: ['sword-of-yue-maiden'], weight: 3 },
  { id: 'r56', source: 'fanli', target: 'goujian', type: 'sect', label: '君臣', description: '范蠡輔佐勾踐興越。', directed: true, novels: ['sword-of-yue-maiden'], weight: 3 },
]
