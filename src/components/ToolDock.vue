<script setup lang="ts">
import type { ActiveMenu, Novel } from '../types'

defineProps<{
  activeMenu: ActiveMenu
  selectedNovel: Novel | null
  activeFilterCount: number
  searchQuery: string
}>()

const emit = defineEmits<{
  toggleMenu: [menu: ActiveMenu]
}>()
</script>

<template>
  <div class="panel tool-dock">
    <button type="button" class="tool-button" :class="{ 'is-active': activeMenu === 'novels' }" @click="emit('toggleMenu', 'novels')">
      <span>作品</span>
      <em class="tool-badge">{{ selectedNovel?.name ?? '未選擇' }}</em>
    </button>
    <button type="button" class="tool-button" :class="{ 'is-active': activeMenu === 'search' }" @click="emit('toggleMenu', 'search')">
      <span>搜尋</span>
      <em v-if="searchQuery.trim()" class="tool-badge">{{ searchQuery.trim() }}</em>
    </button>
    <button type="button" class="tool-button" :class="{ 'is-active': activeMenu === 'filters' }" @click="emit('toggleMenu', 'filters')">
      <span>篩選</span>
      <em v-if="activeFilterCount > 0" class="tool-badge">{{ activeFilterCount }}</em>
    </button>
    <button type="button" class="tool-button" :class="{ 'is-active': activeMenu === 'legend' }" @click="emit('toggleMenu', 'legend')">
      <span>圖例</span>
    </button>
  </div>
</template>
