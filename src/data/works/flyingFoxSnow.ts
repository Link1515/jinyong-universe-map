import type { Character, Relationship } from '../../types'

export const characters: Character[] = [
  {
    id: 'hu-fei',
    name: '胡斐',
    aliases: ['雪山飛狐'],
    novels: ['flying-fox-snow', 'side-story-flying-fox'],
    gender: 'male',
    factions: [],
    title: '飛狐',
    description: '胡家後人，以俠義與復仇之心行走江湖。',
    tags: ['主角', '跨作品'],
  },
  {
    id: 'miao-renfeng',
    name: '苗人鳳',
    aliases: ['金面佛'],
    novels: ['flying-fox-snow', 'side-story-flying-fox'],
    gender: 'male',
    factions: [],
    title: '打遍天下無敵手',
    description: '與胡家恩怨糾纏，是胡斐生命中的關鍵對手與前輩。',
    tags: ['重要配角', '跨作品'],
  },
]

export const relationships: Relationship[] = [
  {
    id: 'r13',
    source: 'hu-fei',
    target: 'miao-renfeng',
    type: 'rival',
    label: '胡苗恩怨',
    description: '胡苗兩家宿怨構成雪山飛狐主線。',
    directed: false,
    novels: ['flying-fox-snow', 'side-story-flying-fox'],
    weight: 5,
  },
]
