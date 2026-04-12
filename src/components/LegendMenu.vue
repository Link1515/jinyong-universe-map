<script setup lang="ts">
import type { RelationshipType } from "../types";

defineProps<{
  relationshipTypes: RelationshipType[];
}>();
</script>

<template>
  <section class="menu-section">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">圖例</p>
        <h2>關係樣式對照</h2>
      </div>
    </div>
    <div class="legend">
      <div v-for="type in relationshipTypes" :key="type.id" class="legend-row">
        <span class="legend-swatch" :class="type.line" :style="{ '--swatch-color': type.color }"></span>
        <div>
          <strong>{{ type.name }}</strong>
          <p>{{ type.group }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
