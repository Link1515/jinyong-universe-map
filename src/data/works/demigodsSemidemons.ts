import type { Character, Relationship } from '../../types'

export const characters: Character[] = [
  {
    id: 'qiao-feng',
    name: '喬峰',
    aliases: ['蕭峰'],
    novels: ['demigods-semidemons'],
    gender: 'male',
    factions: ['丐幫', '遼'],
    title: '北喬峰',
    description: '豪氣干雲，背負身世錯位與民族衝突。',
    tags: ['主角'],
  },
  {
    id: 'duan-yu',
    name: '段譽',
    aliases: [],
    novels: ['demigods-semidemons'],
    gender: 'male',
    factions: ['大理段氏'],
    title: '大理世子',
    description: '機緣深厚，身處多角情感與王族牽連。',
    tags: ['主角'],
  },
  {
    id: 'xu-zhu',
    name: '虛竹',
    aliases: [],
    novels: ['demigods-semidemons'],
    gender: 'male',
    factions: ['少林', '逍遙派', '靈鷲宮'],
    title: '逍遙派掌門',
    description: '純厚木訥，卻獲承高深武學與身分。',
    tags: ['主角'],
  },
  {
    id: 'wang-yuyan',
    name: '王語嫣',
    aliases: [],
    novels: ['demigods-semidemons'],
    gender: 'female',
    factions: ['曼陀山莊'],
    title: '神仙姊姊',
    description: '博聞強記，牽動段譽與慕容復心緒。',
    tags: ['重要配角'],
  },
]

export const relationships: Relationship[] = [
  { id: 'r37', source: 'qiao-feng', target: 'duan-yu', type: 'sworn', label: '結義兄弟', description: '喬峰、段譽與虛竹三人結義。', directed: false, novels: ['demigods-semidemons'], weight: 5 },
  { id: 'r38', source: 'duan-yu', target: 'xu-zhu', type: 'sworn', label: '結義兄弟', description: '段譽與虛竹情誼深厚。', directed: false, novels: ['demigods-semidemons'], weight: 5 },
  { id: 'r39', source: 'xu-zhu', target: 'qiao-feng', type: 'sworn', label: '結義兄弟', description: '虛竹與喬峰於亂世結義。', directed: false, novels: ['demigods-semidemons'], weight: 5 },
  { id: 'r40', source: 'duan-yu', target: 'wang-yuyan', type: 'romance', label: '癡戀', description: '段譽長期傾心王語嫣。', directed: true, novels: ['demigods-semidemons'], weight: 4 },
]
