import type { RelationshipType } from '../types'

export const relationshipTypes: RelationshipType[] = [
  { id: 'family', name: '血緣', group: '家族', color: '#b5513c', line: 'solid' },
  { id: 'romance', name: '感情', group: '情感', color: '#b06ab3', line: 'solid' },
  { id: 'marriage', name: '婚姻', group: '情感', color: '#7e4aa8', line: 'solid' },
  { id: 'mentor', name: '師徒', group: '傳承', color: '#3f6fb5', line: 'dashed' },
  { id: 'sect', name: '門派', group: '組織', color: '#2f8f83', line: 'solid' },
  { id: 'alliance', name: '同盟', group: '互助', color: '#5f8d2c', line: 'dotted' },
  { id: 'sworn', name: '結義', group: '互助', color: '#d28824', line: 'dashed' },
  { id: 'rival', name: '宿敵', group: '對立', color: '#8f2d2d', line: 'solid' },
  { id: 'pursuit', name: '追殺', group: '對立', color: '#bf3b3b', line: 'dotted' },
  { id: 'benefactor', name: '恩義', group: '特殊', color: '#4a7c59', line: 'dotted' },
  { id: 'retainer', name: '主僕', group: '特殊', color: '#735c3f', line: 'dashed' },
]
