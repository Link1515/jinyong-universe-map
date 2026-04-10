import { relationshipTypes } from "../data/relationshipTypes.js";

const typeMap = new Map(relationshipTypes.map((type) => [type.id, type]));

/**
 * @param {string[]} novelIds
 * @param {string[]} activeTypes
 * @param {import("../types.js").Character[]} characters
 * @param {import("../types.js").Relationship[]} relationships
 */
export function getVisibleGraph(novelIds, activeTypes, characters, relationships) {
  const selectedNovelIds = novelIds.length > 0 ? new Set(novelIds) : null;
  const selectedTypes = activeTypes.length > 0 ? new Set(activeTypes) : null;

  const filteredCharacters = characters.filter((character) => {
    if (!selectedNovelIds) {
      return true;
    }

    return character.novels.some((novelId) => selectedNovelIds.has(novelId));
  });

  const visibleCharacterIds = new Set(filteredCharacters.map((character) => character.id));

  const filteredRelationships = relationships
    .filter((relationship) => {
      if (selectedTypes && !selectedTypes.has(relationship.type)) {
        return false;
      }

      if (selectedNovelIds && !relationship.novels.some((novelId) => selectedNovelIds.has(novelId))) {
        return false;
      }

      return visibleCharacterIds.has(relationship.source) && visibleCharacterIds.has(relationship.target);
    })
    .map((relationship) => ({
      ...relationship,
      typeConfig: typeMap.get(relationship.type)
    }));

  const relationshipCharacterIds = new Set(
    filteredRelationships.flatMap((relationship) => [relationship.source, relationship.target])
  );

  const connectedCharacters = filteredCharacters.filter((character) => relationshipCharacterIds.has(character.id));

  return {
    characters: connectedCharacters,
    relationships: filteredRelationships
  };
}

/**
 * @param {string} query
 * @param {import("../types.js").Character[]} characters
 */
export function searchCharacters(query, characters) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return characters.filter((character) => {
    const pool = [character.name, ...character.aliases, ...character.tags, ...character.factions];
    return pool.some((entry) => entry.toLowerCase().includes(normalized));
  });
}

/**
 * @param {string} relationshipTypeId
 */
export function getRelationshipType(relationshipTypeId) {
  return typeMap.get(relationshipTypeId) ?? null;
}
