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
      <strong>{{ selectedNovel?.name ?? '' }}</strong>
    </button>
    <button type="button" class="tool-button" :class="{ 'is-active': activeMenu === 'search' }" @click="emit('toggleMenu', 'search')">
      <span>搜尋</span>
      <strong>{{ searchQuery.trim() ? '定位人物' : '打開搜尋' }}</strong>
    </button>
    <button type="button" class="tool-button" :class="{ 'is-active': activeMenu === 'filters' }" @click="emit('toggleMenu', 'filters')">
      <span>篩選</span>
      <strong>{{ activeFilterCount > 0 ? `${activeFilterCount} 項啟用` : '全部關係' }}</strong>
    </button>
    <button type="button" class="tool-button" :class="{ 'is-active': activeMenu === 'legend' }" @click="emit('toggleMenu', 'legend')">
      <span>圖例</span>
      <strong>關係樣式</strong>
    </button>
  </div>
</template>
