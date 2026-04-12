export type Gender = 'male' | 'female' | 'unknown'

export interface Novel {
  id: string
  name: string
  era: string
  description: string
}

export interface Character {
  id: string
  name: string
  aliases: string[]
  novels: string[]
  gender: Gender
  factions: string[]
  title: string
  description: string
  tags: string[]
}

export interface RelationshipMetadata {
  note?: string
  sourceArc?: string
}

export interface Relationship {
  id: string
  source: string
  target: string
  type: string
  label: string
  description: string
  directed: boolean
  novels: string[]
  weight: number
  metadata?: RelationshipMetadata
}

export interface RelationshipType {
  id: string
  name: string
  group: string
  color: string
  line: 'solid' | 'dashed' | 'dotted'
}

export interface RelationshipWithType extends Relationship {
  typeConfig?: RelationshipType
}

export interface UniverseData {
  novels: Novel[]
  characters: Character[]
  relationships: Relationship[]
}

export interface VisibleGraph {
  characters: Character[]
  relationships: RelationshipWithType[]
}

export type DetailSelection = { kind: 'none' } | { kind: 'character'; id: string } | { kind: 'relationship'; id: string }

export type ActiveMenu = 'novels' | 'search' | 'filters' | 'legend' | ''
