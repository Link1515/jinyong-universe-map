<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { createGraphView } from "./graphView";
import type { DetailSelection, VisibleGraph } from "../types";

const props = defineProps<{
  graph: VisibleGraph;
  detail: DetailSelection;
  highlightedNodeId: string | null;
}>();

const emit = defineEmits<{
  nodeSelect: [nodeId: string];
  edgeSelect: [edgeId: string];
}>();

const containerRef = ref<HTMLElement | null>(null);
let graphView: ReturnType<typeof createGraphView> | null = null;

onMounted(() => {
  if (!containerRef.value) {
    return;
  }

  graphView = createGraphView(containerRef.value, {
    onNodeSelect(nodeId) {
      emit("nodeSelect", nodeId);
    },
    onEdgeSelect(edgeId) {
      emit("edgeSelect", edgeId);
    }
  });

  graphView.update(props.graph);
  syncSelection();
  syncHighlight();
});

onBeforeUnmount(() => {
  graphView?.destroy();
  graphView = null;
});

watch(
  () => props.graph,
  (nextGraph) => {
    graphView?.update(nextGraph);
    syncSelection();
    syncHighlight();
  },
  { deep: true }
);

watch(
  () => props.detail,
  () => {
    syncSelection();
  },
  { deep: true }
);

watch(
  () => props.highlightedNodeId,
  () => {
    syncHighlight();
  }
);

function syncSelection(): void {
  if (!graphView) {
    return;
  }

  graphView.setSelection(
    props.detail.kind === "character" ? props.detail.id : null,
    props.detail.kind === "relationship" ? props.detail.id : null
  );
}

function syncHighlight(): void {
  graphView?.highlightNode(props.highlightedNodeId);
}
</script>

<template>
  <div ref="containerRef" class="graph-root"></div>
</template>
