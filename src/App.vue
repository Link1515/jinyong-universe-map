<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DetailDrawer from './components/DetailDrawer.vue'
import FilterMenu from './components/FilterMenu.vue'
import GraphCanvas from './components/GraphCanvas.vue'
import LegendMenu from './components/LegendMenu.vue'
import NovelMenu from './components/NovelMenu.vue'
import SearchMenu from './components/SearchMenu.vue'
import ToolDock from './components/ToolDock.vue'
import { useUniverseMap } from './composables/useUniverseMap'
import type { ActiveMenu } from './types'

const {
  state,
  novels,
  relationshipTypes,
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
  updateSearchQuery,
  toggleRelationshipType,
  resetRelationshipTypes,
  selectCharacter,
  selectRelationship,
  openCharacterFromSearch,
  setDetailOpen,
  ensureVisibleSelection,
} = useUniverseMap()

const statusMinimized = ref(false)

const highlightedNodeId = computed(() => {
  if (state.activeMenu === 'search') {
    return searchMatches.value[0]?.id ?? null
  }

  if (state.detail.kind === 'character') {
    return state.detail.id
  }

  return null
})

function handleMenuEmit(eventName: string, payload?: string): void {
  if (eventName === 'selectNovel' && payload) {
    selectNovel(payload)
  }

  if (eventName === 'updateQuery') {
    updateSearchQuery(payload ?? '')
  }

  if (eventName === 'selectCharacter' && payload) {
    openCharacterFromSearch(payload)
  }

  if (eventName === 'toggleType' && payload) {
    toggleRelationshipType(payload)
  }

  if (eventName === 'reset') {
    resetRelationshipTypes()
  }
}

function handleToolToggle(menu: ActiveMenu): void {
  toggleMenu(menu)
}

function toggleStatusMinimized(): void {
  statusMinimized.value = !statusMinimized.value
}

watch(graph, () => {
  ensureVisibleSelection()
})
</script>

<template>
  <main class="workspace-canvas">
    <GraphCanvas :graph="graph" :detail="state.detail" :highlighted-node-id="highlightedNodeId" @node-select="selectCharacter" @edge-select="selectRelationship" />

    <header class="panel overlay-panel overlay-panel-status" :class="{ 'is-minimized': statusMinimized }">
      <button
        type="button"
        class="status-minimize-button"
        :aria-expanded="!statusMinimized"
        :aria-label="statusMinimized ? '展開操作面板' : '最小化操作面板'"
        @click="toggleStatusMinimized"
      >
        <span class="status-minimize-icon">{{ statusMinimized ? '展' : '收' }}</span>
      </button>

      <template v-if="!statusMinimized">
        <div class="status-head">
          <div>
            <p class="eyebrow">Jin Yong Universe Map</p>
            <h1>金庸人物宇宙圖譜</h1>
          </div>
          <div class="status-meta">
            <p class="graph-title">{{ graphTitle }}</p>
          </div>
        </div>
        <section class="overlay-panel-tools">
          <div class="overlay-tools-bar">
            <ToolDock :active-menu="state.activeMenu" :selected-novel="selectedNovel" :active-filter-count="activeFilterCount" :search-query="state.searchQuery" @toggle-menu="handleToolToggle" />
          </div>

          <div v-if="state.activeMenu" class="panel menu-panel">
            <NovelMenu v-if="state.activeMenu === 'novels'" :novels="novels" :selected-novel-id="state.selectedNovelId" @select-novel="handleMenuEmit('selectNovel', $event)" />
            <SearchMenu
              v-else-if="state.activeMenu === 'search'"
              :query="state.searchQuery"
              :matches="searchMatches"
              @update-query="handleMenuEmit('updateQuery', $event)"
              @select-character="handleMenuEmit('selectCharacter', $event)"
            />
            <FilterMenu
              v-else-if="state.activeMenu === 'filters'"
              :relationship-types="relationshipTypes"
              :active-type-ids="state.activeTypeIds"
              @toggle-type="handleMenuEmit('toggleType', $event)"
              @reset="handleMenuEmit('reset')"
            />
            <LegendMenu v-else-if="state.activeMenu === 'legend'" :relationship-types="relationshipTypes" />
          </div>
        </section>
      </template>
    </header>

    <div>
      <DetailDrawer
        :detail-open="state.detailOpen"
        :detail="state.detail"
        :selected-novel="selectedNovel"
        :selected-character="selectedCharacter"
        :selected-relationship="selectedRelationship"
        :detail-character-relationships="detailCharacterRelationships"
        :novel-map="novelMap"
        :character-map="characterMap"
        @toggle-open="setDetailOpen(!state.detailOpen)"
        @close="setDetailOpen(false)"
        @select-character="selectCharacter"
      />
    </div>
  </main>
</template>
