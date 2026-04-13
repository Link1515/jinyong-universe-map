<script setup lang="ts">
import { icons as lucideIcons } from '@iconify-json/lucide'
import { Icon, addCollection } from '@iconify/vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createGraphView } from './graphView'
import type { DetailSelection, VisibleGraph } from '../types'

addCollection(lucideIcons)

const props = defineProps<{
  graph: VisibleGraph
  detail: DetailSelection
  highlightedNodeId: string | null
}>()

const emit = defineEmits<{
  nodeSelect: [nodeId: string]
  edgeSelect: [edgeId: string]
}>()

const containerRef = ref<HTMLElement | null>(null)
let graphView: ReturnType<typeof createGraphView> | null = null

onMounted(() => {
  if (!containerRef.value) {
    return
  }

  graphView = createGraphView(containerRef.value, {
    onNodeSelect(nodeId) {
      emit('nodeSelect', nodeId)
    },
    onEdgeSelect(edgeId) {
      emit('edgeSelect', edgeId)
    },
  })

  graphView.update(props.graph)
  syncSelection()
  syncHighlight()
})

onBeforeUnmount(() => {
  graphView?.destroy()
  graphView = null
})

watch(
  () => props.graph,
  nextGraph => {
    graphView?.update(nextGraph)
    syncSelection()
    syncHighlight()
  },
  { deep: true }
)

watch(
  () => props.detail,
  () => {
    syncSelection()
  },
  { deep: true }
)

watch(
  () => props.highlightedNodeId,
  () => {
    syncHighlight()
  }
)

function syncSelection(): void {
  if (!graphView) {
    return
  }

  graphView.setSelection(props.detail.kind === 'character' ? props.detail.id : null, props.detail.kind === 'relationship' ? props.detail.id : null)
}

function syncHighlight(): void {
  graphView?.highlightNode(props.highlightedNodeId)
}

function zoomIn(): void {
  graphView?.zoomIn()
}

function zoomOut(): void {
  graphView?.zoomOut()
}

function fitGraph(): void {
  graphView?.fit()
}
</script>

<template>
  <div class="graph-root">
    <div ref="containerRef" class="graph-shell-host"></div>
    <div class="graph-zoom-controls">
      <button type="button" class="graph-zoom-button" aria-label="放大圖譜" @click="zoomIn">
        <Icon icon="lucide:zoom-in" class="graph-zoom-icon" />
      </button>
      <button type="button" class="graph-zoom-button graph-zoom-button-reset" aria-label="顯示整張圖" @click="fitGraph">
        <Icon icon="lucide:maximize-2" class="graph-zoom-icon graph-zoom-icon-reset" />
      </button>
      <button type="button" class="graph-zoom-button" aria-label="縮小圖譜" @click="zoomOut">
        <Icon icon="lucide:zoom-out" class="graph-zoom-icon" />
      </button>
    </div>
  </div>
</template>
