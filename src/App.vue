<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import DetailDrawer from './components/DetailDrawer.vue'
import FilterMenu from './components/FilterMenu.vue'
import GraphCanvas from './components/GraphCanvas.vue'
import LegendMenu from './components/LegendMenu.vue'
import NovelMenu from './components/NovelMenu.vue'
import SearchMenu from './components/SearchMenu.vue'
import ToolDock from './components/ToolDock.vue'
import { useUniverseMap } from './composables/useUniverseMap'

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
  closeMenu,
  updateSearchQuery,
  toggleRelationshipType,
  resetRelationshipTypes,
  selectCharacter,
  selectRelationship,
  openCharacterFromSearch,
  setDetailOpen,
  ensureVisibleSelection,
} = useUniverseMap()

const toolsPanelRef = ref<HTMLElement | null>(null)
const detailDrawerRef = ref<HTMLElement | null>(null)

const highlightedNodeId = computed(() => {
  if (state.activeMenu === 'search') {
    return searchMatches.value[0]?.id ?? null
  }

  if (state.detail.kind === 'character') {
    return state.detail.id
  }

  return null
})

function handlePointerDown(event: PointerEvent): void {
  const target = event.target
  if (!(target instanceof Node)) {
    return
  }

  if (toolsPanelRef.value?.contains(target) || detailDrawerRef.value?.contains(target)) {
    return
  }

  closeMenu()
}

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

onMounted(() => {
  document.addEventListener('pointerdown', handlePointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePointerDown)
})

watch(graph, () => {
  ensureVisibleSelection()
})
</script>

<template>
  <main class="workspace-canvas">
    <GraphCanvas :graph="graph" :detail="state.detail" :highlighted-node-id="highlightedNodeId" @node-select="selectCharacter" @edge-select="selectRelationship" />

    <header class="panel overlay-panel overlay-panel-status">
      <div class="status-head">
        <div>
          <p class="eyebrow">Jin Yong Universe Map</p>
          <h1>金庸人物宇宙圖譜</h1>
        </div>
        <p class="graph-title">{{ graphTitle }}</p>
      </div>
      <p class="graph-hint">拖曳節點、滾輪或右下角按鈕縮放、拖動畫布平移。左側工具列按需打開選單。</p>
    </header>

    <section ref="toolsPanelRef" class="overlay-panel overlay-panel-tools">
      <ToolDock :active-menu="state.activeMenu" :selected-novel="selectedNovel" :active-filter-count="activeFilterCount" :search-query="state.searchQuery" @toggle-menu="toggleMenu" />

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

    <div ref="detailDrawerRef">
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
