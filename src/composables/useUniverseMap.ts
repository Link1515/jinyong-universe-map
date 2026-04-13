import { computed, reactive } from 'vue'
import { characters, novels, relationshipTypes, relationships } from '../data'
import { getRelationshipType, getVisibleGraph, searchCharacters } from '../utils/graphData'
import type { ActiveMenu, Character, DetailSelection, Novel, Relationship, RelationshipType, RelationshipWithType } from '../types'

interface UniverseMapState {
  selectedNovelId: string
  activeTypeIds: string[]
  searchQuery: string
  activeMenu: ActiveMenu
  detailOpen: boolean
  detail: DetailSelection
}

export function useUniverseMap() {
  const state = reactive<UniverseMapState>({
    selectedNovelId: novels[0]?.id ?? '',
    activeTypeIds: [],
    searchQuery: '',
    activeMenu: '',
    detailOpen: false,
    detail: { kind: 'none' },
  })

  const novelMap = new Map<string, Novel>(novels.map(novel => [novel.id, novel]))
  const characterMap = new Map<string, Character>(characters.map(character => [character.id, character]))
  const relationshipMap = new Map<string, Relationship>(relationships.map(relationship => [relationship.id, relationship]))

  const graph = computed(() => getVisibleGraph([state.selectedNovelId], state.activeTypeIds, characters, relationships))

  const selectedNovel = computed(() => novelMap.get(state.selectedNovelId) ?? null)
  const selectedCharacter = computed(() => (state.detail.kind === 'character' ? (characterMap.get(state.detail.id) ?? null) : null))
  const selectedRelationship = computed(() => (state.detail.kind === 'relationship' ? (relationshipMap.get(state.detail.id) ?? null) : null))

  const searchMatches = computed(() => searchCharacters(state.searchQuery, graph.value.characters).slice(0, 8))
  const activeFilterCount = computed(() => state.activeTypeIds.length)
  const graphTitle = computed(() => {
    if (!selectedNovel.value) {
      return ''
    }

    return `${selectedNovel.value.name} · ${graph.value.characters.length} 人 / ${graph.value.relationships.length} 關係`
  })

  const detailCharacterRelationships = computed<RelationshipWithType[]>(() => {
    if (!selectedCharacter.value) {
      return []
    }

    return relationships
      .filter(relationship => relationship.novels.includes(state.selectedNovelId) && (relationship.source === selectedCharacter.value?.id || relationship.target === selectedCharacter.value?.id))
      .map(relationship => ({
        ...relationship,
        typeConfig: getRelationshipType(relationship.type) ?? undefined,
      }))
  })

  function selectNovel(novelId: string): void {
    state.selectedNovelId = novelId
    state.searchQuery = ''
    state.detailOpen = false
    state.detail = { kind: 'none' }
  }

  function toggleMenu(menu: ActiveMenu): void {
    state.activeMenu = state.activeMenu === menu ? '' : menu
  }

  function closeMenu(): void {
    state.activeMenu = ''
  }

  function updateSearchQuery(query: string): void {
    state.searchQuery = query
  }

  function toggleRelationshipType(typeId: string): void {
    if (state.activeTypeIds.includes(typeId)) {
      state.activeTypeIds = state.activeTypeIds.filter(id => id !== typeId)
    } else {
      state.activeTypeIds = [...state.activeTypeIds, typeId]
    }

    if (state.detail.kind === 'relationship') {
      state.detail = { kind: 'none' }
    }
  }

  function resetRelationshipTypes(): void {
    state.activeTypeIds = []
  }

  function selectCharacter(characterId: string): void {
    if (!characterId) {
      state.detailOpen = false
      state.detail = { kind: 'none' }
      return
    }

    state.detail = { kind: 'character', id: characterId }
    state.detailOpen = true
  }

  function selectRelationship(relationshipId: string): void {
    if (!relationshipId) {
      state.detailOpen = false
      state.detail = { kind: 'none' }
      return
    }

    state.detail = { kind: 'relationship', id: relationshipId }
    state.detailOpen = true
  }

  function openCharacterFromSearch(characterId: string): void {
    selectCharacter(characterId)
  }

  function setDetailOpen(nextOpen: boolean): void {
    state.detailOpen = nextOpen
  }

  function ensureVisibleSelection(): void {
    if (state.detail.kind === 'character') {
      const selectedId = state.detail.id
      if (!graph.value.characters.some(character => character.id === selectedId)) {
        state.detail = { kind: 'none' }
      }
    }

    if (state.detail.kind === 'relationship') {
      const selectedId = state.detail.id
      if (!graph.value.relationships.some(relationship => relationship.id === selectedId)) {
        state.detail = { kind: 'none' }
      }
    }
  }

  return {
    state,
    novels,
    relationshipTypes: relationshipTypes as RelationshipType[],
    novelMap,
    characterMap,
    selectedNovel,
    selectedCharacter,
    selectedRelationship,
    graph,
    graphTitle,
    searchMatches,
    activeFilterCount,
    detailCharacterRelationships,
    selectNovel,
    toggleMenu,
    closeMenu,
    updateSearchQuery,
    toggleRelationshipType,
    resetRelationshipTypes,
    selectCharacter,
    selectRelationship,
    openCharacterFromSearch,
    setDetailOpen,
    ensureVisibleSelection,
  }
}
