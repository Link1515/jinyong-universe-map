<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Character } from '../types'

const props = defineProps<{
  query: string
  matches: Character[]
}>()

const emit = defineEmits<{
  updateQuery: [query: string]
  selectCharacter: [characterId: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

watch(
  () => props.query,
  () => {
    if (inputRef.value && document.activeElement !== inputRef.value) {
      inputRef.value.focus()
    }
  },
  { immediate: true }
)
</script>

<template>
  <section class="menu-section">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">人物搜尋</p>
        <h2>定位角色</h2>
      </div>
    </div>
    <label class="search-field">
      <span>輸入姓名、稱號或門派</span>
      <input ref="inputRef" type="search" placeholder="例如：郭靖、明教、神鵰大俠" :value="query" @input="emit('updateQuery', ($event.target as HTMLInputElement).value)" />
    </label>
    <div class="search-results">
      <p v-if="!query.trim()" class="empty-state">搜尋會高亮人物並自動聚焦到節點。</p>
      <p v-else-if="matches.length === 0" class="empty-state">目前作品與篩選條件下沒有符合的人物。</p>
      <button v-for="character in matches" v-else :key="character.id" type="button" class="search-result" @click="emit('selectCharacter', character.id)">
        <strong>{{ character.name }}</strong>
        <span>{{ character.title }}</span>
      </button>
    </div>
  </section>
</template>
