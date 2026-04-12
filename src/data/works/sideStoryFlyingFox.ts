import type { Character, Relationship } from '../../types'

export const characters: Character[] = [
  {
    id: 'cheng-lingsu',
    name: '程靈素',
    aliases: [],
    novels: ['side-story-flying-fox'],
    gender: 'female',
    factions: ['藥王門'],
    title: '毒手藥王弟子',
    description: '醫毒雙絕，對胡斐情深義重。',
    tags: ['女主角'],
  },
  {
    id: 'yuan-ziyi',
    name: '袁紫衣',
    aliases: [],
    novels: ['side-story-flying-fox'],
    gender: 'female',
    factions: ['天龍門'],
    title: '神秘女俠',
    description: '與胡斐情愫難成，也牽動多重江湖糾葛。',
    tags: ['重要配角'],
  },
]

export const relationships: Relationship[] = [
  {
    id: 'r14',
    source: 'hu-fei',
    target: 'cheng-lingsu',
    type: 'benefactor',
    label: '救治與深情',
    description: '程靈素多次救助胡斐，情深義重。',
    directed: false,
    novels: ['side-story-flying-fox'],
    weight: 4,
  },
  {
    id: 'r15',
    source: 'hu-fei',
    target: 'yuan-ziyi',
    type: 'romance',
    label: '情愫難成',
    description: '胡斐與袁紫衣互有情意，但終未成眷屬。',
    directed: false,
    novels: ['side-story-flying-fox'],
    weight: 4,
  },
  {
    id: 'r16',
    source: 'cheng-lingsu',
    target: 'yuan-ziyi',
    type: 'rival',
    label: '情感張力',
    description: '兩人圍繞胡斐產生微妙競逐。',
    directed: false,
    novels: ['side-story-flying-fox'],
    weight: 2,
  },
]
