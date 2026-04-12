import { relationshipTypes } from '../data'
import type { Character, Relationship, RelationshipType, VisibleGraph } from '../types'

const typeMap = new Map<string, RelationshipType>(relationshipTypes.map(type => [type.id, type]))

export function getVisibleGraph(novelIds: string[], activeTypes: string[], characters: Character[], relationships: Relationship[]): VisibleGraph {
  const selectedNovelIds = novelIds.length > 0 ? new Set(novelIds) : null
  const selectedTypes = activeTypes.length > 0 ? new Set(activeTypes) : null

  const filteredCharacters = characters.filter(character => {
    if (!selectedNovelIds) {
      return true
    }

    return character.novels.some(novelId => selectedNovelIds.has(novelId))
  })

  const visibleCharacterIds = new Set(filteredCharacters.map(character => character.id))

  const filteredRelationships = relationships
    .filter(relationship => {
      if (selectedTypes && !selectedTypes.has(relationship.type)) {
        return false
      }

      if (selectedNovelIds && !relationship.novels.some(novelId => selectedNovelIds.has(novelId))) {
        return false
      }

      return visibleCharacterIds.has(relationship.source) && visibleCharacterIds.has(relationship.target)
    })
    .map(relationship => ({
      ...relationship,
      typeConfig: typeMap.get(relationship.type),
    }))

  const relationshipCharacterIds = new Set(filteredRelationships.flatMap(relationship => [relationship.source, relationship.target]))

  return {
    characters: filteredCharacters.filter(character => relationshipCharacterIds.has(character.id)),
    relationships: filteredRelationships,
  }
}

export function searchCharacters(query: string, characters: Character[]): Character[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return []
  }

  return characters.filter(character => {
    const pool = [character.name, ...character.aliases, ...character.tags, ...character.factions]
    return pool.some(entry => entry.toLowerCase().includes(normalized))
  })
}

export function getRelationshipType(relationshipTypeId: string): RelationshipType | null {
  return typeMap.get(relationshipTypeId) ?? null
}
