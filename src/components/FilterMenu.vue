<script setup lang="ts">
import type { RelationshipType } from '../types'

defineProps<{
  relationshipTypes: RelationshipType[]
  activeTypeIds: string[]
}>()

const emit = defineEmits<{
  toggleType: [typeId: string]
  reset: []
}>()
</script>

<template>
  <section class="menu-section">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">關係篩選</p>
        <h2>選擇顯示類型</h2>
      </div>
      <button type="button" class="ghost-button" @click="emit('reset')">顯示全部</button>
    </div>
    <div class="type-filters">
      <button
        v-for="type in relationshipTypes"
        :key="type.id"
        type="button"
        class="type-filter"
        :class="{ 'is-active': activeTypeIds.includes(type.id) }"
        :style="{ '--type-color': type.color }"
        @click="emit('toggleType', type.id)"
      >
        {{ type.name }}
      </button>
    </div>
  </section>
</template>
